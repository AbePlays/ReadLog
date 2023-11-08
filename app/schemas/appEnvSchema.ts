import { z } from 'zod'

export const AppEnvSchema = z.object({
  CI_DB_URL: z.string(),
  CI: z.enum(['true', 'false']),
  DB_URL: z.string(),
  GOOGLE_BOOKS_API_KEY: z.string(),
  SESSION_SECRET: z.string(),
  XATA_API_KEY: z.string()
})
