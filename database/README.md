# Database

PostgreSQL with Adminer UI running in Docker on Raspberry Pi.
A single postgres instance hosts multiple databases — no separate containers per app needed.

## Usage

```bash
make up       # start
make down     # stop
make logs     # follow logs
make psql     # open postgres shell
make backup   # run backup manually
make restore FILE=database-backup-YYYYMMDD_HHMMSS.sql.gz
make cron-install                                 # register daily backup cron job (fails if already exists, run: crontab -l | grep database)
```

## Ports

- `5432` — PostgreSQL
- `8000` — Adminer UI

## Adding a new database

```bash
make create-db DB=myapp
```

Then connect your app using:
```
host=<pi-ip>  port=5432  user=postgres  password=postgres  dbname=myapp
```

## Backup

Backups are stored in `/home/containers/backup/database` as `database-backup-YYYYMMDD_HHMMSS.sql.gz`.
Uses `pg_dumpall` — backs up **all databases** while running, no downtime required.
The last 14 days are retained; older files are deleted automatically.

### Cron (daily at 4am)

```bash
make cron-install
```
