# Miniflux application
Self-hosted RSS feed reader running in Docker on Raspberry Pi.
Source: https://miniflux.app

## Usage
```bash
make up       # start
make down     # stop
make logs     # follow logs
```

## Setup
Before first run, create the miniflux database and set environment variables:
```bash
# In the database directory:
make create-db DB=miniflux

cp example.env .env  # fill in DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD
make up
```

The app connects to the shared PostgreSQL instance (see `../database`).
Set `DATABASE_URL` in `.env` with the Pi's IP address (e.g. `192.168.1.x`).
