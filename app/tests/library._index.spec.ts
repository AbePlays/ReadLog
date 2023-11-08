import { expect, test } from './utils'

test('should redirect to auth page for unauthorized users', async ({ page }) => {
  await page.goto('/library')
  await expect(page).toHaveURL('/auth')
})

test('has books present for logged in user', async ({ addBook, login, page }) => {
  const { id } = await login()
  await page.goto('/library')

  let booksList = page.getByRole('list', { name: 'Your ReadLog Library' })
  let books = booksList.getByRole('listitem')
  expect(await books.count()).toBe(0)

  await addBook(id)
  await page.reload()

  booksList = page.getByRole('list', { name: 'Your ReadLog Library' })
  books = booksList.getByRole('listitem')
  expect(await books.count()).toBe(1)
})
