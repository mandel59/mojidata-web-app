export function getApiBaseUrl() {
  const envBaseUrl = process.env.MOJIDATA_API_BASE_URL?.trim()
  if (envBaseUrl) {
    return envBaseUrl.endsWith('/') ? envBaseUrl : `${envBaseUrl}/`
  }
  const env = process.env.NODE_ENV
  if (env === 'production') {
    return 'https://mojidata-api.vercel.app/'
  } else {
    return 'http://localhost:3001/'
  }
}

export function getApiHeaders(): Record<string, string> {
  const bypass = process.env.X_VERCEL_PROTECTION_BYPASS?.trim()
  if (bypass) {
    return { 'x-vercel-protection-bypass': bypass }
  }
  return {}
}

export function getApiUrl(path: string) {
  return new URL(path, getApiBaseUrl()).href
}

export function getRevalidateDuration() {
  const env = process.env.NODE_ENV
  if (env === 'production') {
    return 24 * 60 * 60
  } else {
    return 10 * 60
  }
}
