import { expect, test } from '@playwright/test'
import { z } from 'zod'

import { BookSchema, BooksSchema } from '~/schemas/bookSchema'

const DUMMY_BOOKS_RESPONSE = {
  items: [
    {
      id: 'VcDZDQAAQBAJ',
      etag: 'X+kYqn3FdlY',
      volumeInfo: {
        title: 'The E. Hoffmann Price Fantasy & Science Fiction MEGAPACK®',
        subtitle: '20 Classic Tales',
        authors: ['E. Hoffmann Price'],
        publisher: 'Wildside Press LLC',
        publishedDate: '2017-01-05',
        description:
          "Edgar Hoffmann Price (1898 - 1988) was an American writer of popular fiction (he was a self-titled 'fictioneer') for the pulp magazine marketplace. He is probably most famous for his collaboration with H. P. Lovecraft, \"Through the Gates of the Silver Key,\" though he published hundreds of other works. This volume is a good sampling of his fantasy and science fiction stories. Included are: THE PROPHET'S GRANDCHILDREN THE INFIDEL'S DAUGHTER THE WORD OF BENTLEY DESERT MAGIC SANCTUARY THE WOMAN IN THE CASE APPRENTICE MAGICIAN STRANGE GATEWAY SPOTTED SATAN KHOSRU'S GARDEN SHADOW CAPTAIN THE HANDS OF JANOS THE FIRE AND THE FLESH THE SHADOW OF SATURN DRAGON'S DAUGHTER THE MIRROR OF KO HUNG EXILE FROM VENUS ESCAPE FROM HYPER-SPACE THE SEVEN SECURITIES WHEN IN DOUBT, MUTATE If you enjoy this ebook, don't forget to search your favorite ebook store for \"Wildside Press Megapack\" to see more of the 300+ volumes in this series, covering adventure, historical fiction, mysteries, westerns, ghost stories, science fiction -- and much, much more!",
        industryIdentifiers: [
          {
            type: 'ISBN_13',
            identifier: '9781479424689'
          },
          {
            type: 'ISBN_10',
            identifier: '1479424684'
          }
        ],
        pageCount: 561,
        categories: ['Fiction'],
        imageLinks: {
          smallThumbnail:
            'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
          thumbnail:
            'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
        },
        language: 'en'
      }
    }
  ],
  kind: 'books#volumes',
  totalItems: 1
} satisfies z.infer<typeof BooksSchema>

const DUMMY_BOOK_RESPONSE = {
  id: 'VcDZDQAAQBAJ',
  etag: 'X+kYqn3FdlY',
  volumeInfo: {
    title: 'The E. Hoffmann Price Fantasy & Science Fiction MEGAPACK®',
    subtitle: '20 Classic Tales',
    authors: ['E. Hoffmann Price'],
    publisher: 'Wildside Press LLC',
    publishedDate: '2017-01-05',
    description:
      "Edgar Hoffmann Price (1898 - 1988) was an American writer of popular fiction (he was a self-titled 'fictioneer') for the pulp magazine marketplace. He is probably most famous for his collaboration with H. P. Lovecraft, \"Through the Gates of the Silver Key,\" though he published hundreds of other works. This volume is a good sampling of his fantasy and science fiction stories. Included are: THE PROPHET'S GRANDCHILDREN THE INFIDEL'S DAUGHTER THE WORD OF BENTLEY DESERT MAGIC SANCTUARY THE WOMAN IN THE CASE APPRENTICE MAGICIAN STRANGE GATEWAY SPOTTED SATAN KHOSRU'S GARDEN SHADOW CAPTAIN THE HANDS OF JANOS THE FIRE AND THE FLESH THE SHADOW OF SATURN DRAGON'S DAUGHTER THE MIRROR OF KO HUNG EXILE FROM VENUS ESCAPE FROM HYPER-SPACE THE SEVEN SECURITIES WHEN IN DOUBT, MUTATE If you enjoy this ebook, don't forget to search your favorite ebook store for \"Wildside Press Megapack\" to see more of the 300+ volumes in this series, covering adventure, historical fiction, mysteries, westerns, ghost stories, science fiction -- and much, much more!",
    industryIdentifiers: [
      {
        type: 'ISBN_13',
        identifier: '9781479424689'
      },
      {
        type: 'ISBN_10',
        identifier: '1479424684'
      }
    ],
    pageCount: 561,
    categories: ['Fiction'],
    imageLinks: {
      smallThumbnail:
        'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
      thumbnail:
        'http://books.google.com/books/content?id=VcDZDQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api'
    },
    language: 'en'
  }
} satisfies z.infer<typeof BookSchema>

test.beforeEach(async ({ page }) => {
  await page.route('books?_data=routes%2Fbooks._index', async (route) => {
    await route.fulfill({ json: DUMMY_BOOKS_RESPONSE })
  })

  await page.route(`/books/${DUMMY_BOOK_RESPONSE.id}?_data=routes%2Fbooks.%24bookId`, async (route) => {
    await route.fulfill({ json: DUMMY_BOOK_RESPONSE })
  })

  await page.goto('/')
  const booksLink = page.getByRole('link', { name: 'Checkout Popular Books' })
  await booksLink.click()

  const booksList = page.getByRole('list', { name: 'Popular Books' })
  const books = booksList.getByRole('listitem')
  await expect(books).toHaveCount(DUMMY_BOOKS_RESPONSE.items.length)
  const bookLink = books.nth(0).getByRole('link')
  await bookLink.click()
})

test('has a link back to books route', async ({ page }) => {
  const booksLink = page.getByRole('link', { name: 'Back to Books' })
  await expect(booksLink).toHaveAttribute('href', '/books')
})

test('has book title and description', async ({ page }) => {
  await expect(page.getByRole('heading', { name: `${DUMMY_BOOK_RESPONSE.volumeInfo.title}` })).toBeInViewport()
  await expect(page.getByRole('paragraph')).toHaveText(DUMMY_BOOK_RESPONSE.volumeInfo.description)
})
