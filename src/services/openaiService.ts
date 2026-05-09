// ============================================================
// OpenAI API 연동 서비스
// 사용자가 UI에서 입력한 API 키를 localStorage에서 읽어 사용한다
// ============================================================

import OpenAI from 'openai'
import type { DesignJSON } from '../types/design'
import type { AIResponse } from '../mock/mockAI'
import { resumeTemplate, portfolioTemplate } from '../mock/templates'

const STORAGE_KEY = 'lumio_openai_key'

// 사용자가 UI에서 입력한 API 키를 localStorage에 저장/조회한다
export function getSavedApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}
export function saveApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key.trim())
}
export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

// ---- 시스템 프롬프트 ----
const SYSTEM_PROMPT = `
당신은 Lumio라는 AI 기반 디자인 플랫폼의 어시스턴트입니다.

## 역할
사용자의 자연어 명령을 이해하고, 디자인 JSON(designJSON)을 생성하거나 수정합니다.
절대 HTML이나 CSS를 직접 생성하지 않습니다. 오직 designJSON만 다룹니다.

## 지원 섹션 타입
- hero: 이름, 직함, 소개
- text-block: 텍스트 블록 (자기소개, 요약 등)
- skill-list: 기술 목록 (displayStyle: "tags" | "bars")
- timeline: 경력/학력 타임라인
- card-grid: 카드 그리드 (프로젝트 등)
- divider: 구분선
- contact-info: 연락처 정보

## 테마 색상 예시
- 블루: primaryColor "#2563EB"
- 그린: primaryColor "#059669"
- 퍼플: primaryColor "#7C3AED"
- 레드: primaryColor "#DC2626"
- 다크: primaryColor "#60A5FA", backgroundColor "#111827", textColor "#F9FAFB"

## 출력 형식 (반드시 이 JSON 구조로만 응답)
{
  "message": "사용자에게 보여줄 한국어 응답 메시지",
  "updatedDesign": { ... }
}

## 규칙
- message는 항상 한국어로 작성한다
- updatedDesign은 designJSON 전체를 반환한다 (부분 반환 금지)
- 디자인 요청이 아닌 일반 질문이면 updatedDesign은 null로 반환한다
- 섹션 순서 변경 시 sections 배열 순서를 바꾼다
- 색상 변경 시 theme.primaryColor를 수정한다
- 여백 변경 시 layout.padding을 수정한다 (단위: mm)
`

// ---- 메인 함수 ----

export async function processMessageWithOpenAI(
  userInput: string,
  currentDesign: DesignJSON | null
): Promise<AIResponse> {
  const apiKey = getSavedApiKey()

  if (!apiKey) {
    return {
      message: 'OpenAI API 키가 설정되어 있지 않습니다.\n\n우측 상단 **API 키 설정** 버튼을 눌러 키를 입력해주세요.',
      action: 'none',
    }
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const userMessage = currentDesign
    ? `현재 designJSON:\n${JSON.stringify(currentDesign, null, 2)}\n\n사용자 명령: ${userInput}`
    : `사용자 명령: ${userInput}\n\n(현재 디자인 없음. 새로 생성해주세요.)`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    const raw = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as { message: string; updatedDesign: DesignJSON | null }

    return {
      message: parsed.message ?? '처리 완료',
      updatedDesign: parsed.updatedDesign ?? undefined,
      action: parsed.updatedDesign ? 'update-content' : 'none',
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes('401')) {
        return { message: 'API 키가 유효하지 않습니다. 다시 확인해주세요.', action: 'none' }
      }
      if (err.message.includes('429')) {
        return { message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', action: 'none' }
      }
      if (err.message.includes('insufficient_quota')) {
        return { message: 'OpenAI 크레딧이 부족합니다. 계정을 확인해주세요.', action: 'none' }
      }
    }
    console.error('[OpenAI Error]', err)
    return { message: 'AI 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', action: 'none' }
  }
}

// ---- 템플릿 빠른 생성 (API 키 불필요) ----
export function tryQuickTemplate(userInput: string): AIResponse | null {
  const lower = userInput.toLowerCase()

  if (/(이력서|resume|cv)/.test(lower) && /(만들|생성|작성|줘|해줘)/.test(lower)) {
    return {
      message: '이력서 템플릿을 생성했습니다! "블루 테마로 바꿔줘" 같은 명령으로 수정해보세요.',
      updatedDesign: JSON.parse(JSON.stringify(resumeTemplate)),
      action: 'create',
    }
  }

  if (/(포트폴리오|portfolio)/.test(lower) && /(만들|생성|작성|줘|해줘)/.test(lower)) {
    return {
      message: '포트폴리오 템플릿을 생성했습니다!',
      updatedDesign: JSON.parse(JSON.stringify(portfolioTemplate)),
      action: 'create',
    }
  }

  return null
}
