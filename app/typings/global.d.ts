import type { TypedResponse } from '@remix-run/cloudflare'
import type { z } from 'zod'

import type { AppEnvSchema } from '~/schemas/app-env'

type Env = z.infer<typeof AppEnvSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {
      CI: boolean
    }
  }

  type AsyncResult<SuccessResponse, ErrorResponse = null> = Promise<
    TypedResponse<
      ErrorResponse extends null
        ? { ok: true; data: SuccessResponse }
        : { ok: true; data: SuccessResponse } | { ok: false; error: ErrorResponse }
    >
  >
}
