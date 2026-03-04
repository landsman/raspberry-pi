import { StatusCard } from './components/status-card'
import { SERVICES } from './services'

export function StatusPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {SERVICES.map((service, i) => (
        <div key={service.name} style={{ animationDelay: `${i * 60}ms` }}>
          <StatusCard service={service} />
        </div>
      ))}
    </div>
  )
}
