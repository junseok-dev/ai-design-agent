import Anthropic from '@anthropic-ai/sdk'
import type { AIResponse } from '../../mock/mockAI'
import { getApiKey, getSelectedModel } from '../aiConfig'
import { SYSTEM_PROMPT } from '../prompts'
import { createStreamingMessageReporter, parseAIResponse, type StreamUpdate } from './streaming'

export async function callClaude(userMessage: string): Promise<AIResponse> {
  return callClaudeStream(userMessage)
}

export async function callClaudeStream(userMessage: string, onUpdate?: StreamUpdate, systemPrompt = SYSTEM_PROMPT): Promise<AIResponse> {
  const apiKey = getApiKey('claude')
  const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const stream = anthropic.messages.stream({
    model: getSelectedModel('claude'),
    max_tokens: 4000,
    system: systemPrompt + '\n\nReturn only valid JSON. Do not include markdown fences or any other text.',
    messages: [{ role: 'user', content: userMessage }],
  })

  let raw = ''
  const reportMessage = createStreamingMessageReporter(onUpdate)

  for await (const event of stream) {
    if (event.type !== 'content_block_delta' || event.delta.type !== 'text_delta') continue
    raw += event.delta.text
    reportMessage(raw)
  }

  return parseAIResponse(raw)
}
