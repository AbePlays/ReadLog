import type { LinksFunction } from '@remix-run/cloudflare'
import { Links, LiveReload, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'

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
          <nav aria-label="Main" className="p-4">
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
