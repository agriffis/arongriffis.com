/** @type {import("prettier").Config} */
export default {
  arrowParens: 'avoid',
  bracketSpacing: false,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-astro'],
  overrides: [{files: '*.astro', options: {parser: 'astro'}}],
}
