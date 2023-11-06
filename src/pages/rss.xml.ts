import * as site from '../lib/site'
import {getPosts} from '../lib/utils'
import rss from '@astrojs/rss'

export async function GET(context) {
  const posts = await getPosts()
  return rss({
    title: site.TITLE,
    description: "Aron Griffis's Blog",
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.updated || post.data.created,
      description: post.data.excerpt,
      // customData: post.data.customData,
      link: `/${post.slug}/`,
    })),
    customData: `<language>en-us</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
  })
}
