import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, Link, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'

import { BookSearchSchema } from '~/schemas/bookSchema'

export const meta: MetaFunction = () => {
  return [
    { title: 'Book Search - ReadLog' },
    {
      name: 'description',
      content: 'Search for books, discover new titles, and find your favorite reads online'
    }
  ]
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q')

  if (query) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&key=${context.env.GOOGLE_BOOKS_API_KEY}`
    )
    const data = await response.json()
    const books = BookSearchSchema.parse(data)
    return books
  }

  return null
}

export default function SearchRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Search books</h1>
      <Form action="/search" method="get">
        <input className="border w-full p-2" defaultValue={query} name="q" placeholder="Search books" type="search" />
      </Form>
      {state === 'loading' ? <span>Loading Books...</span> : null}
      {state === 'idle' ? (
        <ul>
          {loaderData?.items?.map((book) => {
            return (
              <li key={book.id}>
                <Link to={`/books/${book.id}`}>
                  <h2>{book.volumeInfo.title}</h2>
                  <img
                    alt={`Cover of a book titled ${book.volumeInfo.title}`}
                    height="180px"
                    src={book.volumeInfo?.imageLinks?.thumbnail}
                    width="120px"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
