export interface SearchParams {
  query: string
  page?: number
  size?: number
}

const formalOpSuffix: Record<string, string> = {
  '<': 'lt',
  '<=': 'le',
  '=': 'eq',
  '>': 'gt',
  '>=': 'ge',
  '~': 'glob',
}

const standaloneFormalProperties = new Set(['totalStrokes', 'UCS', 'ucs'])

function parseFormalToken(token: string): [string, string] | null {
  const normalized = token.normalize('NFKC')
  const m = normalized.match(
    /^((?<source>[A-Za-z][A-Za-z0-9_-]*)\.)?(?<property>[^<>=~]+?)(?<op><=|>=|=|<|>|~)(?<value>.+)$/u,
  )
  if (!m?.groups) return null

  const source = m.groups.source
  const property = m.groups.property
  const op = m.groups.op
  const value = m.groups.value

  if (!property || !op || !value) return null

  if (!source && !standaloneFormalProperties.has(property)) {
    // Keep backward compatibility: unknown tokens without explicit source
    // should be treated as IDS query terms, not formal p/q keys.
    return null
  }

  const baseKey = source ? `${source}.${property}` : property
  const suffix = formalOpSuffix[op]
  if (!suffix) return null

  if (suffix === 'eq') {
    return [baseKey, value]
  }
  return [`${baseKey}.${suffix}`, value]
}

function parseQueryInternal(query: string, useFormalSyntax: boolean) {
  const ps: string[] = []
  const qs: string[] = []
  const ids: string[] = []
  const whole: string[] = []
  function putPQ(p: string, q: string) {
    ps.push(p)
    qs.push(q)
  }
  for (const p of query.match(/\S+/gu) ?? []) {
    if (useFormalSyntax) {
      const formal = parseFormalToken(p)
      if (formal) {
        putPQ(formal[0], formal[1])
        continue
      }
    }

    if (p.startsWith('U+')) {
      putPQ('UCS', p.slice(2))
      continue
    }
    if (p.startsWith('MJ')) {
      putPQ('mji.MJ文字図形名', p)
      continue
    }
    if (p[0] === '=' || p[0] === '＝') {
      putPQ('totalStrokes', p.normalize('NFKC').slice(1))
      continue
    }
    if (p.slice(0, 2).normalize('NFKC') === '<=') {
      putPQ('totalStrokes.le', p.normalize('NFKC').slice(2))
      continue
    }
    if (p[0] === '<' || p[0] === '＜') {
      putPQ('totalStrokes.lt', p.normalize('NFKC').slice(1))
      continue
    }
    if (p.slice(0, 2).normalize('NFKC') === '>=') {
      putPQ('totalStrokes.ge', p.normalize('NFKC').slice(2))
      continue
    }
    if (p[0] === '>' || p[0] === '＞') {
      putPQ('totalStrokes.gt', p.normalize('NFKC').slice(1))
      continue
    }
    if (p.normalize('NFKC').match(/^\d{1,2}$/u)) {
      putPQ('totalStrokes', p.normalize('NFKC'))
      continue
    }
    if (p.match(/^[\p{sc=Kana}\p{sc=Hira}ー]+$/u)) {
      putPQ('mji.読み', p)
      continue
    }
    if (p.match(/^[\p{sc=Kana}\p{sc=Hira}ー]+[*＊]$/u)) {
      putPQ('mji.読み.prefix', p.substring(0, p.length - 1))
      continue
    }
    if (p.match(/^[:：][^\x00-\xFF].*$/u)) {
      putPQ('UCS', p.codePointAt(1)!.toString(16))
      continue
    }
    if (p.match(/^(char|ｃｈａｒ)[:：][^\x00-\xFF].*$/iu)) {
      putPQ('UCS', p.codePointAt(5)!.toString(16))
      continue
    }
    if (p.match(/^[@＠].+$/u)) {
      whole.push(p.slice(1))
      continue
    }
    if (p.match(/^(whole|ｗｈｏｌｅ)[:：=＝].+$/iu)) {
      whole.push(p.slice(6))
      continue
    }
    if (p.match(/^(ids|ｉｄｓ)[:：=＝].+$/iu)) {
      ids.push(p.slice(4))
      continue
    }
    if (p) {
      ids.push(p)
    }
  }
  return { ps, qs, ids, whole }
}

export function parseQuery(query: string) {
  return parseQueryInternal(query, true)
}

export function parseQueryLegacy(query: string) {
  return parseQueryInternal(query, false)
}
