import type { AppLoadContext } from '@remix-run/cloudflare'

import { XataClient } from './xata.server'

let instance: XataClient | undefined = undefined

export function getDbClient(context: AppLoadContext) {
  if (instance) return instance

  instance = new XataClient({ apiKey: context.env.XATA_API_KEY, databaseURL: context.env.DB_URL })
  return instance
}
