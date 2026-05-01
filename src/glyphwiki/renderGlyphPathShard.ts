import {
  getGlyphFontAssetsBucket,
  renderGlyphPathDataAsSvg,
  type GlyphRenderBox,
} from '@/glyphwiki/renderFontGlyph'
import { gunzip } from 'node:zlib'
import { promisify } from 'node:util'

const doGunzip = promisify(gunzip)
const GLYPH_PATH_R2_KEY_PREFIX = 'glyph-paths/v1'
const SHARD_PREFIX_LENGTH = 3

type GlyphPathShard = Record<string, string>

export interface GlyphPathShardRendererConfig {
  source: 'jigmo' | 'ipamjm'
  renderBox: GlyphRenderBox
  fallback?: (name: string) => Promise<string | null>
}

function shardKey(source: string, name: string) {
  return `${GLYPH_PATH_R2_KEY_PREFIX}/${source}/${name
    .slice(0, SHARD_PREFIX_LENGTH)
    .toLowerCase()}.json.gz`
}

async function loadShard(
  bucket: R2Bucket,
  key: string,
): Promise<GlyphPathShard | null> {
  const object = await bucket.get(key)
  if (!object) return null

  const compressed = new Uint8Array(await object.arrayBuffer())
  const json = await doGunzip(compressed)
  return JSON.parse(new TextDecoder().decode(json)) as GlyphPathShard
}

export function createGlyphPathShardRenderer(
  config: GlyphPathShardRendererConfig,
) {
  const shardCache = new Map<string, Promise<GlyphPathShard | null>>()

  return async (name: string) => {
    const normalizedName = name.toLowerCase()
    const bucket = await getGlyphFontAssetsBucket()
    if (!bucket) {
      return config.fallback?.(normalizedName) ?? null
    }

    const key = shardKey(config.source, normalizedName)
    let shardPromise = shardCache.get(key)
    if (!shardPromise) {
      const current = loadShard(bucket, key).catch((error) => {
        if (shardCache.get(key) === current) shardCache.delete(key)
        throw error
      })
      shardPromise = current
      shardCache.set(key, shardPromise)
    }

    const pathData = (await shardPromise)?.[normalizedName]
    if (!pathData) return null

    return renderGlyphPathDataAsSvg(pathData, config.renderBox)
  }
}
