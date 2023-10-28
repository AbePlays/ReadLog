import { expect, test } from '@playwright/test'

test('has a link to the books route', async ({ page }) => {
  await page.goto('/')
  const booksLink = page.getByRole('link', { name: 'Checkout Popular Books' })
  await expect(booksLink).toHaveAttribute('href', '/books')
  await expect(booksLink).toBeAttached()
})
