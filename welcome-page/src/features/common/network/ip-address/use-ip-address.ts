import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { PROXY_PATHS } from '../../../../proxy.config.ts'
import { useNetworkStatus } from '../use-network-status.ts'

const QUERY_KEYS = {
  MY_IP: ['my-ip'] as const,
  MY_IPV6: ['my-ipv6'] as const,
}

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

// In dev (Vite), the browser is on localhost, so nginx always sees 127.0.0.1/::1.
// Call the public ipify APIs directly — they support CORS.
// In production (nginx on the Pi), use the local $remote_addr endpoints instead.
const IS_DEV = import.meta.env.DEV
const IPV4_URL = IS_DEV ? 'https://api4.ipify.org?format=json' : PROXY_PATHS.MY_IP
const IPV6_URL = IS_DEV ? 'https://api6.ipify.org?format=json' : PROXY_PATHS.MY_IPV6

async function fetchIp(url: string): Promise<string> {
  const response = await fetch(url)
  const data = (await response.json()) as { ip: string }
  return data.ip
}

export function useIpAddress() {
  const queryClient = useQueryClient()
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    if (isOnline) {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_IP })
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_IPV6 })
    }
  }, [isOnline, queryClient])

  const { data: ipv4Raw, isLoading: loadingV4 } = useQuery({
    queryKey: QUERY_KEYS.MY_IP,
    queryFn: () => fetchIp(IPV4_URL),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  const { data: ipv6Raw, isLoading: loadingV6 } = useQuery({
    queryKey: QUERY_KEYS.MY_IPV6,
    queryFn: () => fetchIp(IPV6_URL),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Guard each value:
  //  - ipv4 must not contain ':' (no IPv6 addresses) and not be a loopback (127.x or ::1)
  //  - ipv6 must contain ':' (real IPv6) and not be the loopback ::1
  const isRealIpv4 = ipv4Raw != null && !ipv4Raw.includes(':') && !LOOPBACK.has(ipv4Raw)
  const isRealIpv6 = ipv6Raw != null && ipv6Raw.includes(':') && !LOOPBACK.has(ipv6Raw)

  return {
    ipv4: isRealIpv4 ? ipv4Raw : null,
    ipv6: isRealIpv6 ? ipv6Raw : null,
    loading: loadingV4 || loadingV6,
    isOnline,
  }
}
