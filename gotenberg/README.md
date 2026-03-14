# Gotenberg application

Stateless Docker-powered PDF generation service running on Raspberry Pi.

Source: https://gotenberg.dev

## Usage

```bash
make up     # start
make down   # stop
make logs   # follow logs
```

## Ports

- `3031` — HTTP API

## Notes

Gotenberg is stateless — no volumes, no backup needed.
