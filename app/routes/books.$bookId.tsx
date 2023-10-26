import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import { useTimer } from 'use-timer'
import { z } from 'zod'

import { getXataClient } from '~/libs/db/xata'
import { BookDetailSchema } from '~/schemas/bookSchema'
import { formatTime } from '~/utils/formatTime'
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
  const userId = await getUserId(request, context.env.SESSION_SECRET)

  if (!userId) {
    return json(
      { success: false, error: 'User ID is missing or invalid. Please provide a valid user ID and try again.' },
      { status: 400 }
    )
  }
  const fields = Object.fromEntries(await request.formData())
  const result = z
    .object({
      bookId: z.string(),
      bookName: z.string(),
      imageUrl: z.string(),
      pageNumber: z.string().transform((val) => +val),
      timeSpent: z.string().transform((val) => +val),
      userBookId: z.string()
    })
    .safeParse(fields)

  if (!result.success) {
    return json({ success: false, error: 'Invalid request. Please check your input and try again.' }, { status: 400 })
  }

  const xata = getXataClient(context.env.XATA_API_KEY)
  if (result.data.userBookId) {
    let record = await xata.db.user_books.filter({ id: result.data.userBookId, user_id: userId }).getFirst()

    if (!record) {
      return json(
        { success: false, error: 'Record not found. Please check your input and try again.' },
        { status: 404 }
      )
    }

    const history = record.reading_history

    if (history.length > 0 && result.data.pageNumber < history[0].page_end) {
      return json(
        { success: false, error: 'Invalid page number. Please check your input and try again.' },
        { status: 400 }
      )
    }

    record = await xata.db.user_books.update(result.data.userBookId, {
      reading_history: [
        {
          id: crypto.randomUUID(),
          page_end: result.data.pageNumber,
          page_start: history[0]?.page_end ?? 0,
          end_time: new Date(),
          start_time: new Date(new Date().getTime() - result.data.timeSpent * 1000)
        },
        ...history
      ]
    })

    if (!record) {
      return json({ success: false, error: 'Failed to update the record. Please try again later.' }, { status: 404 })
    }

    return { success: true, data: record }
  }

  const record = await xata.db.user_books.create({
    book_id: result.data.bookId,
    image_url: result.data.imageUrl,
    name: result.data.bookName,
    reading_history: [
      {
        id: crypto.randomUUID(),
        page_end: result.data.pageNumber,
        page_start: 0,
        end_time: new Date(),
        start_time: new Date(new Date().getTime() - result.data.timeSpent * 1000)
      }
    ],
    read_status: 'reading',
    user_id: userId
  })

  return { success: true, data: record }
}

export default function BookRoute() {
  const actionData = useActionData<typeof action>()
  const loaderData = useLoaderData<typeof loader>()
  const { state } = useNavigation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { pause, reset, start, status, time } = useTimer()

  const hasTimerStarted = status === 'RUNNING'
  const hasNotRead = !loaderData.userDetails.userBook
  const currentPageNumber = loaderData.userDetails.userBook?.reading_history[0]?.page_end || 0
  const completionPercentage = (currentPageNumber * 100) / (loaderData.bookDetails.volumeInfo.pageCount || 1)

  useEffect(() => {
    // Close dialog if the form is successfully submitted
    if (actionData?.success) {
      dialogRef.current?.close()
    }
  }, [actionData])

  function handleTimer() {
    if (hasTimerStarted) {
      pause()
      dialogRef.current?.showModal()
    } else {
      reset()
      start()
    }
  }

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
        <>
          {hasNotRead ? null : <span>You have completed {completionPercentage.toFixed(2)}% of the book</span>}
          <button className="block" onClick={handleTimer} type="button">
            {hasTimerStarted
              ? formatTime(time)
              : hasNotRead
              ? 'Start Reading'
              : `Continue Reading from Page ${currentPageNumber}`}
          </button>
        </>
      ) : null}

      <dialog className="p-4" ref={dialogRef}>
        <h2 className="font-bold">Update Reading Progress</h2>
        <p>Keep your reading on track! Please enter the page number you've reached in the book. </p>

        <Form method="post">
          <fieldset disabled={state !== 'idle'}>
            <input name="bookId" type="hidden" value={loaderData.bookDetails.id} />
            <input name="bookName" type="hidden" value={loaderData.bookDetails.volumeInfo.title} />
            <input name="imageUrl" type="hidden" value={loaderData.bookDetails.volumeInfo.imageLinks?.smallThumbnail} />
            <input name="userBookId" readOnly type="hidden" value={loaderData.userDetails.userBook?.id ?? ''} />
            <input name="timeSpent" readOnly type="hidden" value={time} />

            <label htmlFor="pageNumber">Page Number</label>
            <input
              className="block"
              defaultValue={loaderData.userDetails.userBook?.reading_history[0]?.page_end}
              id="pageNumber"
              name="pageNumber"
              type="number"
            />

            <button onClick={() => dialogRef.current?.close()} type="button">
              Cancel
            </button>
            <button type="submit">Submit</button>
          </fieldset>
        </Form>
      </dialog>

      <span className="block">Number of Pages: {loaderData.bookDetails.volumeInfo.pageCount}</span>
      <p>{loaderData.bookDetails.volumeInfo.description}</p>
    </div>
  )
}
