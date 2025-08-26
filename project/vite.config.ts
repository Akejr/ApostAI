import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: false // Desabilita overlay de erros que pode causar crashes
    },
    watch: {
      usePolling: true, // Melhora detecção de mudanças no Windows
      interval: 1000 // Reduz frequência de verificação
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [],
    }
  }
});
