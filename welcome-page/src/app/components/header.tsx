import { useRef } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useConfig } from '../config/config-provider'
import { formatDate, formatDateShort } from '../config/format-date'
import { HotKey } from '../../features/common/hotkey/hot-key'
import { Tooltip } from './tooltip'
import { ROUTES } from '../routes'
import { useSearch } from '../../features/search/search-context'
import { SearchBar } from '../../features/search/search-bar'
import { useSearchFocus } from '../../features/search/use-search-focus'
import { IpAddress } from '../../features/common/network/ip-address/ip-address.tsx'

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
  const { query, setQuery } = useSearch()
  const isStatus = pathname === ROUTES.status
  const searchRef = useRef<HTMLInputElement>(null)
  useSearchFocus(searchRef, isStatus)

  return (
    <header className="flex flex-col gap-3 pt-8 pb-6 px-6 md:px-10 xl:px-16 border-b border-(--border) overflow-x-hidden">
      {/* Desktop: single row — title | search | nav + settings */}
      {/* Mobile: row 1 title + settings, row 2 nav */}
      <div className="flex items-end justify-between gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="hidden sm:flex items-center gap-2 text-(--text-muted) text-[10px] tracking-[0.2em] uppercase mb-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 status-pulse shrink-0"
              style={{ color: '#22c55e' }}
            />
            homelab · dashboard
            <span className="normal-case tracking-normal"><IpAddress /></span>
          </div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-200">
            <span
              className="sm:hidden inline-block w-2 h-2 rounded-full bg-green-500 status-pulse shrink-0"
              aria-hidden="true"
            />
            Welcome, {displayName}
          </h1>
        </div>

        {/* Search — desktop center */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className={`w-80 lg:w-[32rem] ${isStatus ? '' : 'invisible'}`}>
            <SearchBar
              ref={searchRef}
              query={query}
              onChange={setQuery}
              placeholder="Search services…"
            />
          </div>
        </div>

        {/* Nav + date — desktop right */}
        <div className="hidden md:flex items-center gap-14 shrink-0">
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            <Link
              to={ROUTES.home}
              className="relative flex items-center justify-center px-5 py-3 rounded-lg text-sm tracking-wide transition-colors"
              activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
              inactiveProps={{
                className:
                  'text-[var(--text-muted)] hover:text-slate-300 border border-(--border) bg-transparent',
              }}
              aria-current={pathname === ROUTES.home ? 'page' : undefined}
            >
              Home
              <HotKey className="absolute top-1 right-1.5 text-[10px]">1</HotKey>
            </Link>
            <Link
              to={ROUTES.status}
              className="relative flex items-center justify-center px-5 py-3 rounded-lg text-sm tracking-wide transition-colors"
              activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
              inactiveProps={{
                className:
                  'text-[var(--text-muted)] hover:text-slate-300 border border-(--border) bg-transparent',
              }}
              aria-current={pathname === ROUTES.status ? 'page' : undefined}
            >
              Status
              <HotKey className="absolute top-1 right-1.5 text-[10px]">2</HotKey>
            </Link>
          </nav>

          <div className="flex flex-col items-end gap-1.5">
            <Tooltip
              content="Settings — change timezone, locale and other preferences"
              placement="bottom"
            >
              <button
                onClick={onSettingsClick}
                className="flex flex-col items-end group"
                aria-label="Open settings"
              >
                <div className="text-xs text-(--text-dim) tracking-wide group-hover:text-slate-300 transition-colors">
                  {dateStr}
                </div>
                <div className="text-[11px] text-(--text-muted) group-hover:text-(--text-dim) transition-colors mt-0.5">
                  {config.timezone}
                </div>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Mobile: settings only (nav is in row 2) */}
        <div className="md:hidden flex flex-col items-end gap-1 shrink-0">
          <Tooltip
            content="Settings — change timezone, locale and other preferences"
            placement="bottom"
          >
            <button
              onClick={onSettingsClick}
              className="flex flex-col items-end group"
              aria-label="Open settings"
            >
              <div className="text-[9px] text-(--text-dim) tracking-wide group-hover:text-slate-300 transition-colors">
                {dateStrShort}
              </div>
              <div className="text-[8px] text-(--text-muted) group-hover:text-(--text-dim) transition-colors mt-0.5">
                {config.timezone}
              </div>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Row 2: nav + IP — mobile only */}
      <div className="md:hidden flex items-center gap-1">
        <Link
          to={ROUTES.home}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs tracking-wide transition-colors"
          activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
          inactiveProps={{
            className:
              'text-[var(--text-muted)] hover:text-slate-300 border border-(--border) bg-transparent',
          }}
          aria-current={pathname === ROUTES.home ? 'page' : undefined}
        >
          Home
        </Link>
        <Link
          to={ROUTES.status}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs tracking-wide transition-colors"
          activeProps={{ className: 'text-slate-200 bg-[var(--dim)]' }}
          inactiveProps={{
            className:
              'text-[var(--text-muted)] hover:text-slate-300 border border-(--border) bg-transparent',
          }}
          aria-current={pathname === ROUTES.status ? 'page' : undefined}
        >
          Status
        </Link>
        <div className="ml-auto">
          <IpAddress />
        </div>
      </div>
    </header>
  )
}
