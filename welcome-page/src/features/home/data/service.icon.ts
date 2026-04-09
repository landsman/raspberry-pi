export enum ServiceIcon {
  MEDIUM = 'medium',
  REDDIT = 'reddit',
  READECK = 'readeck',
  CLAUDE = 'claude',
  PERPLEXITY = 'perplexity',
  GITHUB = 'github',
  GITLAB = 'gitlab',
  FIGMA = 'figma',
  SLACK = 'slack',
  TOGGL = 'toggl',
  FIZZY = 'fizzy',
}

export type ServiceIconName = (typeof ServiceIcon)[keyof typeof ServiceIcon]
