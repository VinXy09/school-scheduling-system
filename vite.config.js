import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_2.png', 'avatar.png', 'avatar2.png', 'avatar3.png', 'avatar5.png', 'avatar04.png'],
      manifest: {
        name: 'SFICS School Scheduling System',
        short_name: 'SFICS Scheduling',
        description: 'SFICS School Scheduling System - Desktop & Web Edition',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: './',
        start_url: './index.html',
        icons: [
          {
            src: 'logo_2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo_2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo_2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'logo_2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: './',
})