export interface SearchParams {
  query: string
  page?: number
  size?: number
}

export function parseQuery(query: string) {
  const ps: string[] = []
  const qs: string[] = []
  const ids: string[] = []
  const whole: string[] = []
  function putPQ(p: string, q: string) {
    ps.push(p)
    qs.push(q)
  }
  for (const p of query.match(/\S+/gu) ?? []) {
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
    if (p.match(/^[:：][\u0100-\u{1FFFF}].*$/u)) {
      putPQ('UCS', p.codePointAt(1)!.toString(16))
      continue
    }
    if (p.match(/^[@＠].+$/u)) {
      whole.push(p.slice(1))
      continue
    }
    if (p.match(/^(whole|ｗｈｏｌｅ)[=＝].+$/iu)) {
      whole.push(p.slice(6))
      continue
    }
    if (p.match(/^(ids|ｉｄｓ)[=＝].+$/iu)) {
      ids.push(p.slice(4))
      continue
    }
    if (p) {
      ids.push(p)
    }
  }
  return { ps, qs, ids, whole }
}
