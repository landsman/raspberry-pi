export enum ServiceIcon {
  MEDIUM = 'medium', // todo
  REDDIT = 'reddit', // todo
  READECK = 'readeck', // todo
  CLAUDE = 'claude',
  PERPLEXITY = 'perplexity',
  NOTEBOOKML = 'notebookml',
  GITHUB = 'github',
  FORGEJO = 'forgejo',
  GITLAB = 'gitlab',
  FIGMA = 'figma',
  SLACK = 'slack',
  TOGGL = 'toggl',
  FIZZY = 'fizzy',
}

export type ServiceIconName = (typeof ServiceIcon)[keyof typeof ServiceIcon]
