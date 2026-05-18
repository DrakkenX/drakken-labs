// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://drakkenlabs.com',
  server: {
    port: parseInt(process.env.PORT ?? '4321'),
    host: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
