import type { DesignJSON } from '../../types/design'
import type { AIResponse } from '../../mock/mockAI'

export type StreamUpdate = (content: string) => void

export function cleanJsonText(raw: string): string {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export function parseAIResponse(raw: string): AIResponse {
  const parsed = JSON.parse(cleanJsonText(raw)) as { message?: string; updatedDesign?: DesignJSON | null }

  return {
    message: parsed.message ?? 'Done',
    updatedDesign: parsed.updatedDesign ?? undefined,
    action: parsed.updatedDesign ? 'update-content' : 'none',
  }
}

export function createStreamingMessageReporter(onUpdate?: StreamUpdate) {
  let lastMessage = ''

  return (raw: string) => {
    if (!onUpdate) return
    const message = extractJsonStringValue(raw, 'message')
    if (message && message !== lastMessage) {
      lastMessage = message
      onUpdate(message)
    }
  }
}

function extractJsonStringValue(raw: string, key: string): string {
  const keyIndex = raw.indexOf(`"${key}"`)
  if (keyIndex === -1) return ''

  const colonIndex = raw.indexOf(':', keyIndex)
  if (colonIndex === -1) return ''

  const firstQuoteIndex = raw.indexOf('"', colonIndex + 1)
  if (firstQuoteIndex === -1) return ''

  let result = ''
  let escaped = false

  for (let i = firstQuoteIndex + 1; i < raw.length; i += 1) {
    const char = raw[i]

    if (escaped) {
      result += decodeEscapedChar(char)
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') return result

    result += char
  }

  return result
}

function decodeEscapedChar(char: string): string {
  switch (char) {
    case 'n': return '\n'
    case 'r': return '\r'
    case 't': return '\t'
    case '"': return '"'
    case '\\': return '\\'
    default: return char
  }
}
