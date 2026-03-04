export interface Service {
  name: string
  url: string
}

export const SERVICES: Service[] = [
  { name: 'Claude', url: 'https://status.claude.com' },
  { name: 'GitHub', url: 'https://www.githubstatus.com' },
  { name: 'GitLab', url: 'https://status.gitlab.com' },
]
