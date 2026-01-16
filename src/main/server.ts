import http from 'node:http'
import { Readable } from 'node:stream'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import type { OpenAIError } from './types/openai.js'
import { mapModelName, validateChatCompletionRequest, validateEmbeddingRequest } from './utils/validation.js'
import { enhanceChatCompletionResponse, enhanceModelsResponse, enhanceUsageWithEstimates } from './utils/response.js'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

export type LocalRouterConfig = {
  port: number
  apiKey: string
  localApiKey: string
  provider: 'deepseek'
}

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

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf-8')
  if (!raw) return null
  return JSON.parse(raw)
}

async function proxyModels(res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  const rawData = await response.json()
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
  } catch {
    return sendError(res, 400, 'Invalid JSON in request body', 'invalid_json', null, 'invalid_request_error')
  }

  if (!body) return sendError(res, 400, 'Request body cannot be empty', 'empty_body', null, 'invalid_request_error')

  // 验证请求参数
  const validation = validateChatCompletionRequest(body)
  if (!validation.isValid) {
    return sendError(res, 400, validation.error || 'Invalid request', 'invalid_request', validation.param)
  }

  // 模型名称映射
  const mappedRequest = {
    ...body,
    model: mapModelName(body.model)
  }

  const isStream = Boolean(mappedRequest.stream)

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mappedRequest)
  })

  if (isStream) {
    res.writeHead(response.status, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })

    if (!response.body) {
      res.end()
      return
    }

    const stream = Readable.fromWeb(response.body as unknown as WebReadableStream)
    stream.on('data', (chunk) => res.write(chunk))
    stream.on('end', () => res.end())
    stream.on('error', () => res.end())
    return
}

  const rawData = await response.json()
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

  const response = await fetch(`${DEEPSEEK_BASE_URL}/user/balance`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json'
    }
  })

  const data = await response.json()
  sendJson(res, response.status, data)
}

async function proxyEmbeddings(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig): Promise<void> {
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing provider API key. Please configure your DeepSeek API key.', 'missing_api_key', null, 'authentication_error')

  let body: any
  try {
    body = await readJsonBody(req)
  } catch {
    return sendError(res, 400, 'Invalid JSON in request body', 'invalid_json', null, 'invalid_request_error')
  }

  if (!body) return sendError(res, 400, 'Request body cannot be empty', 'empty_body', null, 'invalid_request_error')

  // 验证请求参数
  const validation = validateEmbeddingRequest(body)
  if (!validation.isValid) {
    return sendError(res, 400, validation.error || 'Invalid request', 'invalid_request', validation.param)
  }

  // DeepSeek 目前不支持 embeddings API
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
      console.error('Server error:', error)
      return sendError(res, 500, 'Internal server error occurred while processing request', 'internal_error', null, 'internal_server_error')
    }
  })

  return new Promise<http.Server>((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server)
    })
  })
}
