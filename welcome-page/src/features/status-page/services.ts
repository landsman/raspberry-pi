export const SERVICE_TYPE = {
  ATLASSIAN: 'atlassian',
  STATUSIO: 'statusio',
  INSTATUS: 'instatus',
  GOOGLE_WORKSPACE: 'google-workspace',
  INCIDENTIO: 'incidentio',
  REDIRECT: 'redirect',
  SIMPLE_CHECK: 'simple-check',
} as const

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE]
export const SERVICE_SECTION = {
  EXTERNAL: 'external',
  HOMELAB: 'homelab',
} as const

export type ServiceSection = (typeof SERVICE_SECTION)[keyof typeof SERVICE_SECTION]

export interface Service {
  name: string
  url: string
  healthCheckUrl?: string
  type: ServiceType
  section?: ServiceSection
  statusioId?: string
  icon?: string // filename stem in /icons/, defaults to name.toLowerCase()
  versionPath?: string
  hiddenComponents?: string[]
  keywords?: string[]
}

export const SERVICES: Service[] = [
  {
    name: 'GitHub',
    url: 'https://www.githubstatus.com',
    type: SERVICE_TYPE.ATLASSIAN,
    hiddenComponents: ['Visit www.githubstatus.com for more information'],
    keywords: ['git', 'github'],
  },
  {
    name: 'GitLab',
    url: 'https://status.gitlab.com',
    type: SERVICE_TYPE.STATUSIO,
    statusioId: '5b36dc6502d06804c08349f7',
    hiddenComponents: ['Website'],
    keywords: ['git', 'gitlab'],
  },
  {
    name: 'Claude',
    url: 'https://status.claude.com',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['ai'],
  },
  {
    name: 'JetBrains AI',
    url: 'https://status.jetbrains.ai',
    type: SERVICE_TYPE.ATLASSIAN,
    icon: 'jetbrains-ai',
    keywords: ['ai'],
  },
  {
    name: 'Docker',
    url: 'https://www.dockerstatus.com',
    type: SERVICE_TYPE.STATUSIO,
    statusioId: '533c6539221ae15e3f000031',
    keywords: ['devops'],
  },
  {
    name: 'npm',
    url: 'https://status.npmjs.org',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['node'],
  },
  {
    name: 'Maven',
    url: 'https://status.maven.org',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['java'],
  },
  {
    name: 'Perplexity',
    url: 'https://status.perplexity.com',
    type: SERVICE_TYPE.INSTATUS,
    keywords: ['ai'],
  },
  {
    name: 'Figma',
    url: 'https://status.figma.com',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['ui'],
  },
  {
    name: 'Toggl',
    url: 'https://status.toggl.com',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['tracking', 'time', 'money'],
  },
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflarestatus.com',
    type: SERVICE_TYPE.ATLASSIAN,
    icon: 'cloudflare',
    keywords: ['cloud', 'dns', 'cache', 'proxy', 'vpn'],
  },
  {
    name: '37signals',
    url: 'https://www.37status.com',
    type: SERVICE_TYPE.ATLASSIAN,
    icon: '37signals',
    keywords: ['tasks', 'issues', 'tracking'],
  },
  {
    name: 'Jira',
    url: 'https://jira-software.status.atlassian.com',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['tasks', 'issues'],
  },
  {
    name: 'Confluence',
    url: 'https://confluence.status.atlassian.com',
    type: SERVICE_TYPE.ATLASSIAN,
    keywords: ['wiki', 'docs'],
  },
  {
    name: 'Google Workspace',
    url: 'https://www.google.com/appsstatus/dashboard/',
    type: SERVICE_TYPE.GOOGLE_WORKSPACE,
    icon: 'google-workspace',
    keywords: ['google', 'workspace', 'calendar', 'docs', 'drive', 'gmail', 'meet', 'chat'],
  },
  {
    name: 'Tailscale',
    url: 'https://status.tailscale.com',
    type: SERVICE_TYPE.REDIRECT,
    icon: 'tailscale',
    keywords: ['vpn', 'network', 'mesh'],
  },
  {
    name: 'AWS',
    url: 'https://health.aws.amazon.com/health/status',
    type: SERVICE_TYPE.REDIRECT,
    icon: 'aws',
    keywords: ['cloud', 'aws', 'amazon', 'infrastructure'],
  },
  {
    name: 'Insuit Read',
    url: 'https://read.insuit.cz',
    healthCheckUrl: 'https://read.insuit.cz/api/info',
    type: SERVICE_TYPE.SIMPLE_CHECK,
    section: SERVICE_SECTION.HOMELAB,
    versionPath: 'version',
    keywords: ['read', 'later', 'bookmarks', 'readeck'],
  },
]
