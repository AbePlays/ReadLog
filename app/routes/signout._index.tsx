import { type ActionFunctionArgs, redirect } from '@remix-run/cloudflare'
import { redirectWithSuccess } from 'remix-toast'

import { getUserSessionStorage } from '~/utils/session.server'

export async function loader() {
  return redirect('/')
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { destroySession, getSession } = getUserSessionStorage(context)
  const session = await getSession(request.headers.get('cookie'))

  return redirectWithSuccess('/', 'Signed out successfully.', {
    headers: { 'Set-Cookie': await destroySession(session) }
  })
}
