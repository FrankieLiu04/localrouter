export type LocalRouterProvider = 'deepseek'

export type LocalRouterConfig = {
  port: number
  apiKey: string
  localApiKey: string
  provider: LocalRouterProvider
}

export type LocalRouterAPI = {
  getConfig: () => Promise<LocalRouterConfig>
  setConfig: (config: Partial<LocalRouterConfig>) => Promise<LocalRouterConfig>
}
