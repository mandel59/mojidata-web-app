export function getApiBaseUrl() {
  const env = process.env.NODE_ENV
  if (env === 'production') {
    return 'https://mojidata-api.vercel.app/'
  } else {
    return 'http://localhost:3001/'
  }
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
