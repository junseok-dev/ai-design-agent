import { useEffect, useState } from 'react'
import { DesignRenderer } from '../components/renderer/DesignRenderer'
import { fetchPublicDocument } from '../services/documentService'
import type { SavedDocument } from '../types/design'

interface Props {
  documentId: string
}

export function SharePage({ documentId }: Props) {
  const [document, setDocument] = useState<SavedDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    fetchPublicDocument(documentId)
      .then(doc => {
        if (mounted) setDocument(doc)
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [documentId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 text-gray-400">
            !
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Shared document not found</h1>
          <p className="text-sm text-gray-500 mt-1">The link may be private, removed, or unavailable.</p>
        </div>
      </div>
    )
  }

  const isA4 = document.design.page.layout.width === '210mm'

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{document.name}</span>
        </div>
        <span className="text-xs text-gray-400">Read-only share</span>
      </header>

      <main className="p-6 flex justify-center">
        <div
          className={isA4 ? '' : 'w-full max-w-5xl'}
          style={isA4 ? { boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)' } : undefined}
        >
          <DesignRenderer design={document.design} />
        </div>
      </main>
    </div>
  )
}
