import { useEffect, useState } from 'react'
import { ChatPanel } from '../chat/ChatPanel'
import { PreviewPanel } from '../preview/PreviewPanel'
import { DocumentList } from '../documents/DocumentList'
import { OnboardingWizard } from '../onboarding/OnboardingWizard'
import { UserMenu } from '../auth/UserMenu'
import { useDesignStore } from '../../store/useDesignStore'
import {
  hasActiveKey, getActiveProvider, isOnboardingDone,
  PROVIDER_INFO, MODELS, getSelectedModel,
} from '../../services/aiConfig'

export function AppLayout() {
  const { undo, redo, canUndo, canRedo } = useDesignStore()

  // 온보딩 미완료 또는 키 미설정이면 위저드 표시
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())
  // 헤더 설정 버튼으로도 위저드를 다시 열 수 있다
  const [showSettings, setShowSettings] = useState(false)

  // 위저드 완료/닫힘 후 헤더 상태 갱신용
  const [providerState, setProviderState] = useState(() => ({
    provider: getActiveProvider(),
    model: getSelectedModel(getActiveProvider()),
    hasKey: hasActiveKey(),
  }))

  function refreshProviderState() {
    const provider = getActiveProvider()
    setProviderState({
      provider,
      model: getSelectedModel(provider),
      hasKey: hasActiveKey(),
    })
  }

  function handleOnboardingComplete() {
    setShowOnboarding(false)
    setShowSettings(false)
    refreshProviderState()
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) undo()
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        if (canRedo()) redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, canUndo, canRedo])

  const providerInfo = PROVIDER_INFO[providerState.provider]
  const modelInfo = MODELS[providerState.provider].find(m => m.id === providerState.model)

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Lumio</span>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-100">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2">
        <UserMenu />
        {/* AI 모델 상태 + 설정 버튼 */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${providerState.hasKey ? 'bg-green-400' : 'bg-amber-400'}`} />
          {providerState.hasKey ? (
            <>
              {/* 제공자 컬러 점 */}
              <span
                className="font-medium text-gray-700"
                style={{ color: providerInfo.color }}
              >
                {providerInfo.name}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{modelInfo?.name ?? providerState.model}</span>
            </>
          ) : (
            <span className="text-amber-600 font-medium">API 키 설정 필요</span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-400">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
        </div>
      </header>

      {/* 메인 */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden">
          <DocumentList />
          <ChatPanel onNeedApiKey={() => setShowSettings(true)} />
        </aside>
        <main className="flex-1 overflow-hidden">
          <PreviewPanel />
        </main>
      </div>

      {/* 온보딩 / 설정 위저드 오버레이 */}
      {(showOnboarding || showSettings) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl">
            {/* 설정 재진입 시에만 닫기 버튼 표시 (최초 온보딩은 반드시 완료) */}
            {showSettings && !showOnboarding && (
              <button
                onClick={() => { setShowSettings(false); refreshProviderState() }}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-gray-700 border border-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            <OnboardingWizard onComplete={handleOnboardingComplete} />
          </div>
        </div>
      )}
    </div>
  )
}
