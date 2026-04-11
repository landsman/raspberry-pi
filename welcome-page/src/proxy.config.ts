// Proxy paths used by the app at runtime.
// In development (make dev): Vite proxies these paths — see vite.config.ts.
// In production (Docker): nginx proxies these paths — see docker/nginx.conf.
const STATUS_CODEBERG_ORG = '/proxy/status-codeberg-org'
const SLACK_STATUS_COM = '/proxy/slack-status-com'
export const PROXY_PATHS = {
  STATUS_CODEBERG_ORG,
  SLACK_STATUS_COM,
} as const

// Vite dev server proxy config — imported by vite.config.ts.
export const proxies = {
  [STATUS_CODEBERG_ORG]: {
    target: 'https://status.codeberg.org',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(STATUS_CODEBERG_ORG, ''),
  },
  [SLACK_STATUS_COM]: {
    target: 'https://slack-status.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(SLACK_STATUS_COM, ''),
  },
}
