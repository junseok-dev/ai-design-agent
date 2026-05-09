// 채팅 입력창 컴포넌트

import { useState, useRef, type KeyboardEvent } from 'react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
  mode?: 'edit' | 'discuss'
}

// 빠른 명령어 버튼 목록
const quickCommands = [
  '이력서 만들어줘',
  '블루 테마로 바꿔줘',
  '다크 테마로 바꿔줘',
  '여백 줄여줘',
  '폰트 키워줘',
]

const discussPrompts = [
  '이 디자인 어때?',
  '더 전문적으로 보이려면?',
  '내용 우선순위 봐줘',
  '지원 회사에 맞는 톤은?',
]

export function ChatInput({ onSend, disabled = false, mode = 'edit' }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestions = mode === 'discuss' ? discussPrompts : quickCommands

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    // 전송 후 높이 초기화
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter: 전송, Shift+Enter: 줄바꿈
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 텍스트 증가에 따라 textarea 높이 자동 조정
  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* 빠른 명령어 버튼 */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {suggestions.map(cmd => (
          <button
            key={cmd}
            onClick={() => !disabled && onSend(cmd)}
            disabled={disabled}
            className="text-xs px-2.5 py-1 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="메시지를 입력하세요... (Enter로 전송)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
          style={{ maxHeight: '120px', minHeight: '38px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
