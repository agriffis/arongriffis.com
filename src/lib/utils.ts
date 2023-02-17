import {getCollection} from 'astro:content'

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

export async function getPosts(includeDrafts: boolean = false) {
  const posts = await getCollection('posts', ({data}) => includeDrafts || !data.draft)
  return posts.map(post => {
    const [created] = post.slug.match(/^\d{4}-\d{2}-[^-]+/) || []
    return {
      ...post,
      data: {
        ...post.data,
        created: created ? new Date(created) : undefined,
      },
    }
  })
}
