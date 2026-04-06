// Proxy paths used by the app at runtime.
// In development (make dev): Vite proxies these paths — see vite.config.ts.
// In production (Docker): nginx proxies these paths — see docker/nginx.conf.
const STATUS_CODEBERG_ORG = '/proxy/status-codeberg-org'

export const PROXY_PATHS = {
  STATUS_CODEBERG_ORG,
} as const

// Vite dev server proxy config — imported by vite.config.ts.
export const proxies = {
  [STATUS_CODEBERG_ORG]: {
    target: 'https://status.codeberg.org',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(STATUS_CODEBERG_ORG, ''),
  },
}
