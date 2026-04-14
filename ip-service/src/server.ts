import {handleRequest} from "./handler.ts";

/**
 * Bun server configuration
 */
// noinspection JSUnusedGlobalSymbols
export default {
  port: 3000,
  async fetch(request: Request) {
    try {
      return await handleRequest(request)
    } catch (err) {
      console.error('Server error:', err)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
}

console.log('IP Service (Bun) listening on port 3000')
