import { Key } from '../shortcut/key.ts'
import { HomeCategory } from './services.types.ts'
import { ServiceIcon } from './service.icon.ts'

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    label: 'Free time',
    services: [
      { name: 'Medium', url: 'https://medium.com', shortcut: Key.D },
      { name: 'Reddit', url: 'https://reddit.com', shortcut: Key.R },
      { name: 'Readeck', url: 'https://read.insuit.cz', shortcut: Key.R },
      { name: 'Music', url: 'https://music.insuit.cz', shortcut: Key.M },
    ],
  },
  {
    label: 'LLM',
    services: [
      { name: 'Claude', url: 'https://claude.ai', icon: ServiceIcon.CLAUDE, shortcut: Key.C },
      { name: 'Perplexity', url: 'https://perplexity.ai', icon: ServiceIcon.PERPLEXITY, shortcut: Key.P },
      { name: 'NotebookLM', url: 'https://notebooklm.google.com/', icon: ServiceIcon.NOTEBOOKML, shortcut: Key.N },
    ],
  },
  {
    label: 'Development',
    services: [
      { name: 'GitHub', url: 'https://github.com', icon: ServiceIcon.GITHUB, shortcut: Key.H },
      { name: 'Forgejo', url: 'https://git.insuit.cz', icon:  ServiceIcon.FORGEJO, shortcut: Key.G },
      { name: 'GitLab', url: 'https://gitlab.com', icon:  ServiceIcon.GITLAB, shortcut: Key.L },
      { name: 'Figma', url: 'https://figma.com', icon: ServiceIcon.FIGMA, shortcut: Key.F },
    ],
  },
  {
    label: 'Work',
    services: [
      { name: 'Slack', url: 'https://slack.com', icon: ServiceIcon.SLACK, shortcut: Key.S },
      { name: 'Toggl', url: 'https://toggl.com', icon: ServiceIcon.TOGGL, shortcut: Key.T },
      { name: 'Fizzy', url: 'https://fizzy.com', icon: ServiceIcon.FIZZY, shortcut: Key.Z },
    ],
  },
]
