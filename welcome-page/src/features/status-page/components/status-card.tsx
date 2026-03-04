import { useStatusPage, type StatusComponent, type Incident } from '../hooks/use-status-page'
import { getStatusConfig } from '../status-config'
import { useConfig } from '../../../app/config/config-provider'
import { formatTime } from '../../../app/config/format-date'
import { Tooltip } from '../../../app/components/tooltip'
import type { Service } from '../services'

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

function ErrorCard({
  name,
  iconSlug,
  error,
  onRetry,
}: {
  name: string
  iconSlug: string
  error: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-xl border border-red-900/40 bg-[var(--card)] p-6 flex flex-col gap-4 fade-in">
      <div className="flex items-center gap-3">
        <img src={`/icons/${iconSlug}.svg`} width={20} height={20} alt="" className="shrink-0" />
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
  service: Service
}

export function StatusCard({ service }: StatusCardProps) {
  const { name, url } = service
  const iconSlug = service.icon ?? name.toLowerCase()
  const config = useConfig()
  const { data, loading, fetching, error, lastUpdated, refresh } = useStatusPage(service)

  if (loading && !data) return <SkeletonCard />
  if (error && !data)
    return <ErrorCard name={name} iconSlug={iconSlug} error={error} onRetry={refresh} />
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
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 group min-w-0"
          title={`Open ${name} status page`}
        >
          <img src={`/icons/${iconSlug}.svg`} width={20} height={20} alt="" className="shrink-0" />
          <span className="text-sm font-semibold tracking-widest uppercase text-slate-300 group-hover:text-slate-100 transition-colors">
            {name}
          </span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="currentColor"
            className="text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors shrink-0"
          >
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
          const label = cfg.label === 'Operational' ? 'ok' : cfg.label
          return (
            <div key={component.id} className="flex items-center justify-between py-2.5 gap-4">
              <Tooltip content={component.name}>
                <span className="text-xs text-[var(--text-dim)] truncate">{component.name}</span>
              </Tooltip>
              <span
                className="text-xs font-medium shrink-0 flex items-center gap-1.5"
                style={{ color: cfg.color }}
              >
                <StatusDot status={component.status} />
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 border-t border-[var(--border)] mt-auto">
        <span className="text-[11px] text-[var(--text-dim)] py-3">
          {lastUpdated ? `updated ${formatTime(lastUpdated, config)}` : 'fetching...'}
        </span>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-dim)] transition-colors py-3 px-1 -mr-1"
          title="Refresh now"
          aria-label="Refresh"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={fetching ? 'animate-spin' : ''}
          >
            <path d="M13.65 2.35A8 8 0 1 0 15 8h-2a6 6 0 1 1-1.06-3.36L10 7h5V2l-1.35.35z" />
          </svg>
          refresh
        </button>
      </div>
    </div>
  )
}
