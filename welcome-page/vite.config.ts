import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // allow access from external hosts
    port: 5173,
    strictPort: true,
    allowedHosts: ['t1.insuit.cz', 'welcome.insuit.cz'],
  },
})
