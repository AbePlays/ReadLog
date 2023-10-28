import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'

import { BooksSchema } from '~/schemas/bookSchema'

export const meta: MetaFunction = () => {
  return [
    { title: 'Popular Books - ReadLog' },
    {
      name: 'description',
      content: 'Explore a curated collection of popular books. Find your next great read on our platform.'
    }
  ]
}

export async function loader({ context }: LoaderFunctionArgs) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:'fiction','nonfiction','mystery','science','fantasy'&orderBy=relevance&key=${context.env.GOOGLE_BOOKS_API_KEY}`
  )
  const data = await res.json()
  console.log(data, context.env)
  const books = BooksSchema.parse(data)
  return books
}

export default function BooksRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2" id="popular-books">
        Popular Books
      </h1>
      <ul aria-labelledby="popular-books">
        {loaderData.items.map((book) => {
          return (
            <li key={book.id}>
              <Link to={`./${book.id}`}>
                <h2>{book.volumeInfo.title}</h2>
                <img
                  alt={book.volumeInfo.title}
                  height="180px"
                  src={book.volumeInfo.imageLinks?.thumbnail}
                  width="120px"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
