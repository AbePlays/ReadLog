import type { AppLoadContext } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { getDbClient } from './index.server'

export async function signin(fields: { email: string; password: string }, context: AppLoadContext) {
  const xata = getDbClient(context)

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

export async function signup(fields: { email: string; fullname: string; password: string }, context: AppLoadContext) {
  const xata = getDbClient(context)

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
