import { type LinksFunction, type LoaderFunctionArgs, json } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type ShouldRevalidateFunctionArgs,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from '@remix-run/react'
import { Menu } from 'lucide-react'
import React from 'react'

import { Navigation } from '~/components/navigation'
import { IconButton } from '~/components/ui/icon-button'
import { Modal } from '~/components/ui/modal'
import tailwind from '~/styles/tailwind.css'
import { getUserId } from '~/utils/session.server'

export const links: LinksFunction = () => [
  { rel: 'manifest', href: '/site.webmanifest' },
  { rel: 'stylesheet', href: tailwind }
]

export async function loader({ context, request }: LoaderFunctionArgs): AsyncResult<string | undefined> {
  const userId = await getUserId(request, context)
  return json({ ok: true, data: userId })
}

export function shouldRevalidate({ formData = new FormData() }: ShouldRevalidateFunctionArgs) {
  return Boolean(formData.get('authType'))
}

export default function App() {
  const { data: userId } = useLoaderData<typeof loader>()

  const [showNav, setShowNav] = React.useState(false)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="sm:grid sm:grid-cols-[15rem_1fr] min-h-screen bg-stone-50">
        <header className="px-4 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">ReadLog</span>
            <Modal open={showNav} onOpenChange={setShowNav}>
              <Modal.Button asChild>
                <IconButton className="sm:hidden rounded-full" variant="ghost">
                  <Menu size={20} />
                </IconButton>
              </Modal.Button>

              <Modal.Content title="Navigation">
                <Navigation className="p-4 bg-stone-50" closeNav={() => setShowNav(false)} isLoggedIn={!!userId} />
              </Modal.Content>
            </Modal>
          </div>

          <hr className="hidden sm:block" />
          <Navigation className="hidden sm:block" isLoggedIn={!!userId} />
        </header>

        <div className="mt-2 sm:rounded-tl-xl sm:border border-gray-200 overflow-hidden bg-white">
          <main className="p-4 sm:p-8">
            <Outlet />
          </main>
          <footer className="p-4 text-center border-t">
            <p>Built using Remix and Cloudflare</p>
          </footer>
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const routeError = useRouteError()
  console.error(routeError)

  let errorMessage = 'Something went wrong'

  if (isRouteErrorResponse(routeError) && routeError.data.error) {
    errorMessage = routeError.data.error
  }

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="p-4">
        <h1 className="font-bold text-2xl">{errorMessage}</h1>
        <p>
          Please raise an issue on the project's{' '}
          <a className="underline" href="https://github.com/AbePlays/ReadLog" rel="noreferrer" target="_blank">
            GitHub repository
          </a>{' '}
          if the problem persists.
        </p>
      </body>
    </html>
  )
}
