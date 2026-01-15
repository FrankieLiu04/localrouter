import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

type LocalRouterConfig = {
  port: number
  apiKey: string
  localApiKey: string
  provider: 'deepseek'
}

const DEFAULT_PORT = 8787

function buildBaseUrl(port: number) {
  return `http://127.0.0.1:${port}/v1`
}

function maskKey(value: string) {
  if (!value) return ''
  const suffix = value.slice(-4)
  return `••••${suffix}`
}

function generateKey() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

async function init() {
  if (!app) return

  const api = (window as any).localrouter
  const config: LocalRouterConfig = (await api?.getConfig?.()) ?? {
    port: DEFAULT_PORT,
    apiKey: '',
    localApiKey: '',
    provider: 'deepseek'
  }
  let currentConfig = { ...config }
  const baseUrl = buildBaseUrl(currentConfig.port)

  app.innerHTML = `
    <div class="container">
      <header>
        <h1>LocalRouter</h1>
        <p>OpenAI 兼容本地代理（DeepSeek 首发）</p>
      </header>
      <section class="card">
        <h2>本地 API（OpenAI 兼容）</h2>
        <div class="grid">
          <div class="row">
            <p class="label">Base URL</p>
            <div class="inline">
              <code id="base-url">${baseUrl}</code>
              <button id="copy-base" type="button">复制</button>
            </div>
          </div>
          <div class="row">
            <p class="label">健康检查</p>
            <button id="health-check" type="button">检查</button>
          </div>
          <div class="row">
            <p class="label">本地 API Key</p>
            <div class="row">
              <input id="local-key-input" type="text" placeholder="留空将生成" value="${currentConfig.localApiKey}" />
              <button id="gen-key" type="button">生成</button>
              <button id="copy-key" type="button">复制</button>
            </div>
          </div>
          <p class="hint">调用本地 API 时使用 Header：Authorization: Bearer &lt;Local API Key&gt;</p>
        </div>
      </section>
      <section class="card">
        <h2>Provider 配置</h2>
        <form id="config-form" class="form">
          <label>
            Provider
            <select id="provider-select">
              <option value="deepseek" ${currentConfig.provider === 'deepseek' ? 'selected' : ''}>DeepSeek</option>
            </select>
          </label>
          <label>
            DeepSeek API Key（已保存：<span id="key-status">${maskKey(currentConfig.apiKey)}</span>）
            <input id="key-input" type="password" placeholder="留空则保留已保存的 Key" />
          </label>
          <div class="actions">
            <button type="submit">保存</button>
            <button id="balance-check" type="button" class="secondary">查询余额</button>
            <span id="save-status" class="status"></span>
          </div>
          <p class="hint">配置将写入本地配置文件并同步到主进程。</p>
        </form>
      </section>
    </div>
  `

  const form = document.querySelector<HTMLFormElement>('#config-form')
  const portInput = document.querySelector<HTMLInputElement>('#port-input')
  const keyInput = document.querySelector<HTMLInputElement>('#key-input')
  const localKeyInput = document.querySelector<HTMLInputElement>('#local-key-input')
  const genKeyButton = document.querySelector<HTMLButtonElement>('#gen-key')
  const saveStatus = document.querySelector<HTMLSpanElement>('#save-status')
  const baseUrlEl = document.querySelector<HTMLElement>('#base-url')
  const keyStatus = document.querySelector<HTMLElement>('#key-status')
  const copyBase = document.querySelector<HTMLButtonElement>('#copy-base')
  const copyKey = document.querySelector<HTMLButtonElement>('#copy-key')
  const healthCheck = document.querySelector<HTMLButtonElement>('#health-check')
  const providerSelect = document.querySelector<HTMLSelectElement>('#provider-select')
  const balanceCheck = document.querySelector<HTMLButtonElement>('#balance-check')

  genKeyButton?.addEventListener('click', () => {
    if (localKeyInput) localKeyInput.value = generateKey()
  })

  copyBase?.addEventListener('click', async () => {
    const ok = await copyText(buildBaseUrl(currentConfig.port))
    if (saveStatus) saveStatus.textContent = ok ? '已复制' : '复制失败'
    setTimeout(() => {
      if (saveStatus) saveStatus.textContent = ''
    }, 1200)
  })

  copyKey?.addEventListener('click', async () => {
    const value = localKeyInput?.value?.trim() || currentConfig.localApiKey
    const ok = await copyText(value)
    if (saveStatus) saveStatus.textContent = ok ? '已复制' : '复制失败'
    setTimeout(() => {
      if (saveStatus) saveStatus.textContent = ''
    }, 1200)
  })

  healthCheck?.addEventListener('click', async () => {
    const url = `http://127.0.0.1:${currentConfig.port}/health`
    let message = '服务未响应'
    try {
      const res = await fetch(url)
      const data = await res.json()
      message = data?.status === 'ok' ? '服务运行正常' : '服务异常'
    } catch {
      message = '服务未响应'
    }

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = `
      <div class="modal-content">
        <h3>健康检查</h3>
        <p>${message}</p>
        <button id="close-modal" type="button">关闭</button>
      </div>
    `
    document.body.appendChild(modal)
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove()
    })
    const close = modal.querySelector<HTMLButtonElement>('#close-modal')
    close?.addEventListener('click', () => modal.remove())
  })

  balanceCheck?.addEventListener('click', async () => {
    const url = `http://127.0.0.1:${currentConfig.port}/v1/balance`
    let message = '服务未响应'
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentConfig.localApiKey}`
        }
      })
      const data = await res.json()
      if (data?.balance_infos?.length) {
        const info = data.balance_infos[0]
        message = `可用: ${info.is_available}\n余额: ${info.total_balance} ${info.currency}`
      } else {
        message = JSON.stringify(data)
      }
    } catch {
      message = '服务未响应'
    }

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = `
      <div class="modal-content">
        <h3>余额查询</h3>
        <pre class="code-block">${message}</pre>
        <button id="close-modal" type="button">关闭</button>
      </div>
    `
    document.body.appendChild(modal)
    modal.addEventListener('click', (event) => {
      if (event.target === modal) modal.remove()
    })
    const close = modal.querySelector<HTMLButtonElement>('#close-modal')
    close?.addEventListener('click', () => modal.remove())
  })

  form?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const portValue = Number(portInput?.value ?? DEFAULT_PORT)
    const nextConfig: Partial<LocalRouterConfig> = {
      port: Number.isFinite(portValue) ? portValue : DEFAULT_PORT,
      apiKey: keyInput?.value?.trim() || currentConfig.apiKey,
      localApiKey: localKeyInput?.value?.trim() || currentConfig.localApiKey || generateKey(),
      provider: (providerSelect?.value as 'deepseek') || 'deepseek'
    }
    const updated: LocalRouterConfig = await api?.setConfig?.(nextConfig)
    if (updated) {
      currentConfig = updated
      if (baseUrlEl) baseUrlEl.textContent = buildBaseUrl(updated.port)
      if (healthCheck) {
        healthCheck.disabled = false
      }
      if (keyStatus) keyStatus.textContent = maskKey(updated.apiKey)
      if (keyInput) keyInput.value = ''
    }

    if (saveStatus) saveStatus.textContent = '已保存'
    setTimeout(() => {
      if (saveStatus) saveStatus.textContent = ''
    }, 1500)
  })
}

init()
