import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIResponse } from '../../mock/mockAI'
import { getApiKey, getSelectedModel } from '../aiConfig'
import { SYSTEM_PROMPT } from '../prompts'
import { createStreamingMessageReporter, parseAIResponse, type StreamUpdate } from './streaming'

export async function callGemini(userMessage: string): Promise<AIResponse> {
  return callGeminiStream(userMessage)
}

export async function callGeminiStream(userMessage: string, onUpdate?: StreamUpdate, systemPrompt = SYSTEM_PROMPT): Promise<AIResponse> {
  const apiKey = getApiKey('gemini')
  const genAI = new GoogleGenerativeAI(apiKey)

  const model = genAI.getGenerativeModel({
    model: getSelectedModel('gemini'),
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 4000,
    },
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContentStream(userMessage)
  let raw = ''
  const reportMessage = createStreamingMessageReporter(onUpdate)

  for await (const chunk of result.stream) {
    const content = chunk.text()
    if (!content) continue
    raw += content
    reportMessage(raw)
  }

  return parseAIResponse(raw)
}
