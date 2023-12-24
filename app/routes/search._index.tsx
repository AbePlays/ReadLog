import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, Link, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'
import { Search, SearchX } from 'lucide-react'

import { BookCover } from '~/components/book-cover'
import { Button } from '~/components/ui/button'
import { Select } from '~/components/ui/select'
import { BooksSchema } from '~/schemas/book'
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
  const genre = url.searchParams.get('genre') === 'all' ? '' : url.searchParams.get('genre')

  if (query) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${query},subject:${genre}&key=${context.env.GOOGLE_BOOKS_API_KEY}`
    )
    const data = await response.json()
    const books = BooksSchema.parse(data)
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
  const genre = searchParams.get('genre') ?? 'all'

  return (
    <>
      <h1 className="text-3xl font-medium">Discover</h1>
      <Form method="get">
        <fieldset
          className="sm:shadow-sm sm:border border-gray-200 rounded-2xl grid sm:grid-cols-2 sm:divide-x-2 py-6 sm:px-8 mt-4 sm:mt-8 gap-8 sm:gap-0"
          disabled={isLoadingBooks}
        >
          <div>
            <label
              className="block font-medium text-lg relative z-0 after:-z-[1] after:absolute leading-4 after:w-full after:left-0 after:bottom-0 after:bg-yellow-300 after:h-1.5 w-fit"
              htmlFor="query"
            >
              Book
            </label>
            <input
              className="placeholder:text-gray-500 mt-2 w-full sm:w-4/5 outline-none p-2 focus-visible:ring-2 transition duration-300 ring-gray-500 rounded"
              defaultValue={query}
              id="query"
              name="q"
              placeholder="Enter the name of a book"
              type="search"
            />
          </div>
          <div className="flex justify-between items-center sm:items-start sm:pl-8">
            <div>
              <label
                className="block font-medium text-lg relative z-0 after:-z-[1] after:absolute leading-4 after:w-full after:left-0 after:bottom-0 after:bg-yellow-300 after:h-1.5 w-fit"
                htmlFor="genre"
              >
                Genre
              </label>
              <Select defaultValue={genre} name="genre">
                <Select.Trigger className="mt-2 border-none hover:bg-transparent" id="genre" />
                <Select.Content>
                  <Select.Option value="all">All</Select.Option>
                  <Select.Option value="fantasy">Fantasy</Select.Option>
                  <Select.Option value="fiction">Fiction</Select.Option>
                  <Select.Option value="horror">Horror</Select.Option>
                  <Select.Option value="mystery">Mystery</Select.Option>
                  <Select.Option value="non-fiction">Non Fiction</Select.Option>
                </Select.Content>
              </Select>
            </div>
            <Button aria-label="Search" className="p-3 rounded-xl" type="submit" variant="solid">
              <Search size={18} />
            </Button>
          </div>
        </fieldset>
      </Form>

      {isLoadingBooks ? <span>Loading Books...</span> : null}

      {loaderData?.totalItems === 0 ? (
        <div
          className={cn('grid place-items-center my-6', {
            'pointer-events-none opacity-30': isLoadingBooks
          })}
        >
          <SearchX aria-hidden="true" className="text-gray-200" size={160} />
          <span className="block text-lg font-medium mt-4">No Results Found</span>
          <p className="text-gray-600">Try searching for a different book or genre.</p>
        </div>
      ) : (
        <ul
          aria-label="Search Results"
          className={cn(
            'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6',
            {
              'pointer-events-none opacity-30': isLoadingBooks
            }
          )}
        >
          {loaderData?.items?.map((book) => {
            return (
              <li className="w-full" key={book.id}>
                <Link
                  className="outline-none block rounded-lg h-full transition duration-300 focus-visible:ring-2 ring-offset-2 ring-gray-500"
                  to={`/books/${book.id}`}
                >
                  <BookCover book={book} />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
