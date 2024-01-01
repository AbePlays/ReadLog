import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'
import { Book, MoveLeft, MoveRight, Search, SearchX } from 'lucide-react'

import { BookCover } from '~/components/book-cover'
import { Spinner } from '~/components/spinner'
import { Button } from '~/components/ui/button'
import { Link } from '~/components/ui/link'
import { Select } from '~/components/ui/select'
import { TextField } from '~/components/ui/text-field'
import { BooksSchema } from '~/schemas/book'
import { cn } from '~/utils/cn'

export const meta: MetaFunction = () => {
  return [
    { title: 'Book Search - ReadLog' },
    { name: 'description', content: 'Search for books, discover new titles, and find your favorite reads online' }
  ]
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)

  const query = url.searchParams.get('q')
  const genre = ['all', null].includes(url.searchParams.get('genre')) ? '' : url.searchParams.get('genre')
  const page = (Number(url.searchParams.get('page') ?? '1') - 1) * 10

  if (query) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${query},subject:${genre}&startIndex=${page}&maxResults=10&key=${context.env.GOOGLE_BOOKS_API_KEY}`
    )
    const data = await response.json()
    const books = BooksSchema.parse(data)
    return books
  }

  return null
}

export default function SearchRoute() {
  const [searchParams] = useSearchParams()
  const { location, state } = useNavigation()
  const loaderData = useLoaderData<typeof loader>()

  const isLoadingBooks = state === 'loading' && location.pathname === '/search'
  const query = searchParams.get('q') ?? ''
  const genre = searchParams.get('genre') ?? 'all'
  const page = Number(searchParams.get('page') ?? '1')

  const pagination = {
    isPreviousDisabled: page === 1,
    isNextDisabled: (loaderData?.items?.length ?? 0) < 10
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Search</h1>
      <Form className="flex flex-col md:flex-row gap-4 mt-6" method="get">
        <TextField.Root className="bg-white flex-1">
          <TextField.Slot>
            <Book className="text-gray-700" size={16} />
          </TextField.Slot>
          <TextField.Input
            aria-label="Search books"
            defaultValue={query}
            name="q"
            placeholder="Enter the name of a book"
            type="search"
          />
        </TextField.Root>
        <div className="flex gap-4">
          <Select defaultValue={genre} name="genre">
            <Select.Trigger className="flex-1 min-w-[10rem]" id="genre" />
            <Select.Content>
              <Select.Option value="all">All Genres</Select.Option>
              <Select.Option value="fantasy">Fantasy</Select.Option>
              <Select.Option value="fiction">Fiction</Select.Option>
              <Select.Option value="horror">Horror</Select.Option>
              <Select.Option value="mystery">Mystery</Select.Option>
              <Select.Option value="non-fiction">Non Fiction</Select.Option>
            </Select.Content>
          </Select>
          <Button aria-label="Search" className="p-3" type="submit" variant="solid">
            {isLoadingBooks ? <Spinner /> : <Search size={16} />}
          </Button>
        </div>
      </Form>

      {loaderData ? (
        <>
          {(loaderData.items?.length ?? 0) > 0 ? (
            <div className={cn({ 'pointer-events-none opacity-30': isLoadingBooks })}>
              <ul
                aria-label="Search Results"
                className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6"
              >
                {loaderData.items?.map((book) => {
                  return (
                    <li className="w-full" key={book.id}>
                      <Link className="block rounded-lg h-full" to={`/books/${book.id}`}>
                        <BookCover book={book} />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {/* https://github.com/evdhiggins/book-inquiry?tab=readme-ov-file#totalitems-and-calculating-pagination */}
              <nav aria-label="Pagination" className="flex gap-4 items-center justify-center mt-4">
                <Link
                  aria-label={`Go to Page ${page - 1}`}
                  className={cn({ 'pointer-events-none opacity-30': pagination.isPreviousDisabled })}
                  disabled={pagination.isPreviousDisabled}
                  to={`/search?q=${query}&genre=${genre}&page=${page - 1}`}
                >
                  <MoveLeft size={20} />
                </Link>

                <div className="flex gap-4 items-center">
                  <hr className="w-8 border-gray-300" />
                  <span className="font-medium">Page {page}</span>
                  <hr className="w-8 border-gray-300" />
                </div>

                <Link
                  aria-label={`Go to Page ${page + 1}`}
                  className={cn({ 'pointer-events-none opacity-30': pagination.isNextDisabled })}
                  disabled={pagination.isNextDisabled}
                  to={`/search?q=${query}&genre=${genre}&page=${page + 1}`}
                >
                  <MoveRight size={20} />
                </Link>
              </nav>
            </div>
          ) : (
            <div className={cn('grid place-items-center my-6', { 'pointer-events-none opacity-30': isLoadingBooks })}>
              <SearchX aria-hidden="true" className="text-gray-200" size={160} />
              <span className="block text-lg font-medium mt-4">No Results Found</span>
              <p className="text-gray-600">Try searching for a different book or genre.</p>
            </div>
          )}
        </>
      ) : null}
    </>
  )
}
