import { expect, test } from './utils'

test('has a back button on the page', async ({ page }) => {
  await page.goto('/books/z-h8EAAAQBAJ')
  const booksLink = page.getByRole('button', { name: 'Back' })
  await expect(booksLink).toBeVisible()
})

test('has book details on the page', async ({ page }) => {
  await page.goto('/books/z-h8EAAAQBAJ')
  await expect(page.getByRole('img')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText('Synopsis')).toBeVisible()
  await expect(page.getByRole('paragraph').first()).toBeVisible()
})

test('has book details on the page for logged in user', async ({ login, page }) => {
  await login()
  await page.goto('/library')

  let booksList = page.getByRole('list', { name: 'Your ReadLog Library' })
  let books = booksList.getByRole('listitem')
  expect(await books.count()).toBe(0)

  await page.goto('/books')
  booksList = page.getByRole('list', { name: 'Popular Books' })
  books = booksList.getByRole('listitem')
  await books.first().click()

  // Check cancel functionality
  await page.getByText('Start Reading').click()
  await page.waitForTimeout(2000)
  await page.getByText('00:02').click()
  page.getByText('Update Reading Progress')

  await page.getByLabel('Page Number').fill('10')
  await page.getByRole('button', { name: 'Cancel' }).click()

  // Check submit functionality
  await page.getByText('Start Reading').click()
  await page.waitForTimeout(2000)
  await page.getByText('00:02').click()
  page.getByText('Update Reading Progress')

  await page.getByLabel('Page Number').fill('10')
  await page.getByRole('button', { name: 'Submit' }).click()

  await page.waitForResponse((res) => res.url().includes('books'))

  await page.goto('/library')
  booksList = page.getByRole('list', { name: 'Your ReadLog Library' })
  books = booksList.getByRole('listitem')
  expect(await books.count()).toBe(1)
})
