import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Service } from '../services'
import { StatusCard } from './status-card'
import { DragHandle } from './drag-handle'

interface SortableCardProps {
  service: Service
  animationDelay: number
}

export function SortableCard({ service, animationDelay }: SortableCardProps) {
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
