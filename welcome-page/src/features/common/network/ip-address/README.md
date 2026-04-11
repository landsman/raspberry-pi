# IP Address Feature

Displays the current device's IPv4 and IPv6 addresses in the header — no external HTTP requests, detected locally via nginx.

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

A clickable button that copies all available IP addresses to the clipboard. Behaviour varies by viewport:

**Desktop (`sm+`)**

- Shown inline in the `homelab · dashboard` status row in the header
- Displays `IPv4 · IPv6` (IPv6 truncates at `10rem`, expands to `16rem` on `lg+`)

**Mobile (< `sm`)**

- Shown on the right side of the navigation row (Row 2 of the header)
- Displays `IPv4` only to fit small screens (375 px / iPhone 13 mini)
- When IPv6 is also available, shows a compact `(+ipv6)` badge
- When only IPv4 is available (no IPv6), shows a red `(no ipv6)` badge

**All viewports**

- Shows `…` while loading
- Shows a red `offline` label when the network is down
- Shows `local` when neither address is available online
- On click: copies all available addresses (`IPv4 · IPv6`) to clipboard via `copyToClipboard` util
- Tooltip: `Click to copy your IP` → switches to `Copied!` for 1.5 s after a successful copy
- `[touch-action:manipulation]` eliminates the 300 ms iOS tap delay
- No page jump on iOS — the clipboard fallback textarea is anchored at `top:0 left:0`, `readonly`, and focused with `preventScroll: true`

### Utility (`src/utils/copy-to-clipboard.ts`)

Attempts `navigator.clipboard.writeText` first; falls back to a hidden `textarea` + `execCommand('copy')` for older or restricted browsers (e.g. iOS Safari in non-secure contexts).

## Files

| File                                     | Description                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `ip-address.tsx`                         | React component — clickable button with responsive IP display and copy action |
| `use-ip-address.ts`                      | React Query hook — fetches and caches IPv4 and IPv6 addresses                 |
| `../use-network-status.ts`               | Shared hook — detects online/offline network changes                          |
| `../../../../utils/copy-to-clipboard.ts` | Utility — copies text to clipboard with `execCommand` fallback                |
