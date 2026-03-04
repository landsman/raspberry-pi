import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StatusCard } from './components/status-card'
import { SERVICES, type Service, type ServiceSection } from './services'

// ─── persistence ────────────────────────────────────────────────────────────

const ORDER_KEY = 'status-card-order'
const COLLAPSED_KEY = 'status-sections-collapsed'

function loadOrder(): Record<ServiceSection, string[]> {
  try {
    const raw = localStorage.getItem(ORDER_KEY)
    if (raw) return JSON.parse(raw) as Record<ServiceSection, string[]>
  } catch {
    // ignore
  }
  return { external: [], homelab: [] }
}

function saveOrder(order: Record<ServiceSection, string[]>) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order))
  } catch {
    // ignore
  }
}

function loadCollapsed(): Set<ServiceSection> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY)
    if (raw) return new Set(JSON.parse(raw) as ServiceSection[])
  } catch {
    // ignore
  }
  return new Set()
}

function saveCollapsed(collapsed: Set<ServiceSection>) {
  try {
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...collapsed]))
  } catch {
    // ignore
  }
}

function applyOrder(services: Service[], savedOrder: string[]): Service[] {
  if (savedOrder.length === 0) return services
  const map = new Map(services.map(s => [s.name, s]))
  const ordered = savedOrder.flatMap(name => {
    const s = map.get(name)
    return s ? [s] : []
  })
  // append any new services not yet in saved order
  const orderedNames = new Set(savedOrder)
  for (const s of services) {
    if (!orderedNames.has(s.name)) ordered.push(s)
  }
  return ordered
}

// ─── drag handle ────────────────────────────────────────────────────────────

function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="absolute top-3 right-3 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded opacity-0 group-hover/card:opacity-100 transition-opacity touch-none text-[var(--text-muted)] hover:text-[var(--text-dim)]"
      title="Drag to reorder"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="4" cy="2.5" r="1" />
        <circle cx="8" cy="2.5" r="1" />
        <circle cx="4" cy="6" r="1" />
        <circle cx="8" cy="6" r="1" />
        <circle cx="4" cy="9.5" r="1" />
        <circle cx="8" cy="9.5" r="1" />
      </svg>
    </div>
  )
}

// ─── sortable card wrapper ───────────────────────────────────────────────────

function SortableCard({ service, animationDelay }: { service: Service; animationDelay: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: service.name,
  })

  return (
    <div
      ref={setNodeRef}
      className="break-inside-avoid mb-4 relative group/card"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <DragHandle {...attributes} {...listeners} />
      <StatusCard service={service} />
    </div>
  )
}

// ─── section ────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<ServiceSection, string> = {
  external: 'External Services',
  homelab: 'Homelab',
}

function SectionGroup({
  section,
  initialServices,
  animationOffset,
}: {
  section: ServiceSection
  initialServices: Service[]
  animationOffset: number
}) {
  const savedOrder = loadOrder()[section] ?? []
  const [services, setServices] = useState(() => applyOrder(initialServices, savedOrder))
  const [collapsed, setCollapsed] = useState(() => loadCollapsed().has(section))
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over || active.id === over.id) return
    setServices(prev => {
      const oldIndex = prev.findIndex(s => s.name === active.id)
      const newIndex = prev.findIndex(s => s.name === over.id)
      const next = arrayMove(prev, oldIndex, newIndex)
      const allOrder = loadOrder()
      allOrder[section] = next.map(s => s.name)
      saveOrder(allOrder)
      return next
    })
  }

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev
      const stored = loadCollapsed()
      if (next) stored.add(section)
      else stored.delete(section)
      saveCollapsed(stored)
      return next
    })
  }

  const activeService = activeId ? services.find(s => s.name === activeId) : null

  const headingId = `section-heading-${section}`
  const regionId = `section-region-${section}`

  return (
    <div className="flex flex-col gap-4">
      <button
        id={headingId}
        onClick={toggleCollapsed}
        aria-expanded={!collapsed}
        aria-controls={regionId}
        title={
          collapsed ? `Expand ${SECTION_LABELS[section]}` : `Collapse ${SECTION_LABELS[section]}`
        }
        className="flex items-center gap-2 w-full group -mx-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
          className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${collapsed ? '-rotate-90' : ''}`}
        >
          <path d="M6 8.5L1 3.5h10L6 8.5z" />
        </svg>
        <span className="text-xs font-semibold tracking-widest uppercase text-[var(--text-dim)] group-hover:text-slate-300 transition-colors">
          {SECTION_LABELS[section]}
        </span>
        <span className="text-xs text-[var(--text-muted)]">({services.length})</span>
      </button>

      {!collapsed && (
        <div id={regionId} role="region" aria-labelledby={headingId}>
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--text-muted)]">
              No services configured yet
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={services.map(s => s.name)} strategy={rectSortingStrategy}>
                <div className="columns-[320px] gap-4">
                  {services.map((service, i) => (
                    <SortableCard
                      key={service.name}
                      service={service}
                      animationDelay={(animationOffset + i) * 60}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeService && (
                  <div className="rotate-1 scale-105 opacity-90 shadow-2xl">
                    <StatusCard service={activeService} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      )}
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

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
            initialServices={services}
            animationOffset={offset}
          />
        )
        offset += services.length
        return group
      })}
    </div>
  )
}
