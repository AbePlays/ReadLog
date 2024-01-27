import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
  redirect
} from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData, useLocation, useNavigation, useSearchParams } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Link } from '~/components/ui/link'
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

export async function loader({ context, request }: LoaderFunctionArgs): AsyncResult<string | undefined> {
  const userId = await getUserId(request, context)
  return json({ ok: true, data: userId })
}

type ActionResponse = {
  fields: { [k: string]: FormDataEntryValue }
  errors: {
    confirmPassword: string
    email: string
    form: string
    fullname: string
    password: string
  }
}

export async function action({ context, request }: ActionFunctionArgs): AsyncResult<ActionResponse> {
  const fields = Object.fromEntries(await request.formData())

  const { commitSession, getSession } = getUserSessionStorage(context)
  const session = await getSession()

  if (fields.authType === 'signin') {
    const result = signinSchema.safeParse(fields)
    if (!result.success) {
      const errors = result.error.format()
      return json(
        {
          ok: true,
          data: {
            fields,
            errors: {
              confirmPassword: '',
              form: '',
              fullname: '',
              email: errors.email?._errors[0] ?? '',
              password: errors.password?._errors[0] ?? ''
            }
          }
        },
        { status: 400 }
      )
    }

    const data = await signin(result.data, context)
    if (data.error) {
      return json({ ok: true, data }, { status: 400 })
    }

    session.set('userId', data.user.id)
    return redirect('/', { headers: { 'Set-Cookie': await commitSession(session) } })
  }

  if (fields.authType === 'signup') {
    const result = signupSchema.safeParse(fields)
    if (!result.success) {
      const errors = result.error.format()
      return json(
        {
          ok: true,
          data: {
            fields,
            errors: {
              confirmPassword: errors.confirmPassword?._errors[0] ?? '',
              email: errors.email?._errors[0] ?? '',
              form: '',
              fullname: errors.fullname?._errors[0] ?? '',
              password: errors.password?._errors[0] ?? ''
            }
          }
        },
        { status: 400 }
      )
    }

    const data = await signup(result.data, context)
    if (data.error) {
      return json({ ok: true, data }, { status: 400 })
    }

    session.set('userId', data.user.id)
    return redirect('/', { headers: { 'Set-Cookie': await commitSession(session) } })
  }

  return json(
    {
      ok: true,
      data: {
        fields,
        errors: {
          confirmPassword: '',
          email: '',
          form: 'Invalid form submission',
          fullname: '',
          password: ''
        }
      }
    },
    { status: 400 }
  )
}

export default function AuthRoute() {
  const actionData = useActionData<typeof action>()
  const { data: userId } = useLoaderData<typeof loader>()
  const { search } = useLocation()
  const { state } = useNavigation()
  const [searchParams] = useSearchParams()

  const isSignupForm = searchParams.get('authType') === 'signup'

  return (
    <div className="max-w-screen-sm mx-auto">
      {userId ? (
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
                      aria-describedby={actionData?.data.errors.fullname ? 'fullname-error' : undefined}
                      aria-invalid={!!actionData?.data.errors.fullname}
                      id="fullname"
                      name="fullname"
                    />
                  </TextField.Root>
                  {actionData?.data.errors.fullname ? (
                    <p className="text-red-500" id="fullname-error" role="alert">
                      {actionData.data.errors.fullname}
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
                    aria-describedby={actionData?.data.errors.email ? 'email-error' : undefined}
                    aria-invalid={!!actionData?.data.errors.email}
                    id="email"
                    name="email"
                    type="email"
                  />
                </TextField.Root>
                {actionData?.data.errors.email ? (
                  <p className="text-red-500" id="email-error" role="alert">
                    {actionData.data.errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="font-medium" htmlFor="password">
                  Password
                </label>
                <TextField.Root>
                  <TextField.Input
                    aria-describedby={actionData?.data.errors.password ? 'password-error' : undefined}
                    aria-invalid={!!actionData?.data.errors.password}
                    id="password"
                    name="password"
                    type="password"
                  />
                </TextField.Root>
                {actionData?.data.errors.password ? (
                  <p className="text-red-500" id="password-error" role="alert">
                    {actionData.data.errors.password}
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
                      aria-describedby={actionData?.data.errors.confirmPassword ? 'confirmPassword-error' : undefined}
                      aria-invalid={!!actionData?.data.errors.confirmPassword}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                    />
                  </TextField.Root>
                  {actionData?.data.errors.confirmPassword ? (
                    <p className="text-red-500" id="confirmPassword-error" role="alert">
                      {actionData.data.errors.confirmPassword}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {actionData?.data.errors.form ? (
                <p className="text-red-500" role="alert">
                  {actionData.data.errors.form}
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
