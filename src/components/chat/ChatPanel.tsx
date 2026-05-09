import { useEffect, useRef, useState } from 'react'
import { useDesignStore } from '../../store/useDesignStore'
import { discussMessageStream, hasActiveKey, processMessageStream, tryQuickTemplate } from '../../services/aiService'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface Props {
  onNeedApiKey: () => void
}

type ChatMode = 'edit' | 'discuss'

export function ChatPanel({ onNeedApiKey }: Props) {
  const {
    messages,
    discussMessages,
    design,
    isProcessing,
    addMessage,
    updateLastMessage,
    addDiscussMessage,
    updateLastDiscussMessage,
    setDesign,
    saveAsNewDocument,
    setProcessing,
  } = useDesignStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<ChatMode>('edit')

  const activeMessages = mode === 'edit' ? messages : discussMessages
  const addActiveMessage = mode === 'edit' ? addMessage : addDiscussMessage
  const updateLastActiveMessage = mode === 'edit' ? updateLastMessage : updateLastDiscussMessage

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, mode])

  async function handleSend(userInput: string) {
    if (isProcessing) return

    const quickResponse = mode === 'edit' ? tryQuickTemplate(userInput) : null
    if (!quickResponse && !hasActiveKey()) {
      onNeedApiKey()
      return
    }

    addActiveMessage({ id: Date.now().toString(), role: 'user', content: userInput, timestamp: Date.now() })
    addActiveMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: Date.now(), isLoading: true })
    setProcessing(true)

    try {
      const response = quickResponse ?? (
        mode === 'edit'
          ? await processMessageStream(userInput, design, content => {
              updateLastActiveMessage(content, true)
            })
          : await discussMessageStream(userInput, design, content => {
              updateLastActiveMessage(content, true)
            })
      )

      updateLastActiveMessage(response.message, false)

      if (mode === 'edit' && response.updatedDesign) {
        if (response.action === 'create') {
          saveAsNewDocument(response.updatedDesign)
        } else {
          setDesign(response.updatedDesign)
        }
      }
    } catch (err) {
      updateLastActiveMessage('오류가 발생했습니다. 다시 시도해 주세요.', false)
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-700">AI Assistant</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {mode === 'edit' ? 'Create and edit the design.' : 'Discuss feedback without changing the design.'}
        </p>
        <div className="mt-3 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          {(['edit', 'discuss'] as const).map(nextMode => (
            <button
              key={nextMode}
              onClick={() => setMode(nextMode)}
              disabled={isProcessing}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                mode === nextMode
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {nextMode === 'edit' ? 'Edit' : 'Discuss'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeMessages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={isProcessing} mode={mode} />
    </div>
  )
}
