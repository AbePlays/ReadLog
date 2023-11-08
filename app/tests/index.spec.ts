import { expect, test } from './utils'

test('has a link to the books route', async ({ page, login }) => {
  await login()
  await page.goto('/')
  const booksLink = page.getByRole('link', { name: 'Checkout Popular Books' })
  await expect(booksLink).toHaveAttribute('href', '/books')
  await expect(booksLink).toBeAttached()
})
