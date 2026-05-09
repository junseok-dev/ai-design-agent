// ============================================================
// 통합 AI 서비스
// 활성 제공자에 따라 OpenAI / Claude / Gemini 중 하나로 라우팅한다
// ChatPanel은 이 파일만 import하면 된다
// ============================================================

import type { DesignJSON } from '../types/design'
import type { AIResponse } from '../mock/mockAI'
import { resumeTemplate, portfolioTemplate } from '../mock/templates'
import { getActiveProvider, getApiKey } from './aiConfig'
import { callOpenAI } from './providers/openaiProvider'
import { callClaude } from './providers/claudeProvider'
import { callGemini } from './providers/geminiProvider'
import { callOpenAIStream } from './providers/openaiProvider'
import { callClaudeStream } from './providers/claudeProvider'
import { callGeminiStream } from './providers/geminiProvider'
import type { StreamUpdate } from './providers/streaming'
import { DISCUSS_SYSTEM_PROMPT } from './prompts'

// 현재 활성 제공자의 키가 있는지 확인
export function hasActiveKey(): boolean {
  return !!getApiKey(getActiveProvider())
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

// ---- 메인 처리 함수 ----
export async function processMessage(
  userInput: string,
  currentDesign: DesignJSON | null
): Promise<AIResponse> {
  return processMessageInternal(userInput, currentDesign)
}

export async function processMessageStream(
  userInput: string,
  currentDesign: DesignJSON | null,
  onUpdate: StreamUpdate
): Promise<AIResponse> {
  return processMessageInternal(userInput, currentDesign, onUpdate)
}

export async function discussMessageStream(
  userInput: string,
  currentDesign: DesignJSON | null,
  onUpdate: StreamUpdate
): Promise<AIResponse> {
  const response = await processMessageInternal(userInput, currentDesign, onUpdate, DISCUSS_SYSTEM_PROMPT)
  return {
    message: response.message,
    action: 'none',
  }
}

async function processMessageInternal(
  userInput: string,
  currentDesign: DesignJSON | null,
  onUpdate?: StreamUpdate,
  systemPrompt?: string
): Promise<AIResponse> {
  const provider = getActiveProvider()
  const apiKey = getApiKey(provider)

  if (!apiKey) {
    return {
      message: 'API 키가 설정되어 있지 않습니다.\n\n헤더의 **API 키 설정** 버튼을 눌러 키를 입력해주세요.',
      action: 'none',
    }
  }

  // 현재 designJSON + 사용자 명령을 하나의 메시지로 합친다
  const userMessage = currentDesign
    ? `현재 designJSON:\n${JSON.stringify(currentDesign, null, 2)}\n\n사용자 명령: ${userInput}`
    : `사용자 명령: ${userInput}\n\n(현재 디자인 없음. 새로 생성해주세요.)`

  try {
    if (onUpdate) {
      switch (provider) {
        case 'openai': return await callOpenAIStream(userMessage, onUpdate, systemPrompt)
        case 'claude': return await callClaudeStream(userMessage, onUpdate, systemPrompt)
        case 'gemini': return await callGeminiStream(userMessage, onUpdate, systemPrompt)
      }
    }

    switch (provider) {
      case 'openai': return await callOpenAI(userMessage)
      case 'claude': return await callClaude(userMessage)
      case 'gemini': return await callGemini(userMessage)
    }
  } catch (err: unknown) {
    return handleError(err)
  }
}

function handleError(err: unknown): AIResponse {
  if (err instanceof Error) {
    const msg = err.message
    if (msg.includes('401') || msg.includes('authentication'))
      return { message: 'API 키가 유효하지 않습니다. 키를 다시 확인해주세요.', action: 'none' }
    if (msg.includes('429') || msg.includes('rate'))
      return { message: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', action: 'none' }
    if (msg.includes('quota') || msg.includes('billing'))
      return { message: '크레딧이 부족합니다. 계정을 확인해주세요.', action: 'none' }
  }
  console.error('[AI Error]', err)
  return { message: 'AI 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', action: 'none' }
}
