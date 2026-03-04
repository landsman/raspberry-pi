import { useConfig } from '../config/config-provider'
import { formatDate } from '../config/format-date'
import { Tooltip } from './tooltip'

interface HeaderProps {
  onSettingsClick: () => void
}

export function Header({ onSettingsClick }: HeaderProps) {
  const config = useConfig()
  const dateStr = formatDate(new Date(), config)

  return (
    <header className="flex items-end justify-between pt-8 pb-6 px-6 md:px-10 xl:px-16 border-b border-[var(--border)]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] tracking-[0.2em] uppercase mb-1">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 status-pulse"
            style={{ color: '#22c55e' }}
          />
          homelab · status monitor
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-200">Service Status</h1>
      </div>

      <div className="flex items-start">
        <Tooltip
          content="Settings — change timezone, locale and other preferences"
          placement="bottom"
        >
          <button
            onClick={onSettingsClick}
            className="flex flex-col items-end group"
            aria-label="Open settings"
          >
            <div className="text-xs text-[var(--text-dim)] tracking-wide group-hover:text-slate-300 transition-colors">
              {dateStr}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors mt-0.5">
              {config.timezone}
            </div>
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
