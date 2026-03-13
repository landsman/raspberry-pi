# github-runner

Ephemeral GitHub Actions self-hosted runner for Raspberry Pi 5 (ARM64).

Each job spawns a fresh `supabase-runner` container that registers with GitHub, runs the job, and exits. No runner software is installed on the Pi itself — only Docker is required.

## What's inside the image

- [`myoung34/github-runner`](https://github.com/myoung34/docker-github-actions-runner) — base runner image with ARM64 support
- [Supabase CLI](https://github.com/supabase/cli) — latest ARM64 binary
- Node.js 22 — for `npx` / Sentry CLI

## Prerequisites

- Raspberry Pi 5 with Docker installed
- GitHub Personal Access Token with `repo` scope (classic PAT) or a fine-grained token with Actions read/write

## Setup

**1. Configure environment**

```bash
cp .env.example .env
# Edit .env and fill in REPO_URL and GITHUB_TOKEN
```

**2. Build the image**

```bash
docker compose build
```

**3. Run**

```bash
docker compose up -d
docker compose logs -f
```

## GitHub workflow configuration

In any workflow you want to run on this runner, set:

```yaml
jobs:
  deploy:
    runs-on: [self-hosted, pi5]
```

## How it works

```
Pi (Docker only)
  └─ container starts
       └─ registers with GitHub as ephemeral runner
            └─ picks up one job → runs → deregisters → exits
  └─ Compose restarts the container → repeat
```

The `EPHEMERAL=true` env var tells the runner to deregister itself after a single job, ensuring a clean environment for every run.

## Scaling to multiple repositories

By default the runner is scoped to a single repository (`RUNNER_SCOPE=repo`). To cover additional repos you would need one Compose service per repository, each with its own `REPO_URL`.

The cleaner alternative is to create a free **GitHub Organization**, register the runner at org scope (`RUNNER_SCOPE=org`), and point all your repos there. A single service then handles jobs from every repo in the org — no duplication needed.

```yaml
# org-level example
environment:
  RUNNER_SCOPE: org
  ORG_NAME: your-github-org   # instead of REPO_URL
  GITHUB_TOKEN: ${GITHUB_TOKEN}  # needs org admin scope
  LABELS: self-hosted,pi5
  EPHEMERAL: "true"
```
