import { expect, test } from '@playwright/test'

import { DUMMY_BOOKS_RESPONSE } from './data/books'

test.beforeEach(async ({ page }) => {
  await page.route('books?_data=routes%2Fbooks._index', async (route) => {
    await route.fulfill({ json: DUMMY_BOOKS_RESPONSE })
  })

  await page.goto('/')
  const booksLink = page.getByRole('link', { name: 'Checkout Popular Books' })
  await booksLink.click()
})

test('has Popular Books heading', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Popular Books' })).toBeInViewport()
})

test('has book title and image in each book in the list', async ({ page }) => {
  const booksList = page.getByRole('list', { name: 'Popular Books' })
  const books = booksList.getByRole('listitem')

  await expect(books).toHaveCount(DUMMY_BOOKS_RESPONSE.items.length)

  for (let i = 0; i < DUMMY_BOOKS_RESPONSE.items.length; ++i) {
    const book = books.nth(i)
    const item = DUMMY_BOOKS_RESPONSE.items[i]

    const bookTitle = book.getByRole('heading', { level: 2 })
    const bookLink = book.getByRole('link')
    const bookImage = book.getByRole('img')

    await expect(bookTitle).toHaveText(item.volumeInfo.title)
    await expect(bookLink).toHaveAttribute('href', `/books/${item.id}`)
    await expect(bookImage).toHaveAttribute('src', item.volumeInfo.imageLinks.thumbnail)
  }
})
