import {getCollection} from 'astro:content'
import * as R from 'rambdax'

export function isoDate(d: Date) {
  return d.toISOString()
}

const shortMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function shortDate(d: Date) {
  return `${
    shortMonths[d.getUTCMonth()]
  } ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function dateSlug(date: Date) {
  const yyyy = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const mm = m < 10 ? `0${m}` : m
  const d = date.getUTCDate()
  const dd = d < 10 ? `0${d}` : d
  return `${yyyy}-${mm}-${dd}`
}

export async function getPosts(includeDrafts: boolean = false) {
  const posts = await getCollection(
    'posts',
    ({data}) => includeDrafts || !data.draft,
  )
  return R.piped(
    posts,
    R.map(post => {
      // internal created can override filename.
      const createdSlug = post.data.created
        ? dateSlug(post.data.created)
        : post.id.match(/^\d{4}-\d{2}-[^-]+/)![0]
      const slugRest = post.slug.startsWith(`${createdSlug}-`)
        ? post.slug.substring(11)
        : post.slug
      return {
        ...post,
        slug: `${createdSlug}-${slugRest}`,
        data: {
          created: new Date(createdSlug),
          ...post.data,
        },
      }
    }),
    R.sortBy(a => a.data.title.toLowerCase()),
    R.sortBy(a => -a.data.created),
    R.sortBy(a => +a.data.draft),
  )
}
