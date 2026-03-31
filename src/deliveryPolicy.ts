export type ExecutionMode = 'server-data' | 'client-data'

export type DataRouteTarget = 'search' | 'idsfind' | 'mojidata'

export type DeliveryUaKind = 'bot' | 'mobile' | 'desktop'

const DATA_ROUTE_TARGETS_ALL: readonly DataRouteTarget[] = [
  'search',
  'idsfind',
  'mojidata',
]

export function getCanonicalRoutePath(
  target: DataRouteTarget,
  slug?: string,
) {
  if (target === 'search') return '/search'
  if (target === 'idsfind') return '/idsfind'
  if (slug == null) {
    throw new Error('mojidata canonical route requires a slug')
  }
  return `/mojidata/${slug}`
}

export function getLocalizedCanonicalRoutePath(
  target: DataRouteTarget,
  locale: string,
  slug?: string,
) {
  return `/${locale}${getCanonicalRoutePath(target, slug)}`
}

export function getClientDataRoutePath(
  target: DataRouteTarget,
  slug?: string,
) {
  if (target === 'search') return '/search-spa'
  if (target === 'idsfind') return '/idsfind-spa'
  if (slug == null) {
    throw new Error('mojidata client-data route requires a slug')
  }
  return `/mojidata-spa/${slug}`
}

export function isMobileUserAgent(ua: string) {
  return /Mobile|Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(
    ua,
  )
}

export function classifyDeliveryUaKind(params: {
  ua: string
  isBot: boolean
  isLikelyBot: boolean
}): DeliveryUaKind {
  const { ua, isBot, isLikelyBot } = params
  if (isBot || isLikelyBot) return 'bot'
  return isMobileUserAgent(ua) ? 'mobile' : 'desktop'
}

export function isMajorIndexingBotFamily(family: string) {
  return (
    family === 'googlebot' ||
    family === 'google-inspectiontool' ||
    family === 'bingbot'
  )
}

function normalizeDataRouteTarget(token: string): DataRouteTarget | undefined {
  const t = token.trim().toLowerCase()
  if (!t) return undefined
  if (t === 'search' || t === '/search') return 'search'
  if (t === 'idsfind' || t === '/idsfind') return 'idsfind'
  if (t === 'mojidata' || t === '/mojidata') return 'mojidata'
  return undefined
}

export function parseClientDataTargets(
  value: string | undefined,
  defaults: readonly DataRouteTarget[],
): Set<DataRouteTarget> {
  if (value == null) return new Set(defaults)
  const tokens = value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
  if (tokens.length === 0) return new Set()
  if (tokens.some((t) => t === 'none')) return new Set()
  if (tokens.some((t) => t === 'all' || t === '*'))
    return new Set(DATA_ROUTE_TARGETS_ALL)
  const out = new Set<DataRouteTarget>()
  for (const token of tokens) {
    const k = normalizeDataRouteTarget(token)
    if (k) out.add(k)
  }
  return out
}

export function getClientDataRouteConfig() {
  const g = globalThis as unknown as {
    __clientDataRouteConfig?: Record<DeliveryUaKind, Set<DataRouteTarget>>
  }
  g.__clientDataRouteConfig ??= {
    // Keep existing env var names for compatibility while the codebase moves
    // toward execution-mode terminology.
    desktop: parseClientDataTargets(
      process.env.SPA_REWRITE_DESKTOP,
      DATA_ROUTE_TARGETS_ALL,
    ),
    mobile: parseClientDataTargets(process.env.SPA_REWRITE_MOBILE, []),
    bot: parseClientDataTargets(process.env.SPA_REWRITE_BOT, DATA_ROUTE_TARGETS_ALL),
  }
  return g.__clientDataRouteConfig
}

export function getClientDataTargetsForRequest(params: {
  ua: string
  isBot: boolean
  isLikelyBot: boolean
  family?: string
}) {
  const { ua, isBot, isLikelyBot, family = '' } = params
  const uaKind = classifyDeliveryUaKind({ ua, isBot, isLikelyBot })
  const isMajorIndexingBot = isMajorIndexingBotFamily(family)
  const clientDataTargets = isMajorIndexingBot
    ? new Set<DataRouteTarget>()
    : getClientDataRouteConfig()[uaKind]
  return { uaKind, isMajorIndexingBot, clientDataTargets }
}

export function getDataRouteTarget(
  pathnameWithoutLocale: string,
): DataRouteTarget | undefined {
  if (pathnameWithoutLocale === '/search') return 'search'
  if (pathnameWithoutLocale === '/idsfind') return 'idsfind'
  if (pathnameWithoutLocale.startsWith('/mojidata/')) return 'mojidata'
  return undefined
}

export function getInternalClientDataPathForTarget(
  pathnameWithoutLocale: string,
  target: DataRouteTarget,
) {
  if (target === 'search' || target === 'idsfind') {
    return getClientDataRoutePath(target)
  }
  const m = pathnameWithoutLocale.match(/^\/mojidata\/([^/]+)$/)
  if (target === 'mojidata' && m) {
    return getClientDataRoutePath(target, m[1])
  }
  return undefined
}

export function resolveExecutionModeForTarget(params: {
  target: DataRouteTarget
  ua: string
  isBot: boolean
  isLikelyBot: boolean
  family?: string
}) {
  const { target, ua, isBot, isLikelyBot, family = '' } = params
  const { uaKind, isMajorIndexingBot, clientDataTargets } =
    getClientDataTargetsForRequest({
      ua,
      isBot,
      isLikelyBot,
      family,
    })
  return {
    uaKind,
    isMajorIndexingBot,
    clientDataTargets,
    mode: clientDataTargets.has(target)
      ? ('client-data' as const)
      : ('server-data' as const),
  }
}

export function resolveExecutionMode(params: {
  pathnameWithoutLocale: string
  ua: string
  isBot: boolean
  isLikelyBot: boolean
  family?: string
}) {
  const {
    pathnameWithoutLocale,
    ua,
    isBot,
    isLikelyBot,
    family = '',
  } = params
  const target = getDataRouteTarget(pathnameWithoutLocale)
  if (target == null) {
    return {
      ...getClientDataTargetsForRequest({
        ua,
        isBot,
        isLikelyBot,
        family,
      }),
      internalClientDataPath: undefined,
    }
  }

  const modeResult = resolveExecutionModeForTarget({
    target,
    ua,
    isBot,
    isLikelyBot,
    family,
  })
  return {
    ...modeResult,
    internalClientDataPath:
      modeResult.mode !== 'client-data'
        ? undefined
        : getInternalClientDataPathForTarget(pathnameWithoutLocale, target),
  }
}
