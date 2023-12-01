import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData, useLocation, useNavigation, useSearchParams } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { TextField } from '~/components/ui/text-field'
import { signin, signup } from '~/libs/db/user.server'
import { signinSchema, signupSchema } from '~/schemas/auth'
import { getUserId, getUserSessionStorage } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Get Started - ReadLog' },
    { name: 'description', content: 'Sign In or Create an account to get started!' }
  ]
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await getUserId(request, context)
  return { userId }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const fields = Object.fromEntries(await request.formData())

  const { commitSession, getSession } = getUserSessionStorage(context)
  const session = await getSession()

  if (fields.authType === 'signin') {
    const result = signinSchema.safeParse(fields)
    if (!result.success) {
      return json(
        { fields, errors: { ...result.error.flatten().fieldErrors, fullname: '', confirmPassword: '', form: '' } },
        { status: 400 }
      )
    }

    const data = await signin(result.data, context)
    if (data.error) {
      return json(data, { status: 400 })
    }

    session.set('userId', data.user.id)
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  }

  if (fields.authType === 'signup') {
    const result = signupSchema.safeParse(fields)
    if (!result.success) {
      return json({ fields, errors: { ...result.error.flatten().fieldErrors, form: '' } }, { status: 400 })
    }

    const data = await signup(result.data, context)

    if (data.error) {
      return json(data, { status: 400 })
    }

    session.set('userId', data.user.id)
    return redirect('/', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    })
  }

  return json(
    { fields, errors: { email: '', password: '', fullname: '', confirmPassword: '', form: 'Invalid form submission' } },
    { status: 400 }
  )
}

export default function AuthRoute() {
  const actionData = useActionData<typeof action>()
  const loaderData = useLoaderData<typeof loader>()
  const { search } = useLocation()
  const { state } = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const isSignupForm = searchParams.get('authType') === 'signup'

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Get Started with ReadLog</h1>
      {loaderData.userId ? (
        <div>
          <span>You're logged in</span>
          <Form action="/signout" aria-label="sign out form" method="post">
            <Button type="submit" variant="solid">
              Logout
            </Button>
          </Form>
        </div>
      ) : (
        <Form action={`/auth${search}`} aria-label={`${isSignupForm ? 'sign up' : 'sign in'} form`} method="post">
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
                <TextField.Root>
                  <TextField.Input
                    aria-describedby={actionData?.errors.fullname ? 'fullname-error' : undefined}
                    aria-invalid={!!actionData?.errors.fullname}
                    id="fullname"
                    name="fullname"
                  />
                </TextField.Root>
                {actionData?.errors.fullname ? (
                  <p id="fullname-error" role="alert">
                    {actionData.errors.fullname}
                  </p>
                ) : null}
              </>
            ) : null}

            <label htmlFor="email">Email</label>
            <TextField.Root>
              <TextField.Input
                aria-describedby={actionData?.errors.email ? 'email-error' : undefined}
                aria-invalid={!!actionData?.errors.email}
                id="email"
                name="email"
                type="email"
              />
            </TextField.Root>
            {actionData?.errors.email ? (
              <p id="email-error" role="alert">
                {actionData.errors.email}
              </p>
            ) : null}

            <label htmlFor="password">Password</label>
            <TextField.Root>
              <TextField.Input
                aria-describedby={actionData?.errors.password ? 'password-error' : undefined}
                aria-invalid={!!actionData?.errors.password}
                id="password"
                name="password"
                type="password"
              />
            </TextField.Root>
            {actionData?.errors.password ? (
              <p id="password-error" role="alert">
                {actionData.errors.password}
              </p>
            ) : null}

            {isSignupForm ? (
              <>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <TextField.Root>
                  <TextField.Input
                    aria-describedby={actionData?.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                    aria-invalid={!!actionData?.errors.confirmPassword}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                  />
                </TextField.Root>
                {actionData?.errors.confirmPassword ? (
                  <p id="confirmPassword-error" role="alert">
                    {actionData.errors.confirmPassword}
                  </p>
                ) : null}
              </>
            ) : null}

            {actionData?.errors.form ? <p role="alert">{actionData.errors.form}</p> : null}
            <Button disabled={state === 'submitting'} type="submit" variant="solid">
              Submit
            </Button>
          </fieldset>
        </Form>
      )}
    </div>
  )
}
