import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['blockly/core', 'blockly/blocks', 'blockly/msg/en', 'blockly/javascript', 'js-interpreter'],
  },
});
