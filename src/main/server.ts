import http from 'node:http'
import { Readable } from 'node:stream'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import type { OpenAIError } from './types/openai.js'
import { mapModelName, validateChatCompletionRequest, validateEmbeddingRequest } from './utils/validation.js'
import { enhanceChatCompletionResponse, enhanceModelsResponse, enhanceUsageWithEstimates } from './utils/response.js'
import type { LocalRouterConfig } from '../shared/types.js'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'
const REQUEST_BODY_MAX_BYTES = 2 * 1024 * 1024
const UPSTREAM_TIMEOUT_MS = 30_000

function getApiKey(config: LocalRouterConfig): string | null {
  return config.apiKey || process.env.DEEPSEEK_API_KEY || null
}

function checkLocalAuth(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig): boolean {
  if (!config.localApiKey) return true
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token !== config.localApiKey) {
    sendError(res, 401, 'Invalid authentication. Please provide a valid local API key.', 'unauthorized', 'authorization', 'authentication_error')
    return false
  }
  return true
}

function sendJson(res: http.ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  res.end(body)
}

function sendError(res: http.ServerResponse, status: number, message: string, code = 'local_error', param?: string | null, errorType: OpenAIError['error']['type'] = 'invalid_request_error'): void {
  const error: OpenAIError = {
    error: {
      message,
      type: errorType,
      param: param || null,
      code
    }
  }
  sendJson(res, status, error)
}

function mapStatusToErrorType(status: number): OpenAIError['error']['type'] {
  if (status === 401) return 'authentication_error'
  if (status === 403) return 'permission_denied_error'
  if (status === 404) return 'not_found_error'
  if (status === 429) return 'rate_limit_error'
  if (status >= 500) return 'api_error'
  return 'invalid_request_error'
}

function getUpstreamErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  const error = record.error
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  const message = record.message
  if (typeof message === 'string' && message.length > 0) return message
  return null
}

async function safeReadResponseJson(response: Response): Promise<unknown | null> {
  try {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function fetchWithTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function readJsonBody(req: http.IncomingMessage, maxBytes = REQUEST_BODY_MAX_BYTES): Promise<unknown> {
  const chunks: Buffer[] = []
  let totalBytes = 0
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk)
    totalBytes += buffer.length
    if (totalBytes > maxBytes) {
      throw new Error('payload_too_large')
    }
    chunks.push(buffer)
  }
  const raw = Buffer.concat(chunks).toString('utf-8')
  if (!raw) return null
  return JSON.parse(raw)
}

async function proxyModels(res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  let response: Response
  try {
    response = await fetchWithTimeout(`${DEEPSEEK_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  } catch {
    return sendError(res, 502, 'Failed to reach provider API. Please check your network connection.', 'upstream_unreachable', null, 'api_error')
  }

  if (response.status >= 400) {
    const payload = await safeReadResponseJson(response)
    const message = getUpstreamErrorMessage(payload) || 'Provider API returned an error.'
    return sendError(res, response.status, message, 'upstream_error', null, mapStatusToErrorType(response.status))
  }

  const rawData = await safeReadResponseJson(response)
  const enhancedData = enhanceModelsResponse(rawData)
  sendJson(res, response.status, enhancedData)
}

async function proxyChatCompletions(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  if (config.provider !== 'deepseek') {
    return sendError(res, 400, 'Provider not supported. Currently only DeepSeek is available.', 'provider_not_supported', null, 'invalid_request_error')
  }
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  let body: any
  try {
    body = await readJsonBody(req)
  } catch (error) {
    if (error instanceof Error && error.message === 'payload_too_large') {
      return sendError(res, 413, 'Request body is too large', 'payload_too_large', null, 'invalid_request_error')
    }
    return sendError(res, 400, 'Invalid JSON in request body', 'invalid_json', null, 'invalid_request_error')
  }

  if (!body) return sendError(res, 400, 'Request body cannot be empty', 'empty_body', null, 'invalid_request_error')

  const validation = validateChatCompletionRequest(body)
  if (!validation.isValid) {
    return sendError(res, 400, validation.error || 'Invalid request', 'invalid_request', validation.param)
  }

  const mappedRequest = {
    ...body,
    model: mapModelName(body.model)
  }

  const isStream = Boolean(mappedRequest.stream)

  let response: Response
  try {
    response = await fetchWithTimeout(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mappedRequest)
    })
  } catch {
    return sendError(res, 502, 'Failed to reach provider API. Please check your network connection.', 'upstream_unreachable', null, 'api_error')
  }

  if (isStream) {
    if (response.status >= 400) {
      const payload = await safeReadResponseJson(response)
      const message = getUpstreamErrorMessage(payload) || 'Provider API returned an error.'
      return sendError(res, response.status, message, 'upstream_error', null, mapStatusToErrorType(response.status))
    }

    if (!response.body) {
      return sendError(res, 502, 'Provider stream was empty', 'upstream_empty_stream', null, 'api_error')
    }

    res.writeHead(response.status, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })

    const stream = Readable.fromWeb(response.body as unknown as WebReadableStream)
    stream.on('data', (chunk) => res.write(chunk))
    stream.on('end', () => res.end())
    stream.on('error', () => res.end())
    return
  }

  if (response.status >= 400) {
    const payload = await safeReadResponseJson(response)
    const message = getUpstreamErrorMessage(payload) || 'Provider API returned an error.'
    return sendError(res, response.status, message, 'upstream_error', null, mapStatusToErrorType(response.status))
  }

  const rawData = await safeReadResponseJson(response)
  const enhancedData = enhanceChatCompletionResponse(rawData)
  const finalData = enhanceUsageWithEstimates(mappedRequest, enhancedData)
  sendJson(res, response.status, finalData)
}

async function proxyBalance(res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  if (config.provider !== 'deepseek') {
    return sendError(res, 400, 'Provider not supported. Currently only DeepSeek is available.', 'provider_not_supported', null, 'invalid_request_error')
  }
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  let response: Response
  try {
    response = await fetchWithTimeout(`${DEEPSEEK_BASE_URL}/user/balance`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    })
  } catch {
    return sendError(res, 502, 'Failed to reach provider API. Please check your network connection.', 'upstream_unreachable', null, 'api_error')
  }

  if (response.status >= 400) {
    const payload = await safeReadResponseJson(response)
    const message = getUpstreamErrorMessage(payload) || 'Provider API returned an error.'
    return sendError(res, response.status, message, 'upstream_error', null, mapStatusToErrorType(response.status))
  }

  const data = await safeReadResponseJson(response)
  sendJson(res, response.status, data)
}

async function proxyEmbeddings(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  let body: any
  try {
    body = await readJsonBody(req)
  } catch (error) {
    if (error instanceof Error && error.message === 'payload_too_large') {
      return sendError(res, 413, 'Request body is too large', 'payload_too_large', null, 'invalid_request_error')
    }
    return sendError(res, 400, 'Invalid JSON in request body', 'invalid_json', null, 'invalid_request_error')
  }

  if (!body) return sendError(res, 400, 'Request body cannot be empty', 'empty_body', null, 'invalid_request_error')

  const validation = validateEmbeddingRequest(body)
  if (!validation.isValid) {
    return sendError(res, 400, validation.error || 'Invalid request', 'invalid_request', validation.param)
  }

  return sendError(res, 501, 'Embeddings API is not supported by DeepSeek provider. Please use chat completions instead.', 'embeddings_not_supported', null, 'api_error')
}

function handleCors(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    res.end()
    return true
  }
  return false
}

export async function startServer(config: LocalRouterConfig) {
  const port = config.port
  const server = http.createServer(async (req, res) => {
    try {
      if (handleCors(req, res)) return

      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)

      if (url.pathname.startsWith('/v1/') && !checkLocalAuth(req, res, config)) {
        return
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { status: 'ok' })
      }

      if (req.method === 'GET' && url.pathname === '/v1/models') {
        return await proxyModels(res, config)
      }

      if (req.method === 'GET' && url.pathname === '/v1/balance') {
        return await proxyBalance(res, config)
      }

      if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
        return await proxyChatCompletions(req, res, config)
      }

      if (req.method === 'POST' && url.pathname === '/v1/embeddings') {
        return await proxyEmbeddings(req, res, config)
      }

      return sendError(res, 404, 'Endpoint not found', 'not_found', null, 'not_found_error')
    } catch (error) {
      return sendError(res, 500, 'Internal server error occurred while processing request', 'internal_error', null, 'internal_server_error')
    }
  })

  return new Promise<http.Server>((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server)
    })
  })
}
