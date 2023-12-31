import type { MetaFunction } from '@remix-run/cloudflare'

import { Link } from '~/components/ui/link'

export const meta: MetaFunction = () => {
  return [{ title: 'Home - ReadLog' }, { name: 'description', content: 'Welcome to ReadLog!' }]
}

export default function IndexRoute() {
  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Welcome to ReadLog</h1>
      <Link to="/books">Checkout Popular Books</Link>
    </div>
  )
}
