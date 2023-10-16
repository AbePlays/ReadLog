import type { LinksFunction } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError
} from '@remix-run/react'

import tailwind from '~/styles/tailwind.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: tailwind }]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <nav aria-label="Main" className="p-4 border-b">
            <ul className="flex gap-4">
              <li>
                <NavLink to="/">ReadLog</NavLink>
              </li>
              <li>
                <NavLink to="/books">Books</NavLink>
              </li>
              <li>
                <NavLink to="/search">Search</NavLink>
              </li>
              <li className="ml-auto">
                <NavLink to="/auth">Your Account</NavLink>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
        <footer className="p-4 text-center border-t">
          <p>Built using Remix and Cloudflare</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  let errorMessage = 'Something went wrong'

  if (isRouteErrorResponse(error) && error.data) {
    errorMessage = error.data
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
      <body>
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
