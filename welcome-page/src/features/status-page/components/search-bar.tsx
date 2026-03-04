interface SearchBarProps {
  query: string
  onChange: (value: string) => void
}

export function SearchBar({ query, onChange }: SearchBarProps) {
  return (
    <div className="flex justify-end">
      <div className="relative w-64">
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        >
          <path d="M11.74 10.33a6 6 0 1 0-1.41 1.41l3.47 3.47 1.41-1.41-3.47-3.47zm-5.74.67a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
        </svg>
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
