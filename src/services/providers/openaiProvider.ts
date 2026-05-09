import OpenAI from 'openai'
import type { AIResponse } from '../../mock/mockAI'
import { getApiKey, getSelectedModel } from '../aiConfig'
import { SYSTEM_PROMPT } from '../prompts'
import { createStreamingMessageReporter, parseAIResponse, type StreamUpdate } from './streaming'

export async function callOpenAI(userMessage: string): Promise<AIResponse> {
  return callOpenAIStream(userMessage)
}

export async function callOpenAIStream(userMessage: string, onUpdate?: StreamUpdate, systemPrompt = SYSTEM_PROMPT): Promise<AIResponse> {
  const apiKey = getApiKey('openai')
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const stream = await openai.chat.completions.create({
    model: getSelectedModel('openai'),
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4000,
    stream: true,
  })

  let raw = ''
  const reportMessage = createStreamingMessageReporter(onUpdate)

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content
    if (!content) continue
    raw += content
    reportMessage(raw)
  }

  return parseAIResponse(raw)
}
