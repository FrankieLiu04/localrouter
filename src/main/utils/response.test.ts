import { describe, expect, it } from 'vitest'
import { enhanceChatCompletionResponse, enhanceModelsResponse, enhanceUsageWithEstimates } from './response.js'

describe('enhanceChatCompletionResponse', () => {
  it('fills defaults for non-object input', () => {
    const res = enhanceChatCompletionResponse(null)
    expect(res.object).toBe('chat.completion')
    expect(typeof res.id).toBe('string')
    expect(typeof res.created).toBe('number')
    expect(res.model).toBe('deepseek-chat')
    expect(Array.isArray(res.choices)).toBe(true)
    expect(res.choices.length).toBeGreaterThan(0)
    expect(res.choices[0]?.message.role).toBe('assistant')
  })

  it('normalizes choices/message fields', () => {
    const res = enhanceChatCompletionResponse({
      id: 'x',
      model: 'm',
      created: 123,
      choices: [
        {
          index: '2',
          finish_reason: 'stop',
          message: {
            role: 'assistant',
            content: 'hi',
            name: 'n',
            function_call: { name: 'f' },
            tool_calls: [{ id: 't' }]
          }
        }
      ]
    })
    expect(res.id).toBe('x')
    expect(res.model).toBe('m')
    expect(res.created).toBe(123)
    expect(res.choices[0]?.index).toBe(2)
    expect(res.choices[0]?.message.content).toBe('hi')
    expect(res.choices[0]?.message.name).toBe('n')
    expect(res.choices[0]?.message.function_call).toEqual({ name: 'f' })
    expect(res.choices[0]?.message.tool_calls).toEqual([{ id: 't' }])
  })
})

describe('enhanceModelsResponse', () => {
  it('returns default list if data is missing', () => {
    const res = enhanceModelsResponse(null)
    expect(res.object).toBe('list')
    expect(res.data[0]?.id).toBe('deepseek-chat')
  })

  it('normalizes model entries', () => {
    const res = enhanceModelsResponse({
      data: [
        { id: 123, created: '1', owned_by: null },
        { id: 'deepseek-coder', created: 2, owned_by: 'deepseek' }
      ]
    })
    expect(res.data[0]?.id).toBe('deepseek-chat')
    expect(res.data[0]?.created).toBe(1)
    expect(res.data[0]?.owned_by).toBe('deepseek')
    expect(res.data[1]?.id).toBe('deepseek-coder')
  })
})

describe('enhanceUsageWithEstimates', () => {
  it('adds usage if missing', () => {
    const response = enhanceChatCompletionResponse({
      choices: [{ message: { role: 'assistant', content: 'hello' }, finish_reason: 'stop', index: 0 }]
    })
    const res = enhanceUsageWithEstimates(
      { messages: [{ role: 'user', content: '你好' }] },
      { ...response, usage: undefined }
    )
    expect(res.usage).toBeDefined()
    expect(res.usage?.prompt_tokens).toBeGreaterThan(0)
    expect(res.usage?.completion_tokens).toBeGreaterThan(0)
    expect(res.usage?.total_tokens).toBeGreaterThan(0)
  })

  it('keeps usage if already present', () => {
    const response = enhanceChatCompletionResponse({
      usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 }
    })
    const res = enhanceUsageWithEstimates({}, response)
    expect(res.usage).toEqual({ prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 })
  })
})

