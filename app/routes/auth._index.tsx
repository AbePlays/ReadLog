import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData, useLocation, useNavigation, useSearchParams } from '@remix-run/react'

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
  const [searchParams] = useSearchParams()

  const isSignupForm = searchParams.get('authType') === 'signup'

  return (
    <div className="max-w-screen-sm mx-auto">
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
        <>
          <div className="text-center text-gray-900">
            <h1 className="font-medium text-2xl">Welcome to ReadLog</h1>
            <span className="text-gray-600">Please enter your details.</span>
          </div>
          <Form
            action={`/auth${search}`}
            aria-label={`${isSignupForm ? 'sign up' : 'sign in'} form`}
            key={String(isSignupForm)}
            method="post"
          >
            <fieldset className="grid gap-4 mt-4" disabled={state === 'submitting'}>
              <input type="hidden" name="authType" value={isSignupForm ? 'signup' : 'signin'} />

              {isSignupForm ? (
                <div className="space-y-2">
                  <label className="font-medium" htmlFor="fullname">
                    Full Name
                  </label>
                  <TextField.Root>
                    <TextField.Input
                      aria-describedby={actionData?.errors.fullname ? 'fullname-error' : undefined}
                      aria-invalid={!!actionData?.errors.fullname}
                      id="fullname"
                      name="fullname"
                    />
                  </TextField.Root>
                  {actionData?.errors.fullname ? (
                    <p className="text-red-500" id="fullname-error" role="alert">
                      {actionData.errors.fullname}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="font-medium" htmlFor="email">
                  Email
                </label>
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
                  <p className="text-red-500" id="email-error" role="alert">
                    {actionData.errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="font-medium" htmlFor="password">
                  Password
                </label>
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
                  <p className="text-red-500" id="password-error" role="alert">
                    {actionData.errors.password}
                  </p>
                ) : null}
              </div>

              {isSignupForm ? (
                <div className="space-y-2">
                  <label className="font-medium" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
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
                    <p className="text-red-500" id="confirmPassword-error" role="alert">
                      {actionData.errors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {actionData?.errors.form ? (
                <p className="text-red-500" role="alert">
                  {actionData.errors.form}
                </p>
              ) : null}

              <Button disabled={state === 'submitting'} type="submit" variant="solid">
                Submit
              </Button>
            </fieldset>
          </Form>
          <p className="mt-4 text-center">
            {isSignupForm ? (
              <>
                Already have an account?
                <Link className="font-medium ml-1 underline" to="?authType=signin">
                  Sign In
                </Link>
              </>
            ) : (
              <>
                Don't have an account yet?
                <Link className="font-medium ml-1 underline" to="?authType=signup">
                  Sign Up
                </Link>
              </>
            )}
          </p>
        </>
      )}
    </div>
  )
}
