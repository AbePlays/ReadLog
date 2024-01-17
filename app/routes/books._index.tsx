import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Form, useLoaderData, useSearchParams, useSubmit } from '@remix-run/react'

import { BookCover } from '~/components/book-cover'
import { Link } from '~/components/ui/link'
import { BooksSchema } from '~/schemas/book'

export const meta: MetaFunction = () => {
  return [
    { title: 'Popular Books - ReadLog' },
    {
      name: 'description',
      content: 'Explore a curated collection of popular books. Find your next great read on our platform.'
    }
  ]
}

const GENRES = ['fiction', 'nonfiction', 'mystery', 'science', 'fantasy']

export async function loader({ context, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const genres = url.searchParams.get('genre') || GENRES.map((genre) => `'${genre}'`).join(',')

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:${genres}&orderBy=relevance&key=${context.env.GOOGLE_BOOKS_API_KEY}`
  )
  const data = await res.json()
  const books = BooksSchema.parse(data)
  return books
}

export default function BooksRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const submit = useSubmit()

  return (
    <>
      <h1 className="text-3xl font-semibold" id="popular-books">
        Popular Books
      </h1>
      <span className="mt-2 text-gray-500">Discover the best books from a variety of genres.</span>

      <Form method="get">
        <span>Filter by:</span>

        <ToggleGroup.Root
          className="space-x-2"
          defaultValue={searchParams.get('genre') ?? ''}
          onValueChange={(values) => submit({ genre: values })}
          type="single"
        >
          {GENRES.sort().map((genre) => (
            <ToggleGroup.Item className="data-[state=on]:bg-gray-400 p-1" key={genre} value={genre}>
              {genre}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </Form>

      <ul
        aria-labelledby="popular-books"
        className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6"
      >
        {loaderData?.items?.map((book) => {
          return (
            <li className="w-full" key={book.id}>
              <Link className="block rounded-lg h-full" to={`./${book.id}`}>
                <BookCover book={book} />
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
