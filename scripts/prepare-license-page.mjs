import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { packageNoticeAssets } from './data-notice-assets.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sections = []
for (const [title, directory, names] of [
  ['CJK Symbols', 'cjksymbols', ['LICENSE.txt', 'README.md']],
  ['Adobe NotDef', 'notdef', ['LICENSE.md', 'README.md']],
  ['Jigmo', 'jigmo', ['LICENSE.txt', 'README.txt', 'THANKS.txt']],
  ['IPAmjMincho', 'ipamjm', ['IPA_Font_License_Agreement_v1.0.txt', 'Readme.txt']],
]) {
  const files = []
  for (const name of names) files.push({name, text: await readFile(path.join(root, 'src/fonts', directory, name), 'utf8')})
  sections.push({title, files})
}
for (const name of ['mojidata', 'idsdb', 'idsdb-fts5']) {
  const notice = await packageNoticeAssets(path.join(root, 'node_modules/@mandel59', name), `@mandel59/${name}`, name)
  const files = []
  for (const file of notice.files) {
    if (!file.name.endsWith('data-notices.json')) files.push({name: file.name.slice(name.length + 1), text: await readFile(file.src, 'utf8')})
  }
  sections.push({title: `${notice.package.name} ${notice.package.version}`, files})
}
const glyphWikiDirectory = path.join(root, 'src/licensing/glyphwiki')
const glyphWikiSource = JSON.parse(await readFile(path.join(glyphWikiDirectory, 'source.json'), 'utf8'))
const glyphWikiBytes = await readFile(path.join(glyphWikiDirectory, 'license.txt'))
if (createHash('sha256').update(glyphWikiBytes).digest('hex') !== glyphWikiSource.sha256) throw new Error('GlyphWiki license snapshot hash mismatch')
sections.push({
  title: 'GlyphWiki',
  source: glyphWikiSource.source,
  files: [{name: glyphWikiSource.title, text: glyphWikiBytes.toString('utf8')}],
})

const output = path.join(root, 'src/licensing/notices.generated.json')
await mkdir(path.dirname(output), {recursive: true})
await writeFile(output, JSON.stringify(sections, null, 2) + '\n')
console.log(`Prepared ${sections.length} license sections`)
