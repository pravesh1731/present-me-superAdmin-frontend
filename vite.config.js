import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/superadmin/',
  plugins: [
    tailwindcss(),
  ],
})