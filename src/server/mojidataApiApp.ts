import 'server-only'

type MojidataApiApp = {
  fetch(request: Request): Promise<Response>
}

const { createNodeApp } = require('@mandel59/mojidata-api/node.js') as {
  createNodeApp: () => MojidataApiApp
}

export const mojidataApiApp = createNodeApp()
