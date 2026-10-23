import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le site sera publié sous https://hourri13-spec.github.io/decoia-studio/
export default defineConfig({
  plugins: [react()],
  base: '/decoia-studio/',
});
