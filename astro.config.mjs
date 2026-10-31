// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://karolina-chrobot.pages.dev',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true },
});
