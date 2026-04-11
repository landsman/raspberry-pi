import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNetworkStatus } from '../use-network-status.ts'

async function fetchIpv4(): Promise<string> {
  const response = await fetch('https://api4.ipify.org?format=json')
  const data = (await response.json()) as { ip: string }
  return data.ip
}

async function fetchIpv6(): Promise<string> {
  const response = await fetch('https://api6.ipify.org?format=json')
  const data = (await response.json()) as { ip: string }
  return data.ip
}

export function useIpAddress() {
  const queryClient = useQueryClient()
  const { isOnline } = useNetworkStatus()

  useEffect(() => {
    if (isOnline) {
      void queryClient.invalidateQueries({ queryKey: ['ip-address-v4'] })
      void queryClient.invalidateQueries({ queryKey: ['ip-address-v6'] })
    }
  }, [isOnline, queryClient])

  const { data: ipv4, isLoading: loadingV4 } = useQuery({
    queryKey: ['ip-address-v4'],
    queryFn: fetchIpv4,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  const { data: ipv6, isLoading: loadingV6 } = useQuery({
    queryKey: ['ip-address-v6'],
    queryFn: fetchIpv6,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  return {
    ipv4: ipv4 ?? null,
    ipv6: ipv6 ?? null,
    loading: loadingV4 || loadingV6,
    isOnline,
  }
}
