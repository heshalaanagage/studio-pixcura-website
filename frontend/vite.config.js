import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages project repo hosting, set base to '/REPOSITORY_NAME/'.
// Example: base: '/studio-pixcura-website/'
// For local dev or custom domain, keep base: './'
export default defineConfig({
  plugins: [react()],
  base: './'
});
