// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://drakkenlabs.com',
  server: {
    // @ts-ignore -- process.env is valid in Node context
    port: parseInt(/** @type {string} */ (process.env['PORT']) ?? '4321'),
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
