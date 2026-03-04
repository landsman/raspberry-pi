import { useQuery } from '@tanstack/react-query'
import type { Service } from '../services'

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

async function fetchAtlassian(baseUrl: string): Promise<StatusPageData> {
  const res = await fetch(`${baseUrl}/api/v2/summary.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as StatusPageData
  const description =
    data.status.indicator === 'none' ? 'All good' : data.status.description
  return { ...data, status: { ...data.status, description } }
}

function statusioCodeToIndicator(code: number): string {
  if (code === 100) return 'none'
  if (code === 200) return 'maintenance'
  if (code === 300) return 'minor'
  if (code === 400) return 'major'
  return 'critical'
}

function statusioCodeToComponentStatus(code: number): string {
  if (code === 100) return 'operational'
  if (code === 200) return 'under_maintenance'
  if (code === 300) return 'degraded_performance'
  if (code === 400) return 'partial_outage'
  return 'major_outage'
}

interface StatusioResponse {
  result: {
    status_overall: { status: string; status_code: number }
    status: Array<{ id: string; name: string; status: string; status_code: number }>
    incidents: Array<{
      _id: string
      name: string
      status: string
      messages?: Array<{ details: string; created?: string }>
    }>
    maintenance: {
      active: Array<{ _id: string; name: string; messages?: Array<{ details: string; created?: string }> }>
    }
  }
}

async function fetchStatusio(statusioId: string): Promise<StatusPageData> {
  const res = await fetch(`https://api.status.io/1.0/status/${statusioId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json() as StatusioResponse
  const { status_overall, status: components, incidents, maintenance } = data.result
  const indicator = statusioCodeToIndicator(status_overall.status_code)

  const activeIncidents: Incident[] = [
    ...incidents.map(i => ({
      id: i._id,
      name: i.name,
      status: i.status,
      incident_updates: i.messages?.map(m => ({ body: m.details, created_at: m.created ?? '' })),
    })),
    ...maintenance.active.map(m => ({
      id: m._id,
      name: m.name,
      status: 'maintenance',
      incident_updates: m.messages?.map(msg => ({ body: msg.details, created_at: msg.created ?? '' })),
    })),
  ]

  return {
    status: {
      indicator,
      description: indicator === 'none' ? 'All good' : status_overall.status,
    },
    components: components.map(c => ({
      id: c.id,
      name: c.name,
      status: statusioCodeToComponentStatus(c.status_code),
      group: false,
      group_id: null,
    })),
    incidents: activeIncidents,
  }
}

async function fetchStatusPage(service: Service): Promise<StatusPageData> {
  if (service.type === 'statusio' && service.statusioId) {
    return fetchStatusio(service.statusioId)
  }
  return fetchAtlassian(service.url)
}

export function useStatusPage(service: Service): UseStatusPageResult {
  const { data, isLoading, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['status', service.url],
    queryFn: () => fetchStatusPage(service),
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