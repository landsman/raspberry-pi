type Placement = 'top' | 'bottom'

interface TooltipProps {
  content: string
  placement?: Placement
  children: React.ReactNode
  className?: string
}

export function Tooltip({ content, placement = 'top', children, className = '' }: TooltipProps) {
  return (
    <span className={`relative group/tooltip inline-flex ${className}`}>
      {children}
      <span
        className={`pointer-events-none absolute z-[100] hidden group-hover/tooltip:flex flex-col items-start ${
          placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        }`}
      >
        {placement === 'bottom' && (
          <span className="ml-3 mb-px w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-black" />
        )}
        <span className="px-2.5 py-1.5 rounded-md bg-black text-white text-xs whitespace-nowrap shadow-lg border border-white/10">
          {content}
        </span>
        {placement === 'top' && (
          <span className="ml-3 mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black" />
        )}
      </span>
    </span>
  )
}
