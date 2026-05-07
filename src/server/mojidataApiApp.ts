import 'server-only'

import { createRequire } from 'node:module'

import { getApiBaseUrl, getApiHeaders } from '@/app/config'

type MojidataApiApp = {
  fetch(request: Request): Promise<Response>
}

let localApp: MojidataApiApp | undefined

function getLocalApp() {
  if (!localApp) {
    const nodeRequire = createRequire(import.meta.url)
    const { createNodeApp } = nodeRequire('@mandel59/mojidata-api/node') as {
      createNodeApp: () => MojidataApiApp
    }
    localApp = createNodeApp()
  }
  return localApp
}

function getRemoteApiRequest(request: Request) {
  const sourceUrl = new URL(request.url)
  const remoteUrl = new URL(
    `${sourceUrl.pathname}${sourceUrl.search}`,
    getApiBaseUrl(),
  )
  const headers = new Headers(request.headers)
  for (const [key, value] of Object.entries(getApiHeaders())) {
    headers.set(key, value)
  }

  return new Request(remoteUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  })
}

export const mojidataApiApp: MojidataApiApp = {
  fetch(request) {
    if (process.env.MOJIDATA_API_BASE_URL?.trim()) {
      return fetch(getRemoteApiRequest(request))
    }
    const response = getLocalApp().fetch(request)
    return Promise.resolve(response)
  },
}
