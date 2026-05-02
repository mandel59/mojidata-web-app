import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPA_ASSET_CACHE_CONTROL =
  process.env.NODE_ENV === 'production'
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate'

const assets: Record<
  string,
  {
    contentType: string
    contentEncoding?: string
  }
> = {
  'sql-wasm.wasm': { contentType: 'application/wasm' },
  'sql-wasm.wasm.br': {
    contentType: 'application/wasm',
    contentEncoding: 'br',
  },
  'sql-wasm.wasm.gz': {
    contentType: 'application/wasm',
    contentEncoding: 'gzip',
  },
  'moji.db': { contentType: 'application/octet-stream' },
  'moji.db.br': {
    contentType: 'application/octet-stream',
    contentEncoding: 'br',
  },
  'moji.db.gz': {
    contentType: 'application/octet-stream',
    contentEncoding: 'gzip',
  },
  'idsfind.db': { contentType: 'application/octet-stream' },
  'idsfind.db.br': {
    contentType: 'application/octet-stream',
    contentEncoding: 'br',
  },
  'idsfind.db.gz': {
    contentType: 'application/octet-stream',
    contentEncoding: 'gzip',
  },
}

function spaAssetsDir() {
  return path.resolve(
    process.env.MOJIDATA_SPA_ASSETS_DIR ??
      path.join(process.cwd(), 'dist', 'spa-assets'),
  )
}

function headersForAsset(name: string, size: number) {
  const asset = assets[name]
  const headers = new Headers()
  headers.set('Cache-Control', SPA_ASSET_CACHE_CONTROL)
  headers.set('Content-Type', asset.contentType)
  headers.set('Content-Length', String(size))
  headers.set('Vary', 'Accept-Encoding')
  if (asset.contentEncoding) {
    headers.set('Content-Encoding', asset.contentEncoding)
  }
  return headers
}

async function assetResponse(name: string, head = false) {
  if (!assets[name]) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const filePath = path.join(spaAssetsDir(), name)
  try {
    const info = await stat(filePath)
    const headers = headersForAsset(name, info.size)
    if (head) {
      return new NextResponse(null, { status: 200, headers })
    }
    return new NextResponse(await readFile(filePath), { status: 200, headers })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params
  return assetResponse(name)
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params
  return assetResponse(name, true)
}
