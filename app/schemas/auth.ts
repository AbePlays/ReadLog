import { z } from 'zod'

export const signinSchema = z.object({
  authType: z.enum(['signin', 'signup']),
  email: z.string().email(),
  password: z.string().min(6, 'Password must contain at least 6 characters')
})

export const signupSchema = signinSchema
  .extend({
    fullname: z.string().min(2, 'Fullname must contain at least 2 characters'),
    confirmPassword: z.string().min(6, 'Password must contain at least 6 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })
