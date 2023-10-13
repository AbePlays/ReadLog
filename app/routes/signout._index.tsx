import { type ActionFunctionArgs, createCookieSessionStorage, redirect } from '@remix-run/cloudflare'

export async function loader() {
  return redirect('/')
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { getSession, destroySession } = createCookieSessionStorage({
    cookie: {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      name: 'READLOG_SESSION',
      path: '/',
      sameSite: 'lax',
      secrets: [context.env.SESSION_SECRET],
      secure: true
    }
  })

  const session = await getSession(request.headers.get('cookie'))
  return redirect('/auth', {
    headers: { 'Set-Cookie': await destroySession(session) }
  })
}
