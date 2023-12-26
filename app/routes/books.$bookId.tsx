import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction, json } from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { BookText, PenBox } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTimer } from 'use-timer'
import { z } from 'zod'

import { BackButton } from '~/components/back-button'
import { ClientOnly } from '~/components/client-only'
import { Button } from '~/components/ui/button'
import { Modal } from '~/components/ui/modal'
import { TextField } from '~/components/ui/text-field'
import { getDbClient } from '~/libs/db/index.server'
import { BookDetailSchema } from '~/schemas/book'
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
  const xata = getDbClient(context)
  const userId = await getUserId(request, context)

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
  const userId = await getUserId(request, context)

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

  const xata = getDbClient(context)
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
  const [showModal, setShowModal] = useState(false)
  const { pause, reset, start, status, time } = useTimer()

  const hasTimerStarted = status === 'RUNNING'
  const hasNotRead = !loaderData.userDetails.userBook
  const currentPageNumber = loaderData.userDetails.userBook?.reading_history[0]?.page_end || 0
  const completionPercentage = (currentPageNumber * 100) / (loaderData.bookDetails.volumeInfo.pageCount || 1)

  useEffect(() => {
    // Close dialog if the form is successfully submitted
    if (actionData?.success) {
      setShowModal(false)
    }
  }, [actionData])

  function handleTimer() {
    if (hasTimerStarted) {
      pause()
      setShowModal(true)
    } else {
      reset()
      start()
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto">
      <div className="flex justify-between items-start">
        <BackButton className="mt-4" />
        <div className="p-8 bg-stone-50">
          <img
            alt={`Cover of a book titled ${loaderData.bookDetails.volumeInfo.title}`}
            className="aspect-[2/3]"
            height="300"
            src={loaderData.bookDetails.volumeInfo.imageLinks?.thumbnail}
            width="200"
          />
        </div>
      </div>
      <div className="grid gap-2 mt-8">
        <h1 className="font-medium text-xl">{loaderData.bookDetails.volumeInfo.title}</h1>
        <span className="block text-gray-600">
          {new Intl.ListFormat().format(loaderData.bookDetails.volumeInfo.authors ?? [])}
        </span>

        {loaderData.bookDetails.volumeInfo.publishedDate ? (
          <span className="flex text-sm gap-2 text-gray-600 leading-none">
            <PenBox aria-hidden="true" size={14} />
            <span>
              <time dateTime={loaderData.bookDetails.volumeInfo.publishedDate} suppressHydrationWarning>
                {new Intl.DateTimeFormat().format(new Date(loaderData.bookDetails.volumeInfo.publishedDate))}
              </time>{' '}
              (First Published)
            </span>
          </span>
        ) : null}

        {loaderData.bookDetails.volumeInfo.pageCount ? (
          <span className="flex text-sm gap-2 text-gray-600 leading-none">
            <BookText aria-hidden="true" size={14} />
            {new Intl.NumberFormat().format(loaderData.bookDetails.volumeInfo.pageCount)} Pages
          </span>
        ) : null}

        {loaderData.userDetails.userId ? (
          <>
            <div
              className="mt-2 bg-gray-200 rounded-lg overflow-hidden h-2 relative before:absolute before:inset-0 before:bg-black before:transition-[width] before:w-[--progress-width]"
              style={{ '--progress-width': `${completionPercentage}%` } as React.CSSProperties}
            >
              <label className="sr-only" htmlFor="reading-progress">
                Reading progress
              </label>
              <progress className="opacity-0" id="reading-progress" max="100" value={completionPercentage}>
                {completionPercentage}%
              </progress>
            </div>
            <span className="text-right block text-sm text-gray-400">
              {Math.floor(completionPercentage)}% Completed
            </span>

            <Button className="tabular-nums" onClick={handleTimer} variant="solid">
              {hasTimerStarted
                ? formatTime(time)
                : hasNotRead
                ? 'Start Reading'
                : `Continue on Page ${currentPageNumber}`}
            </Button>
          </>
        ) : null}

        <hr className="mt-4 b-0 h-0.5 bg-gray-200 rounded-full" />

        <ClientOnly>
          <span className="mt-2 font-medium text-lg">Synopsis</span>
          <p
            className="text-gray-600 text-sm prose max-w-none"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: santized by google books
            dangerouslySetInnerHTML={{ __html: loaderData.bookDetails.volumeInfo.description ?? '' }}
          />
        </ClientOnly>
      </div>

      <Modal open={showModal} onOpenChange={setShowModal}>
        <Modal.Content title="Update Reading Progress" onEscapeKeyDown={(e) => e.preventDefault()}>
          <div className="p-4">
            <p>Keep your reading on track! Please enter the page number you've reached in the book.</p>

            <Form method="post">
              <fieldset disabled={state !== 'idle'}>
                <input name="bookId" type="hidden" value={loaderData.bookDetails.id} />
                <input name="bookName" type="hidden" value={loaderData.bookDetails.volumeInfo.title} />
                <input
                  name="imageUrl"
                  type="hidden"
                  value={loaderData.bookDetails.volumeInfo.imageLinks?.smallThumbnail}
                />
                <input name="userBookId" readOnly type="hidden" value={loaderData.userDetails.userBook?.id ?? ''} />
                <input name="timeSpent" readOnly type="hidden" value={time} />

                <label htmlFor="pageNumber">Page Number</label>
                <TextField.Root className="mt-2">
                  <TextField.Input
                    defaultValue={loaderData.userDetails.userBook?.reading_history[0]?.page_end}
                    id="pageNumber"
                    name="pageNumber"
                    type="number"
                  />
                </TextField.Root>

                <div className="mt-4 space-x-4">
                  <Modal.Close asChild>
                    <Button variant="soft">Cancel</Button>
                  </Modal.Close>
                  <Button type="submit" variant="solid">
                    Submit
                  </Button>
                </div>
              </fieldset>
            </Form>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  )
}
