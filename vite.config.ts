import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site: https://<user>.github.io/paper-maker/
// When a custom domain is added, change base to '/'.
export default defineConfig({
  base: '/paper-maker/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
