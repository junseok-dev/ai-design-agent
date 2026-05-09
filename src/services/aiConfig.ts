export type AIProvider = 'openai' | 'claude' | 'gemini'

const PROVIDER_KEY = 'lumio_ai_provider'
const ONBOARDING_KEY = 'lumio_onboarding_done'

const MODEL_KEY_MAP: Record<AIProvider, string> = {
  openai: 'lumio_openai_model',
  claude: 'lumio_claude_model',
  gemini: 'lumio_gemini_model',
}

const API_KEY_MAP: Record<AIProvider, string> = {
  openai: 'lumio_openai_key',
  claude: 'lumio_claude_key',
  gemini: 'lumio_gemini_key',
}

export interface ModelInfo {
  id: string
  name: string
  description: string
  inputPrice: string
  outputPrice: string
  tags: string[]
  isDefault: boolean
}

export const MODELS: Record<AIProvider, ModelInfo[]> = {
  openai: [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      description: '빠르고 비용이 낮은 범용 모델입니다. 구조화된 DesignJSON 생성과 간단한 수정에 적합합니다.',
      inputPrice: '$0.15',
      outputPrice: '$0.60',
      tags: ['추천', '저비용', '빠름'],
      isDefault: true,
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: '복잡한 문서 구조와 긴 요청을 더 안정적으로 처리하는 고품질 모델입니다.',
      inputPrice: '$2.50',
      outputPrice: '$10.00',
      tags: ['고품질'],
      isDefault: false,
    },
  ],
  claude: [
    {
      id: 'claude-haiku-4-5-20251001',
      name: 'Claude Haiku 4.5',
      description: '빠르고 비용 효율적인 Claude 모델입니다. 일반적인 이력서/포트폴리오 작업에 적합합니다.',
      inputPrice: '$0.80',
      outputPrice: '$4.00',
      tags: ['추천', '빠름'],
      isDefault: true,
    },
    {
      id: 'claude-sonnet-4-6',
      name: 'Claude Sonnet 4.6',
      description: '품질과 속도의 균형이 좋은 모델입니다. 긴 문서 피드백과 구조 개선에 적합합니다.',
      inputPrice: '$3.00',
      outputPrice: '$15.00',
      tags: ['고품질'],
      isDefault: false,
    },
  ],
  gemini: [
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: '빠른 응답에 강한 Gemini 모델입니다. MVP 테스트와 가벼운 수정 작업에 적합합니다.',
      inputPrice: '$0.075',
      outputPrice: '$0.30',
      tags: ['추천', '저비용', '빠름'],
      isDefault: true,
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: '긴 컨텍스트와 복잡한 문서 생성에 적합한 Gemini 모델입니다.',
      inputPrice: '$3.50',
      outputPrice: '$10.50',
      tags: ['고품질'],
      isDefault: false,
    },
  ],
}

export const PROVIDER_INFO: Record<AIProvider, {
  name: string
  description: string
  color: string
  keyPlaceholder: string
  keyInstructions: Array<{ step: string; detail: string }>
  keyLink: string
}> = {
  openai: {
    name: 'OpenAI',
    description: 'JSON 구조화 출력이 안정적이고 다양한 디자인 수정 요청을 잘 처리합니다.',
    color: '#10A37F',
    keyPlaceholder: 'sk-proj-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyInstructions: [
      { step: 'OpenAI Platform 접속', detail: 'platform.openai.com에 로그인합니다.' },
      { step: 'API Keys 메뉴 이동', detail: 'Dashboard에서 API Keys 메뉴를 엽니다.' },
      { step: '새 Secret Key 생성', detail: 'Create new secret key를 눌러 키를 생성합니다.' },
      { step: '키 복사', detail: '생성 직후 한 번만 볼 수 있으니 바로 복사합니다.' },
    ],
  },
  claude: {
    name: 'Claude',
    description: '문장 피드백과 긴 설명을 잘 다루는 모델입니다.',
    color: '#D97706',
    keyPlaceholder: 'sk-ant-...',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyInstructions: [
      { step: 'Anthropic Console 접속', detail: 'console.anthropic.com에 로그인합니다.' },
      { step: 'Settings로 이동', detail: 'Settings 아래 API Keys 메뉴를 엽니다.' },
      { step: 'Create Key 클릭', detail: '새 키를 생성하고 이름을 지정합니다.' },
      { step: '키 복사', detail: '생성된 키를 Lumio에 붙여넣습니다.' },
    ],
  },
  gemini: {
    name: 'Gemini',
    description: '빠르고 비용 효율적인 Google AI 모델을 사용할 수 있습니다.',
    color: '#4285F4',
    keyPlaceholder: 'AIzaSy...',
    keyLink: 'https://aistudio.google.com/apikey',
    keyInstructions: [
      { step: 'Google AI Studio 접속', detail: 'aistudio.google.com에 로그인합니다.' },
      { step: 'Get API key 클릭', detail: 'API key 생성 화면으로 이동합니다.' },
      { step: 'Create API key 클릭', detail: '프로젝트를 선택하거나 새로 생성합니다.' },
      { step: '키 복사', detail: '생성된 키를 Lumio에 붙여넣습니다.' },
    ],
  },
}

export function getActiveProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_KEY) as AIProvider) ?? 'openai'
}

export function setActiveProvider(provider: AIProvider) {
  localStorage.setItem(PROVIDER_KEY, provider)
}

export function getSelectedModel(provider: AIProvider): string {
  return localStorage.getItem(MODEL_KEY_MAP[provider])
    ?? MODELS[provider].find(model => model.isDefault)!.id
}

export function setSelectedModel(provider: AIProvider, modelId: string) {
  localStorage.setItem(MODEL_KEY_MAP[provider], modelId)
}

export function getApiKey(provider: AIProvider): string {
  return localStorage.getItem(API_KEY_MAP[provider]) ?? ''
}

export function setApiKey(provider: AIProvider, key: string) {
  localStorage.setItem(API_KEY_MAP[provider], key.trim())
}

export function clearApiKey(provider: AIProvider) {
  localStorage.removeItem(API_KEY_MAP[provider])
}

export function hasActiveKey(): boolean {
  return !!getApiKey(getActiveProvider())
}

export function isOnboardingDone(): boolean {
  return !!localStorage.getItem(ONBOARDING_KEY)
}

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, '1')
}
