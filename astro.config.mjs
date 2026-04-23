// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Actions sets GITHUB_ACTIONS=true; use the subpath config there.
// Cloudflare Pages and local dev both use the custom domain at the root.
const isGitHubPages = !!process.env.GITHUB_ACTIONS;

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages ? 'https://redwoods-dsc.github.io' : 'https://joinredwoods.com',
  base: isGitHubPages ? '/joinredwoods.com' : '/',
});
