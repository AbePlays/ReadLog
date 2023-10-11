import bcrypt from 'bcryptjs'
import { z } from 'zod'

import { getXataClient } from './xata'

export async function signin(fields: { email: string; password: string }, key: string) {
  const xata = getXataClient(key)

  try {
    const user = await xata.db.users.filter({ email: fields.email }).getFirst()
    if (!user) {
      return {
        fields,
        errors: {
          email: '',
          password: '',
          fullname: '',
          confirmPassword: '',
          form: 'Email/Password combination is incorrect'
        }
      }
    }

    const isCorrectPassword = await bcrypt.compare(fields.password, z.string().parse(user.password_hash))
    if (!isCorrectPassword) {
      return {
        fields,
        errors: {
          email: '',
          password: '',
          fullname: '',
          confirmPassword: '',
          form: 'Email/Password combination is incorrect'
        }
      }
    }

    // return createUserSession(user.id, '/')
  } catch (e) {
    let errMsg = 'Something went wrong.'
    if (e instanceof Error) {
      errMsg = e.message
    }

    return { fields, errors: { email: '', password: '', fullname: '', confirmPassword: '', form: errMsg } }
  }
}

export async function signup(fields: { email: string; fullname: string; password: string }, key: string) {
  const xata = getXataClient(key)

  try {
    const pw_hash = await bcrypt.hash(fields.password, 10)
    await xata.db.users.create({ email: fields.email, fullname: fields.fullname, password_hash: pw_hash })

    // return createUserSession(user.id, '/')
  } catch (e) {
    let errMsg = 'Something went wrong.'
    if (e instanceof Error) {
      errMsg = e.message
    }

    return { fields, errors: { email: '', password: '', fullname: '', confirmPassword: '', form: errMsg } }
  }
}
