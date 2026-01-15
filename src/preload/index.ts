import { contextBridge, ipcRenderer } from 'electron'

export type LocalRouterConfig = {
  port: number
  apiKey: string
  localApiKey: string
  provider: 'deepseek'
}

contextBridge.exposeInMainWorld('localrouter', {
  getConfig: () => ipcRenderer.invoke('config:get') as Promise<LocalRouterConfig>,
  setConfig: (config: Partial<LocalRouterConfig>) =>
    ipcRenderer.invoke('config:set', config) as Promise<LocalRouterConfig>
})

export type LocalRouterAPI = {
  getConfig: () => Promise<LocalRouterConfig>
  setConfig: (config: Partial<LocalRouterConfig>) => Promise<LocalRouterConfig>
}
