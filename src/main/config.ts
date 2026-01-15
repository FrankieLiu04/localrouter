import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { App } from 'electron'

export type LocalRouterConfig = {
  port: number
  apiKey: string
  localApiKey: string
  provider: 'deepseek'
}

export const DEFAULT_CONFIG: LocalRouterConfig = {
  port: 8787,
  apiKey: '',
  localApiKey: '',
  provider: 'deepseek'
}

function sanitizeConfig(input: Partial<LocalRouterConfig>): LocalRouterConfig {
  const port = typeof input.port === 'number' && input.port >= 1024 && input.port <= 65535
    ? input.port
    : DEFAULT_CONFIG.port
  const apiKey = typeof input.apiKey === 'string' ? input.apiKey : DEFAULT_CONFIG.apiKey
  const localApiKey = typeof input.localApiKey === 'string' ? input.localApiKey : DEFAULT_CONFIG.localApiKey
  const provider = input.provider === 'deepseek' ? 'deepseek' : DEFAULT_CONFIG.provider
  return { port, apiKey, localApiKey, provider }
}

export async function readConfig(app: App): Promise<LocalRouterConfig> {
  const configPath = join(app.getPath('userData'), 'config.json')
  try {
    const raw = await readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<LocalRouterConfig>
    return sanitizeConfig(parsed)
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

export async function writeConfig(app: App, config: LocalRouterConfig): Promise<void> {
  const dir = app.getPath('userData')
  const configPath = join(dir, 'config.json')
  await mkdir(dir, { recursive: true })
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

export function normalizeConfig(input: Partial<LocalRouterConfig>): LocalRouterConfig {
  return sanitizeConfig(input)
}
