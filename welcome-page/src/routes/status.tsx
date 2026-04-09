import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { StatusPage } from '../features/status-page/status-page'
import { SearchBar } from '../features/status-page/components/search-bar'

export const Route = createFileRoute('/status')({
  component: StatusRoute,
})

function StatusRoute() {
  const [query, setQuery] = useState('')

  return (
    <>
      <div className="mb-6 md:hidden">
        <SearchBar query={query} onChange={setQuery} />
      </div>
      <StatusPage query={query} onQueryChange={setQuery} />
    </>
  )
}
