import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SPA_ASSET_CACHE_CONTROL =
  process.env.NODE_ENV === 'production'
    ? 'public, max-age=300, must-revalidate'
    : 'public, max-age=0, must-revalidate'

type Asset = { name: string; contentType: string; contentEncoding?: string }

async function assetMetadata(name: string): Promise<Asset | undefined> {
  if (!/^[A-Za-z0-9_./-]+$/.test(name) || name.split('/').some(part => part === '.' || part === '..' || !part)) return undefined
  const inventory = JSON.parse(await readFile(path.join(spaAssetsDir(), 'asset-index.json'), 'utf8')) as { assets: Asset[] }
  return inventory.assets.find(asset => asset.name === name)
}

function spaAssetsDir() {
  return path.resolve(
    process.env.MOJIDATA_SPA_ASSETS_DIR ??
      path.join(process.cwd(), 'dist', 'spa-assets'),
  )
}

function headersForAsset(asset: Asset, size: number) {
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
  const filePath = path.join(spaAssetsDir(), name)
  try {
    const asset = await assetMetadata(name)
    if (!asset) return new NextResponse('Not Found', { status: 404 })
    const info = await stat(filePath)
    const headers = headersForAsset(asset, info.size)
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
  context: { params: Promise<{ name: string[] }> },
) {
  const { name } = await context.params
  return assetResponse(name.join('/'))
}

export async function HEAD(
  _request: Request,
  context: { params: Promise<{ name: string[] }> },
) {
  const { name } = await context.params
  return assetResponse(name.join('/'), true)
}
