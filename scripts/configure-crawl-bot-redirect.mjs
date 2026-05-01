import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const zoneName = process.env.CLOUDFLARE_ZONE_NAME ?? 'ryusei.dev'
const sourceHost = process.env.MOJIDATA_CRAWL_SOURCE_HOST ?? 'mojidata.ryusei.dev'
const targetHost =
  process.env.MOJIDATA_CRAWL_TARGET_HOST ?? 'mojidata-crawl.pages.dev'
const ruleRef =
  process.env.MOJIDATA_CRAWL_RULE_REF ?? 'mojidata-crawl-bot-redirect'

const crawlBotNames = [
  'ahrefsbot',
  'amazonbot',
  'backlinksextendedbot',
  'claudebot',
  'coccocbot',
  'dotbot',
  'gptbot',
  'mj12bot',
  'petalbot',
  'semrushbot',
  'seznambot',
  'yandexbot',
]

const rulesetsPermissionHint =
  'Use CLOUDFLARE_API_TOKEN with Cloudflare Rulesets permissions such as Dynamic URL Redirects Write/Read or Account Rulesets Write/Read.'

function readWranglerOAuthToken() {
  const configPath = path.join(
    os.homedir(),
    'Library',
    'Preferences',
    '.wrangler',
    'config',
    'default.toml',
  )
  try {
    const text = fs.readFileSync(configPath, 'utf8')
    return text.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1]
  } catch {
    return undefined
  }
}

const token = process.env.CLOUDFLARE_API_TOKEN ?? readWranglerOAuthToken()
if (!token) {
  throw new Error(
    'Set CLOUDFLARE_API_TOKEN or log in with wrangler before running this script.',
  )
}

async function cf(pathname, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok || body.success === false) {
    throw new Error(
      JSON.stringify(
        {
          status: res.status,
          pathname,
          errors: body.errors,
          messages: body.messages,
          hint: rulesetsPermissionHint,
        },
        null,
        2,
      ),
    )
  }
  return body
}

async function getZoneId() {
  if (process.env.CLOUDFLARE_ZONE_ID) return process.env.CLOUDFLARE_ZONE_ID
  const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`)
  const zone = zones.result?.[0]
  if (!zone?.id) throw new Error(`Zone not found: ${zoneName}`)
  return zone.id
}

async function getEntrypointRuleset(zoneId) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/rulesets/phases/http_request_dynamic_redirect/entrypoint`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
  const body = await res.json()
  if (res.status === 404 || body.errors?.some((e) => e.code === 10007)) {
    return undefined
  }
  if (!res.ok || body.success === false) {
    throw new Error(
      JSON.stringify(
        {
          status: res.status,
          errors: body.errors,
          hint: rulesetsPermissionHint,
        },
        null,
        2,
      ),
    )
  }
  return body.result
}

function buildExpression() {
  const botExpression = crawlBotNames
    .map((name) => `lower(http.user_agent) contains "${name}"`)
    .join(' or ')
  const routeExpression = [
    'http.request.uri.path eq "/"',
    'http.request.uri.path in {"/en-US" "/ja-JP"}',
    'http.request.uri.path in {"/search" "/search-spa" "/idsfind" "/idsfind-spa"}',
    'starts_with(http.request.uri.path, "/mojidata/")',
    'starts_with(http.request.uri.path, "/mojidata-spa/")',
    'starts_with(http.request.uri.path, "/en-US/search")',
    'starts_with(http.request.uri.path, "/en-US/idsfind")',
    'starts_with(http.request.uri.path, "/en-US/mojidata/")',
    'starts_with(http.request.uri.path, "/en-US/mojidata-spa/")',
    'starts_with(http.request.uri.path, "/ja-JP/search")',
    'starts_with(http.request.uri.path, "/ja-JP/idsfind")',
    'starts_with(http.request.uri.path, "/ja-JP/mojidata/")',
    'starts_with(http.request.uri.path, "/ja-JP/mojidata-spa/")',
  ].join(' or ')
  return [
    `http.host eq "${sourceHost}"`,
    'http.request.method in {"GET" "HEAD"}',
    `(${botExpression})`,
    `(${routeExpression})`,
    'not starts_with(http.request.uri.path, "/api/")',
    'not starts_with(http.request.uri.path, "/_next/")',
    'not starts_with(http.request.uri.path, "/assets/")',
  ].join(' and ')
}

const rule = {
  ref: ruleRef,
  description: 'Redirect non-major crawl bots to Mojidata crawl SPA',
  expression: buildExpression(),
  action: 'redirect',
  action_parameters: {
    from_value: {
      target_url: {
        expression: `concat("https://${targetHost}", http.request.uri.path)`,
      },
      status_code: 307,
      preserve_query_string: true,
    },
  },
  enabled: true,
}

const zoneId = await getZoneId()
const existing = await getEntrypointRuleset(zoneId)
const nextRules = [
  ...(existing?.rules ?? []).filter((candidate) => candidate.ref !== ruleRef),
  rule,
]
const payload = existing
  ? {
      name: existing.name,
      description: existing.description,
      kind: existing.kind,
      phase: existing.phase,
      rules: nextRules,
    }
  : {
      name: 'default',
      kind: 'zone',
      phase: 'http_request_dynamic_redirect',
      rules: nextRules,
    }

if (dryRun) {
  console.log(JSON.stringify({ zoneId, existingRulesetId: existing?.id, payload }, null, 2))
  console.error(
    'Dry run only. The source hostname must be proxied through Cloudflare for this rule to execute.',
  )
  process.exit(0)
}

const result = existing
  ? await cf(`/zones/${zoneId}/rulesets/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  : await cf(`/zones/${zoneId}/rulesets`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

console.log(
  JSON.stringify(
    {
      rulesetId: result.result?.id,
      ruleRef,
      sourceHost,
      targetHost,
      note: 'The source hostname must be proxied through Cloudflare for this rule to execute.',
    },
    null,
    2,
  ),
)
