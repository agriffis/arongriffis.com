#!/usr/bin/env node

import {camelCase} from 'case-anything'
import {basename} from 'path'
import {readdir} from 'fs/promises'

const isImage = f => /[.](?:gif|jpg|png)/.test(f)

async function main() {
  const files = Object.fromEntries(
    (await readdir('.'))
      .filter(isImage)
      .map(f => [camelCase(basename(f).replace(/[.]/g, '-')), f]),
  )
  for (const name of Object.keys(files).sort()) {
    console.log(`export {default as ${name}} from './${files[name]}'`)
  }
}

main()
