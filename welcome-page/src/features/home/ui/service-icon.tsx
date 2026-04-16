interface ServiceIconProps {
  service: {
    name: string
    icon?: string
    iconWhiteBg?: boolean
  }
}

export function ServiceIcon({ service }: ServiceIconProps) {
  const iconPath = service.icon ? `/icons/services/${service.icon}.svg` : null
  return (
    <div className="w-10 h-10 mt-3 flex items-center justify-center rounded-lg bg-(--dim) group-hover:bg-[#1e3050] transition-colors">
      {iconPath ? (
        <img src={iconPath} alt={service.name} aria-hidden="true" className="w-5 h-5" />
      ) : (
        <span className="text-sm font-semibold text-(--text-dim)">
            {service.name[0].toUpperCase()}
          </span>
      )}
    </div>
  )
}