# Forgejo application

Self-hosted Git service running in Docker on Raspberry Pi.

Source: https://codeberg.org/forgejo/forgejo

## Configuration

Set the required env variable values before starting:

```bash
cp .env.example .env
```

## Usage

```bash
make build                                        # build the runner-tools image
make up                                           # start
make down                                         # stop
make logs                                         # follow logs
make backup                                       # run backup manually
make restore FILE=forgejo-backup-YYYYMMDD_HHMMSS.tar.gz
make cron-install                                 # register daily backup cron job (fails if already exists, run: crontab -l | grep forgejo)
make runner-register TOKEN=<registration-token>   # register the Actions runner (first time only)
```

## Ports

- `3000` — web UI
- `2222` — SSH (git over SSH)

## Backup

Backups are stored in `/home/containers/backup/forgejo` as `forgejo-backup-YYYYMMDD_HHMMSS.tar.gz`.
The last 14 days are retained; older files are deleted automatically.

### Cron (daily at 3am)

```bash
make cron-install
```

## Runner

The runner uses Docker-in-Docker (`dind`) to execute workflow jobs in isolated containers.

### First-time registration

1. Get a registration token from Forgejo: **Site Administration → Actions → Runners → Create new runner token**
2. Start services: `make up`
3. Register: `make runner-register TOKEN=<registration-token>`

The `.runner` file is stored in the `runner` Docker volume and persists across restarts.

### Labels

| Label           | Execution       | Image              |
|-----------------|-----------------|--------------------|
| `ubuntu-latest` | Docker via dind | `node:20-bookworm` |
| `self-hosted`   | Host shell      | —                  |

