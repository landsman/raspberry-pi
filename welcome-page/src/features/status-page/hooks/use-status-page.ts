import { useQuery } from '@tanstack/react-query'

const REFRESH_INTERVAL = 60_000 // ms

export interface StatusComponent {
  id: string
  name: string
  status: string
  group: boolean
  group_id: string | null
}

export interface IncidentUpdate {
  body: string
  created_at: string
}

export interface Incident {
  id: string
  name: string
  status: string
  incident_updates?: IncidentUpdate[]
}

export interface StatusPageData {
  status: {
    indicator: string
    description: string
  }
  components: StatusComponent[]
  incidents: Incident[]
}

export interface UseStatusPageResult {
  data: StatusPageData | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

async function fetchStatusPage(baseUrl: string): Promise<StatusPageData> {
  const res = await fetch(`${baseUrl}/api/v2/summary.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<StatusPageData>
}

export function useStatusPage(baseUrl: string): UseStatusPageResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['status', baseUrl],
    queryFn: () => fetchStatusPage(baseUrl),
    refetchInterval: REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: REFRESH_INTERVAL / 2,
  })

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => void refetch(),
  }
}
