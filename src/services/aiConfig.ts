// ============================================================
// AI 제공자 + 모델 설정 관리
// ============================================================

export type AIProvider = 'openai' | 'claude' | 'gemini'

const PROVIDER_KEY   = 'lumio_ai_provider'
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

// ---- 모델 정보 ----

export interface ModelInfo {
  id: string
  name: string
  description: string
  inputPrice: string   // 1M 토큰당 가격 (USD)
  outputPrice: string
  tags: string[]       // '추천' | '저렴' | '고품질' | '빠름' | '무료티어'
  isDefault: boolean
}

export const MODELS: Record<AIProvider, ModelInfo[]> = {
  openai: [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      description: '빠르고 저렴하며 구조화 JSON 출력이 안정적입니다. 대부분의 디자인 작업에 충분합니다.',
      inputPrice: '$0.15',
      outputPrice: '$0.60',
      tags: ['추천', '저렴', '빠름'],
      isDefault: true,
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: '복잡한 디자인 요청과 긴 문서 처리에 더 뛰어납니다. 품질이 중요할 때 사용하세요.',
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
      description: '가장 빠르고 저렴한 Claude 모델. 한국어 이해와 지시 추종이 뛰어납니다.',
      inputPrice: '$0.80',
      outputPrice: '$4.00',
      tags: ['추천', '저렴', '빠름'],
      isDefault: true,
    },
    {
      id: 'claude-sonnet-4-6',
      name: 'Claude Sonnet 4.6',
      description: '균형 잡힌 성능과 가격. 복잡한 수정 요청이나 긴 JSON 생성에 적합합니다.',
      inputPrice: '$3.00',
      outputPrice: '$15.00',
      tags: ['고품질'],
      isDefault: false,
    },
    {
      id: 'claude-opus-4-7',
      name: 'Claude Opus 4.7',
      description: '가장 강력한 Claude 모델. 세밀한 디자인 수정과 복잡한 레이아웃 생성에 최적입니다.',
      inputPrice: '$15.00',
      outputPrice: '$75.00',
      tags: ['최고품질'],
      isDefault: false,
    },
  ],
  gemini: [
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: '무료 티어 제공 (분당 15회 요청). 빠른 응답 속도로 MVP 테스트에 이상적입니다.',
      inputPrice: '$0.075',
      outputPrice: '$0.30',
      tags: ['추천', '무료티어', '빠름'],
      isDefault: true,
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: '더 긴 컨텍스트와 높은 품질. 복잡한 디자인 생성에 적합합니다.',
      inputPrice: '$3.50',
      outputPrice: '$10.50',
      tags: ['고품질'],
      isDefault: false,
    },
  ],
}

// ---- 제공자 정보 ----

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
    description: 'ChatGPT를 만든 회사. JSON 구조 출력이 가장 안정적입니다.',
    color: '#10A37F',
    keyPlaceholder: 'sk-proj-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyInstructions: [
      { step: 'platform.openai.com 접속', detail: '브라우저에서 OpenAI 플랫폼에 접속합니다.' },
      { step: '로그인 후 Dashboard 이동', detail: '계정이 없으면 먼저 회원가입이 필요합니다.' },
      { step: '좌측 메뉴 → API Keys', detail: '"API Keys" 메뉴를 클릭합니다.' },
      { step: '"Create new secret key" 클릭', detail: '키 이름을 입력하고 생성합니다.' },
      { step: '생성된 키 복사', detail: '⚠️ 이 화면에서만 볼 수 있습니다. 반드시 복사하세요!' },
    ],
  },
  claude: {
    name: 'Claude (Anthropic)',
    description: '한국어 이해 최고 수준. 복잡한 지시도 정확하게 따릅니다.',
    color: '#D97706',
    keyPlaceholder: 'sk-ant-...',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyInstructions: [
      { step: 'console.anthropic.com 접속', detail: 'Anthropic Console에 접속합니다.' },
      { step: '로그인', detail: '계정이 없으면 회원가입 후 진행합니다.' },
      { step: '좌측 메뉴 → Settings → API Keys', detail: 'Settings 하위의 API Keys를 클릭합니다.' },
      { step: '"Create Key" 클릭', detail: '키 이름을 입력하고 생성합니다.' },
      { step: '생성된 키 복사', detail: '⚠️ 생성 직후에만 전체 키를 볼 수 있습니다!' },
    ],
  },
  gemini: {
    name: 'Gemini (Google)',
    description: '무료 티어 제공. Google 계정만 있으면 바로 시작할 수 있습니다.',
    color: '#4285F4',
    keyPlaceholder: 'AIzaSy...',
    keyLink: 'https://aistudio.google.com/apikey',
    keyInstructions: [
      { step: 'aistudio.google.com 접속', detail: 'Google AI Studio에 접속합니다.' },
      { step: 'Google 계정으로 로그인', detail: '기존 Google 계정을 사용할 수 있습니다.' },
      { step: '좌측 메뉴 → "Get API key"', detail: '"Get API key" 버튼을 클릭합니다.' },
      { step: '"Create API key" 클릭', detail: '프로젝트를 선택하거나 새로 생성합니다.' },
      { step: '생성된 키 복사', detail: '나중에 동일 화면에서 다시 확인할 수 있습니다.' },
    ],
  },
}

// ---- 상태 관리 ----

export function getActiveProvider(): AIProvider {
  return (localStorage.getItem(PROVIDER_KEY) as AIProvider) ?? 'openai'
}
export function setActiveProvider(p: AIProvider) {
  localStorage.setItem(PROVIDER_KEY, p)
}

export function getSelectedModel(provider: AIProvider): string {
  return localStorage.getItem(MODEL_KEY_MAP[provider])
    ?? MODELS[provider].find(m => m.isDefault)!.id
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

// 온보딩 완료 여부
export function isOnboardingDone(): boolean {
  return !!localStorage.getItem('lumio_onboarding_done')
}
export function markOnboardingDone() {
  localStorage.setItem('lumio_onboarding_done', '1')
}
