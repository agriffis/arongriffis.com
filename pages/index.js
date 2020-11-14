import renderToString from 'next-mdx-remote/render-to-string'
import hydrate from 'next-mdx-remote/hydrate'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'
import Head from 'next/head'

const root = process.cwd()

export default function Home({mdxSource, frontMatter}) {
  const content = hydrate(mdxSource)
  return (
    <>
      <Head>
        <title>{frontMatter.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>{content}</main>
    </>
  )
}

export async function getStaticProps({params}) {
  const source = fs.readFileSync(path.join(root, 'content/home.mdx'), 'utf8')
  const {data, content} = matter(source)
  const mdxSource = await renderToString(content)
  return {props: {mdxSource, frontMatter: data}}
}
