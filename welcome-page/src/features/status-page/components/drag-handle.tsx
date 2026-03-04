export function DragHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="absolute top-2 left-1/2 -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing p-1.5 rounded opacity-0 group-hover/card:opacity-100 transition-opacity touch-none text-[var(--text-muted)] hover:text-[var(--text-dim)]"
      title="Drag to reorder"
    >
      <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
        <circle cx="2" cy="2" r="1" />
        <circle cx="7" cy="2" r="1" />
        <circle cx="12" cy="2" r="1" />
        <circle cx="2" cy="8" r="1" />
        <circle cx="7" cy="8" r="1" />
        <circle cx="12" cy="8" r="1" />
      </svg>
    </div>
  )
}
