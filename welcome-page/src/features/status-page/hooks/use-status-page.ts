import { useQuery } from '@tanstack/react-query'
import type { Service } from '../services'

export interface StatusComponent {
  id: string
  name: string
  status: string
  group: boolean
  group_id: string | null
}

interface IncidentUpdate {
  body: string
  created_at: string
}

interface Incident {
  id: string
  name: string
  status: string
  incident_updates?: IncidentUpdate[]
}

interface StatusPageData {
  status: {
    indicator: string
    description: string
  }
  components: StatusComponent[]
  incidents: Incident[]
}

interface IncidentioStatus {
  ongoing_incidents: Array<{
    id: string
    name: string
    status: string
    updates: Array<{ message: string; created_at: string }>
  }>
  in_progress_maintenances: Array<{
    id: string
    name: string
    updates: Array<{ message: string; created_at: string }>
  }>
  scheduled_maintenances: Array<{
    id: string
    name: string
  }>
}

export interface UseStatusPageResult {
  data: StatusPageData | null
  loading: boolean
  fetching: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

async function fetchAtlassian(baseUrl: string): Promise<StatusPageData> {
  const res = await fetch(`${baseUrl}/api/v2/summary.json`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as StatusPageData
  const description = data.status.indicator === 'none' ? 'ok' : data.status.description
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
      active: Array<{
        _id: string
        name: string
        messages?: Array<{ details: string; created?: string }>
      }>
    }
  }
}

async function fetchStatusio(statusioId: string): Promise<StatusPageData> {
  const res = await fetch(`https://api.status.io/1.0/status/${statusioId}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as StatusioResponse
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
      incident_updates: m.messages?.map(msg => ({
        body: msg.details,
        created_at: msg.created ?? '',
      })),
    })),
  ]

  return {
    status: {
      indicator,
      description: indicator === 'none' ? 'ok' : status_overall.status,
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

interface InstatusPageResponse {
  page: { name: string; url: string; status: string }
}

interface InstatusComponentsResponse {
  components: Array<{
    id: string
    name: string
    status: string
    group: string | null
  }>
}

function instatusPageStatusToIndicator(status: string): string {
  if (status === 'UP') return 'none'
  if (status === 'UNDERMAINTENANCE') return 'maintenance'
  return 'minor'
}

function instatusComponentStatus(status: string): string {
  switch (status) {
    case 'OPERATIONAL':
      return 'operational'
    case 'DEGRADED':
      return 'degraded_performance'
    case 'PARTIALOUTAGE':
      return 'partial_outage'
    case 'MAJOROUTAGE':
      return 'major_outage'
    case 'UNDERMAINTENANCE':
      return 'under_maintenance'
    default:
      return 'operational'
  }
}

async function fetchInstatus(baseUrl: string): Promise<StatusPageData> {
  const [summaryRes, componentsRes] = await Promise.all([
    fetch(`${baseUrl}/summary.json`, { cache: 'no-store' }),
    fetch(`${baseUrl}/components.json`, { cache: 'no-store' }),
  ])
  if (!summaryRes.ok) throw new Error(`HTTP ${summaryRes.status}`)
  const summary = (await summaryRes.json()) as InstatusPageResponse
  const indicator = instatusPageStatusToIndicator(summary.page.status)

  let components: StatusComponent[] = []
  if (componentsRes.ok) {
    const data = (await componentsRes.json()) as InstatusComponentsResponse
    components = data.components.map(c => ({
      id: c.id,
      name: c.name,
      status: instatusComponentStatus(c.status),
      group: false,
      group_id: null,
    }))
  }

  return {
    status: { indicator, description: indicator === 'none' ? 'ok' : summary.page.status },
    components,
    incidents: [],
  }
}

interface GoogleIncident {
  id: string
  begin: string
  end?: string
  external_desc: string
  status_impact: string
  affected_products: Array<{ title: string; id: string }>
  updates: Array<{ when: string; text: string; status: string }>
}

const GOOGLE_WORKSPACE_KEY_PRODUCTS: Array<{ id: string; name: string }> = [
  { id: 'prPt2Yra2CbGsbEm9cpC', name: 'Gmail' },
  { id: 'VHNA7p3Z5p3iakj5sA8V', name: 'Google Drive' },
  { id: 'wNHuVFtZEWU5Mmj2eRCK', name: 'Google Docs' },
  { id: 'n5hVexuq1PM9onY9qrmo', name: 'Google Calendar' },
  { id: 'Ht9Vx5PFzDPHYvrnrvSk', name: 'Google Chat' },
  { id: 'sUH4BQXzYXma7NiS94Hi', name: 'Google Meet' },
]

async function fetchGoogleWorkspace(): Promise<StatusPageData> {
  const res = await fetch('https://www.google.com/appsstatus/dashboard/incidents.json', {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const incidents = (await res.json()) as GoogleIncident[]

  const active = incidents.filter(i => !i.end)
  const indicator =
    active.length === 0
      ? 'none'
      : active.some(i => i.status_impact === 'SERVICE_OUTAGE')
        ? 'major'
        : 'minor'

  const affectedIds = new Set<string>()
  for (const inc of active) {
    for (const p of inc.affected_products) {
      affectedIds.add(p.id)
    }
  }

  return {
    status: {
      indicator,
      description: indicator === 'none' ? 'ok' : `${active.length} active incident(s)`,
    },
    components: GOOGLE_WORKSPACE_KEY_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      status: affectedIds.has(p.id) ? 'degraded_performance' : 'operational',
      group: false,
      group_id: null,
    })),
    incidents: active.map(i => ({
      id: i.id,
      name: i.external_desc.split('\n')[0].replace(/\*\*/g, ''),
      status: 'investigating',
      incident_updates: i.updates.map(u => ({ body: u.text, created_at: u.when })),
    })),
  }
}

async function fetchIncidentio(baseUrl: string): Promise<StatusPageData> {
  const res = await fetch(`${baseUrl}/api/v1/status`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as IncidentioStatus

  const incidents: Incident[] = [
    ...data.ongoing_incidents.map(i => ({
      id: i.id,
      name: i.name,
      status: i.status,
      incident_updates: i.updates.map(u => ({ body: u.message, created_at: u.created_at })),
    })),
    ...data.in_progress_maintenances.map(m => ({
      id: m.id,
      name: m.name,
      status: 'maintenance',
      incident_updates: m.updates.map(u => ({ body: u.message, created_at: u.created_at })),
    })),
  ]

  const indicator =
    data.ongoing_incidents.length > 0
      ? data.ongoing_incidents.some(i => i.status === 'critical')
        ? 'critical'
        : 'minor'
      : data.in_progress_maintenances.length > 0
        ? 'maintenance'
        : 'none'

  return {
    status: {
      indicator,
      description: indicator === 'none' ? 'ok' : `${incidents.length} active event(s)`,
    },
    components: [], // incident.io widget API doesn't seem to provide component list easily in this endpoint
    incidents,
  }
}

async function fetchStatusPage(service: Service): Promise<StatusPageData> {
  if (service.type === 'statusio' && service.statusioId) {
    return fetchStatusio(service.statusioId)
  }
  if (service.type === 'instatus') {
    return fetchInstatus(service.url)
  }
  if (service.type === 'google-workspace') {
    return fetchGoogleWorkspace()
  }
  if (service.type === 'incidentio') {
    return fetchIncidentio(service.url)
  }
  if (service.type === 'redirect') {
    return {
      status: { indicator: 'none', description: '?' },
      components: [],
      incidents: [],
    }
  }
  return fetchAtlassian(service.url)
}

export function useStatusPage(service: Service): UseStatusPageResult {
  const { data, isLoading, isFetching, error, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['status', service.url],
    queryFn: () => fetchStatusPage(service),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  return {
    data: data ?? null,
    loading: isLoading,
    fetching: isFetching,
    error: error ? (error as Error).message : null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => void refetch(),
  }
}
