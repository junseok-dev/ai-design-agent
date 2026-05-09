// 헤더 우측 유저 메뉴 (아바타 + 드롭다운)

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

export function UserMenu() {
  const { user, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (!user) return null

  const name      = user.user_metadata?.full_name ?? user.email ?? '사용자'
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials  = name.slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      {/* 아바타 버튼 */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{name}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 드롭다운 */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {/* 유저 정보 */}
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
          </div>

          {/* 메뉴 아이템 */}
          <button
            onClick={async () => { setOpen(false); await signOut() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}
