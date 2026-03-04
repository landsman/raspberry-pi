export function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="absolute top-2 left-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded opacity-0 group-hover/card:opacity-100 transition-opacity touch-none text-[var(--text-muted)] hover:text-[var(--text-dim)]"
      title="Drag to reorder"
    >
      <img src="/icons/ui/drag-handle.svg" alt="" className="w-3.5 h-2.5 opacity-50 invert" />
    </div>
  )
}
