import { expect, test } from '@playwright/test'

test('has books list when search is performed', async ({ page }) => {
  await page.goto('/search')
  await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible()
  await expect(page.getByLabel('Search books')).toBeVisible()
  const booksList = page.getByRole('list', { name: 'Search Results' })
  const books = booksList.getByRole('listitem')
  await expect(books).toHaveCount(0)

  const searchInput = page.getByLabel('Search books')
  await searchInput.fill('Summer Rain')
  await page.keyboard.press('Enter')

  await expect(page.getByTestId('loader')).toBeAttached()
  await expect(page.getByTestId('loader')).not.toBeAttached()

  const booksCount = await books.count()

  for (let i = 0; i < booksCount; ++i) {
    const book = books.nth(i)
    await expect(book.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(book.getByRole('link')).toBeVisible()
    await expect(book.getByRole('img')).toBeVisible()
  }
})

test('has pagination present', async ({ page }) => {
  await page.goto('/search')

  const searchInput = page.getByLabel('Search books')
  await searchInput.fill('Summer Rain')
  await searchInput.press('Enter')

  const pagination = page.getByRole('navigation', { name: 'Pagination' })
  let prevLink = pagination.getByLabel('Go to Page 0')
  await expect(pagination.getByText('Page 1', { exact: true })).toBeVisible()
  let nextLink = pagination.getByLabel('Go to Page 2')

  await expect(prevLink).toBeDisabled()
  await nextLink.click()

  prevLink = pagination.getByLabel('Go to Page 1')
  await expect(prevLink).toBeVisible()
  await expect(prevLink).toBeEnabled()
  await expect(pagination.getByText('Page 2', { exact: true })).toBeVisible()
  nextLink = pagination.getByLabel('Go to Page 3')
  await expect(nextLink).toBeVisible()
})
