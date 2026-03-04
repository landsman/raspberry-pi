interface SearchBarProps {
  query: string
  onChange: (value: string) => void
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="flex justify-end">
      <div className="relative w-64">
        <img
          src="/icons/ui/search.svg"
          alt=""
          className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[var(--text-muted)] pointer-events-none opacity-50 invert"
        />
        <input
          type="search"
          value={query}
          onChange={e => onChange(e.target.value)}
          placeholder="Search services…"
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg text-slate-300 placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--dim)] transition-colors"
        />
      </div>
    </div>
  )
}
