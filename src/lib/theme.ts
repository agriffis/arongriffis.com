const notUndefined = <T>(x: T | undefined): x is T => x !== undefined

const mapObj =
  <VI, VO>(fn: (value: [k: string, v: VI]) => [string, VO] | undefined) =>
  (o: Record<any, VI>): Record<string, VO> =>
    Object.fromEntries(Object.entries(o).map(fn).filter(notUndefined))

const containerRem = 36 // 576px

const space = {
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
}

const fonts = {
  mono: '"Roboto Mono", monospace',
  sans: '"Roboto Condensed", sans-serif',
  serif: '"Crimson Pro", serif',
}

export const theme = {
  colors: {
    background: '#fff',
    text: '#555',
    heading: '#444',
    icon: '#333',
    accent: '#246eb9',
    link: '#246eb9',
    note: '#ddd',
  },
  fonts: {
    ...fonts,
    meta: fonts.sans,
  },
  fontSizes: {
    metaLg: '1.25rem',
    metaSm: '0.75rem',
  },
  sizes: {
    container: `${containerRem}rem`,
    logo: '100px',
    pageGutter: space['8'],
    pagePadding: space['4'],
  },
  space,

  'papercolor-color00': '#eeeeee',
  'papercolor-color01': '#af0000',
  'papercolor-color02': '#008700',
  'papercolor-color03': '#5f8700',
  'papercolor-color04': '#0087af',
  'papercolor-color05': '#878787',
  'papercolor-color06': '#005f87',
  'papercolor-color07': '#444444',
  'papercolor-color08': '#bcbcbc',
  'papercolor-color09': '#d70000',
  'papercolor-color10': '#d70087',
  'papercolor-color11': '#8700af',
  'papercolor-color12': '#d75f00',
  'papercolor-color13': '#d75f00',
  'papercolor-color14': '#005faf',
  'papercolor-color15': '#005f87',
  'papercolor-color16': '#0087af',
  'papercolor-color17': '#008700',
  'papercolor-visual-fg': '#eeeeee',
  'papercolor-visual-bg': '#0087af',

  'syntax-background': 'var(--papercolor-color00)',
  'syntax-negative': 'var(--papercolor-color01)',
  'syntax-positive': 'var(--papercolor-color02)',
  'syntax-olive': 'var(--papercolor-color03)',
  'syntax-neutral': 'var(--papercolor-color04)',
  'syntax-comment': 'var(--papercolor-color05)',
  'syntax-navy': 'var(--papercolor-color06)',
  'syntax-foreground': 'var(--papercolor-color07)',
  'syntax-nontext': 'var(--papercolor-color08)',
  'syntax-red': 'var(--papercolor-color09)',
  'syntax-pink': 'var(--papercolor-color10)',
  'syntax-purple': 'var(--papercolor-color11)',
  'syntax-accent': 'var(--papercolor-color12)',
  'syntax-orange': 'var(--papercolor-color13)',
  'syntax-blue': 'var(--papercolor-color14)',
  'syntax-highlight': 'var(--papercolor-color15)',
  'syntax-aqua': 'var(--papercolor-color16)',
  'syntax-green': 'var(--papercolor-color17)',
  'syntax-wine': 'var(--papercolor-color18)',
  'syntax-visual-fg': 'var(--papercolor-visual-fg)',
  'syntax-visual-bg': 'var(--papercolor-visual-bg)',

  'astro-code-color-text': 'var(--syntax-foreground)',
  'astro-code-color-background': 'var(--syntax-background)',
  'astro-code-token-constant': 'var(--syntax-orange)',
  'astro-code-token-string': 'var(--syntax-olive)',
  'astro-code-token-comment': 'var(--syntax-comment)',
  'astro-code-token-keyword': 'var(--syntax-blue)',
  'astro-code-token-parameter': 'var(--syntax-aqua)',
  'astro-code-token-function': 'var(--syntax-orange)',
  'astro-code-token-string-expression': '',
  'astro-code-token-punctuation': 'var(--syntax-pink)',
  'astro-code-token-link': '',
}

export const darkTheme = {
  ...theme,
  colors: {
    background: '#111',
    text: '#ccc',
    heading: '#ddd',
    accent: '#76c2fb',
    icon: '#ccc',
    link: '#76c2fb',
    note: '#444',
  },
  'papercolor-color00': '#1c1c1c',
  'papercolor-color01': '#af005f',
  'papercolor-color02': '#5faf00',
  'papercolor-color03': '#d7af5f',
  'papercolor-color04': '#5fafd7',
  'papercolor-color05': '#808080',
  'papercolor-color06': '#d7875f',
  'papercolor-color07': '#d0d0d0',
  'papercolor-color08': '#585858',
  'papercolor-color09': '#5faf5f',
  'papercolor-color10': '#afd700',
  'papercolor-color11': '#af87d7',
  'papercolor-color12': '#ffaf00',
  'papercolor-color13': '#ff5faf',
  'papercolor-color14': '#00afaf',
  'papercolor-color15': '#5f8787',
  'papercolor-visual-fg': '#000000',
  'papercolor-visual-bg': '#8787af',
}

const asVars = (th: typeof theme) => ({
  ...mapObj(([k, v]) => [`${k}Color`, v])(th.colors),
  ...mapObj(([k, v]) => [`${k}Font`, v])(th.fonts),
  ...mapObj(([k, v]) => [`${k}FontSize`, v])(th.fontSizes),
  ...mapObj(([k, v]) => [`${k}Size`, v])(th.sizes),
  ...mapObj(([k, v]) => [`space${k.replace('.', '_')}`, v])(th.space),
  ...mapObj(([k, v]) => (typeof v === 'string' ? [k, v] : undefined))(th),
})

export const vars = asVars(theme)

export const darkVars = mapObj(([k, v]) =>
  v === vars[k] ? undefined : [k, v],
)(asVars(darkTheme))
