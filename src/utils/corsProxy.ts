// Default CORS proxy (can be configured)
const DEFAULT_PROXY = 'https://corsproxy.io/?'

let proxyUrl = DEFAULT_PROXY

export function setProxyUrl(url: string): void {
  proxyUrl = url
}

export function getProxyUrl(): string {
  return proxyUrl
}

export function buildProxiedUrl(targetUrl: string): string {
  return `${proxyUrl}${encodeURIComponent(targetUrl)}`
}

export async function fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
  const proxiedUrl = buildProxiedUrl(url)
  return fetch(proxiedUrl, options)
}
