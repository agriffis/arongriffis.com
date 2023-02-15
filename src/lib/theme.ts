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
}

export const vars = {
  ...mapObj(([k, v]) => [`${k}Color`, v])(theme.colors),
  ...mapObj(([k, v]) => [`${k}Font`, v])(theme.fonts),
  ...mapObj(([k, v]) => [`${k}FontSize`, v])(theme.fontSizes),
  ...mapObj(([k, v]) => [`${k}Size`, v])(theme.sizes),
  ...mapObj(([k, v]) => [`space${k.replace('.', '_')}`, v])(theme.space),
  ...mapObj(([k, v]) => (typeof v === 'string' ? [k, v] : undefined))(theme),
}
