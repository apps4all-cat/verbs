import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// La versió de l'app és la d'Android (versionName de android/app/build.gradle).
const versionName = /versionName\s+"([^"]+)"/.exec(readFileSync(new URL('./android/app/build.gradle', import.meta.url), 'utf8'))?.[1] ?? '?'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(versionName) },
})
