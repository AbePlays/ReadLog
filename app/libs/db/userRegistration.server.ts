import { createCookieSessionStorage } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { getXataClient } from './xata'

export async function signin(fields: { email: string; password: string }, key: string) {
  const xata = getXataClient(key)

  try {
    const user = await xata.db.users.filter({ email: fields.email }).getFirst()
    if (!user) {
      return {
        error: true,
        fields,
        errors: {
          email: '',
          password: '',
          fullname: '',
          confirmPassword: '',
          form: 'Email/Password combination is incorrect'
        }
      } as const
    }

    const isCorrectPassword = await bcrypt.compare(fields.password, z.string().parse(user.password_hash))
    if (!isCorrectPassword) {
      return {
        error: true,
        fields,
        errors: {
          email: '',
          password: '',
          fullname: '',
          confirmPassword: '',
          form: 'Email/Password combination is incorrect'
        }
      } as const
    }

    return { error: false, user } as const
  } catch (e) {
    let errMsg = 'Something went wrong.'
    if (e instanceof Error) {
      errMsg = e.message
    }

    return {
      error: true,
      fields,
      errors: { email: '', password: '', fullname: '', confirmPassword: '', form: errMsg }
    } as const
  }
}

export async function signup(fields: { email: string; fullname: string; password: string }, key: string) {
  const xata = getXataClient(key)

  try {
    const pw_hash = await bcrypt.hash(fields.password, 10)
    const user = await xata.db.users.create({ email: fields.email, fullname: fields.fullname, password_hash: pw_hash })
    return { error: false, user } as const
  } catch (e) {
    let errMsg = 'Something went wrong.'
    if (e instanceof Error) {
      errMsg = e.message
    }

    return {
      error: true,
      fields,
      errors: { email: '', password: '', fullname: '', confirmPassword: '', form: errMsg }
    } as const
  }
}

export async function getUserId(request: Request, secret: string) {
  const { getSession } = createCookieSessionStorage({
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

  const session = await getSession(request.headers.get('cookie'))
  return z.string().optional().parse(session.get('userId'))
}
