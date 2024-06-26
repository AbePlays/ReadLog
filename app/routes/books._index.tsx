import { type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/cloudflare'
import { useLoaderData, useNavigation, useSearchParams } from '@remix-run/react'

import { BookCover } from '~/components/book-cover'
import { Link } from '~/components/ui/link'
import { ToggleGroup } from '~/components/ui/toggle-group'
import { BooksSchema, type TBookSearchResponse } from '~/schemas/book'
import { cn } from '~/utils/cn'

export const meta: MetaFunction = () => {
  return [
    { title: 'Popular Books - ReadLog' },
    {
      name: 'description',
      content: 'Explore a curated collection of popular books. Find your next great read on our platform.'
    }
  ]
}

const ALL_GENRES = 'all genres'
const GENRES = ['fiction', 'nonfiction', 'mystery', 'science', 'fantasy']

export async function loader({ context, request }: LoaderFunctionArgs): AsyncResult<TBookSearchResponse, string> {
  const url = new URL(request.url)
  let genres = url.searchParams.get('genre') ?? ALL_GENRES

  if (genres === ALL_GENRES) {
    genres = GENRES.map((genre) => `'${genre}'`).join(',')
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${genres}&orderBy=relevance&key=${context.env.GOOGLE_BOOKS_API_KEY}`
    )
    const data = await res.json()
    const books = BooksSchema.parse(data)
    return json({ ok: true, data: books }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
  } catch (e) {
    console.error(e)
    return json({ ok: false, error: 'An error occurred while fetching books' })
  }
}

export default function BooksRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const { location, state } = useNavigation()
  const [searchParams] = useSearchParams()

  const isLoadingBooks = state === 'loading' && location.pathname === '/books'

  return (
    <>
      <h1 className="text-3xl font-semibold" id="popular-books">
        Popular Books
      </h1>
      <span className="text-gray-500">Discover the best books from a variety of genres.</span>

      <ToggleGroup
        aria-label="Genre selection"
        className="mt-6"
        type="single"
        value={searchParams.get('genre') ?? ALL_GENRES}
      >
        {[ALL_GENRES, ...GENRES.sort()].map((genre) => (
          <ToggleGroup.Item asChild className="capitalize" key={genre} value={genre}>
            <Link prefetch="intent" to={`?genre=${genre}`}>
              {genre}
            </Link>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      {loaderData.ok ? (
        <div className={cn({ 'pointer-events-none opacity-30': isLoadingBooks })}>
          <ul
            aria-labelledby="popular-books"
            className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6"
          >
            {loaderData.data.items.map((book) => {
              return (
                <li className="w-full" key={book.id}>
                  <Link
                    className="block rounded-lg h-full"
                    prefetch="intent"
                    to={`./${book.id}`}
                    unstable_viewTransition
                  >
                    <BookCover book={book} />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </>
  )
}
