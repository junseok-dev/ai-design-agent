import { useState } from 'react'
import { useDesignStore } from '../../store/useDesignStore'
import type { SavedDocument } from '../../types/design'

const typeConfig: Record<string, { label: string; color: string }> = {
  'a4-resume': { label: '이력서', color: '#2563EB' },
  'portfolio': { label: '포트폴리오', color: '#7C3AED' },
  'a4-document': { label: '문서', color: '#059669' },
  'landing': { label: '랜딩', color: '#D97706' },
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return new Date(timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

interface DocumentItemProps {
  doc: SavedDocument
  isActive: boolean
  onOpen: () => void
  onDelete: () => void
  onRename: (name: string) => void
}

function DocumentItem({ doc, isActive, onOpen, onDelete, onRename }: DocumentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(doc.name)
  const config = typeConfig[doc.design.page.type] ?? { label: '문서', color: '#6B7280' }

  function submitRename() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== doc.name) onRename(trimmed)
    setIsEditing(false)
  }

  return (
    <div
      onClick={onOpen}
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-700'}`}
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ backgroundColor: config.color }}>
        {config.label[0]}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={event => setEditName(event.target.value)}
            onBlur={submitRename}
            onKeyDown={event => {
              if (event.key === 'Enter') submitRename()
              if (event.key === 'Escape') {
                setEditName(doc.name)
                setIsEditing(false)
              }
            }}
            onClick={event => event.stopPropagation()}
            className="w-full text-sm font-medium bg-white border border-blue-400 rounded px-1.5 py-0.5 outline-none"
          />
        ) : (
          <p className="text-sm font-medium truncate leading-tight">{doc.name}</p>
        )}
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{timeAgo(doc.updatedAt)}</p>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={event => {
              event.stopPropagation()
              setIsEditing(true)
            }}
            title="이름 변경"
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            편
          </button>
          <button
            onClick={event => {
              event.stopPropagation()
              onDelete()
            }}
            title="삭제"
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r" />}
    </div>
  )
}

export function DocumentList() {
  const { documents, activeDocumentId, openDocument, deleteDocument, renameDocument } = useDesignStore()
  const [isExpanded, setIsExpanded] = useState(true)

  if (documents.length === 0) return null

  return (
    <div className="border-b border-gray-200 bg-white">
      <button onClick={() => setIsExpanded(value => !value)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">내 문서</span>
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">{documents.length}</span>
        </div>
        <span className={`text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}>⌄</span>
      </button>

      {isExpanded && (
        <div className="px-2 pb-2 flex flex-col gap-0.5 max-h-52 overflow-y-auto">
          {documents.map(doc => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeDocumentId}
              onOpen={() => openDocument(doc.id)}
              onDelete={() => {
                if (window.confirm(`"${doc.name}" 문서를 삭제할까요?`)) deleteDocument(doc.id)
              }}
              onRename={name => renameDocument(doc.id, name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
