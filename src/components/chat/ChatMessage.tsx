// 채팅 메시지 말풍선 컴포넌트

import type { ChatMessage as ChatMessageType } from '../../types/design'

interface Props {
  message: ChatMessageType
}

// 간단한 마크다운 변환 (**bold**, 줄바꿈)
function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    // **텍스트** → <strong>
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* AI 아바타 */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-0.5">
          L
        </div>
      )}

      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {/* 로딩 애니메이션 */}
        {message.isLoading && !message.content ? (
          <div className="flex gap-1 items-center h-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <span>
            {renderContent(message.content)}
            {message.isLoading && <span className="ml-0.5 animate-pulse">|</span>}
          </span>
        )}
      </div>

      {/* 사용자 아바타 */}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold ml-2 flex-shrink-0 mt-0.5">
          나
        </div>
      )}
    </div>
  )
}
