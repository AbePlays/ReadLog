import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/cloudflare'
import { Link, useLoaderData, useNavigation, useSubmit } from '@remix-run/react'
import { z } from 'zod'

import { getXataClient } from '~/libs/db/xata'
import { BookDetailSchema } from '~/schemas/bookSchema'
import { getUserId } from '~/utils/session.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data) {
    const match = data.bookDetails.volumeInfo.description?.match(/[^.!?]+[.!?]+\s/)
    const description = match ? match[0].trim() : data.bookDetails.volumeInfo.description ?? ''
    return [{ title: data.bookDetails.volumeInfo.title }, { name: 'description', content: description }]
  }

  return [
    { title: '404 Book not found - ReadLog' },
    { name: 'description', content: "Oops! The page you're looking for doesn't exist." }
  ]
}

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const xata = getXataClient(context.env.XATA_API_KEY)
  const userId = await getUserId(request, context.env.SESSION_SECRET)

  const bookId = z.string().parse(params.bookId)
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${context.env.GOOGLE_BOOKS_API_KEY}`
  )
  const data = await response.json()
  const bookDetails = BookDetailSchema.parse(data)

  let userBook = null
  if (userId) {
    const book = await xata.db.user_books.filter({ book_id: bookId, user_id: userId }).getFirst()
    userBook = book
  }
  return { bookDetails, userDetails: { userId, userBook } }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const fields = Object.fromEntries(await request.formData())
  const result = z
    .object({
      bookId: z.string(),
      bookName: z.string(),
      imageUrl: z.string(),
      readingStatus: z.enum(['not-read', 'reading', 'read']),
      userBookId: z.string().optional(),
      userId: z.string()
    })
    .safeParse(fields)

  if (!result.success) {
    return json({ error: 'Invalid request. Please check your input and try again.' }, { status: 400 })
  }

  const xata = getXataClient(context.env.XATA_API_KEY)
  if (result.data.userBookId) {
    const record = await xata.db.user_books.update(result.data.userBookId, {
      read_status: result.data.readingStatus
    })

    return record
  }

  const record = await xata.db.user_books.create({
    book_id: result.data.bookId,
    image_url: result.data.imageUrl,
    name: result.data.bookName,
    read_status: result.data.readingStatus,
    user_id: result.data.userId
  })

  return record
}

export default function BookRoute() {
  const loaderData = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const submit = useSubmit()

  return (
    <div>
      <Link to="/books">Back to Books</Link>
      <img
        alt={`Cover of a book titled ${loaderData.bookDetails.volumeInfo.title}`}
        height="450px"
        src={loaderData.bookDetails.volumeInfo.imageLinks?.smallThumbnail}
        width="300px"
      />
      <h1 className="font-bold">{loaderData.bookDetails.volumeInfo.title}</h1>

      {loaderData.userDetails.userId ? (
        <form method="post" onChange={(e) => submit(e.currentTarget)}>
          <fieldset disabled={state !== 'idle'}>
            <input name="bookId" type="hidden" value={loaderData.bookDetails.id} />
            <input name="bookName" type="hidden" value={loaderData.bookDetails.volumeInfo.title} />
            <input name="imageUrl" type="hidden" value={loaderData.bookDetails.volumeInfo.imageLinks?.smallThumbnail} />
            <input name="userBookId" readOnly type="hidden" value={loaderData.userDetails.userBook?.id} />
            <input name="userId" type="hidden" value={loaderData.userDetails.userId} />

            <label htmlFor="reading-status">Reading Status</label>
            <br />
            <select
              defaultValue={loaderData.userDetails.userBook?.read_status ?? ''}
              name="readingStatus"
              id="reading-status"
            >
              <option value="not-read">Not Read</option>
              <option value="reading">Reading</option>
              <option value="read">Read</option>
            </select>
          </fieldset>
        </form>
      ) : null}

      <p>{loaderData.bookDetails.volumeInfo.description}</p>
    </div>
  )
}
