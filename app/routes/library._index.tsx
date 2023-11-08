import { type LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'

import { getDbClient } from '~/libs/db/index.server'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Library - ReadLog' }, { name: 'description', content: 'Your collection of books on ReadLog!' }]
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userId = await getUserId(request, context)
  if (!userId) {
    return redirect('/auth')
  }

  const xata = getDbClient(context)
  const books = await xata.db.user_books.filter({ user_id: userId }).getAll()

  return books
}

export default function LibraryRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2" id="your-library">
        Your ReadLog Library
      </h1>
      {loaderData.length > 0 ? (
        <ul aria-labelledby="your-library">
          {loaderData.map((book) => (
            <li key={book.id}>
              <Link to={`/books/${book.book_id}`}>
                <img
                  alt={`Cover of a book titled ${book.name}`}
                  height="180px"
                  src={book.image_url ?? ''}
                  width="120px"
                />
                <h2 className="font-bold">{book.name}</h2>
                <span>Reading Status: </span>
                <span>{book.read_status}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No books added yet. <Link to="/books">Explore books</Link> to get started.
        </p>
      )}
    </div>
  )
}
