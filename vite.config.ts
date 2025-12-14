import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/chipu-web/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});