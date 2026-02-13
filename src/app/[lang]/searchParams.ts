export function castToArray<T>(x: undefined | T | T[]): T[] {
  return Array.isArray(x) ? x : x != null ? [x] : []
}

export function castToString<T>(
  x: undefined | T | T[],
  joiner: string = ' ',
): string {
  return Array.isArray(x) ? x.join(joiner) : x != null ? String(x) : ''
}

export function appendArraySearchParams(
  url: URL,
  key: string,
  values: string[],
) {
  values.forEach((v) => url.searchParams.append(key, v))
}
