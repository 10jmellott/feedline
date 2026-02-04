// Default CORS proxy (can be configured)
const DEFAULT_PROXY = 'https://corsproxy.10jmellott.workers.dev/?'

let proxyUrl = DEFAULT_PROXY

export function buildProxiedUrl(targetUrl: string): string {
  return `${proxyUrl}url=${encodeURIComponent(targetUrl)}`
}

export async function fetchWithProxy(url: string, options?: RequestInit): Promise<Response> {
  const proxiedUrl = buildProxiedUrl(url)
  return fetch(proxiedUrl, options)
}
