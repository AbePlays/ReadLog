import { type ActionFunctionArgs, redirect } from '@remix-run/cloudflare'
import { getUserSessionStorage } from '~/utils/session.server'

export async function loader() {
  return redirect('/')
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { destroySession, getSession } = getUserSessionStorage(context)
  const session = await getSession(request.headers.get('cookie'))

  return redirect('/auth', {
    headers: { 'Set-Cookie': await destroySession(session) }
  })
}
