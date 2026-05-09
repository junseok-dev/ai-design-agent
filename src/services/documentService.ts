import { supabase } from '../lib/supabase'
import type { DesignJSON, SavedDocument } from '../types/design'

export interface DocumentServiceResult {
  ok: boolean
  error?: string
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export async function fetchDocuments(): Promise<SavedDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[documentService] fetch:', error)
    return []
  }

  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    design: row.design as DesignJSON,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }))
}

export async function upsertDocument(doc: SavedDocument): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const { error } = await supabase.from('documents').upsert({
    id: doc.id,
    user_id: session.user.id,
    name: doc.name,
    design: doc.design,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) console.error('[documentService] upsert:', error)
}

export async function publishDocument(doc: SavedDocument, userId: string): Promise<DocumentServiceResult> {
  try {
    if (!userId) return { ok: false, error: '로그인이 필요합니다.' }

    const { error } = await withTimeout(
      Promise.resolve(supabase.from('documents').upsert({
        id: doc.id,
        user_id: userId,
        name: doc.name,
        design: doc.design,
        is_public: true,
          created_at: new Date(doc.createdAt).toISOString(),
          updated_at: new Date().toISOString(),
        })
      ),
      12000,
      'Supabase share save'
    )

    if (error) {
      console.error('[documentService] publish:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown Supabase publish error'
    console.error('[documentService] publish:', err)
    return { ok: false, error: message }
  }
}

export async function fetchPublicDocument(id: string): Promise<SavedDocument | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, design, created_at, updated_at')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error || !data) {
    if (error) console.error('[documentService] fetchPublic:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    design: data.design as DesignJSON,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

export async function removeDocument(id: string): Promise<void> {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) console.error('[documentService] delete:', error)
}

export async function bulkUpsert(docs: SavedDocument[]): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user || docs.length === 0) return

  const rows = docs.map(doc => ({
    id: doc.id,
    user_id: session.user.id,
    name: doc.name,
    design: doc.design,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  }))

  const { error } = await supabase.from('documents').upsert(rows)
  if (error) console.error('[documentService] bulkUpsert:', error)
}
