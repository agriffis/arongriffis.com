import {readFileSync} from 'node:fs'
import constants from 'postcss-constants'
import nested from 'postcss-nested'

// Shared with the media queries in src/layouts/*.astro via postcss-constants,
// so breakpoints stay defined in exactly one place.
const breakpoints = JSON.parse(
  readFileSync(new URL('./src/layouts/breakpoints.json', import.meta.url)),
)

export default {
  plugins: [constants({defaults: {breakpoints}}), nested],
}
