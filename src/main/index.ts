import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell } from 'electron'
import { join } from 'node:path'
import type { Server } from 'node:http'
import { startServer } from './server'
import { DEFAULT_CONFIG, normalizeConfig, readConfig, writeConfig, type LocalRouterConfig } from './config'

let mainWindow: BrowserWindow | null = null
let server: Server | null = null
let config: LocalRouterConfig = { ...DEFAULT_CONFIG }
let tray: Tray | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    show: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js')
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

  if (!app.isPackaged) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getTrayIcon() {
  const dataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W8ZQAAAAASUVORK5CYII='
  const image = nativeImage.createFromDataURL(dataUrl)
  image.setTemplateImage(true)
  return image
}

function baseUrl(port: number) {
  return `http://127.0.0.1:${port}/v1`
}

function updateTrayMenu() {
  if (!tray) {
    tray = new Tray(getTrayIcon())
    tray.setToolTip('LocalRouter')
  }

  const statusLabel = server ? `运行中 (端口 ${config.port})` : '已停止'

  const menu = Menu.buildFromTemplate([
    { label: `状态: ${statusLabel}`, enabled: false },
    { type: 'separator' },
    {
      label: '打开主窗口',
      click: () => {
        if (!mainWindow) createWindow()
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '打开本地 API Base URL',
      click: () => shell.openExternal(baseUrl(config.port))
    },
    {
      label: '打开健康检查',
      click: () => shell.openExternal(`http://127.0.0.1:${config.port}/health`)
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])

  tray.setContextMenu(menu)
}

async function restartServerIfNeeded(previousPort: number, nextPort: number) {
  if (!server) {
    server = await startServer(config)
    return
  }
  if (nextPort === previousPort) return
  await new Promise<void>((resolve) => {
    server?.close(() => resolve())
  })
  server = await startServer(config)
}

app.whenReady().then(async () => {
  config = await readConfig(app)
  server = await startServer(config)
  updateTrayMenu()
  createWindow()

  ipcMain.handle('config:get', () => config)
  ipcMain.handle('config:set', async (_event, next: Partial<LocalRouterConfig>) => {
    const normalized = normalizeConfig(next)
    const previousPort = config.port
    const nextPort = normalized.port

    config.port = normalized.port
    config.apiKey = normalized.apiKey
    config.localApiKey = normalized.localApiKey
    config.provider = normalized.provider

    await writeConfig(app, config)
    await restartServerIfNeeded(previousPort, nextPort)
    updateTrayMenu()

    return config
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
