import { type LoaderFunctionArgs, type MetaFunction, json, redirect } from '@remix-run/cloudflare'
import { type ShouldRevalidateFunctionArgs, useLoaderData, useSearchParams } from '@remix-run/react'
import { BookCheck, BookMarked, BookOpenText, SearchX } from 'lucide-react'

import { BookCover } from '~/components/book-cover'
import { Link } from '~/components/ui/link'
import { Tabs } from '~/components/ui/tabs'
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

const TABS = [
  { id: 'reading', label: 'Reading', icon: <BookOpenText aria-hidden="true" className="w-4 h-4" /> },
  { id: 'want-to-read', label: 'To Read', icon: <BookMarked aria-hidden="true" className="w-4 h-4" /> },
  { id: 'finished', label: 'Finished', icon: <BookCheck aria-hidden="true" className="w-4 h-4" /> }
]

export default function LibraryRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  const readStatus = searchParams.get('read-status') ?? 'reading'

  return (
    <>
      <h1 className="text-3xl font-semibold" id="popular-books">
        Your Library
      </h1>
      <span className="text-gray-500">Manage, explore, and revisit your personal book collection.</span>

      <Tabs activationMode="manual" className="mt-6" value={readStatus}>
        <Tabs.List>
          {TABS.map((tab) => (
            <Tabs.Trigger asChild key={tab.id} value={tab.id}>
              <Link className="flex gap-2 items-center" to={`?read-status=${tab.id}`}>
                {tab.icon}
                {tab.label}
              </Link>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TABS.map((tab) => {
          const books = loaderData.filter((book) => book.readStatus === tab.id)

          return (
            <Tabs.Content key={tab.id} value={tab.id}>
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
      </Tabs>
    </>
  )
}
