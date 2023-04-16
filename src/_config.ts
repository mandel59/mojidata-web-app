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
