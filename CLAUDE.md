# Project Rules for Claude

## Stack
- **welcome-page**: Vite + React + TypeScript + Tailwind CSS
- Always use **TypeScript** — never plain JS for new code
- Use `make` targets, never raw `npm` commands — see `welcome-page/Makefile` for all targets
- Run `npx tsc -b` to verify types, `npx prettier --write` to format after edits (these are low-level checks, not user-facing commands)
- Common targets: `make dev`, `make build`, `make qa`, `make docker-build`

## Code style
- Keep solutions minimal — don't add features, refactors, or comments beyond what was asked
- No docstrings or type annotations on unchanged code
- Prefer editing existing files over creating new ones
- After editing files, always run prettier on changed files

## SVG icons
- Brand/service logos go in `public/icons/<name>.svg` (20×20 viewBox) so the browser can cache them
- UI icons that need `currentColor` (chevron, refresh, settings gear, etc.) stay inline in JSX — moving them to `<img>` breaks color theming
- Icon filename defaults to `service.name.toLowerCase()`; override with `icon` field on the `Service` object

## Status page services (`services.ts`)
- Supported platforms: `atlassian` | `statusio` | `instatus` | `google-workspace`
- `atlassian` — fetch `/api/v2/summary.json`
- `statusio` — requires `statusioId`; fetch `https://api.status.io/1.0/status/<id>`
- `instatus` — fetch `/summary.json` + `/components.json`
- `google-workspace` — fetch `https://www.google.com/appsstatus/dashboard/incidents.json`
- Before adding a service, verify the platform by checking network requests on the status page
- Sections: `'external'` (default) | `'homelab'`

## UI patterns
- Tooltips: use `<Tooltip>` from `src/app/components/tooltip.tsx` — supports `placement="top" | "bottom"`; black bg, white text, arrow pointer
- Accordion sections: full-width clickable button with `aria-expanded` + `aria-controls` / `role="region"` + `aria-labelledby`
- Drag-and-drop: `@dnd-kit/sortable` with `rectSortingStrategy`; order persisted to `localStorage`
- Collapse state persisted to `localStorage`
- Layout: CSS `columns-[320px]` (masonry) within each section — not a fixed grid

## Accessibility
- Decorative SVGs get `aria-hidden="true"`
- Interactive elements need `aria-label` when icon-only
- Modal closable with ESC key via `useEffect` keydown listener
- Tooltips on truncated text and interactive controls

## Deployment
- Docker: multi-stage build (`node:20-alpine` → `nginx:alpine`)
- Target: `linux/arm64` (Raspberry Pi)
- `make docker-build` to build the image
- GitHub Actions: `.github/workflows/welcome-page-build.yml`
