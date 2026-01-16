import { contextBridge, ipcRenderer } from 'electron'
import type { LocalRouterAPI, LocalRouterConfig } from '../shared/types.js'

contextBridge.exposeInMainWorld('localrouter', {
  getConfig: () => ipcRenderer.invoke('config:get') as Promise<LocalRouterConfig>,
  setConfig: (config: Partial<LocalRouterConfig>) =>
    ipcRenderer.invoke('config:set', config) as Promise<LocalRouterConfig>
})

export type { LocalRouterAPI, LocalRouterConfig } from '../shared/types.js'
