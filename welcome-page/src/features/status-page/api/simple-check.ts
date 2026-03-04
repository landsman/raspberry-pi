import type { StatusPageData } from './types'

export async function fetchSimpleCheck(url: string): Promise<StatusPageData> {
  try {
    // First, try a simple fetch. This will check for a 200 response.
    // However, it's vulnerable to CORS issues.
    const response = await fetch(url, { cache: 'no-store' })
    if (response.ok) {
      return {
        status: { indicator: 'none', description: 'ok' },
        components: [],
        incidents: [],
      }
    }
    const error = new Error(`HTTP ${response.status}`)
    console.error(`Simple check failed for ${url}:`, error)
    throw error
  } catch (err) {
    // If it's not an HTTP error (e.g., CORS failure), try a 'no-cors' HEAD request.
    // While we can't see the status code, a successful 'no-cors' fetch means
    // the server is at least reachable and responding.
    if (!(err instanceof Error) || !err.message.startsWith('HTTP')) {
      try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' })
        return {
          status: { indicator: 'none', description: 'responding' },
          components: [],
          incidents: [],
        }
      } catch (headErr) {
        console.error(`Simple check failed for ${url} (CORS and HEAD):`, headErr)
      }
    }

    if (!(err instanceof Error) || !err.message.startsWith('HTTP')) {
      console.error(`Simple check failed for ${url}:`, err)
    }

    return {
      status: { indicator: 'critical', description: (err as Error).message || 'offline' },
      components: [],
      incidents: [],
    }
  }
}
