import { HomeService } from '../data/services.types.ts'

interface ServiceCardProps {
  service: HomeService
}

export function ServiceCard({ service }: ServiceCardProps) {
  const iconPath = service.icon ? `/icons/services/${service.icon}.svg` : null

  return (
    <a
      href={service.url}
      target="_self"
      rel="noopener noreferrer"
      className="relative group flex flex-col items-center gap-3 p-4 rounded-xl border border-(--border) bg-(--card) hover:border-(--dim) hover:bg-[#111d2e] transition-all duration-150"
      aria-label={`Open ${service.name}`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-(--dim) group-hover:bg-[#1e3050] transition-colors">
        {iconPath ? (
          <img src={iconPath} alt="" aria-hidden="true" className="w-5 h-5" />
        ) : (
          <span className="text-sm font-semibold text-(--text-dim)">
            {service.name[0].toUpperCase()}
          </span>
        )}
      </div>

      {service.shortcut && (
        <kbd className="hidden md:block absolute top-2 right-2 text-[11px] uppercase text-(--text-muted) font-mono leading-none">
          {service.shortcut}
        </kbd>
      )}

      <span
        title={service.name}
        className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors truncate w-full text-center"
      >
        {service.name}
      </span>
    </a>
  )
}
