import type { NextRequest } from 'next/server'

type BotDelayState = {
  lastSeenMs: number
  strikes: number
  inFlight: number
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
const BOT_DELAY_MAX_UNDER_TARGET_MS = 10_000
const BOT_DELAY_STRIKE_STEP_MS = 250
const BOT_DELAY_MAX_STRIKES_MS = 12_000
const BOT_DELAY_PARALLEL_STEP_MS = 400
const BOT_DELAY_PARALLEL_EXTRA_STEP_MS = 800
const BOT_DELAY_MAX_PARALLEL_MS = 20_000

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
  underTargetMs: number
  underTargetPenaltyMs: number
  strikes: number
  strikePenaltyMs: number
  inFlightBefore: number
  parallelPenaltyMs: number
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
      if (now - value.lastSeenMs > BOT_DELAY_TTL_MS && value.inFlight <= 0) {
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
    const delayMs = BOT_DELAY_BASE_MS
    cache.set(key, {
      lastSeenMs: now,
      strikes: 0,
      inFlight: 1,
      continuousSinceMs: now,
    })
    setTimeout(() => {
      const cur = cache.get(key)
      if (!cur) return
      cache.set(key, { ...cur, inFlight: Math.max(0, cur.inFlight - 1) })
    }, delayMs)
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
        targetIntervalMs: BOT_DELAY_TARGET_INTERVAL_MS,
        underTargetMs: 0,
        underTargetPenaltyMs: 0,
        strikes: 0,
        strikePenaltyMs: 0,
        inFlightBefore: 0,
        parallelPenaltyMs: 0,
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

  const underTarget = Math.max(0, targetIntervalMs - delta)
  const strikes = delta < targetIntervalMs ? prev.strikes + 1 : 0

  const parallel = Math.max(0, prev.inFlight)
  const parallelPenalty = Math.min(
    BOT_DELAY_MAX_PARALLEL_MS,
    parallel * BOT_DELAY_PARALLEL_STEP_MS +
      Math.max(0, parallel - 4) * BOT_DELAY_PARALLEL_EXTRA_STEP_MS,
  )

  const underTargetPenalty = Math.min(BOT_DELAY_MAX_UNDER_TARGET_MS, underTarget)
  const strikePenalty = Math.min(
    BOT_DELAY_MAX_STRIKES_MS,
    strikes * BOT_DELAY_STRIKE_STEP_MS,
  )
  const delayMs = Math.min(
    BOT_DELAY_MAX_MS,
    BOT_DELAY_BASE_MS + underTargetPenalty + strikePenalty + parallelPenalty,
  )

  cache.set(key, {
    lastSeenMs: now,
    strikes,
    inFlight: parallel + 1,
    continuousSinceMs,
  })
  setTimeout(() => {
    const cur = cache.get(key)
    if (!cur) return
    cache.set(key, { ...cur, inFlight: Math.max(0, cur.inFlight - 1) })
  }, delayMs)
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
      underTargetMs: underTarget,
      underTargetPenaltyMs: underTargetPenalty,
      strikes,
      strikePenaltyMs: strikePenalty,
      inFlightBefore: parallel,
      parallelPenaltyMs: parallelPenalty,
      baseMs: BOT_DELAY_BASE_MS,
      maxMs: BOT_DELAY_MAX_MS,
    },
  }
}
