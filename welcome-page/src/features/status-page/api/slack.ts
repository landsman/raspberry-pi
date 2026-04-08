import type { StatusPageData, Incident, StatusComponent } from './types'

const SLACK_FEATURES = [
  'Login/SSO',
  'Connectivity',
  'Messaging',
  'Files',
  'Notifications',
  'Huddles',
  'Search',
  'Apps/Integrations/APIs',
  'Workspace/Org Administration',
  'Workflows',
  'Canvases',
]

interface SlackNote {
  date_created: string
  body: string
}

interface SlackIncident {
  id: string
  title: string
  type: 'incident' | 'notice' | 'outage'
  status: 'ok' | 'active' | 'resolved' | 'scheduled' | 'completed' | 'cancelled'
  url: string
  date_created: string
  date_updated: string
  services: string[]
  notes: SlackNote[]
}

interface SlackCurrentResponse {
  status: string
  date_created: string
  date_updated: string
  active_incidents: SlackIncident[]
}

export async function fetchSlack(): Promise<StatusPageData> {
  const res = await fetch('/proxy/slack-status-com/api/v2.0.0/current', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as SlackCurrentResponse

  const incidents: Incident[] = data.active_incidents.map(i => ({
    id: i.id,
    name: i.title,
    status: i.type,
    incident_updates: i.notes.map(n => ({
      body: n.body.replace(/<[^>]+>/g, '').trim(),
      created_at: n.date_created,
    })),
  }))

  const affectedServices = new Set(data.active_incidents.flatMap(i => i.services))

  const components: StatusComponent[] = SLACK_FEATURES.map(feature => ({
    id: feature,
    name: feature,
    status: affectedServices.has(feature) ? 'degraded_performance' : 'operational',
    group: false,
    group_id: null,
  }))

  const indicator =
    data.active_incidents.length === 0
      ? 'none'
      : data.active_incidents.some(i => i.type === 'outage')
        ? 'major'
        : data.active_incidents.some(i => i.type === 'incident')
          ? 'minor'
          : 'maintenance'

  return {
    status: {
      indicator,
      description: data.status === 'ok' ? 'ok' : data.status,
    },
    components,
    incidents,
  }
}
