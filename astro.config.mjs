import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  build: {format: 'file'},
  trailingSlash: 'never',
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  integrations: [
    mdx(),
    react(),
    sitemap({
      customPages: ['https://arongriffis.com/resume/resume-AronGriffis.pdf'],
    }),
  ],
  redirects: {
    '/2021-12-25-advent-of-code': '/2021-12-01-advent-index',
  },
  site: 'https://arongriffis.com',

  // Astro 7 (Vite 8) raised the default CSS target, which rewrites
  // @media(min-width:740px) into Media Queries Level 4 range syntax,
  // @media(width>=740px). That syntax needs Safari 16.4+ / Chrome 104+, and
  // browsers below that would silently fall back to the mobile layout. Pin an
  // older target so the breakpoints in src/layouts/breakpoints.json keep
  // working everywhere.
  vite: {
    build: {cssTarget: 'safari14'},
  },
})
