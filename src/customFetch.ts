import { userAgent } from './settings'

export function customFetch(input: string | URL | Request, init?: RequestInit) {
  const request = new Request(input, init)
  request.headers.set('User-Agent', userAgent)
  return fetch(request)
}
