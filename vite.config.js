import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/devagiri_map/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Devagiri Campus Navigator',
        short_name: 'Devagiri Map',
        description: 'Offline-friendly campus map for Devagiri College',
        theme_color: '#5d0f24'
      }
    })
  ],
});
