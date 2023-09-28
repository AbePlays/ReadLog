import type { MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { BooksSchema } from '~/schemas/bookSchema'

export const meta: MetaFunction = () => {
  return [{ title: 'Books' }, { name: 'description', content: 'Welcome to ReadLog!' }]
}

export async function loader() {
  const res = await fetch(
    "https://www.googleapis.com/books/v1/volumes?q=subject:'fiction','nonfiction','mystery','science','fantasy'&orderBy=relevance"
  )
  const data = await res.json()
  const books = BooksSchema.parse(data)
  return books
}

export default function BooksPage() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <h1 className="bg-red-200 text-center p-2">Popular Books</h1>
      <ul>
        {loaderData.items.map((book) => {
          return (
            <li key={book.id}>
              <span>{book.volumeInfo.title}</span>
              <img alt={book.volumeInfo.title} src={book.volumeInfo.imageLinks.thumbnail} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
