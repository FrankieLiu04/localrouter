import type { ChatCompletionMessage, ChatCompletionResponse, OpenAIModel, Usage } from '../types/openai.js'

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asNumber(value: unknown, fallback: number) {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function normalizeUsage(value: unknown): Usage {
  if (!isRecord(value)) {
    return { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  }
  const prompt = asNumber(value.prompt_tokens, 0)
  const completion = asNumber(value.completion_tokens, 0)
  const total = asNumber(value.total_tokens, prompt + completion)
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: total }
}

function normalizeMessage(value: unknown): ChatCompletionMessage {
  if (!isRecord(value)) return { role: 'assistant', content: null }
  const roleValue = value.role
  const role =
    roleValue === 'system' || roleValue === 'user' || roleValue === 'assistant' || roleValue === 'function' || roleValue === 'tool'
      ? roleValue
      : 'assistant'
  const contentValue = value.content
  const content = typeof contentValue === 'string' ? contentValue : contentValue === null ? null : null
  const name = typeof value.name === 'string' && value.name.length > 0 ? value.name : undefined
  const function_call = isRecord(value.function_call) ? value.function_call : undefined
  const tool_calls = Array.isArray(value.tool_calls) ? value.tool_calls : undefined
  return { role, content, name, function_call, tool_calls }
}

function normalizeChoices(value: unknown): ChatCompletionResponse['choices'] {
  if (!Array.isArray(value) || value.length === 0) {
    return [
      {
        index: 0,
        message: { role: 'assistant', content: null },
        finish_reason: 'stop'
      }
    ]
  }
  return value.map((choice, i) => {
    const c = isRecord(choice) ? choice : {}
    const finish = c.finish_reason
    const finish_reason =
      finish === 'stop' || finish === 'length' || finish === 'tool_calls' || finish === 'content_filter' || finish === 'function_call'
        ? finish
        : 'stop'
    const message = normalizeMessage(c.message)
    return {
      index: asNumber(c.index, i),
      message,
      finish_reason
    }
  })
}

export function enhanceChatCompletionResponse(response: unknown): ChatCompletionResponse {
  const raw = isRecord(response) ? response : {}
  const created = asNumber(raw.created, nowSeconds())
  const model = asString(raw.model, 'deepseek-chat')
  const id = asString(raw.id, `chatcmpl_${created}_${Math.random().toString(16).slice(2)}`)
  const object: ChatCompletionResponse['object'] = 'chat.completion'
  const choices = normalizeChoices(raw.choices)
  const usage = raw.usage ? normalizeUsage(raw.usage) : undefined
  const system_fingerprint = typeof raw.system_fingerprint === 'string' ? raw.system_fingerprint : undefined
  return { id, object, created, model, choices, usage, system_fingerprint }
}

export function enhanceModelsResponse(data: unknown): { object: 'list'; data: OpenAIModel[] } {
  const raw = isRecord(data) ? data : {}
  const list = raw.data
  if (!Array.isArray(list)) {
    return {
      object: 'list',
      data: [
        {
          id: 'deepseek-chat',
          object: 'model',
          created: nowSeconds(),
          owned_by: 'deepseek'
        }
      ]
    }
  }
  const enhancedData = list.map((model): OpenAIModel => {
    const m = isRecord(model) ? model : {}
    return {
      id: asString(m.id, 'deepseek-chat'),
      object: 'model',
      created: asNumber(m.created, nowSeconds()),
      owned_by: asString(m.owned_by, 'deepseek')
    }
  })
  return { object: 'list', data: enhancedData }
}

export function estimateTokenCount(text: string): number {
  if (typeof text !== 'string' || text.length === 0) return 0
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars / 1.5 + otherChars / 4)
}

export function enhanceUsageWithEstimates(request: unknown, response: ChatCompletionResponse): ChatCompletionResponse {
  if (response.usage) return response

  const req = isRecord(request) ? request : {}
  const messages = Array.isArray(req.messages) ? req.messages : []
  const promptText = messages
    .map((m) => (isRecord(m) && typeof m.content === 'string' ? m.content : ''))
    .filter(Boolean)
    .join(' ')
  const completionText = response.choices?.[0]?.message?.content ?? ''

  return {
    ...response,
    usage: {
      prompt_tokens: estimateTokenCount(promptText),
      completion_tokens: estimateTokenCount(completionText),
      total_tokens: estimateTokenCount(promptText + completionText)
    }
  }
}
