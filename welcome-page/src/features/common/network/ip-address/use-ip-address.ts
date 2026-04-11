import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { PROXY_PATHS } from '../../../../proxy.config.ts'
import { useNetworkStatus } from '../use-network-status.ts'

const QUERY_KEYS = {
  MY_IP: ['my-ip'] as const,
  MY_IPV6: ['my-ipv6'] as const,
}

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

  const { data: ipv4, isLoading: loadingV4 } = useQuery({
    queryKey: QUERY_KEYS.MY_IP,
    queryFn: () => fetchIp(PROXY_PATHS.MY_IP),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  const { data: ipv6, isLoading: loadingV6 } = useQuery({
    queryKey: QUERY_KEYS.MY_IPV6,
    queryFn: () => fetchIp(PROXY_PATHS.MY_IPV6),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  const isRealIpv6 = ipv6 != null && ipv6.includes(':')

  return {
    ipv4: ipv4 ?? null,
    ipv6: isRealIpv6 ? ipv6 : null,
    loading: loadingV4 || loadingV6,
    isOnline,
  }
}
