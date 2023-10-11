import { type ActionFunctionArgs, type MetaFunction, json, redirect } from '@remix-run/cloudflare'
import { Form, useActionData, useLocation, useNavigation, useSearchParams } from '@remix-run/react'

import { signin, signup } from '~/libs/db/userRegistration.server'
import { signinSchema, signupSchema } from '~/schemas/authSchema'

export const meta: MetaFunction = () => {
  return [
    { title: 'Get Started - ReadLog' },
    { name: 'description', content: 'Sign In or Create an account to get started!' }
  ]
}

export async function action({ context, request }: ActionFunctionArgs) {
  const fields = Object.fromEntries(await request.formData())

  if (fields.authType === 'signin') {
    const result = signinSchema.safeParse(fields)
    if (!result.success) {
      return json(
        { fields, errors: { ...result.error.flatten().fieldErrors, fullname: '', confirmPassword: '', form: '' } },
        { status: 400 }
      )
    }

    const data = await signin(result.data, context.env.XATA_API_KEY)
    if (!data) {
      return redirect('/')
    }

    return json(data, { status: 400 })
  }

  if (fields.authType === 'signup') {
    const result = signupSchema.safeParse(fields)
    if (!result.success) {
      return json({ fields, errors: { ...result.error.flatten().fieldErrors, form: '' } }, { status: 400 })
    }

    const data = await signup(result.data, context.env.XATA_API_KEY)
    if (!data) {
      return redirect('/')
    }

    return json(data, { status: 400 })
  }

  return json(
    { fields, errors: { email: '', password: '', fullname: '', confirmPassword: '', form: 'Invalid form submission' } },
    { status: 400 }
  )
}

export default function AuthRoute() {
  const actionData = useActionData<typeof action>()
  const { search } = useLocation()
  const { state } = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const isSignupForm = searchParams.get('authType') === 'signup'

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Get Started with ReadLog</h1>
      <Form action={`/auth${search}`} method="post">
        <fieldset disabled={state === 'submitting'}>
          <input
            defaultChecked={!isSignupForm}
            type="radio"
            name="authType"
            id="signin"
            value="signin"
            onChange={() => {
              searchParams.set('authType', 'signin')
              setSearchParams(searchParams)
            }}
          />
          <label htmlFor="signin">Sign In</label>

          <input
            defaultChecked={isSignupForm}
            type="radio"
            name="authType"
            id="signup"
            value="signup"
            onChange={() => {
              searchParams.set('authType', 'signup')
              setSearchParams(searchParams)
            }}
          />
          <label htmlFor="signup">Sign Up</label>

          <br />

          {isSignupForm ? (
            <>
              <label htmlFor="fullname">Fullname</label>
              <input
                aria-describedby={actionData?.errors.fullname ? 'fullname-error' : undefined}
                aria-invalid={!!actionData?.errors.fullname}
                className="block border"
                id="fullname"
                name="fullname"
                type="text"
              />
              {actionData?.errors.fullname ? (
                <p id="fullname-error" role="alert">
                  {actionData.errors.fullname}
                </p>
              ) : null}
            </>
          ) : null}

          <label htmlFor="email">Email</label>
          <input
            aria-describedby={actionData?.errors.email ? 'email-error' : undefined}
            aria-invalid={!!actionData?.errors.email}
            className="block border"
            id="email"
            name="email"
            type="email"
          />
          {actionData?.errors.email ? (
            <p id="email-error" role="alert">
              {actionData.errors.email}
            </p>
          ) : null}

          <label htmlFor="password">Password</label>
          <input
            aria-describedby={actionData?.errors.password ? 'password-error' : undefined}
            aria-invalid={!!actionData?.errors.password}
            className="block border"
            id="password"
            name="password"
            type="password"
          />
          {actionData?.errors.password ? (
            <p id="password-error" role="alert">
              {actionData.errors.password}
            </p>
          ) : null}

          {isSignupForm ? (
            <>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                aria-describedby={actionData?.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                aria-invalid={!!actionData?.errors.confirmPassword}
                className="block border"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
              />
              {actionData?.errors.confirmPassword ? (
                <p id="confirmPassword-error" role="alert">
                  {actionData.errors.confirmPassword}
                </p>
              ) : null}
            </>
          ) : null}

          {actionData?.errors.form ? <p role="alert">{actionData.errors.form}</p> : null}
          <button disabled={state === 'submitting'} type="submit">
            Submit
          </button>
        </fieldset>
      </Form>
    </div>
  )
}
