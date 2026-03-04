import { useState, useMemo } from 'react'
import { SERVICES, type ServiceSection } from './services'
import { usePersistence } from './hooks/use-persistence'
import { SectionGroup } from './components/section-group'
import { SearchBar } from './components/search-bar'

const SECTION_ORDER: ServiceSection[] = ['external', 'homelab']

export function StatusPage() {
  const [query, setQuery] = useState('')
  const { order, setOrder, collapsed, toggleCollapsed } = usePersistence()

  const q = query.trim().toLowerCase()

  const bySection = useMemo(() => {
    return SECTION_ORDER.map(section => ({
      section,
      services: SERVICES.filter(s => (s.section ?? 'external') === section),
    }))
  }, [])

  let offset = 0
  return (
    <div className="flex flex-col gap-8">
      <SearchBar query={query} onChange={setQuery} />

      {bySection.map(({ section, services }) => {
        const group = (
          <SectionGroup
            key={section}
            section={section}
            initialServices={services}
            animationOffset={offset}
            query={q}
            savedOrder={order[section] ?? []}
            isCollapsed={collapsed.has(section)}
            onToggleCollapsed={toggleCollapsed}
            onOrderChange={setOrder}
          />
        )
        offset += services.length
        return group
      })}
    </div>
  )
}
