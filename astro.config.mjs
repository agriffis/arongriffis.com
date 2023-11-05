import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  integrations: [mdx(), react()],
  },
})
