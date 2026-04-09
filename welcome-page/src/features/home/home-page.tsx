import { useCallback } from 'react'
import { useHotkey } from '../../app/hooks/use-hotkey'
import { HOME_CATEGORIES, type HomeService } from './services'

function openService(service: HomeService) {
  window.open(service.url, '_blank', 'noopener,noreferrer')
}

function ServiceCard({ service }: { service: HomeService }) {
  const iconPath = service.icon ? `/icons/services/${service.icon}.svg` : null

  return (
    <a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--dim)] hover:bg-[#111d2e] transition-all duration-150"
      aria-label={`Open ${service.name}`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--dim)] group-hover:bg-[#1e3050] transition-colors">
        {iconPath ? (
          <img src={iconPath} alt="" aria-hidden="true" className="w-5 h-5" />
        ) : (
          <span className="text-sm font-semibold text-[var(--text-dim)]">
            {service.name[0].toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 min-w-0 w-full">
        <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate w-full text-center">
          {service.name}
        </span>
        {service.shortcut && (
          <kbd className="text-[9px] text-[var(--text-muted)] font-mono tracking-widest uppercase">
            {service.shortcut}
          </kbd>
        )}
      </div>
    </a>
  )
}

function ServiceHotkey({ service }: { service: HomeService }) {
  const handler = useCallback(() => openService(service), [service])
  useHotkey(service.shortcut!, handler)
  return null
}

export function HomePage() {
  const servicesWithShortcuts = HOME_CATEGORIES.flatMap(c => c.services).filter(s => s.shortcut)

  return (
    <div className="flex flex-col gap-10 fade-in">
      {servicesWithShortcuts.map(s => (
        <ServiceHotkey key={s.shortcut} service={s} />
      ))}

      {HOME_CATEGORIES.map(category => (
        <section key={category.label}>
          <h2 className="text-[10px] text-[var(--text-muted)] tracking-[0.2em] uppercase mb-4">
            {category.label}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
            {category.services.map(service => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
