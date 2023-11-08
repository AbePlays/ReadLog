import { z } from 'zod'

import { AppEnvSchema } from '~/schemas/appEnvSchema'

type Env = z.infer<typeof AppEnvSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      CI: boolean
    }
  }
}
