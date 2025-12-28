const botNames = [
  'ahrefsbot',
  'amazonbot',
  'applebot',
  'backlinksextendedbot',
  'baiduspider',
  'bingbot',
  'bytespider',
  'claudebot',
  'coccocbot',
  'dotbot',
  'duckduckbot',
  'googlebot',
  'google-inspectiontool',
  'gptbot',
  'mj12bot',
  'oai-searchbot',
  'petalbot',
  'semrushbot',
  'seznambot',
  'twitterbot',
  'yandexbot',
  'yisouspider',
] as const

const botKeywords = [
  'bot',
  'spider',
  'crawler',
  'crawl',
  'slurp',
  'archiver',
] as const

const botPattern = new RegExp(
  `${botNames.join('|')}|(?:${botKeywords.join('|')})\\b`,
  'i',
)

export function isLikelyBotUserAgent(ua: string) {
  return botPattern.test(ua)
}

export function botFamily(ua: string) {
  const s = ua.toLocaleLowerCase()
  for (const name of botNames) {
    if (s.includes(name)) return name
  }
  return 'unknown'
}
