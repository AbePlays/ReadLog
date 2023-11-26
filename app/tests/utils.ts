import { faker } from '@faker-js/faker'
import { test as base } from '@playwright/test'
import bcrypt from 'bcryptjs'
import { parse } from 'cookie'
import { readFile } from 'fs/promises'
import type { z } from 'zod'

import { getDbClient } from '~/libs/db/index.server'
import type { UsersRecord } from '~/libs/db/xata.server'
import { AppEnvSchema } from '~/schemas/app-env'
import { getUserSessionStorage } from '~/utils/session.server'

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

export async function insertNewUser(context: { env: z.infer<typeof AppEnvSchema> }) {
  const xata = getDbClient(context)

  const fullname = faker.person.fullName()
  const email = faker.internet.email({ firstName: fullname.split(' ')[0], lastName: fullname.split(' ')[1] })
  const password = faker.internet.password()

  const user = await xata.db.users.create({ email, fullname, password_hash: await bcrypt.hash(password, 10) })
  return user
}

export async function insertBook(context: { env: z.infer<typeof AppEnvSchema> }, userId: string) {
  const xata = getDbClient(context)

  await xata.db.user_books.create({
    book_id: faker.string.uuid(),
    image_url: faker.image.url(),
    name: faker.commerce.productName(),
    reading_history: [
      {
        id: faker.string.uuid(),
        page_end: faker.number.int(),
        page_start: 0,
        end_time: faker.date.soon({ days: 1 }),
        start_time: new Date()
      }
    ],
    read_status: 'reading',
    user_id: userId
  })
}

export const test = base.extend<{ addBook: (userId: string) => Promise<void>; login: () => Promise<UsersRecord> }>({
  addBook: async ({ page }, use) => {
    return use(async (userId) => {
      const context = await getContext()
      await insertBook(context, userId)
    })
  },
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

      return user
    })
  }
})

// Cleanup after each test
test.afterEach(async () => {
  const context = await getContext()
  const xata = getDbClient(context)
  const users = await xata.db.users.getAll()

  for (const user of users) {
    const records = await xata.db.user_books.filter({ user_id: user.id }).getAll()
    for (const record of records) {
      await xata.db.user_books.delete(record.id)
    }
  }

  await xata.db.users.delete(users.map((user) => user.id))
})

export const { expect } = test
