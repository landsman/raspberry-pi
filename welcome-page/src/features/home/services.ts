export interface HomeService {
  name: string
  url: string
  icon?: string
  shortcut?: string
}

export interface HomeCategory {
  label: string
  services: HomeService[]
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    label: 'AI',
    services: [
      { name: 'Claude', url: 'https://claude.ai', icon: 'claude', shortcut: 'c' },
      { name: 'Perplexity', url: 'https://perplexity.ai', icon: 'perplexity', shortcut: 'p' },
    ],
  },
  {
    label: 'Development',
    services: [
      { name: 'GitHub', url: 'https://github.com', icon: 'github', shortcut: 'g' },
      { name: 'GitLab', url: 'https://gitlab.com', icon: 'gitlab' },
      { name: 'Figma', url: 'https://figma.com', icon: 'figma', shortcut: 'f' },
    ],
  },
  {
    label: 'Work',
    services: [
      { name: 'Slack', url: 'https://slack.com', icon: 'slack', shortcut: 's' },
      { name: 'Toggl', url: 'https://toggl.com', icon: 'toggl', shortcut: 't' },
      { name: 'Medium', url: 'https://medium.com', shortcut: 'm' },
    ],
  },
]
