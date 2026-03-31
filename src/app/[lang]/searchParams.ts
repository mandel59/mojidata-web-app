export function castToArray<T>(x: undefined | T | T[]): T[] {
  const values = Array.isArray(x) ? x : x != null ? [x] : []
  return values.filter(
    (value) => !(typeof value === 'string' && value.length === 0),
  )
}

export function castToString<T>(
  x: undefined | T | T[],
  joiner: string = ' ',
): string {
  return Array.isArray(x) ? x.join(joiner) : x != null ? String(x) : ''
}

export function castToBooleanFlag<T>(
  x: undefined | T | T[],
  truthyValue: string = '1',
): boolean {
  return castToArray(x).some((value) => String(value) === truthyValue)
}

export function castToEnumValue<T extends string>(
  x: undefined | T | T[],
  allowed: readonly T[],
): T | undefined {
  const values = castToArray(x).map((value) => String(value))
  return values.find((value): value is T =>
    allowed.some((allowedValue) => allowedValue === value),
  )
}

export function appendArraySearchParams(
  url: URL,
  key: string,
  values: string[],
) {
  values.forEach((v) => url.searchParams.append(key, v))
}
