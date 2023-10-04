import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'

import { BookDetailSchema } from '~/schemas/bookSchema'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data) {
    const match = data.volumeInfo.description?.match(/[^.!?]+[.!?]+\s/)
    const description = match ? match[0].trim() : data.volumeInfo.description ?? ''
    return [{ title: data.volumeInfo.title }, { name: 'description', content: description }]
  }

  return [
    { title: '404 Book not found - ReadLog' },
    { name: 'description', content: "Oops! The page you're looking for doesn't exist." }
  ]
}

export async function loader({ context, params }: LoaderFunctionArgs) {
  const bookId = z.string().parse(params.bookId)
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${context.env.GOOGLE_BOOKS_API_KEY}`
  )
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
        src={loaderData.volumeInfo.imageLinks?.smallThumbnail}
        width="300px"
      />
      <h1 className="font-bold">{loaderData.volumeInfo.title}</h1>
      <p>{loaderData.volumeInfo.description}</p>
    </div>
  )
}
