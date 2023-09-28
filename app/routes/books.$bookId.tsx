import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { BookDetailSchema } from '~/schemas/bookSchema'

export const meta: MetaFunction = () => {
  return [{ title: 'A Book' }, { name: 'description', content: 'Welcome to ReadLog!' }]
}

export async function loader({ params }: LoaderFunctionArgs) {
  const bookId = z.string().parse(params.bookId)
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`)
  const data = await response.json()
  const bookDetails = BookDetailSchema.parse(data)
  return bookDetails
}

export default function BookRoute() {
  const loaderData = useLoaderData<typeof loader>()

  return (
    <div>
      <Link to="/books">Back to Books</Link>
      <img
        alt={loaderData.volumeInfo.title}
        height="450px"
        src={loaderData.volumeInfo.imageLinks.small}
        width="300px"
      />
      <h1 className="font-bold">{loaderData.volumeInfo.title}</h1>
      <p>{loaderData.volumeInfo.description}</p>
    </div>
  )
}
