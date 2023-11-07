import { faker } from '@faker-js/faker'
import { test as base } from '@playwright/test'
import bcrypt from 'bcryptjs'
import { parse } from 'cookie'
import { readFile } from 'fs/promises'
import type { z } from 'zod'

import { getDbClient } from '~/libs/db/index.server'
import type { UsersRecord } from '~/libs/db/xata.server'
import { AppEnvSchema } from '~/schemas/appEnvSchema'
import { getUserSessionStorage } from '~/utils/session.server'

const fullname = faker.person.fullName()
const email = faker.internet.email({ firstName: fullname.split(' ')[0], lastName: fullname.split(' ')[1] })
const password = faker.internet.password()

function parseDevVars(content: string) {
  const lines = content.split('\n')
  const result: Record<string, string> = {}

  for (const line of lines) {
    const parts = line.split('=')
    if (parts.length === 2) {
      const key = parts[0].trim()
      const value = parts[1].trim()
      result[key] = value
    }
  }

  return result
}

async function getContext() {
  const filePath = '.dev.vars'
  let data = ''

  try {
    data = await readFile(filePath, 'utf8')
  } catch (error) {
    console.error(`Error reading file: ${error}`)
  }

  const parsedData = parseDevVars(data)
  const env = AppEnvSchema.parse(parsedData)
  return { env }
}

const users = new Set<UsersRecord>()

export async function insertNewUser(context: { env: z.infer<typeof AppEnvSchema> }) {
  const xata = getDbClient(context)

  const user = await xata.db.users.create({ email, fullname, password_hash: await bcrypt.hash(password, 10) })
  users.add(user)
  return user
}

export const test = base.extend<{ login: () => Promise<void> }>({
  login: async ({ baseURL, page }, use) => {
    return use(async () => {
      const context = await getContext()
      const { commitSession, getSession } = getUserSessionStorage(context)

      const user = await insertNewUser(context)
      const session = await getSession()
      session.set('userId', user.id)
      const cookieValue = await commitSession(session)

      const { READLOG_SESSION } = parse(cookieValue)

      await page.context().addCookies([
        {
          httpOnly: true,
          name: 'READLOG_SESSION',
          sameSite: 'Lax',
          secure: context.env.CI === 'false',
          url: baseURL,
          value: READLOG_SESSION
        }
      ])
    })
  }
})

test.afterEach(async () => {
  const context = await getContext()
  const xata = getDbClient(context)
  for (const user of users) {
    const records = await xata.db.user_books.filter({ user_id: user.id }).getAll()
    for (const record of records) {
      await xata.db.user_books.delete(record.id)
    }
  }
  await xata.db.users.delete([...users].map((user) => user.id))
})

export const { expect } = test
