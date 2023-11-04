import {z, defineCollection} from 'astro:content'

const date = z
  .string()
  .transform((s: string) => new Date(s.includes('T') ? s : `${s}T16:00:00Z`))

const posts = defineCollection({
  schema: z.object({
    author: z.string().default('Aron'),
    created: date.optional(),
    draft: z.boolean().default(false),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    index: z.boolean().default(true),
    tags: z.array(z.string()),
    title: z.string(),
    updated: date.optional(),
  }),
})

export const collections = {
  posts,
}
