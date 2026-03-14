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
