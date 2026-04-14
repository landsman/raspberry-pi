import { useQuery } from '@tanstack/react-query'

async function fetchIpAddress(): Promise<string> {
  const response = await fetch('https://api.ipify.org?format=json')
  const data = (await response.json()) as { ip: string }
  return data.ip
}

export function useIpAddress() {
  const { data, isLoading } = useQuery({
    queryKey: ['ip-address'],
    queryFn: fetchIpAddress,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  })

  return { ip: data ?? null, loading: isLoading }
}
