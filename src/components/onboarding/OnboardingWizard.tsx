// ============================================================
// 온보딩 위저드 (3단계)
// 1단계: AI 제공자 선택
// 2단계: 모델 선택 (가격 + 특징 표시)
// 3단계: API 키 입력 (상세 발급 방법 포함)
// ============================================================

import { useState } from 'react'
import {
  type AIProvider,
  type ModelInfo,
  PROVIDER_INFO,
  MODELS,
  setActiveProvider,
  setSelectedModel,
  setApiKey,
  markOnboardingDone,
} from '../../services/aiConfig'

interface Props {
  onComplete: () => void
}

// ---- 공용 태그 배지 ----
const TAG_STYLES: Record<string, string> = {
  '추천':     'bg-blue-100 text-blue-700',
  '저렴':     'bg-green-100 text-green-700',
  '빠름':     'bg-yellow-100 text-yellow-700',
  '고품질':   'bg-purple-100 text-purple-700',
  '최고품질': 'bg-rose-100 text-rose-700',
  '무료티어': 'bg-teal-100 text-teal-700',
}

function Tag({ label }: { label: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_STYLES[label] ?? 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  )
}

// ---- 단계 표시기 ----
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
            i < current ? 'bg-blue-600 text-white' :
            i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
            'bg-gray-100 text-gray-400'
          }`}>
            {i < current ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 ${i < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ================================================================
// 1단계: 제공자 선택
// ================================================================
function StepProvider({
  selected, onSelect,
}: { selected: AIProvider; onSelect: (p: AIProvider) => void }) {
  const providers: AIProvider[] = ['openai', 'claude', 'gemini']

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">AI 제공자 선택</h2>
      <p className="text-sm text-gray-500 mb-6">사용할 AI 서비스를 선택하세요. 나중에 언제든 변경할 수 있습니다.</p>

      <div className="grid grid-cols-1 gap-3">
        {providers.map(provider => {
          const info = PROVIDER_INFO[provider]
          const isSelected = selected === provider
          return (
            <button
              key={provider}
              onClick={() => onSelect(provider)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 컬러 아이콘 */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: info.color }}
                >
                  {info.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{info.name}</span>
                    {provider === 'gemini' && (
                      <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">무료 티어</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{info.description}</p>
                </div>
                {/* 라디오 */}
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  isSelected ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ================================================================
// 2단계: 모델 선택
// ================================================================
function StepModel({
  provider, selected, onSelect,
}: { provider: AIProvider; selected: string; onSelect: (id: string) => void }) {
  const models = MODELS[provider]
  const info = PROVIDER_INFO[provider]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">모델 선택</h2>
      <p className="text-sm text-gray-500 mb-6">
        <span className="font-medium" style={{ color: info.color }}>{info.name}</span>의 모델을 선택하세요.
        가격은 토큰 1,000,000개(약 소설 1권 분량)당 USD 기준입니다.
      </p>

      <div className="space-y-3">
        {models.map((model: ModelInfo) => {
          const isSelected = selected === model.id
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                  isSelected ? 'border-blue-500' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 이름 + 태그 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{model.name}</span>
                    {model.tags.map(tag => <Tag key={tag} label={tag} />)}
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-gray-500 mt-1">{model.description}</p>

                  {/* 가격 */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">입력</span>
                      <span className="font-semibold text-gray-700">{model.inputPrice}</span>
                      <span>/ 1M tokens</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded font-mono">출력</span>
                      <span className="font-semibold text-gray-700">{model.outputPrice}</span>
                      <span>/ 1M tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 실사용 비용 안내 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 leading-relaxed">
        💡 <strong>실제 사용량 예시</strong>: 이력서 1회 생성 ≈ 약 3,000~5,000 토큰.
        추천 모델 기준 <strong>약 $0.001 미만</strong> (≈ 0.1원 수준)입니다.
      </div>
    </div>
  )
}

// ================================================================
// 3단계: API 키 입력
// ================================================================
function StepApiKey({
  provider, onKeyChange, keyValue,
}: { provider: AIProvider; keyValue: string; onKeyChange: (v: string) => void }) {
  const info = PROVIDER_INFO[provider]
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">API 키 입력</h2>
      <p className="text-sm text-gray-500 mb-5">
        <span className="font-medium" style={{ color: info.color }}>{info.name}</span>의 API 키를 발급받아 입력하세요.
      </p>

      <div className="grid grid-cols-2 gap-5">
        {/* 왼쪽: 발급 방법 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">발급 방법</h3>
          <ol className="space-y-3">
            {info.keyInstructions.map((item, i) => (
              <li key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: info.color }}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.step}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href={info.keyLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            키 발급 페이지 열기
          </a>
        </div>

        {/* 오른쪽: 키 입력 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">API 키</h3>

          <div className="relative">
            <input
              type={isVisible ? 'text' : 'password'}
              value={keyValue}
              onChange={e => onKeyChange(e.target.value)}
              placeholder={info.keyPlaceholder}
              className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setIsVisible(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          {/* 보안 안내 */}
          <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-green-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>키는 이 브라우저에만 저장되며 외부 서버로 전송되지 않습니다.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>키를 타인과 공유하거나 공개 저장소에 올리지 마세요.</span>
            </div>
          </div>

          {/* 유효성 힌트 */}
          {keyValue && !keyValue.startsWith(info.keyPlaceholder.split('.')[0]) && (
            <p className="mt-2 text-xs text-amber-600">
              입력된 키 형식이 {info.name} 키와 다릅니다. 다시 확인해주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ================================================================
// 메인 위저드
// ================================================================
export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [modelId, setModelId] = useState<string>(MODELS['openai'].find(m => m.isDefault)!.id)
  const [apiKey, setApiKeyValue] = useState('')

  function handleProviderChange(p: AIProvider) {
    setProvider(p)
    setModelId(MODELS[p].find(m => m.isDefault)!.id)
  }

  function handleComplete() {
    setActiveProvider(provider)
    setSelectedModel(provider, modelId)
    setApiKey(provider, apiKey)
    markOnboardingDone()
    onComplete()
  }

  const stepTitles = ['제공자 선택', '모델 선택', 'API 키 입력']
  const canProceed = [
    !!provider,
    !!modelId,
    apiKey.trim().length > 10,
  ]

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden">

        {/* 헤더 */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Lumio 시작하기</span>
              </div>
              <p className="text-sm text-gray-500">{stepTitles[step]} ({step + 1} / {stepTitles.length})</p>
            </div>
            <StepIndicator current={step} total={stepTitles.length} />
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        <div className="px-8 py-6 min-h-[360px]">
          {step === 0 && (
            <StepProvider selected={provider} onSelect={handleProviderChange} />
          )}
          {step === 1 && (
            <StepModel provider={provider} selected={modelId} onSelect={setModelId} />
          )}
          {step === 2 && (
            <StepApiKey provider={provider} keyValue={apiKey} onKeyChange={setApiKeyValue} />
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-0 rounded-lg transition-colors"
          >
            ← 이전
          </button>

          <div className="flex items-center gap-3">
            {/* 3단계에서 키 없이 건너뛰기 (템플릿은 키 없이도 사용 가능) */}
            {step === 2 && (
              <button
                onClick={() => { markOnboardingDone(); onComplete() }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                키 없이 시작 (제한적 사용)
              </button>
            )}

            {step < stepTitles.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed[step]}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                다음 →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed[step]}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                시작하기 🚀
              </button>
            )}
          </div>
        </div>
      </div>
  )
}
