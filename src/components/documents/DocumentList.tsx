// ============================================================
// 저장된 문서 목록
// 왼쪽 패널 상단에 위치하며, 문서 전환/삭제/이름 변경을 지원한다
// ============================================================

import { useState } from 'react'
import { useDesignStore } from '../../store/useDesignStore'
import type { SavedDocument } from '../../types/design'

// 페이지 타입별 아이콘/뱃지 색상
const typeConfig: Record<string, { label: string; color: string }> = {
  'a4-resume':    { label: '이력서',     color: '#2563EB' },
  'portfolio':    { label: '포트폴리오', color: '#7C3AED' },
  'a4-document':  { label: '문서',       color: '#059669' },
  'landing':      { label: '랜딩',      color: '#D97706' },
}

// 날짜를 "방금 전 / N분 전 / N시간 전 / 날짜" 형식으로 표시
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

  function handleRenameSubmit() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== doc.name) onRename(trimmed)
    setIsEditing(false)
  }

  return (
    <div
      onClick={onOpen}
      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-900'
          : 'hover:bg-gray-50 text-gray-700'
      }`}
    >
      {/* 타입 뱃지 */}
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: config.color }}
      >
        {config.label[0]}
      </div>

      {/* 이름 + 수정일 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') { setEditName(doc.name); setIsEditing(false) }
            }}
            onClick={e => e.stopPropagation()}
            className="w-full text-sm font-medium bg-white border border-blue-400 rounded px-1.5 py-0.5 outline-none"
          />
        ) : (
          <p className="text-sm font-medium truncate leading-tight">{doc.name}</p>
        )}
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{timeAgo(doc.updatedAt)}</p>
      </div>

      {/* 액션 버튼 (호버 시 표시) */}
      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* 이름 편집 버튼 */}
          <button
            onClick={e => { e.stopPropagation(); setIsEditing(true) }}
            title="이름 변경"
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            title="삭제"
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>
      )}

      {/* 활성 문서 표시선 */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r" />
      )}
    </div>
  )
}

export function DocumentList() {
  const { documents, activeDocumentId, openDocument, deleteDocument, renameDocument } =
    useDesignStore()

  const [isExpanded, setIsExpanded] = useState(true)

  if (documents.length === 0) return null

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">내 문서</span>
          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">
            {documents.length}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 문서 목록 */}
      {isExpanded && (
        <div className="px-2 pb-2 flex flex-col gap-0.5 max-h-52 overflow-y-auto">
          {documents.map(doc => (
            <DocumentItem
              key={doc.id}
              doc={doc}
              isActive={doc.id === activeDocumentId}
              onOpen={() => openDocument(doc.id)}
              onDelete={() => {
                if (window.confirm(`"${doc.name}"을 삭제할까요?`)) {
                  deleteDocument(doc.id)
                }
              }}
              onRename={name => renameDocument(doc.id, name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
