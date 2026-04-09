import { Link, useRouterState } from '@tanstack/react-router'
import { useConfig } from '../config/config-provider'
import { formatDate, formatDateShort } from '../config/format-date'
import { Tooltip } from './tooltip'
import { ROUTES } from '../routes'

interface HeaderProps {
  onSettingsClick: () => void
}

const DEFAULT_NAME = 'Michal'

function getDisplayName(): string {
  const n = new URLSearchParams(window.location.search).get('n')
  return n ? n.trim() : DEFAULT_NAME
}

export function Header({ onSettingsClick }: HeaderProps) {
  const config = useConfig()
  const displayName = getDisplayName()
  const dateStr = formatDate(new Date(), config)
  const dateStrShort = formatDateShort(new Date(), config)
  const pathname = useRouterState({ select: s => s.location.pathname })

  return (
    <header className="flex items-center justify-between pt-8 pb-6 px-6 md:px-10 xl:px-16 border-b border-(--border) gap-6">
      <div className="flex flex-col gap-1 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-(--text-muted) text-[10px] tracking-[0.2em] uppercase mb-1">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 status-pulse"
            style={{ color: '#22c55e' }}
          />
          homelab · dashboard
        </div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-200">
          <span
            className="sm:hidden inline-block w-2 h-2 rounded-full bg-green-500 status-pulse shrink-0"
            aria-hidden="true"
          />
          Welcome, {displayName}
        </h1>
      </div>

      <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
        <Link
          to={ROUTES.home}
          className="px-3 py-1.5 rounded-md text-xs tracking-wide transition-colors"
          activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
          inactiveProps={{ className: 'text-[var(--text-muted)] hover:text-slate-300' }}
          aria-current={pathname === ROUTES.home ? 'page' : undefined}
        >
          Home
        </Link>
        <Link
          to={ROUTES.status}
          className="px-3 py-1.5 rounded-md text-xs tracking-wide transition-colors"
          activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
          inactiveProps={{ className: 'text-[var(--text-muted)] hover:text-slate-300' }}
          aria-current={pathname === ROUTES.status ? 'page' : undefined}
        >
          Status
        </Link>
      </nav>

      <div className="flex items-center shrink-0">
        <Tooltip
          content="Settings — change timezone, locale and other preferences"
          placement="bottom"
        >
          <button
            onClick={onSettingsClick}
            className="flex flex-col items-end group"
            aria-label="Open settings"
          >
            <div className="text-[10px] sm:text-xs text-(--text-dim) tracking-wide group-hover:text-slate-300 transition-colors">
              <span className="hidden sm:inline">{dateStr}</span>
              <span className="sm:hidden">{dateStrShort}</span>
            </div>
            <div className="text-[9px] sm:text-[11px] text-(--text-muted) group-hover:text-(--text-dim) transition-colors mt-0.5">
              {config.timezone}
            </div>
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
