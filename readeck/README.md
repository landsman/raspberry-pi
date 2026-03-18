# Readeck application

Self-hosted bookmarking and read-later service running in Docker on Raspberry Pi.

Source: https://codeberg.org/readeck

## Clients

- **iOS** — [Readeck app](https://apps.apple.com/us/app/readeck/id6748764703) — connect to your instance URL
- **Browser extension** — [Firefox](https://addons.mozilla.org/firefox/addon/readeck/) / [Chrome](https://chromewebstore.google.com/detail/readeck/iedgbdjibfmacpgkclbkohaolhealcip) — save pages directly to your instance

## Usage

```bash
make up       # start
make down     # stop
make logs     # follow logs
make backup   # run backup manually
make restore FILE=readeck-backup-YYYYMMDD_HHMMSS.tar.gz
make cron-install                                 # register daily backup cron job (fails if already exists, run: crontab -l | grep readeck)
```

## Backup

Backups are stored in `/home/containers/backup/readeck` as `readeck-backup-YYYYMMDD_HHMMSS.tar.gz`.
The last 14 days are retained; older files are deleted automatically.

### Cron (daily at 2am)

```bash
make cron-install
```
