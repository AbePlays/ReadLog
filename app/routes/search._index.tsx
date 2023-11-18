import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, Link, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'

import BookCover from '~/components/BookCover'
import { BookSearchSchema } from '~/schemas/bookSchema'
import { cn } from '~/utils/cn'

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
  const { location, state } = useNavigation()
  const [searchParams] = useSearchParams()

  const isLoadingBooks = state === 'loading' && location.pathname === '/search'
  const query = searchParams.get('q') ?? ''

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Search books</h1>
      <Form action="/search" method="get">
        <input
          aria-label="Search books"
          className="border w-full p-2"
          defaultValue={query}
          name="q"
          placeholder="Search books"
          type="search"
        />
      </Form>
      {isLoadingBooks ? <span>Loading Books...</span> : null}
      <ul
        aria-label="Search Results"
        className={cn('grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6', {
          'pointer-events-none opacity-30': isLoadingBooks
        })}
      >
        {loaderData?.items?.map((book) => {
          return (
            <li className="w-full" key={book.id}>
              <Link to={`/books/${book.id}`}>
                <BookCover book={book} />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
