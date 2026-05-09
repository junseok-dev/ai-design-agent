import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { bulkUpsert, fetchDocuments } from '../services/documentService'
import { useDesignStore } from './useDesignStore'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithNaver: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  session: null,
  isLoading: true,

  initialize: async () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] event:', event, '/ user:', session?.user?.email ?? null)
      set({ session, user: session?.user ?? null, isLoading: false })
      if (session) await syncDocuments()
    })

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) console.error('[Auth] getSession:', error)
    set({ session, user: session?.user ?? null, isLoading: false })
    if (session) await syncDocuments()
  },

  signInWithGoogle: () => signInWithSupabaseProvider('google'),
  signInWithGithub: () => signInWithSupabaseProvider('github'),
  signInWithDiscord: () => signInWithSupabaseProvider('discord'),

  signInWithNaver: () => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    if (!clientId) {
      throw new Error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.')
    }

    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL이 설정되지 않았습니다.')
    }

    const redirectUri = `${supabaseUrl}/functions/v1/naver-auth`
    const state = crypto.randomUUID()
    sessionStorage.setItem('naver_oauth_state', state)

    const url = new URL('https://nid.naver.com/oauth2.0/authorize')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('state', state)

    window.location.href = url.toString()
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('[Auth] signOut:', error)
    set({ user: null, session: null })
    useDesignStore.getState().clearAll()
  },
}))

async function signInWithSupabaseProvider(provider: 'google' | 'github' | 'discord') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  })

  if (error) {
    console.error(`[Auth] ${provider} OAuth:`, error)
    throw error
  }
}

async function syncDocuments() {
  const cloudDocs = await fetchDocuments()
  const store = useDesignStore.getState()

  if (cloudDocs.length > 0) {
    store.setDocumentsFromCloud(cloudDocs)
    return
  }

  if (store.documents.length > 0) {
    await bulkUpsert(store.documents)
  }
}
