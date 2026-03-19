# Varnish

HTTP reverse proxy cache running in Docker on Raspberry Pi, with nginx as the backend.

Source: https://www.varnish.org/

## Architecture

```
client → varnish:6081 → nginx:8080 → app:80
```

Varnish caches GET/HEAD responses (5 min TTL, 1 min grace). Requests with `Authorization` or `Cookie` headers are passed through uncached. Responses include an `X-Cache: HIT/MISS` header.

## Configuration

**Backend app** — point nginx to your app by editing `nginx/default.conf`:

```nginx
proxy_pass http://your-app:80;
```

**Purge access** — copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VARNISH_PURGE_TOKEN` | Secret token checked on every PURGE request |
| `VARNISH_PURGE_IP4` | Your public IPv4 address |
| `VARNISH_PURGE_IP6` | Your public IPv6 address |

`entrypoint.sh` substitutes these into `default.vcl` at container startup via `envsubst`. PURGE requests must pass both the IP ACL (`localhost`, `127.0.0.1`, and your IPs) and the token check.

Set the matching values in Forgejo:
- **Variable** `VARNISH_HOST` — e.g. `http://localhost:6081`
- **Secret** `VARNISH_PURGE_TOKEN` — same token as in `.env`

**Cache size** — copy `.env.example` to `.env` to override:

```bash
cp .env.example .env
```

## Usage

```bash
make up      # start
make down    # stop
make logs    # follow logs
make reload  # restart to apply VCL or nginx config changes
```

## Cache invalidation

Trigger the [varnish-purge](.github/workflows/varnish-purge.yml) workflow manually from Forgejo,
passing a newline-separated list of paths:

```
/
/about
/posts/hello-world
/api/posts/*
```

The workflow runs on a self-hosted GitHub Actions runner or Forgejo runner so Varnish is reachable directly on the internal network.

### PURGE vs BAN

**PURGE** — removes a single exact URL from cache immediately.
```
/posts/hello-world  →  removes exactly that one object
```

**BAN** — adds a rule to a ban list. Varnish checks cached objects against the list lazily as they are requested (via the "ban lurker" background thread). Any object whose URL matches the regex gets invalidated.
```
/posts/*  →  invalidates everything under /posts/
```

The key difference: PURGE is synchronous and exact. BAN is pattern-based and evaluated over time — the objects aren't removed immediately, but they won't be served to clients (Varnish fetches a fresh copy instead) and the ban lurker cleans them up in the background.

`purge.sh` detects `*` in a path and switches method automatically — no manual distinction needed.

## Ports

| Host   | Container | Description          |
|--------|-----------|----------------------|
| 6081   | 80        | HTTP proxy (Varnish) |

## Useful links

- [jonnenauha/prometheus_varnish_exporter](https://github.com/jonnenauha/prometheus_varnish_exporter) — de-facto standard Prometheus exporter for Varnish
- [Grafana dashboard #9903](https://grafana.com/grafana/dashboards/9903-varnish/) — ready-made Varnish dashboard for the exporter above
- [Varnish monitoring tutorial](https://www.varnish-software.com/developers/tutorials/monitoring-varnish-prometheus-loki-grafana/) — official guide for Prometheus + Loki + Grafana
- [Grafana Cloud Varnish integration](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-varnish-cache/) — managed monitoring via Grafana Cloud
- [auduny/varnishprom](https://github.com/auduny/varnishprom) — alternative exporter with varnishlog support
