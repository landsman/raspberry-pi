import { useState } from 'react'
import { StatusCard } from './components/status-card'
import { SERVICES, type Service, type ServiceSection } from './services'

const SECTION_LABELS: Record<ServiceSection, string> = {
  external: 'External Services',
  homelab: 'Homelab',
}

const STORAGE_KEY = 'status-sections-collapsed'

function loadCollapsed(): Set<ServiceSection> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw) as ServiceSection[])
  } catch {
    // ignore
  }
  return new Set()
}

function saveCollapsed(collapsed: Set<ServiceSection>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...collapsed]))
  } catch {
    // ignore
  }
}

function SectionGroup({
  section,
  services,
  animationOffset,
}: {
  section: ServiceSection
  services: Service[]
  animationOffset: number
}) {
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(section))

  function toggle() {
    setCollapsed(prev => {
      const next = !prev
      const stored = loadCollapsed()
      if (next) {
        stored.add(section)
      } else {
        stored.delete(section)
      }
      saveCollapsed(stored)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={toggle}
        className="flex items-center gap-2 group w-fit"
        aria-expanded={!collapsed}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={`text-[var(--text-muted)] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        >
          <path d="M6 8.5L1 3.5h10L6 8.5z" />
        </svg>
        <span className="text-xs font-semibold tracking-widest uppercase text-[var(--text-dim)] group-hover:text-slate-300 transition-colors">
          {SECTION_LABELS[section]}
        </span>
        <span className="text-xs text-[var(--text-muted)]">({services.length})</span>
      </button>

      {!collapsed && (
        <>
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--text-muted)]">
              No services configured yet
            </div>
          ) : (
            <div className="columns-[320px] gap-4">
              {services.map((service, i) => (
                <div
                  key={service.name}
                  className="break-inside-avoid mb-4"
                  style={{ animationDelay: `${(animationOffset + i) * 60}ms` }}
                >
                  <StatusCard service={service} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const SECTION_ORDER: ServiceSection[] = ['external', 'homelab']

export function StatusPage() {
  const bySection = SECTION_ORDER.map(section => ({
    section,
    services: SERVICES.filter(s => (s.section ?? 'external') === section),
  }))

  let offset = 0
  return (
    <div className="flex flex-col gap-8">
      {bySection.map(({ section, services }) => {
        const group = (
          <SectionGroup
            key={section}
            section={section}
            services={services}
            animationOffset={offset}
          />
        )
        offset += services.length
        return group
      })}
    </div>
  )
}
