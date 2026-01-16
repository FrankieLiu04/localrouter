import './style.css'
import type { LocalRouterAPI, LocalRouterConfig } from '../../shared/types.js'

declare global {
  interface Window {
    localrouter?: LocalRouterAPI
  }
}

const DEFAULT_PORT = 8787

function buildBaseUrl(port: number) {
  return `http://127.0.0.1:${port}/v1`
}

function maskKey(value: string) {
  if (!value) return ''
  const suffix = value.slice(-4)
  return `••••••••${suffix}`
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

function showToast(message: string, duration = 2000) {
  const toast = document.querySelector<HTMLDivElement>('#save-status')
  if (!toast) return
  toast.textContent = message
  toast.classList.add('visible')
  setTimeout(() => {
    toast.classList.remove('visible')
  }, duration)
}

function showModal(title: string, content: string) {
  const modal = document.createElement('div')
  modal.className = 'modal'
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <p>${content}</p>
      <button id="close-modal" type="button">Close</button>
    </div>
  `
  document.body.appendChild(modal)
  
  const close = () => modal.remove()
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close()
  })
  modal.querySelector('#close-modal')?.addEventListener('click', close)
}

async function init() {
  const api = window.localrouter

  const portInput = document.querySelector<HTMLInputElement>('#port-input')
  const keyInput = document.querySelector<HTMLInputElement>('#key-input')
  const localKeyInput = document.querySelector<HTMLInputElement>('#local-key-input')
  const providerSelect = document.querySelector<HTMLSelectElement>('#provider-select')
  const baseUrlInput = document.querySelector<HTMLInputElement>('#base-url')

  const genKeyBtn = document.querySelector<HTMLButtonElement>('#gen-key')
  const copyBaseBtn = document.querySelector<HTMLButtonElement>('#copy-base')
  const copyKeyBtn = document.querySelector<HTMLButtonElement>('#copy-key')
  const saveBtn = document.querySelector<HTMLButtonElement>('#save-btn')
  const healthBtn = document.querySelector<HTMLButtonElement>('#health-check')
  const balanceBtn = document.querySelector<HTMLButtonElement>('#balance-check')
  const keyStatus = document.querySelector<HTMLElement>('#key-status')

  let currentConfig: LocalRouterConfig = (await api?.getConfig?.()) ?? {
    port: DEFAULT_PORT,
    apiKey: '',
    localApiKey: '',
    provider: 'deepseek'
  }

  const render = () => {
    if (portInput) portInput.value = String(currentConfig.port)
    if (baseUrlInput) baseUrlInput.value = buildBaseUrl(currentConfig.port)
    if (localKeyInput) localKeyInput.value = currentConfig.localApiKey
    if (providerSelect) providerSelect.value = currentConfig.provider
    if (keyStatus) keyStatus.textContent = currentConfig.apiKey ? `Current: ${maskKey(currentConfig.apiKey)}` : 'No API key set'
  }
  render()

  genKeyBtn?.addEventListener('click', () => {
    if (localKeyInput) localKeyInput.value = generateKey()
  })

  copyBaseBtn?.addEventListener('click', async () => {
    const ok = await copyText(baseUrlInput?.value || '')
    showToast(ok ? 'URL copied to clipboard' : 'Failed to copy')
  })

  copyKeyBtn?.addEventListener('click', async () => {
    const ok = await copyText(localKeyInput?.value || '')
    showToast(ok ? 'Token copied to clipboard' : 'Failed to copy')
  })

  saveBtn?.addEventListener('click', async () => {
    const portValue = Number(portInput?.value ?? DEFAULT_PORT)
    const nextConfig: Partial<LocalRouterConfig> = {
      port: Number.isFinite(portValue) ? portValue : DEFAULT_PORT,
      apiKey: keyInput?.value?.trim() || currentConfig.apiKey,
      localApiKey: localKeyInput?.value?.trim() || '',
      provider: (providerSelect?.value as 'deepseek') || 'deepseek'
    }

    const updated = await api?.setConfig?.(nextConfig)
    if (updated) {
      currentConfig = updated
      if (keyInput) keyInput.value = ''
      render()
      showToast('Changes applied successfully')
    } else {
      showToast('Failed to save settings')
    }
  })

  healthBtn?.addEventListener('click', async () => {
    const url = `http://127.0.0.1:${currentConfig.port}/health`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const status = data?.status === 'ok' ? 'System Operational' : 'System Issues Detected'
      showModal('Health Check', status)
    } catch {
      showModal('Health Check', 'Server not responding. Please check if the port is correct.')
    }
  })

  balanceBtn?.addEventListener('click', async () => {
    const url = `http://127.0.0.1:${currentConfig.port}/v1/balance`
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${currentConfig.localApiKey}` }
      })
      const data = await res.json()
      
      let message = ''
      if (data?.balance_infos?.length) {
        const info = data.balance_infos[0]
        message = `Available: ${info.is_available ? 'Yes' : 'No'}\nBalance: ${info.total_balance} ${info.currency}`
      } else {
        message = JSON.stringify(data, null, 2)
      }
      showModal('Balance Info', message)
    } catch {
      showModal('Balance Info', 'Failed to fetch balance. Check your network and API Key.')
    }
  })
}

init()
