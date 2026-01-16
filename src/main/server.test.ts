import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startServer } from './server.js'
import type { LocalRouterConfig } from '../shared/types.js'

function requestJson(options: http.RequestOptions, body?: unknown): Promise<{ status: number; headers: http.IncomingHttpHeaders; json: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {})
        }
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c) => chunks.push(Buffer.from(c)))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf-8')
          const json = text ? JSON.parse(text) : null
          resolve({ status: res.statusCode || 0, headers: res.headers, json })
        })
      }
    )
    req.on('error', reject)
    if (body !== undefined) req.write(JSON.stringify(body))
    req.end()
  })
}

describe('startServer (integration)', () => {
  const baseConfig: LocalRouterConfig = {
    port: 0,
    apiKey: 'provider-key',
    localApiKey: 'local-key',
    provider: 'deepseek'
  }

  let server: http.Server | null = null
  let port = 0

  beforeEach(async () => {
    server = await startServer({ ...baseConfig })
    port = (server.address() as AddressInfo).port
  })

  afterEach(async () => {
    if (!server) return
    await new Promise<void>((resolve) => server?.close(() => resolve()))
    server = null
    vi.restoreAllMocks()
  })

  it('responds to /health without auth', async () => {
    const res = await requestJson({ hostname: '127.0.0.1', port, method: 'GET', path: '/health' })
    expect(res.status).toBe(200)
    expect(res.json).toEqual({ status: 'ok' })
  })

  it('requires local auth for /v1/*', async () => {
    const res = await requestJson({ hostname: '127.0.0.1', port, method: 'GET', path: '/v1/models' })
    expect(res.status).toBe(401)
    expect(res.json?.error?.type).toBe('authentication_error')
  })

  it('returns 400 on invalid JSON', async () => {
    const raw = await new Promise<{ status: number; json: any }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          method: 'POST',
          path: '/v1/chat/completions',
          headers: {
            Authorization: `Bearer ${baseConfig.localApiKey}`,
            'Content-Type': 'application/json'
          }
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (c) => chunks.push(Buffer.from(c)))
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf-8')
            resolve({ status: res.statusCode || 0, json: JSON.parse(text) })
          })
        }
      )
      req.on('error', reject)
      req.write('{"not":') 
      req.end()
    })

    expect(raw.status).toBe(400)
    expect(raw.json?.error?.code).toBe('invalid_json')
  })

  it('proxies /v1/models with auth and normalizes response', async () => {
    const mockFetch = vi.fn(async () => {
      return new Response(JSON.stringify({ data: [{ id: 'deepseek-chat', created: 1, owned_by: 'deepseek' }] }), { status: 200 })
    })
    vi.stubGlobal('fetch', mockFetch as any)

    const res = await requestJson({
      hostname: '127.0.0.1',
      port,
      method: 'GET',
      path: '/v1/models',
      headers: { Authorization: `Bearer ${baseConfig.localApiKey}` }
    })

    expect(res.status).toBe(200)
    expect(res.json?.object).toBe('list')
    expect(Array.isArray(res.json?.data)).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

