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
})
