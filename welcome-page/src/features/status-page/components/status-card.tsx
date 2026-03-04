import { useStatusPage, type StatusComponent, type Incident } from '../hooks/use-status-page'
import { getStatusConfig } from '../status-config'
import { useConfig } from '../../../app/config/config-provider'
import { formatTime } from '../../../app/config/format-date'

function ServiceIcon({ name }: { name: string }) {
  if (name === 'Claude') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          fill="#D97706"
          opacity="0.2"
        />
        <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="#D97706" />
      </svg>
    )
  }
  if (name === 'GitHub') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="shrink-0 text-slate-300"
      >
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
      </svg>
    )
  }
  if (name === 'GitLab') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path
          d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"
          fill="#FC6D26"
        />
      </svg>
    )
  }
  return null
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-5 h-5 rounded-full" />
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-6 w-28 rounded-full ml-auto" />
      </div>
      <div className="skeleton h-px w-full rounded" />
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center justify-between">
          <div className="skeleton h-3.5 rounded" style={{ width: `${45 + i * 12}%` }} />
          <div className="skeleton h-3.5 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

function ErrorCard({ name, error, onRetry }: { name: string; error: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-900/40 bg-[var(--card)] p-6 flex flex-col gap-4 fade-in">
      <div className="flex items-center gap-3">
        <ServiceIcon name={name} />
        <span className="text-sm font-semibold tracking-widest uppercase text-slate-300">
          {name}
        </span>
      </div>
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-red-400 text-xs">⚠ fetch failed: {error}</span>
        <button
          onClick={onRetry}
          className="text-xs text-[var(--text-dim)] hover:text-slate-200 border border-[var(--border)] hover:border-[var(--dim)] px-3 py-1.5 rounded transition-colors"
        >
          retry
        </button>
      </div>
    </div>
  )
}

function StatusDot({ status, pulse = false }: { status: string; pulse?: boolean }) {
  const cfg = getStatusConfig(status)
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${pulse && status !== 'operational' && status !== 'none' ? 'status-pulse' : ''}`}
      style={{ backgroundColor: cfg.dot, color: cfg.dot }}
    />
  )
}

function StatusBadge({ indicator, description }: { indicator: string; description?: string }) {
  const cfg = getStatusConfig(indicator)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide"
      style={{ backgroundColor: cfg.bg ?? 'rgba(107,114,128,0.1)', color: cfg.color }}
    >
      <StatusDot status={indicator} pulse />
      {description ?? cfg.label}
    </span>
  )
}

export interface StatusCardProps {
  name: string
  url: string
}

export function StatusCard({ name, url }: StatusCardProps) {
  const config = useConfig()
  const { data, loading, error, lastUpdated, refresh } = useStatusPage(url)

  if (loading && !data) return <SkeletonCard />
  if (error && !data) return <ErrorCard name={name} error={error} onRetry={refresh} />
  if (!data) return null

  const { status, components = [], incidents = [] } = data

  const visibleComponents = components.filter((c: StatusComponent) => !c.group).slice(0, 10)

  const activeIncidents = incidents.filter(
    (i: Incident) => i.status !== 'resolved' && i.status !== 'postmortem'
  )

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] flex flex-col fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-[var(--border)]">
        <ServiceIcon name={name} />
        <span className="text-sm font-semibold tracking-widest uppercase text-slate-300">
          {name}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-muted)] hover:text-[var(--text-dim)] transition-colors ml-1"
          title="Open status page"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3.5 3a.5.5 0 0 0 0 1H7.29L2.15 9.15a.5.5 0 1 0 .7.7L8 4.71V8.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5h-5z" />
          </svg>
        </a>
        <div className="ml-auto">
          <StatusBadge indicator={status.indicator} description={status.description} />
        </div>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div className="px-6 py-3 border-b border-[var(--border)] bg-red-950/20">
          {activeIncidents.map((incident: Incident) => (
            <div key={incident.id} className="flex flex-col gap-0.5">
              <span className="text-xs text-red-400 font-medium">⚡ {incident.name}</span>
              {incident.incident_updates?.[0]?.body && (
                <span className="text-xs text-[var(--text-dim)] line-clamp-2">
                  {incident.incident_updates[0].body}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Components */}
      <div className="flex flex-col divide-y divide-[var(--border)] flex-1 px-6">
        {visibleComponents.map((component: StatusComponent) => {
          const cfg = getStatusConfig(component.status)
          return (
            <div key={component.id} className="flex items-center justify-between py-2.5 gap-4">
              <span className="text-xs text-[var(--text-dim)] truncate">{component.name}</span>
              <span
                className="text-xs font-medium shrink-0 flex items-center gap-1.5"
                style={{ color: cfg.color }}
              >
                <StatusDot status={component.status} />
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] mt-auto">
        <span className="text-[10px] text-[var(--text-muted)]">
          {lastUpdated ? `updated ${formatTime(lastUpdated, config)}` : 'fetching...'}
        </span>
        <button
          onClick={refresh}
          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-dim)] transition-colors"
          title="Refresh now"
          aria-label="Refresh"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.06-3.36L10 7h5V2l-1.35.35z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
