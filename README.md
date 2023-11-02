# arongriffis.com (astro edition)

This is the nth iteration of [my personal website and blog](https://arongriffis.com), this time using [Astro](https://astro.build/)

## Development

Per my usual habit, there are some make targets wrapping language-specific tooling:

- `make dev` runs the dev server on port 4321
- `make build` preps for deployment
- `make deploy` will eventually deploy somewhere (TBD)

## History

My website has previously used [Next.js](https://nextjs.org) deployed to [Vercel](https://vercel.com), and before that, [Jekyll](https://jekyllrb.com/) deployed to [GitHub Pages](https://pages.github.com/).

Jekyll was pleasant but simplistic, with no built-in support for JS-powered components. Next.js is powerful but complex, and as server-side rendering technology, it depends on server infrastructure instead of compiling to a static site.

I'm hoping Astro strikes the balance, making it easier to publish individual blog entries while still enabling the occasional foray into interesting tech experiments.
