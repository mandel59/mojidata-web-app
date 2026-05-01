import * as esbuild from 'esbuild'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(
  await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'),
)
const outDir = path.join(rootDir, 'dist', 'crawl-spa')
const assetsDir = path.join(outDir, 'assets')
const assetBaseUrl =
  process.env.MOJIDATA_CRAWL_SPA_ASSET_BASE_URL ??
  process.env.NEXT_PUBLIC_SPA_ASSET_BASE_URL ??
  'https://pub-71ea5f978f41419c8fbd653a44326929.r2.dev'
const mojidataDbUrl =
  process.env.MOJIDATA_CRAWL_SPA_MOJIDATA_DB_URL ??
  process.env.NEXT_PUBLIC_SPA_MOJIDATA_DB_URL ??
  ''
const idsfindDbUrl =
  process.env.MOJIDATA_CRAWL_SPA_IDSFIND_DB_URL ??
  process.env.NEXT_PUBLIC_SPA_IDSFIND_DB_URL ??
  ''
const sqlWasmUrl =
  process.env.MOJIDATA_CRAWL_SPA_SQL_WASM_URL ??
  process.env.NEXT_PUBLIC_SPA_SQL_WASM_URL ??
  ''
const assetVersion =
  process.env.MOJIDATA_CRAWL_SPA_ASSET_VERSION ??
  process.env.NEXT_PUBLIC_SPA_ASSET_VERSION ??
  process.env.CF_PAGES_COMMIT_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  packageJson.version ??
  ''

function resolveImportPath(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}.css`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.jsx'),
  ]
  return candidates.find((candidate) => fsSync.existsSync(candidate))
}

await fs.rm(outDir, { recursive: true, force: true })
await fs.mkdir(assetsDir, { recursive: true })

function outputHref(outputPath) {
  return `/${path.relative(outDir, outputPath).split(path.sep).join('/')}`
}

function entryOutput(metafile, entryPoint) {
  const normalizedEntryPoint = path.relative(rootDir, entryPoint)
  const output = Object.entries(metafile.outputs).find(
    ([, info]) => info.entryPoint === normalizedEntryPoint,
  )
  if (!output) {
    throw new Error(`Could not find esbuild output for ${normalizedEntryPoint}`)
  }
  return output
}

const shared = {
  bundle: true,
  external: ['crypto', 'fs', 'path'],
  loader: {
    '.css': 'css',
    '.module.css': 'local-css',
    '.woff2': 'file',
  },
  jsx: 'automatic',
  platform: 'browser',
  plugins: [
    {
      name: 'mojidata-crawl-aliases',
      setup(build) {
        const aliases = new Map([
          [
            'next/link',
            path.join(rootDir, 'crawl-spa', 'src', 'next-link.tsx'),
          ],
          [
            'next/navigation',
            path.join(rootDir, 'crawl-spa', 'src', 'next-navigation.ts'),
          ],
          [
            '@/spa/mojidataApiBrowser',
            path.join(rootDir, 'crawl-spa', 'src', 'mojidataApiBrowser.ts'),
          ],
          [
            '@/components/GlyphWikiCharImg',
            path.join(rootDir, 'crawl-spa', 'src', 'TextGlyph.tsx'),
          ],
          [
            '@/components/IpamjmCharImg',
            path.join(rootDir, 'crawl-spa', 'src', 'TextGlyph.tsx'),
          ],
          [
            '@/components/DeferredCharSvgImage',
            path.join(rootDir, 'crawl-spa', 'src', 'TextGlyph.tsx'),
          ],
        ])

        build.onResolve({ filter: /^(?:@\/|next\/)/ }, (args) => {
          const alias = aliases.get(args.path)
          if (alias) return { path: alias }
          if (args.path.startsWith('@/')) {
            const resolved = resolveImportPath(
              path.join(rootDir, 'src', args.path.slice(2)),
            )
            if (resolved) return { path: resolved }
          }
          return undefined
        })
      },
    },
  ],
  target: ['es2022'],
  logLevel: 'info',
}

const workerBuild = await esbuild.build({
  ...shared,
  entryPoints: [path.join(rootDir, 'crawl-spa', 'src', 'api-worker.ts')],
  outdir: assetsDir,
  entryNames: '[name]-[hash]',
  format: 'iife',
  metafile: true,
})
const [workerOutputPath] = entryOutput(
  workerBuild.metafile,
  path.join(rootDir, 'crawl-spa', 'src', 'api-worker.ts'),
)
const workerUrl = outputHref(path.join(rootDir, workerOutputPath))

const mainBuild = await esbuild.build({
  ...shared,
  entryPoints: [path.join(rootDir, 'crawl-spa', 'src', 'main.tsx')],
  outdir: assetsDir,
  entryNames: '[name]-[hash]',
  assetNames: '[name]-[hash]',
  format: 'esm',
  metafile: true,
  define: {
    __MOJIDATA_CRAWL_ASSET_BASE_URL__: JSON.stringify(assetBaseUrl),
    __MOJIDATA_CRAWL_MOJIDATA_DB_URL__: JSON.stringify(mojidataDbUrl),
    __MOJIDATA_CRAWL_IDSFIND_DB_URL__: JSON.stringify(idsfindDbUrl),
    __MOJIDATA_CRAWL_SQL_WASM_URL__: JSON.stringify(sqlWasmUrl),
    __MOJIDATA_CRAWL_ASSET_VERSION__: JSON.stringify(assetVersion),
    __MOJIDATA_CRAWL_WORKER_URL__: JSON.stringify(workerUrl),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.SPA_REWRITE_DESKTOP': 'undefined',
    'process.env.SPA_REWRITE_MOBILE': 'undefined',
    'process.env.SPA_REWRITE_BOT': 'undefined',
  },
})
const [mainOutputPath, mainOutputInfo] = entryOutput(
  mainBuild.metafile,
  path.join(rootDir, 'crawl-spa', 'src', 'main.tsx'),
)
if (!mainOutputInfo.cssBundle) {
  throw new Error('Could not find esbuild CSS bundle for crawl SPA.')
}

const indexHtml = await fs.readFile(
  path.join(rootDir, 'crawl-spa', 'index.html'),
  'utf8',
)
await fs.writeFile(
  path.join(outDir, 'index.html'),
  indexHtml
    .replace(
      '__MOJIDATA_CRAWL_MAIN_CSS__',
      outputHref(path.join(rootDir, mainOutputInfo.cssBundle)),
    )
    .replace(
      '__MOJIDATA_CRAWL_MAIN_JS__',
      outputHref(path.join(rootDir, mainOutputPath)),
    ),
)
await fs.writeFile(
  path.join(outDir, '_headers'),
  [
    '/*',
    '  X-Robots-Tag: noindex, follow',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n'),
)
await fs.writeFile(
  path.join(outDir, 'robots.txt'),
  ['User-agent: *', 'Allow: /', ''].join('\n'),
)

console.log(`[crawl-spa] wrote ${path.relative(rootDir, outDir)}`)
console.log(`[crawl-spa] asset base ${assetBaseUrl}`)
if (sqlWasmUrl) console.log(`[crawl-spa] sql wasm ${sqlWasmUrl}`)
if (mojidataDbUrl) console.log(`[crawl-spa] mojidata db ${mojidataDbUrl}`)
if (idsfindDbUrl) console.log(`[crawl-spa] idsfind db ${idsfindDbUrl}`)
console.log(`[crawl-spa] worker ${workerUrl}`)
