import { useState } from 'react'
import {
  type AIProvider,
  MODELS,
  PROVIDER_INFO,
  markOnboardingDone,
  setActiveProvider,
  setApiKey,
  setSelectedModel,
} from '../../services/aiConfig'

interface Props {
  onComplete: () => void
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map(index => (
        <div key={index} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [provider, setProvider] = useState<AIProvider>('openai')
  const [modelId, setModelId] = useState(MODELS.openai.find(model => model.isDefault)!.id)
  const [apiKeyValue, setApiKeyValue] = useState('')

  const providerInfo = PROVIDER_INFO[provider]
  const models = MODELS[provider]
  const canContinue = step === 0 || step === 1 || apiKeyValue.trim().length > 8

  function chooseProvider(nextProvider: AIProvider) {
    setProvider(nextProvider)
    setModelId(MODELS[nextProvider].find(model => model.isDefault)!.id)
  }

  function complete(skipKey = false) {
    setActiveProvider(provider)
    setSelectedModel(provider, modelId)
    if (!skipKey) setApiKey(provider, apiKeyValue)
    markOnboardingDone()
    onComplete()
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Lumio 시작하기</span>
            </div>
            <p className="text-sm text-gray-500">
              {step === 0 ? 'AI 제공자 선택' : step === 1 ? '모델 선택' : 'API 키 입력'}
            </p>
          </div>
          <div className="w-40">
            <StepIndicator step={step} />
          </div>
        </div>
      </div>

      <div className="px-8 py-6 min-h-[390px]">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">AI 제공자를 선택하세요</h2>
            <p className="text-sm text-gray-500 mb-6">나중에 설정에서 언제든 바꿀 수 있습니다.</p>
            <div className="space-y-3">
              {(['openai', 'claude', 'gemini'] as const).map(item => {
                const info = PROVIDER_INFO[item]
                const selected = item === provider
                return (
                  <button
                    key={item}
                    onClick={() => chooseProvider(item)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: info.color }}>
                        {info.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{info.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{info.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-blue-500' : 'border-gray-300'}`}>
                        {selected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">모델을 선택하세요</h2>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-medium" style={{ color: providerInfo.color }}>{providerInfo.name}</span>에서 사용할 모델입니다.
            </p>
            <div className="space-y-3">
              {models.map(model => {
                const selected = model.id === modelId
                return (
                  <button
                    key={model.id}
                    onClick={() => setModelId(model.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{model.name}</p>
                          {model.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{tag}</span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500 flex-shrink-0">
                        <p>입력 {model.inputPrice}</p>
                        <p>출력 {model.outputPrice}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">API 키를 입력하세요</h2>
            <p className="text-sm text-gray-500 mb-5">
              Lumio는 개발자 키를 사용하지 않습니다. 사용자의 키는 이 브라우저에만 저장됩니다.
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">발급 방법</h3>
                <ol className="space-y-3">
                  {providerInfo.keyInstructions.map((item, index) => (
                    <li key={item.step} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: providerInfo.color }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.step}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <a href={providerInfo.keyLink} target="_blank" rel="noreferrer" className="inline-flex mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                  키 발급 페이지 열기
                </a>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">API 키</h3>
                <input
                  value={apiKeyValue}
                  onChange={event => setApiKeyValue(event.target.value)}
                  placeholder={providerInfo.keyPlaceholder}
                  type="password"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  키는 localStorage에 저장됩니다. 공용 컴퓨터에서는 사용 후 로그아웃하거나 브라우저 데이터를 삭제하세요.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => setStep(value => value - 1)}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-0 rounded-lg transition-colors"
        >
          이전
        </button>
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button onClick={() => complete(true)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              키 없이 시작
            </button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(value => value + 1)} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              다음
            </button>
          ) : (
            <button
              onClick={() => complete(false)}
              disabled={!canContinue}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              시작하기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
