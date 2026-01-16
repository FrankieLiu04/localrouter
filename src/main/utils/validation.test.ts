import { describe, expect, it } from 'vitest'
import { mapModelName, validateChatCompletionRequest, validateEmbeddingRequest } from './validation.js'

describe('mapModelName', () => {
  it('maps known OpenAI models to deepseek-chat', () => {
    expect(mapModelName('gpt-4o')).toBe('deepseek-chat')
  })

  it('passes through deepseek models', () => {
    expect(mapModelName('deepseek-coder')).toBe('deepseek-coder')
  })

  it('defaults to deepseek-chat', () => {
    expect(mapModelName('unknown')).toBe('deepseek-chat')
  })
})

describe('validateChatCompletionRequest', () => {
  it('rejects non-object request', () => {
    const res = validateChatCompletionRequest(null)
    expect(res.isValid).toBe(false)
  })

  it('rejects missing model', () => {
    const res = validateChatCompletionRequest({ messages: [{ role: 'user', content: 'hi' }] })
    expect(res.isValid).toBe(false)
    expect(res.param).toBe('model')
  })

  it('rejects empty messages', () => {
    const res = validateChatCompletionRequest({ model: 'gpt-4o', messages: [] })
    expect(res.isValid).toBe(false)
    expect(res.param).toBe('messages')
  })

  it('accepts minimal valid request', () => {
    const res = validateChatCompletionRequest({ model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] })
    expect(res.isValid).toBe(true)
  })
})

describe('validateEmbeddingRequest', () => {
  it('rejects missing input', () => {
    const res = validateEmbeddingRequest({ model: 'text-embedding-3-small' })
    expect(res.isValid).toBe(false)
    expect(res.param).toBe('input')
  })

  it('rejects invalid dimensions', () => {
    const res = validateEmbeddingRequest({ model: 'text-embedding-3-small', input: 'x', dimensions: 99999 })
    expect(res.isValid).toBe(false)
    expect(res.param).toBe('dimensions')
  })

  it('accepts string input', () => {
    const res = validateEmbeddingRequest({ model: 'text-embedding-3-small', input: 'x' })
    expect(res.isValid).toBe(true)
  })
})

