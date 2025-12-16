import type { NextRequest } from 'next/server'

type BotDelayState = {
  lastSeenMs: number
  nextAllowedMs: number
  continuousSinceMs?: number
}

const BOT_DELAY_BASE_MS = 100
const BOT_DELAY_TARGET_INTERVAL_MS = 6000
const BOT_DELAY_LONG_CRAWL_TARGET_INTERVAL_MS = 20_000
const BOT_DELAY_LONG_CRAWL_THRESHOLD_MS = 5 * 60 * 1000
const BOT_DELAY_CONTINUOUS_IDLE_MAX_MS = 60 * 1000
const BOT_DELAY_MAX_MS = 30_000
const BOT_DELAY_TTL_MS = 10 * 60 * 1000
const BOT_DELAY_CLEANUP_INTERVAL_MS = 60 * 1000
const BOT_DELAY_MAX_KEYS = 10_000

export type BotDelayInfo = {
  key: string
  botFamily: string
  ipPrefix: string
  isFirstSeen: boolean
  longCrawl: boolean
  nowMs: number
  deltaMs: number | null
  continuousDurationMs: number
  targetIntervalMs: number
  nextAllowedMsBefore: number | null
  scheduledAtMs: number
  queueMs: number
  baseMs: number
  maxMs: number
}

export function botDelayWithInfo(
  request: NextRequest,
  ua: string,
): { delayMs: number; info: BotDelayInfo } {
  return computeAndRecordBotDelay(request, ua)
}

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
  if (s.includes('yisouspider')) return 'yisouspider'
  if (s.includes('petalbot')) return 'petalbot'
  if (s.includes('ahrefsbot')) return 'ahrefsbot'
  if (s.includes('semrushbot')) return 'semrushbot'
  if (s.includes('mj12bot')) return 'mj12bot'
  if (s.includes('dotbot')) return 'dotbot'
  if (s.includes('amazonbot')) return 'amazonbot'
  if (s.includes('oai-searchbot')) return 'oai-searchbot'
  if (s.includes('backlinksextendedbot')) return 'backlinksextendedbot'
  if (s.includes('seznambot')) return 'seznambot'
  if (s.includes('coccocbot')) return 'coccocbot'
  if (s.includes('gptbot')) return 'gptbot'
  return 'unknown'
}

/**
 * Botがアクセスしてきた場合のディレイ時間。単位：ms。
 * 同じBotが頻繁にアクセスしてくる場合、より大きなディレイ時間を返す。
 * 初回アクセスのディレイ：100ms
 * 標準的なアクセス間隔：6000ms
 * 継続的にクロールされている場合、標準的なアクセス間隔を20秒まで引き上げる。
 * uaがランダムな場合に備えたアルゴリズムにする。
 */
export function botDelay(request: NextRequest, ua: string): number {
  return computeAndRecordBotDelay(request, ua).delayMs
}

function computeAndRecordBotDelay(
  request: NextRequest,
  ua: string,
): { delayMs: number; info: BotDelayInfo } {
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

  const bot = botFamily(ua)
  const ip = ipPrefix(getClientIp(request))
  const key = `${bot}:${ip}`
  const prev = cache.get(key)
  if (!prev) {
    const targetIntervalMs = BOT_DELAY_TARGET_INTERVAL_MS
    const scheduledAtMs = now
    const queueMs = 0
    const delayMs = Math.min(BOT_DELAY_MAX_MS, BOT_DELAY_BASE_MS + queueMs)
    cache.set(key, {
      lastSeenMs: now,
      nextAllowedMs: now + targetIntervalMs,
      continuousSinceMs: now,
    })
    return {
      delayMs,
      info: {
        key,
        botFamily: bot,
        ipPrefix: ip,
        isFirstSeen: true,
        longCrawl: false,
        nowMs: now,
        deltaMs: null,
        continuousDurationMs: 0,
        targetIntervalMs,
        nextAllowedMsBefore: null,
        scheduledAtMs,
        queueMs,
        baseMs: BOT_DELAY_BASE_MS,
        maxMs: BOT_DELAY_MAX_MS,
      },
    }
  }

  const delta = now - prev.lastSeenMs
  const continuousSinceMs =
    delta <= BOT_DELAY_CONTINUOUS_IDLE_MAX_MS
      ? (prev.continuousSinceMs ?? prev.lastSeenMs)
      : now
  const continuousDurationMs = now - continuousSinceMs
  const longCrawl = continuousDurationMs >= BOT_DELAY_LONG_CRAWL_THRESHOLD_MS
  const targetIntervalMs = longCrawl
    ? BOT_DELAY_LONG_CRAWL_TARGET_INTERVAL_MS
    : BOT_DELAY_TARGET_INTERVAL_MS

  const nextAllowedMsBefore = prev.nextAllowedMs
  const scheduledAtMs = Math.max(now, nextAllowedMsBefore)
  const queueMs = scheduledAtMs - now

  const delayMs = Math.min(
    BOT_DELAY_MAX_MS,
    BOT_DELAY_BASE_MS + queueMs,
  )

  cache.set(key, {
    lastSeenMs: now,
    nextAllowedMs: scheduledAtMs + targetIntervalMs,
    continuousSinceMs,
  })
  return {
    delayMs,
    info: {
      key,
      botFamily: bot,
      ipPrefix: ip,
      isFirstSeen: false,
      longCrawl,
      nowMs: now,
      deltaMs: delta,
      continuousDurationMs,
      targetIntervalMs,
      nextAllowedMsBefore,
      scheduledAtMs,
      queueMs,
      baseMs: BOT_DELAY_BASE_MS,
      maxMs: BOT_DELAY_MAX_MS,
    },
  }
}
