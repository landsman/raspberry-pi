import { useConfig } from '../config/config-provider'
import { formatDate } from '../config/format-date'

interface HeaderProps {
  onSettingsClick: () => void
}

export function Header({ onSettingsClick }: HeaderProps) {
  const config = useConfig()
  const dateStr = formatDate(new Date(), config)

  return (
    <header className="flex items-end justify-between mb-8 pt-8 px-6 md:px-8">
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
      <div className="flex items-start gap-3">
        <div className="text-right">
          <div className="text-[10px] text-[var(--text-muted)] tracking-wide">{dateStr}</div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{config.timezone}</div>
        </div>
        <button
          onClick={onSettingsClick}
          className="text-[var(--text-muted)] hover:text-slate-300 transition-colors mt-0.5"
          title="Settings"
          aria-label="Open settings"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}
