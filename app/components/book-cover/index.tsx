import { unstable_useViewTransitionState } from '@remix-run/react'

import type { TBook } from '~/schemas/book'
import { cn } from '~/utils/cn'

function BookCover(props: { book: TBook }) {
  const { book } = props
  const isTransitioning = unstable_useViewTransitionState(`/books/${book.id}`)

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="absolute inset-0 bg-cover blur-lg scale-150 origin-bottom"
          style={{
            backgroundImage: `url(${book.volumeInfo.imageLinks?.thumbnail ?? '/placeholder.png'})`
          }}
        />
        <img
          alt={`Cover of a book titled ${book.volumeInfo.title}`}
          className={cn('aspect-[2/3] mx-auto relative', {
            'motion-safe:[view-transition-name:book-cover]': isTransitioning
          })}
          height="240"
          src={book.volumeInfo.imageLinks?.thumbnail ?? '/placeholder.png'}
          width="160"
        />
      </div>
      <div className="mt-4">
        <span className="text-gray-600 text-sm line-clamp-1">{book.volumeInfo.authors?.join(', ')}</span>
        <h2 className="font-semibold mt-1 line-clamp-2">{book.volumeInfo.title}</h2>
      </div>
    </>
  )
}

export { BookCover }
