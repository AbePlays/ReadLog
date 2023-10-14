import { expect, test } from '@playwright/test'

test.describe('Testing sign in feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test('has field errors when empty form is submitted', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign in form' })
    await expect(form).toBeInViewport()

    await expect(form.getByLabel('Email')).toBeVisible()
    await expect(form.getByLabel('Password')).toBeVisible()

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const fieldErrors = page.getByRole('alert')
    await expect(fieldErrors).toHaveCount(2)
    await expect(fieldErrors.nth(0)).toContainText('Invalid email')
    await expect(fieldErrors.nth(1)).toContainText('Password must contain at least 6 characters')
  })

  test('has form error when sign in fails', async ({ page }) => {
    await page.route('auth?_data=routes%2Fauth._index', async (route) => {
      setTimeout(async () => {
        await route.fulfill({ json: { errors: { form: 'Email/Password combination is incorrect' } } })
      }, 1000)
    })

    const form = page.getByRole('form', { name: 'sign in form' })
    await expect(form).toBeInViewport()

    const emailInput = form.getByLabel('Email')
    await emailInput.fill('a@b.com')

    const passwordInput = form.getByLabel('Password')
    await passwordInput.fill('123456')

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    await expect(emailInput).toBeDisabled()
    await expect(passwordInput).toBeDisabled()
    await expect(submitButton).toBeDisabled()

    const formError = page.getByRole('alert')
    await expect(formError).toBeInViewport()
    await expect(formError).toContainText('Email/Password combination is incorrect')
  })
})

test.describe('Testing sign up feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
    await page.getByLabel('Sign Up').check()
  })

  test('has field errors when empty form is submitted', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign up form' })
    await expect(form).toBeInViewport()

    await expect(form.getByLabel('Fullname')).toBeVisible()
    await expect(form.getByLabel('Email')).toBeVisible()
    await expect(form.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(form.getByLabel('Confirm Password')).toBeVisible()

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const fieldErrors = page.getByRole('alert')
    await expect(fieldErrors).toHaveCount(4)
    await expect(fieldErrors.nth(0)).toContainText('Fullname must contain at least 2 characters')
    await expect(fieldErrors.nth(1)).toContainText('Invalid email')
    await expect(fieldErrors.nth(2)).toContainText('Password must contain at least 6 characters')
    await expect(fieldErrors.nth(3)).toContainText('Password must contain at least 6 characters')
  })

  test('has show password error when incorrect passwords are submitted', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign up form' })
    await expect(form).toBeInViewport()

    const fullnameInput = form.getByLabel('Fullname')
    await fullnameInput.fill('Abe')

    const emailInput = form.getByLabel('Email')
    await emailInput.fill('a@b.com')

    const passwordInput = form.getByLabel('Password', { exact: true })
    await passwordInput.fill('123456')

    const confirmPasswordInput = form.getByLabel('Confirm Password')
    await confirmPasswordInput.fill('1234567')

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const passwordError = page.getByRole('alert')
    await expect(passwordError).toBeInViewport()
    await expect(passwordError).toContainText("Passwords don't match")
  })
})
