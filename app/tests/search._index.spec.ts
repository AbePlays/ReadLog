import { expect, test } from '@playwright/test'
import { DUMMY_BOOKS_RESPONSE } from './data/books'

test.beforeEach(async ({ page }) => {
  await page.route('search?q=Summer+Rain&_data=routes%2Fsearch._index', async (route) => {
    setTimeout(async () => {
      await route.fulfill({ json: DUMMY_BOOKS_RESPONSE })
    }, 1000)
  })

  await page.goto('/search')
})

test('has books list when search is performed', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Search Books' })).toBeInViewport()
  await expect(page.getByLabel('Search books')).toBeInViewport()
  const booksList = page.getByRole('list', { name: 'Search Results' })
  const books = booksList.getByRole('listitem')
  await expect(books).toHaveCount(0)

  const searchInput = page.getByLabel('Search books')
  await searchInput.fill('Summer Rain')
  await page.keyboard.press('Enter')

  await expect(page.getByText('Loading Books...')).toBeInViewport()
  await expect(books).toHaveCount(DUMMY_BOOKS_RESPONSE.items.length)
  await expect(page.getByText('Loading Books...')).not.toBeInViewport()

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
