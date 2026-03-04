# Welcome Page

Homelab status dashboard served on a Raspberry Pi. Displays real-time status for external services and homelab infrastructure.

## Features

- Live status cards fetched every 60 s — GitHub, GitLab, Claude, JetBrains AI, Docker, npm, Maven, Perplexity, Figma, Toggl, 37signals, Google Workspace
- Supports three status platforms: **Atlassian Statuspage**, **status.io**, **Instatus**, and a custom **Google Workspace** adapter
- Masonry card layout that fills available screen width (4K-friendly)
- Drag-and-drop card reordering, persisted to `localStorage`
- Collapsible sections — **External Services** and **Homelab**
- Configurable locale and timezone (saved to cookies)
- Dark theme

## Stack

- Vite + React + TypeScript + Tailwind CSS
- [@tanstack/react-query](https://tanstack.com/query) for data fetching
- [@dnd-kit](https://dndkit.com) for drag and drop

## Development

```bash
make dev        # install deps and start hot-reload dev server
make preview    # production build + local preview
```

## Build & deploy

```bash
make build              # compile static assets into dist/
make docker-build       # Docker image for Raspberry Pi (linux/arm64)
make docker-build-local # Docker image for current platform (local testing)
make docker-run         # run the container on port 8080
```

The Docker image is a two-stage build: `node:20-alpine` compiles the app, `nginx:alpine` serves the static output.

## Quality

```bash
make qa      # typecheck + format check + lint
make format  # auto-format all files with Prettier
make lint    # ESLint only
```

## Adding a service

1. Add an entry to `src/features/status-page/services.ts`
2. Drop a 20×20 SVG logo in `public/icons/<name>.svg`
3. Set `section: 'homelab'` to put it in the Homelab section instead of External Services
