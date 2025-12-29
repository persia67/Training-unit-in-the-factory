import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron to load assets with file:// protocol
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});