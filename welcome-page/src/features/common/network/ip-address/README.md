# IP Address Feature

Displays the current device's IPv4 and IPv6 addresses on the home page, detected locally via nginx — no external HTTP requests.

## How it works

### Architecture

```
Browser → nginx (port 80) → /api/my-ip    → returns $remote_addr (IPv4)
Browser → nginx (port 81) → /api/my-ipv6 → returns $remote_addr (IPv6)
```

### nginx

Two server blocks are defined in `docker/nginx.conf`:

- **Port 80** — main server, handles the SPA and static assets. Also exposes `/api/my-ip` which returns the client's IPv4 address using nginx's built-in `$remote_addr` variable.
- **Port 81** — IPv6-only server (`ipv6only=on`), exposes `/api/my-ipv6` which returns the client's IPv6 address the same way.

Both endpoints return a simple JSON response:

```json
{ "ip": "..." }
```

### Docker Compose

Port `8081:81` is exposed alongside the main `8080:80` so the IPv6 endpoint is reachable from the host.

### Proxy config (`src/proxy.config.ts`)

- `PROXY_PATHS.MY_IP` → `/api/my-ip` (served by the main nginx on port 80)
- `PROXY_PATHS.MY_IPV6` → `/api/my-ipv6` (proxied to `http://localhost:8081` in Vite dev mode)

### Hook (`use-ip-address.ts`)

Uses two React Query queries to fetch IPv4 and IPv6 in parallel:

- Results are cached for **5 minutes** (`staleTime: 1000 * 60 * 5`)
- `retry: false` — avoids retrying when offline
- Integrates with `useNetworkStatus` — when the device comes back online, both queries are invalidated and re-fetched automatically

### Component (`ip-address.tsx`)

Renders two rows:

```
IPv4: 192.168.1.10
IPv6: fd00::1
```

Shows `...` while loading and a red `offline` label when the network is down.

## Files

| File                       | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `ip-address.tsx`           | React component — renders IPv4/IPv6 rows and offline state |
| `use-ip-address.ts`        | React Query hook — fetches and caches both IP addresses    |
| `../use-network-status.ts` | Shared hook — detects online/offline network changes       |
