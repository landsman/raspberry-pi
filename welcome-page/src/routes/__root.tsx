import { useState, useCallback } from 'react'
import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Header } from '../app/components/header'
import { Footer } from '../app/components/footer'
import { ConfigModal } from '../app/config/components/config-modal'
import { useHotkey } from '../app/hooks/use-hotkey'
import { ROUTES } from '../app/routes'

function RootLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()

  useHotkey(
    '1',
    useCallback(() => navigate({ to: ROUTES.home }), [navigate])
  )
  useHotkey(
    '2',
    useCallback(() => navigate({ to: ROUTES.status }), [navigate])
  )

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full flex-1 flex flex-col">
        <Header onSettingsClick={() => setSettingsOpen(true)} />

        <main className="px-6 md:px-10 xl:px-16 pt-8 pb-12 flex-1">
          <Outlet />
        </main>

        <Footer onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      {settingsOpen && <ConfigModal onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
