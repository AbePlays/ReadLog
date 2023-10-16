import { createCookieSessionStorage } from '@remix-run/cloudflare'
import { z } from 'zod'

export function getUserSessionStorage(secret: string) {
  return createCookieSessionStorage({
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      name: 'READLOG_SESSION',
      path: '/',
      sameSite: 'lax',
      secrets: [secret],
      secure: true
    }
  })
}

export async function getUserId(request: Request, secret: string) {
  const { getSession } = getUserSessionStorage(secret)

  const session = await getSession(request.headers.get('cookie'))
  return z.string().optional().parse(session.get('userId'))
}
