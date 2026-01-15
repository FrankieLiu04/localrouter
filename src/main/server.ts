import http from 'node:http'
import { Readable } from 'node:stream'

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

function checkLocalAuth(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig) {
  if (!config.localApiKey) return true
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token !== config.localApiKey) {
    sendError(res, 401, 'Unauthorized', 'unauthorized')
    return false
  }
  return true
}

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*'
  })
  res.end(body)
}

function sendError(res: http.ServerResponse, status: number, message: string, code = 'local_error') {
  sendJson(res, status, {
    error: {
      message,
      type: 'invalid_request_error',
      code
    }
  })
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf-8')
  if (!raw) return null
  return JSON.parse(raw)
}

async function proxyModels(res: http.ServerResponse, config: LocalRouterConfig) {
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing DEEPSEEK_API_KEY', 'missing_api_key')

  const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })

  const data = await response.json()
  sendJson(res, response.status, data)
}

async function proxyChatCompletions(req: http.IncomingMessage, res: http.ServerResponse, config: LocalRouterConfig) {
  if (config.provider !== 'deepseek') {
    return sendError(res, 400, 'Provider not supported', 'provider_not_supported')
  }
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing DEEPSEEK_API_KEY', 'missing_api_key')

  let body: any
  try {
    body = await readJsonBody(req)
  } catch {
    return sendError(res, 400, 'Invalid JSON body', 'invalid_json')
  }

  if (!body) return sendError(res, 400, 'Empty request body', 'empty_body')

  const isStream = Boolean(body.stream)

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
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

    const stream = Readable.fromWeb(response.body)
    stream.on('data', (chunk) => res.write(chunk))
    stream.on('end', () => res.end())
    stream.on('error', () => res.end())
    return
  }

  const data = await response.json()
  sendJson(res, response.status, data)
}

async function proxyBalance(res: http.ServerResponse, config: LocalRouterConfig) {
  if (config.provider !== 'deepseek') {
    return sendError(res, 400, 'Provider not supported', 'provider_not_supported')
  }
  const apiKey = getApiKey(config)
  if (!apiKey) return sendError(res, 401, 'Missing DEEPSEEK_API_KEY', 'missing_api_key')

  const response = await fetch(`${DEEPSEEK_BASE_URL}/user/balance`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json'
    }
  })

  const data = await response.json()
  sendJson(res, response.status, data)
}

function handleCors(req: http.IncomingMessage, res: http.ServerResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
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

      return sendError(res, 404, 'Not Found', 'not_found')
    } catch (error) {
      return sendError(res, 500, 'Internal Server Error', 'internal_error')
    }
  })

  return new Promise<http.Server>((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server)
    })
  })
}
