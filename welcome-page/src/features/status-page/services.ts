export type ServiceType = 'atlassian' | 'statusio' | 'instatus' | 'google-workspace'
export type ServiceSection = 'external' | 'homelab'

export interface Service {
  name: string
  url: string
  type: ServiceType
  section?: ServiceSection
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
  { name: 'Maven', url: 'https://status.maven.org', type: 'atlassian' },
  {
    name: 'Perplexity',
    url: 'https://status.perplexity.com',
    type: 'instatus',
  },
  { name: 'Figma', url: 'https://status.figma.com', type: 'atlassian' },
  { name: 'Toggl', url: 'https://status.toggl.com', type: 'atlassian' },
  {
    name: '37signals',
    url: 'https://www.37status.com',
    type: 'atlassian',
    icon: '37signals',
  },
  {
    name: 'Google Workspace',
    url: 'https://www.google.com/appsstatus/dashboard/',
    type: 'google-workspace',
    icon: 'google-workspace',
  },
]
