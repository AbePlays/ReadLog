import { expect, test } from './utils'

test('should redirect to auth page for unauthorized users', async ({ page }) => {
  await page.goto('/library')
  await expect(page).toHaveURL('/auth')
})

test('has tabs present', async ({ login, page }) => {
  await login()
  await page.goto('/library')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your Library')

  const tabList = page.getByRole('tablist', { name: 'Manage your library' })
  await expect(tabList).toBeVisible()
  expect(await tabList.getByRole('tab').count()).toBe(3)
})

test('has books present for logged in user', async ({ addBook, login, page }) => {
  const { id } = await login()
  await page.goto('/library')

  await expect(page.getByText('No Books Found')).toBeVisible()

  await addBook(id)
  await page.reload()

  const tabPanel = page.getByRole('tabpanel')
  await expect(tabPanel.getByRole('listitem')).toBeVisible()
  expect(await tabPanel.getByRole('listitem').count()).toBe(1)
})
