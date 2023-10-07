import { type ActionFunctionArgs, type MetaFunction, json, redirect } from '@remix-run/cloudflare'
import { Form, useActionData, useNavigation } from '@remix-run/react'

import { loginSchema } from '~/schemas/authSchema'

export const meta: MetaFunction = () => {
  return [
    { title: 'Get Started - ReadLog' },
    { name: 'description', content: 'Sign In or Create an account to get started!' }
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const fields = Object.fromEntries(await request.formData())
  const result = loginSchema.safeParse(fields)

  if (result.success) {
    return redirect('/')
  } else {
    return json({ fields, errors: result.error.flatten() }, { status: 400 })
  }
}

export default function AuthRoute() {
  const actionData = useActionData<typeof action>()
  const { state } = useNavigation()

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Get Started with ReadLog</h1>
      <Form action="/auth" method="post">
        <fieldset disabled={state === 'submitting'}>
          <label htmlFor="email">Email</label>
          <input
            aria-describedby={actionData?.errors.fieldErrors.email ? 'email-error' : undefined}
            aria-invalid={!!actionData?.errors.fieldErrors.email}
            className="block border"
            type="email"
            name="email"
            id="email"
          />
          {actionData?.errors.fieldErrors.email ? (
            <p id="email-error" role="alert">
              {actionData.errors.fieldErrors.email}
            </p>
          ) : null}
          <label htmlFor="password">Password</label>
          <input
            aria-describedby={actionData?.errors.fieldErrors.password ? 'password-error' : undefined}
            aria-invalid={!!actionData?.errors.fieldErrors.password}
            className="block border"
            type="password"
            name="password"
            id="password"
          />
          {actionData?.errors.fieldErrors.password ? (
            <p id="password-error" role="alert">
              {actionData.errors.fieldErrors.password}
            </p>
          ) : null}
          <button disabled={state === 'submitting'} type="submit">
            Login
          </button>
        </fieldset>
      </Form>
    </div>
  )
}
