import { type AppLoadContext, createCookieSessionStorage } from '@remix-run/cloudflare'
import { z } from 'zod'

export function getUserSessionStorage(context: AppLoadContext) {
  return createCookieSessionStorage({
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      name: 'READLOG_SESSION',
      path: '/',
      sameSite: 'lax',
      secrets: [context.env.SESSION_SECRET],
      secure: context.env.CI === 'false'
    }
  })
}

export async function getUserId(request: Request, context: AppLoadContext) {
  const { getSession } = getUserSessionStorage(context)

  const session = await getSession(request.headers.get('cookie'))
  return z.string().optional().parse(session.get('userId'))
}
