import { match, P } from 'ts-pattern'
import {
  handleIpRequest,
  handleJsonHeadersRequest,
  handleNotFound,
  handleTextHeadersRequest,
} from './features.ts'

const route = {
  INDEX: '/',
  JSON: '/json',
  HEADERS: ['/headers', '/more'] as const,
}

/**
 * Main request orchestrator (Fetch API-style)
 */
export async function handleRequest(request: Request): Promise<Response> {
  const { pathname: path } = new URL(request.url)

  return match(path)
    .with(route.INDEX, () => handleIpRequest(request))
    .with(route.JSON, () => handleJsonHeadersRequest(request))
    .with(P.union(...route.HEADERS), () => handleTextHeadersRequest(request))
    .otherwise(() => handleNotFound())
}
