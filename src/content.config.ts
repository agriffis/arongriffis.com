import {z, defineCollection} from 'astro:content'
import {glob} from 'astro/loaders'

const date = z
  .string()
  .transform((s: string) => new Date(s.includes('T') ? s : `${s}T16:00:00Z`))

const posts = defineCollection({
  // Astro 5 replaced implicit directory scanning with explicit loaders. The
  // base stays at src/content/posts so post ids keep matching the filenames
  // that getPosts() parses dates out of.
  //
  // generateId is spelled out because the loader's default mangles names
  // containing a dot: 2012-04-24-bashrc.virtualenvwrapper.mdx would otherwise
  // lose its date prefix and become "bashrc.virtualenvwrapper", breaking both
  // the published URL and the date parsing in getPosts().
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/posts',
    generateId: ({entry}) => entry.replace(/\.mdx$/, ''),
  }),
  schema: z.object({
    author: z.string().default('Aron'),
    created: date.optional(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
    gentoo: z.string().optional(),
    image: z.string().optional(),
    index: z.boolean().default(true),
    n01se: z.string().optional(),
    tags: z.array(z.string()),
    title: z.string(),
    updated: date.optional(),
  }),
})

export const collections = {
  posts,
}
