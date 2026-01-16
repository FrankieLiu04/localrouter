import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, normalizeConfig } from './config.js'

describe('normalizeConfig', () => {
  it('defaults to safe values', () => {
    const res = normalizeConfig({})
    expect(res).toEqual(DEFAULT_CONFIG)
  })

  it('clamps invalid port to default', () => {
    expect(normalizeConfig({ port: 1 }).port).toBe(DEFAULT_CONFIG.port)
    expect(normalizeConfig({ port: 99999 }).port).toBe(DEFAULT_CONFIG.port)
  })

  it('accepts valid port and strings', () => {
    const res = normalizeConfig({ port: 8788, apiKey: 'k', localApiKey: 'lk', provider: 'deepseek' })
    expect(res.port).toBe(8788)
    expect(res.apiKey).toBe('k')
    expect(res.localApiKey).toBe('lk')
    expect(res.provider).toBe('deepseek')
  })
})

