import { expect, test } from '@playwright/test'

test('has books list when search is performed', async ({ page }) => {
  await page.goto('/search')
  await expect(page.getByRole('heading', { name: 'Search' })).toBeAttached()
  await expect(page.getByLabel('Search books')).toBeAttached()
  const booksList = page.getByRole('list', { name: 'Search Results' })
  const books = booksList.getByRole('listitem')
  await expect(books).toHaveCount(0)

  const searchInput = page.getByLabel('Search books')
  await searchInput.fill('Summer Rain')
  await page.keyboard.press('Enter')

  await expect(page.getByText('Loading...')).toBeAttached()
  await page.waitForResponse((res) => res.url().includes('search?q=Summer+Rain&genre=all'))
  await expect(page.getByText('Loading...')).not.toBeAttached()

  const booksCount = await books.count()

  for (let i = 0; i < booksCount; ++i) {
    const book = books.nth(i)
    await expect(book.getByRole('heading', { level: 2 })).toBeAttached()
    await expect(book.getByRole('link')).toBeAttached()
    await expect(book.getByRole('img')).toBeAttached()
  }
})
