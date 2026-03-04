export type ServiceType = 'atlassian' | 'statusio'

export interface Service {
  name: string
  url: string
  type: ServiceType
  statusioId?: string
  icon?: string // filename stem in /icons/, defaults to name.toLowerCase()
}

export const SERVICES: Service[] = [
  { name: 'GitHub', url: 'https://www.githubstatus.com', type: 'atlassian' },
  {
    name: 'GitLab',
    url: 'https://status.gitlab.com',
    type: 'statusio',
    statusioId: '5b36dc6502d06804c08349f7',
  },
  { name: 'Claude', url: 'https://status.claude.com', type: 'atlassian' },
  {
    name: 'JetBrains AI',
    url: 'https://status.jetbrains.ai',
    type: 'atlassian',
    icon: 'jetbrains-ai',
  },
  {
    name: 'Docker',
    url: 'https://www.dockerstatus.com',
    type: 'statusio',
    statusioId: '533c6539221ae15e3f000031',
  },
  { name: 'npm', url: 'https://status.npmjs.org', type: 'atlassian' },
]
