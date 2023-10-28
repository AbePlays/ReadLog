import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/books/z-h8EAAAQBAJ')
})

test('has a link back to books route', async ({ page }) => {
  const booksLink = page.getByRole('link', { name: 'Back to Books' })
  await expect(booksLink).toHaveAttribute('href', '/books')
})

test('has book details on the page', async ({ page }) => {
  await expect(page.getByRole('img')).toBeAttached()
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached()
  await expect(page.getByText('Number of Pages')).toBeAttached()
  await expect(page.getByRole('paragraph').first()).toBeAttached()
})
