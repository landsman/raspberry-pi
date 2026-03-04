export type ServiceType = 'atlassian' | 'statusio'

export interface Service {
  name: string
  url: string
  type: ServiceType
  statusioId?: string
}

export const SERVICES: Service[] = [
  { name: 'Claude', url: 'https://status.claude.com', type: 'atlassian' },
  { name: 'GitHub', url: 'https://www.githubstatus.com', type: 'atlassian' },
  { name: 'GitLab', url: 'https://status.gitlab.com', type: 'statusio', statusioId: '5b36dc6502d06804c08349f7' },
]