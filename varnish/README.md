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

| Variable                  | Description                                                 |
|---------------------------|-------------------------------------------------------------|
| `VARNISH_PURGE_TOKEN`     | Main token for GitHub workflow PURGE and BAN requests       |
| `VARNISH_PURGE_TOKEN_CMS` | Restricted token for internal services — PURGE only, no BAN |
| `VARNISH_PURGE_IPS`       | Comma-separated public IPs allowed to purge (IPv4 and IPv6) |

`entrypoint.sh` substitutes these into `default.vcl` at container startup via `envsubst`. Requests must pass both the IP ACL and the token check.

**Cache size** — override `VARNISH_SIZE` in `.env` (default `512m`).

## Usage

```bash
make up          # start
make down        # stop
make logs        # follow docker compose logs
make reload      # restart to apply VCL or nginx config changes
make stat        # live counters: hits, misses, RAM usage, cached objects
make top         # top URLs by request rate
make varnishlog  # raw request log
```

## Cache invalidation

There are two ways to invalidate the cache, each with its own token and permission scope.

### 1. GitHub workflow (PURGE + BAN)

Trigger the [varnish-purge](.github/workflows/varnish-purge.yml) workflow manually from Forgejo,
passing a newline-separated list of paths:

```
/
/about
/posts/hello-world
/api/posts/*
```

The workflow runs on a self-hosted GitHub Actions runner or Forgejo runner so Varnish is reachable directly on the internal network.

Set these in Forgejo:
- **Variable** `VARNISH_HOST` — e.g. `http://localhost:6081`
- **Secret** `VARNISH_PURGE_TOKEN_GITHUB` — same value as `VARNISH_PURGE_TOKEN` in `.env`

### 2. CMS backend API (PURGE only)

Internal services such as a CMS can invalidate specific URLs directly via HTTP. The CMS token only allows exact `PURGE` — wildcard `BAN` is blocked for internal callers.

The CMS must be on the same Docker compose network so it reaches Varnish on the internal `172.16.0.0/12` range.

```http
PURGE /posts/my-article HTTP/1.1
Host: varnish
X-Purge-Token: <VARNISH_PURGE_TOKEN_CMS>
```

Example with curl:

```bash
curl -X PURGE \
  -H "X-Purge-Token: your-cms-token" \
  http://varnish/posts/my-article
```

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
