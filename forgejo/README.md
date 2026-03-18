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
make up       # start
make down     # stop
make logs     # follow logs
make backup   # run backup manually
make restore FILE=forgejo-backup-YYYYMMDD_HHMMSS.tar.gz
```

## Ports

- `3000` — web UI
- `2222` — SSH (git over SSH)

## Backup

Backups are stored in `/home/pi5/backup/forgejo` as `forgejo-backup-YYYYMMDD_HHMMSS.tar.gz`.
The last 14 days are retained; older files are deleted automatically.

### Cron (daily at 3am)

```bash
crontab -e
```

```
0 3 * * * cd /path/to/forgejo && make backup >> /home/pi5/backup/forgejo/backup.log 2>&1
```

## Runner

The runner uses Docker-in-Docker (`dind`) to execute workflow jobs in isolated containers.

### First-time registration

1. Get a registration token from Forgejo: **Site Administration → Actions → Runners → Create new runner token**
2. Start services: `make up`
3. Register the runner:
   ```bash
   docker exec -it forgejo-runner forgejo-runner register \
     --instance ${FORGEJO_URL} \
     --token <registration-token> \
     --name raspberry-pi \
     --labels ubuntu-latest:docker://node:20-bookworm,self-hosted:host \
     --no-interactive
   ```
4. Restart so the daemon picks up the `.runner` file: `docker restart forgejo-runner`

The `.runner` file is stored in the `runner` Docker volume and persists across restarts.

### Labels

| Label           | Execution       | Image              |
|-----------------|-----------------|--------------------|
| `ubuntu-latest` | Docker via dind | `node:20-bookworm` |
| `self-hosted`   | Host shell      | —                  |

