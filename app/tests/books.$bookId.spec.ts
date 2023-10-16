import { expect, test } from '@playwright/test'

import { DUMMY_BOOKS_RESPONSE, DUMMY_BOOK_RESPONSE } from './data/books'

test.beforeEach(async ({ page }) => {
  await page.route('books?_data=routes%2Fbooks._index', async (route) => {
    await route.fulfill({ json: DUMMY_BOOKS_RESPONSE })
  })

  await page.route(`/books/${DUMMY_BOOK_RESPONSE.id}?_data=routes%2Fbooks.%24bookId`, async (route) => {
    await route.fulfill({ json: { bookDetails: DUMMY_BOOK_RESPONSE, userDetails: { userBook: null, userId: null } } })
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
  await expect(page.getByRole('paragraph').first()).toHaveText(DUMMY_BOOK_RESPONSE.volumeInfo.description)
})
