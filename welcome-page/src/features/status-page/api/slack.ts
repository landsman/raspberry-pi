import type { StatusPageData, Incident, StatusComponent } from './types'

// Slack's status API only returns services affected by active incidents — it has no endpoint
// that lists all possible services. This list is manually derived from slack-status.com so
// we can show operational components alongside degraded ones.
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

  const serviceStatusMap = new Map<string, string>()
  for (const incident of data.active_incidents) {
    const status =
      incident.type === 'outage'
        ? 'major_outage'
        : incident.type === 'incident'
          ? 'degraded_performance'
          : 'under_maintenance'
    for (const service of incident.services) {
      if (!serviceStatusMap.has(service) || status === 'major_outage') {
        serviceStatusMap.set(service, status)
      }
    }
  }

  const components: StatusComponent[] = SLACK_FEATURES.map(feature => ({
    id: feature,
    name: feature,
    status: serviceStatusMap.get(feature) ?? 'operational',
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
