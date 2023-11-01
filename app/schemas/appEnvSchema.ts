import { z } from 'zod'

export const AppEnvSchema = z.object({
  DB_URL: z.string(),
  GOOGLE_BOOKS_API_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'production']),
  SESSION_SECRET: z.string(),
  XATA_API_KEY: z.string()
})
