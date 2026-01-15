import { app, ipcMain, BrowserWindow, Tray, Menu, shell, nativeImage } from "electron";
import { join } from "node:path";
import http from "node:http";
import { Readable } from "node:stream";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
function getApiKey(config2) {
  return config2.apiKey || process.env.DEEPSEEK_API_KEY || null;
}
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}
function sendError(res, status, message, code = "local_error") {
  sendJson(res, status, {
    error: {
      message,
      type: "invalid_request_error",
      code
    }
  });
}
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return null;
  return JSON.parse(raw);
}
async function proxyModels(res, config2) {
  const apiKey = getApiKey(config2);
  if (!apiKey) return sendError(res, 401, "Missing DEEPSEEK_API_KEY", "missing_api_key");
  const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });
  const data = await response.json();
  sendJson(res, response.status, data);
}
async function proxyChatCompletions(req, res, config2) {
  const apiKey = getApiKey(config2);
  if (!apiKey) return sendError(res, 401, "Missing DEEPSEEK_API_KEY", "missing_api_key");
  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendError(res, 400, "Invalid JSON body", "invalid_json");
  }
  if (!body) return sendError(res, 400, "Empty request body", "empty_body");
  const isStream = Boolean(body.stream);
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (isStream) {
    res.writeHead(response.status, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    if (!response.body) {
      res.end();
      return;
    }
    const stream = Readable.fromWeb(response.body);
    stream.on("data", (chunk) => res.write(chunk));
    stream.on("end", () => res.end());
    stream.on("error", () => res.end());
    return;
  }
  const data = await response.json();
  sendJson(res, response.status, data);
}
function handleCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}
async function startServer(config2) {
  const port = config2.port;
  const server2 = http.createServer(async (req, res) => {
    try {
      if (handleCors(req, res)) return;
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
      if (req.method === "GET" && url.pathname === "/health") {
        return sendJson(res, 200, { status: "ok" });
      }
      if (req.method === "GET" && url.pathname === "/v1/models") {
        return await proxyModels(res, config2);
      }
      if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
        return await proxyChatCompletions(req, res, config2);
      }
      return sendError(res, 404, "Not Found", "not_found");
    } catch (error) {
      return sendError(res, 500, "Internal Server Error", "internal_error");
    }
  });
  return new Promise((resolve) => {
    server2.listen(port, "127.0.0.1", () => {
      resolve(server2);
    });
  });
}
const DEFAULT_CONFIG = {
  port: 8787,
  apiKey: ""
};
function sanitizeConfig(input) {
  const port = typeof input.port === "number" && input.port >= 1024 && input.port <= 65535 ? input.port : DEFAULT_CONFIG.port;
  const apiKey = typeof input.apiKey === "string" ? input.apiKey : DEFAULT_CONFIG.apiKey;
  return { port, apiKey };
}
async function readConfig(app2) {
  const configPath = join(app2.getPath("userData"), "config.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    return sanitizeConfig(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
async function writeConfig(app2, config2) {
  const dir = app2.getPath("userData");
  const configPath = join(dir, "config.json");
  await mkdir(dir, { recursive: true });
  await writeFile(configPath, JSON.stringify(config2, null, 2), "utf-8");
}
function normalizeConfig(input) {
  return sanitizeConfig(input);
}
let mainWindow = null;
let server = null;
let config = { ...DEFAULT_CONFIG };
let tray = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 640,
    show: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js")
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
function getTrayIcon() {
  const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5W8ZQAAAAASUVORK5CYII=";
  const image = nativeImage.createFromDataURL(dataUrl);
  image.setTemplateImage(true);
  return image;
}
function baseUrl(port) {
  return `http://127.0.0.1:${port}/v1`;
}
function updateTrayMenu() {
  if (!tray) {
    tray = new Tray(getTrayIcon());
    tray.setToolTip("LocalRouter");
  }
  const statusLabel = server ? `运行中 (端口 ${config.port})` : "已停止";
  const menu = Menu.buildFromTemplate([
    { label: `状态: ${statusLabel}`, enabled: false },
    { type: "separator" },
    {
      label: "打开主窗口",
      click: () => {
        if (!mainWindow) createWindow();
        mainWindow?.show();
        mainWindow?.focus();
      }
    },
    {
      label: "打开本地 API Base URL",
      click: () => shell.openExternal(baseUrl(config.port))
    },
    {
      label: "打开健康检查",
      click: () => shell.openExternal(`http://127.0.0.1:${config.port}/health`)
    },
    { type: "separator" },
    { label: "退出", click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
}
async function restartServerIfNeeded(previousPort, nextPort) {
  if (!server) {
    server = await startServer(config);
    return;
  }
  if (nextPort === previousPort) return;
  await new Promise((resolve) => {
    server?.close(() => resolve());
  });
  server = await startServer(config);
}
app.whenReady().then(async () => {
  config = await readConfig(app);
  server = await startServer(config);
  updateTrayMenu();
  createWindow();
  ipcMain.handle("config:get", () => config);
  ipcMain.handle("config:set", async (_event, next) => {
    const normalized = normalizeConfig(next);
    const previousPort = config.port;
    const nextPort = normalized.port;
    config.port = normalized.port;
    config.apiKey = normalized.apiKey;
    await writeConfig(app, config);
    await restartServerIfNeeded(previousPort, nextPort);
    updateTrayMenu();
    return config;
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
