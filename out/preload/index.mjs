import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("localrouter", {
  getConfig: () => ipcRenderer.invoke("config:get"),
  setConfig: (config) => ipcRenderer.invoke("config:set", config)
});
