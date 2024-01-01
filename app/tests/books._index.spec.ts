import { expect, test } from '@playwright/test'

test('has Popular Books heading', async ({ page }) => {
  await page.goto('/books')
  await expect(page.getByRole('heading', { name: 'Popular Books' })).toBeVisible()
})

test('has book title and image in each book in the list', async ({ page }) => {
  await page.goto('/books')
  const booksList = page.getByRole('list', { name: 'Popular Books' })
  const books = booksList.getByRole('listitem')
  const count = await books.count()

  for (let i = 0; i < count; ++i) {
    const book = books.nth(i)

    await expect(book.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(book.getByRole('link')).toBeVisible()
    await expect(book.getByRole('img')).toBeVisible()
  }
})
