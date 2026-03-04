export type ServiceType = 'atlassian' | 'statusio' | 'instatus' | 'google-workspace'
export type ServiceSection = 'external' | 'homelab'

export interface Service {
  name: string
  url: string
  type: ServiceType
  section?: ServiceSection
  statusioId?: string
  icon?: string // filename stem in /icons/, defaults to name.toLowerCase()
  hiddenComponents?: string[]
  keywords?: string[]
}

export const SERVICES: Service[] = [
  {
    name: 'GitHub',
    url: 'https://www.githubstatus.com',
    type: 'atlassian',
    hiddenComponents: ['Visit www.githubstatus.com for more information'],
    keywords: ['git', 'github'],
  },
  {
    name: 'GitLab',
    url: 'https://status.gitlab.com',
    type: 'statusio',
    statusioId: '5b36dc6502d06804c08349f7',
    hiddenComponents: ['Website'],
    keywords: ['git', 'gitlab'],
  },
  {
    name: 'Claude',
    url: 'https://status.claude.com',
    type: 'atlassian',
    keywords: ['ai'],
  },
  {
    name: 'JetBrains AI',
    url: 'https://status.jetbrains.ai',
    type: 'atlassian',
    icon: 'jetbrains-ai',
    keywords: ['ai']
  },
  {
    name: 'Docker',
    url: 'https://www.dockerstatus.com',
    type: 'statusio',
    statusioId: '533c6539221ae15e3f000031',
    keywords: ['devops'],
  },
  {
    name: 'npm',
    url: 'https://status.npmjs.org',
    type: 'atlassian',
    keywords: ['node'],
  },
  {
    name: 'Maven',
    url: 'https://status.maven.org',
    type: 'atlassian',
    keywords: ['java'],
  },
  {
    name: 'Perplexity',
    url: 'https://status.perplexity.com',
    type: 'instatus',
    keywords: ['ai'],
  },
  {
    name: 'Figma',
    url: 'https://status.figma.com',
    type: 'atlassian',
    keywords: ['ui'],
  },
  {
    name: 'Toggl',
    url: 'https://status.toggl.com',
    type: 'atlassian',
    keywords: ['tracking', 'time', 'money'],
  },
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflarestatus.com',
    type: 'atlassian',
    icon: 'cloudflare',
    keywords: ['cloud', 'dns', 'cache', 'proxy', 'vpn'],
  },
  {
    name: '37signals',
    url: 'https://www.37status.com',
    type: 'atlassian',
    icon: '37signals',
    keywords: ['tasks', 'issues', 'tracking'],
  },
  {
    name: 'Jira',
    url: 'https://jira-software.status.atlassian.com',
    type: 'atlassian',
    keywords: ['tasks', 'issues'],
  },
  {
    name: 'Confluence',
    url: 'https://confluence.status.atlassian.com',
    type: 'atlassian',
    keywords: ['wiki', 'docs'],
  },
  {
    name: 'Google Workspace',
    url: 'https://www.google.com/appsstatus/dashboard/',
    type: 'google-workspace',
    icon: 'google-workspace',
    keywords: ['google', 'workspace', 'calendar', 'docs', 'drive', 'gmail', 'meet', 'chat'],
  },
]
