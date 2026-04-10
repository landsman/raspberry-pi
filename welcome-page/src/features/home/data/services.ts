import { Key } from '../shortcut/key.ts'
import { HomeCategory } from './services.types.ts'
import { ServiceIcon } from './service.icon.ts'

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    label: 'Free time',
    services: [
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com',
        icon: ServiceIcon.HACKERNEWS,
        shortcut: Key.Y,
      },
      { name: 'Medium', url: 'https://medium.com', icon: ServiceIcon.MEDIUM, shortcut: Key.D },
      {
        name: 'Substack',
        url: 'https://substack.com',
        icon: ServiceIcon.SUBSTACK,
        shortcut: Key.V,
      },
      { name: 'Reddit', url: 'https://reddit.com', icon: ServiceIcon.REDDIT, shortcut: Key.R },
      { name: 'Nyx', url: 'https://www.nyx.cz', icon: ServiceIcon.NYX, shortcut: Key.X },
      {
        name: 'Readeck',
        url: 'https://read.insuit.cz',
        icon: ServiceIcon.READECK,
        shortcut: Key.E,
      },
      { name: 'Bluesky', url: 'https://bsky.app', icon: ServiceIcon.BLUESKY, shortcut: Key.B },
      { name: 'X', url: 'https://x.com', icon: ServiceIcon.X },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/playlist?list=WL',
        icon: ServiceIcon.YOUTUBE,
      },
      {
        name: 'Discord',
        url: 'https://discord.com/app',
        icon: ServiceIcon.DISCORD,
        shortcut: Key.I,
      },
    ],
  },
  {
    label: 'LLM',
    services: [
      { name: 'Claude', url: 'https://claude.ai', icon: ServiceIcon.CLAUDE, shortcut: Key.C },
      {
        name: 'Perplexity',
        url: 'https://perplexity.ai',
        icon: ServiceIcon.PERPLEXITY,
        shortcut: Key.P,
      },
      {
        name: 'Gemini',
        url: 'https://gemini.google.com',
        icon: ServiceIcon.GEMINI,
        shortcut: Key.G,
      },
      {
        name: 'NotebookLM',
        url: 'https://notebooklm.google.com',
        icon: ServiceIcon.NOTEBOOKML,
        shortcut: Key.N,
      },
    ],
  },
  {
    label: 'Development',
    services: [
      { name: 'GitHub', url: 'https://github.com', icon: ServiceIcon.GITHUB, shortcut: Key.H },
      { name: 'GitLab', url: 'https://gitlab.com', icon: ServiceIcon.GITLAB, shortcut: Key.L },
      { name: 'Figma', url: 'https://figma.com', icon: ServiceIcon.FIGMA, shortcut: Key.F },
      {
        name: 'Photopea',
        url: 'https://www.photopea.com',
        icon: ServiceIcon.PHOTOPEA,
        shortcut: Key.U,
      },
      { name: 'Grep', url: 'https://grep.app', icon: ServiceIcon.GREP_VERCEL, shortcut: Key.W },
      { name: 'Vaadin Docs', url: 'https://vaadin.com/docs', icon: ServiceIcon.VAADIN },
      { name: 'Azure DevOps', url: 'https://dev.azure.com', icon: ServiceIcon.AZURE_DEVOPS },
      {
        name: 'Supabase',
        url: 'https://supabase.com/dashboard/projects',
        icon: ServiceIcon.SUPABASE,
      },
      {
        name: 'Raspberry Connect',
        url: 'https://connect.raspberrypi.com',
        icon: ServiceIcon.RASPBERRY_CONNECT,
        shortcut: Key.Q,
      },
    ],
  },
  {
    label: 'Personal',
    services: [
      {
        name: 'Google Keep',
        url: 'https://keep.google.com',
        icon: ServiceIcon.GOOGLE_KEEP,
        shortcut: Key.K,
      },
      {
        name: 'Google Calendar',
        url: 'https://calendar.google.com',
        icon: ServiceIcon.GOOGLE_CALENDAR,
        shortcut: Key.A,
      },
      {
        name: 'Apple Notes',
        url: 'https://www.icloud.com/notes',
        icon: ServiceIcon.APPLE_NOTES,
        shortcut: Key.J,
      },
      {
        name: 'Find My',
        url: 'https://www.icloud.com/find',
        icon: ServiceIcon.APPLE_FIND_MY,
      },
    ],
  },
  {
    label: 'Homelab',
    services: [
      { name: 'Music', url: 'https://music.insuit.cz', shortcut: Key.M },
      {
        name: 'Forgejo',
        url: 'https://git.insuit.cz',
        icon: ServiceIcon.FORGEJO,
        shortcut: Key.O,
      },
      {
        name: 'Cloudflare',
        url: 'https://dash.cloudflare.com',
        icon: ServiceIcon.CLOUDFLARE,
      },
      {
        name: 'Tailscale',
        url: 'https://login.tailscale.com/admin',
        icon: ServiceIcon.TAILSCALE,
      },
    ],
  },
  {
    label: 'Work',
    services: [
      { name: 'Slack', url: 'https://slack.com', icon: ServiceIcon.SLACK, shortcut: Key.S },
      { name: 'Toggl', url: 'https://toggl.com', icon: ServiceIcon.TOGGL, shortcut: Key.T },
      { name: 'Fizzy', url: 'https://www.fizzy.do', icon: ServiceIcon.FIZZY, shortcut: Key.Z },
    ],
  },
]
