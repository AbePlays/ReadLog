import { logDevReady } from '@remix-run/cloudflare'
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'
import { z } from 'zod'

export const AppEnvSchema = z.object({
  CI: z.string().optional(),
  GOOGLE_BOOKS_API_KEY: z.string(),
  SESSION_SECRET: z.string(),
  XATA_API_KEY: z.string()
})

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    env: z.output<typeof AppEnvSchema>
  }
}

if (process.env.NODE_ENV === 'development') {
  logDevReady(build)
}

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => {
    if (context.env.CI) {
      return { env: { GOOGLE_BOOKS_API_KEY: 'dummy', SESSION_SECRET: 'dummy', XATA_API_KEY: 'dummy' } }
    }
    const env = AppEnvSchema.parse(context.env)
    return { env }
  },
  mode: build.mode
})
