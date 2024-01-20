import * as Tabs from '@radix-ui/react-tabs'
import { type LoaderFunctionArgs, type MetaFunction, json, redirect } from '@remix-run/cloudflare'
import { type ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react'
import { SearchX } from 'lucide-react'

import { BookCover } from '~/components/book-cover'
import { Link } from '~/components/ui/link'
import { getDbClient } from '~/libs/db/index.server'
import { BookSchema } from '~/schemas/book'
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
  const userBooks = await xata.db.user_books.filter({ user_id: userId }).getAll()

  const books = await Promise.all(
    userBooks.map(async (userBook) => {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${userBook.book_id}?key=${context.env.GOOGLE_BOOKS_API_KEY}`
      )
      const data = await response.json()
      const book = BookSchema.parse(data)
      return { ...book, readStatus: userBook.read_status }
    })
  )

  return json(books)
}

export function shouldRevalidate(_: ShouldRevalidateFunctionArgs) {
  return false
}

const READ_STATUS_LABELS = {
  reading: 'Currently Reading',
  'want-to-read': 'Want To Read',
  read: 'Finished Reading'
}

export default function LibraryRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  const readStatus = searchParams.get('read-status') ?? 'reading'

  return (
    <>
      <h1 className="text-3xl font-semibold" id="popular-books">
        Library
      </h1>

      <Tabs.Root value={readStatus}>
        <Tabs.List>
          {Object.entries(READ_STATUS_LABELS).map(([status, label]) => (
            <Tabs.Trigger asChild className='data-[state="active"]:bg-gray-200' key={status} value={status}>
              <Link to={`?read-status=${status}`}>{label}</Link>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {Object.entries(READ_STATUS_LABELS).map(([status]) => {
          const books = loaderData.filter((book) => book.readStatus === status)

          return (
            <Tabs.Content key={status} value={status}>
              {books.length === 0 ? (
                <div className="grid place-items-center my-6">
                  <SearchX aria-hidden="true" className="text-gray-200" size={160} />
                  <span className="block text-lg font-medium mt-4">No Books Found</span>
                  <p className="text-gray-600">Try searching for a book or adding a new book to your library.</p>
                </div>
              ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] justify-items-center gap-x-12 gap-y-8 p-6">
                  {books.map((book) => (
                    <li className="w-full" key={book.id}>
                      <Link className="block rounded-lg h-full" to={`/books/${book.id}`}>
                        <BookCover book={book} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Content>
          )
        })}
      </Tabs.Root>
    </>
  )
}
