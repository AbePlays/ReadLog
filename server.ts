import { logDevReady } from '@remix-run/cloudflare'
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages'
import * as build from '@remix-run/dev/server-build'
import { z } from 'zod'

export const AppEnvSchema = z.object({
  CI: z.string().optional(),
  DB_URL: z.string(),
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
    console.log({ ...context.env })
    if (context.env.CI) {
      return { env: { ...context.env, DB_URL: context.env.CI_DB_URL } }
    }
    const env = AppEnvSchema.parse(context.env)
    return { env }
  },
  mode: build.mode
})
