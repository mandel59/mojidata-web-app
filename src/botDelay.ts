import type { NextRequest } from 'next/server'

type BotDelayState = {
  lastSeenMs: number
  strikes: number
}

const BOT_DELAY_BASE_MS = 100
const BOT_DELAY_TARGET_INTERVAL_MS = 6000
const BOT_DELAY_MAX_MS = 8000
const BOT_DELAY_TTL_MS = 10 * 60 * 1000
const BOT_DELAY_CLEANUP_INTERVAL_MS = 60 * 1000
const BOT_DELAY_MAX_KEYS = 10_000

function getBotDelayCache() {
  const g = globalThis as unknown as {
    __botDelayCache?: Map<string, BotDelayState>
    __botDelayCacheLastCleanupMs?: number
  }
  g.__botDelayCache ??= new Map<string, BotDelayState>()
  g.__botDelayCacheLastCleanupMs ??= 0
  return { cache: g.__botDelayCache, g }
}

function getClientIp(request: NextRequest): string | undefined {
  const requestWithIp = request as NextRequest & { ip?: string }
  const ip =
    requestWithIp.ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip')?.trim() ??
    request.headers.get('cf-connecting-ip')?.trim()
  return ip || undefined
}

function ipPrefix(ip: string | undefined): string {
  if (!ip) return 'unknown'
  if (ip.includes(':')) {
    const normalized = ip.split('%')[0]
    const parts = normalized.split(':').filter(Boolean)
    return parts.slice(0, 4).join(':') || 'ipv6'
  }
  const octets = ip.split('.')
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.${octets[2]}`
  }
  return 'ipv4'
}

function botFamily(ua: string): string {
  const s = ua.toLowerCase()
  if (s.includes('bytespider')) return 'bytespider'
  if (s.includes('googlebot')) return 'googlebot'
  if (s.includes('bingbot')) return 'bingbot'
  if (s.includes('duckduckbot')) return 'duckduckbot'
  if (s.includes('yandexbot')) return 'yandexbot'
  if (s.includes('baiduspider')) return 'baiduspider'
  if (s.includes('gptbot')) return 'gptbot'
  return 'unknown'
}

/**
 * Botがアクセスしてきた場合のディレイ時間。単位：ms。
 * 同じBotが頻繁にアクセスしてくる場合、より大きなディレイ時間を返す。
 * 初回アクセスのディレイ：100ms
 * 標準的なアクセス間隔：6000ms
 * uaがランダムな場合に備えたアルゴリズムにする。
 */
export function botDelay(request: NextRequest, ua: string): number {
  const { cache, g } = getBotDelayCache()
  const now = Date.now()

  if (
    now - (g.__botDelayCacheLastCleanupMs ?? 0) >
    BOT_DELAY_CLEANUP_INTERVAL_MS
  ) {
    g.__botDelayCacheLastCleanupMs = now
    for (const [key, value] of cache.entries()) {
      if (now - value.lastSeenMs > BOT_DELAY_TTL_MS) {
        cache.delete(key)
      }
    }
    if (cache.size > BOT_DELAY_MAX_KEYS) {
      cache.clear()
    }
  }

  const key = `${botFamily(ua)}:${ipPrefix(getClientIp(request))}`
  const prev = cache.get(key)
  if (!prev) {
    cache.set(key, { lastSeenMs: now, strikes: 0 })
    return BOT_DELAY_BASE_MS
  }

  const delta = now - prev.lastSeenMs
  const underTarget = Math.max(0, BOT_DELAY_TARGET_INTERVAL_MS - delta)
  const strikes = delta < BOT_DELAY_TARGET_INTERVAL_MS ? prev.strikes + 1 : 0
  cache.set(key, { lastSeenMs: now, strikes })

  const delay =
    BOT_DELAY_BASE_MS +
    Math.min(5000, underTarget) +
    Math.min(4000, strikes * 250)
  return Math.min(BOT_DELAY_MAX_MS, delay)
}
