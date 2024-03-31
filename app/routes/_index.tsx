import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { json, useLoaderData } from '@remix-run/react'
import { jsonWithError } from 'remix-toast'

import { getDbClient } from '~/libs/db/index.server'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Home - ReadLog' }, { name: 'description', content: 'Welcome to ReadLog!' }]
}

export async function loader({ context, request }: LoaderFunctionArgs): AsyncResult<string, string> {
  const userId = await getUserId(request, context)

  if (userId) {
    const xata = getDbClient(context)
    const user = await xata.db.users.filter({ id: userId }).getFirst()
    if (!user) {
      return jsonWithError(
        { ok: false, error: 'User not found' },
        "We couldn't verify your identity. Please log in to continue.",
        { status: 401 }
      )
    }
    return json({ ok: true, data: user.fullname ?? 'Guest' })
  }

  return json({ ok: true, data: 'Guest' })
}

export default function IndexRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="text-3xl font-semibold">Hey, {loaderData.ok ? loaderData.data : 'Guest'}</h1>
      <span className="text-gray-500">
        {new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(
          new Date()
        )}
      </span>

      <dl className="mt-6 border rounded-lg flex divide-x pt-4 pb-8">
        <div className="pl-8 pr-16">
          <dt className="text-gray-500 text-sm">Pages read</dt>
          <dd className="block text-3xl">111</dd>
        </div>
        <div className="pl-8 pr-16">
          <dt className="text-gray-500 text-sm">Longest streak</dt>
          <dd className="block text-3xl">6</dd>
        </div>
        <div className="pl-8 pr-16">
          <dt className="text-gray-500 text-sm">Time spent reading</dt>
          <dd className="block text-3xl">186 mins.</dd>
        </div>
      </dl>
    </div>
  )
}
