import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      layout: { runbook: join(here, 'src/lib/layouts/runbook.svelte') },
    }),
  ],
  kit: {
    adapter: adapter({ fallback: null }),
    alias: { '#lib': 'src/lib' },
    prerender: {
      entries: [
        '/kb',
        '/kb/triage/dedupe',
        '/kb/decisions/0001-dedupe-by-subject',
        '/kb/incidents/4471',
        '/kb/incidents/4471-what-it-shows',
      ],
    },
  },
};

export default config;
