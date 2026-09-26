import react from '@vitejs/plugin-react'
import {defineConfig, loadEnv} from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.DEV_API_TARGET || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: mode === 'development' ? {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    } : {},
  };
});
