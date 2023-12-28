import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

const fullName = faker.person.fullName()
const email = faker.internet.email({ firstName: fullName.split(' ')[0], lastName: fullName.split(' ')[1] })
const password = faker.internet.password()

test.describe('Testing sign up error handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
    await page.getByRole('link', { name: 'Sign Up' }).click()
  })

  test('has field errors when empty form is submitted', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign up form' })
    await expect(form).toBeAttached()

    await expect(form.getByLabel('Full Name')).toBeAttached()
    await expect(form.getByLabel('Email')).toBeAttached()
    await expect(form.getByLabel('Password', { exact: true })).toBeAttached()
    await expect(form.getByLabel('Confirm Password')).toBeAttached()

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
    await expect(form).toBeAttached()

    const fullnameInput = form.getByLabel('Full Name')
    await fullnameInput.fill(fullName)

    const emailInput = form.getByLabel('Email')
    await emailInput.fill(email)

    const passwordInput = form.getByLabel('Password', { exact: true })
    await passwordInput.fill(password)

    const confirmPasswordInput = form.getByLabel('Confirm Password')
    await confirmPasswordInput.fill(password.slice(0, -1))

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const passwordError = page.getByRole('alert')
    await expect(passwordError).toBeAttached()
    await expect(passwordError).toContainText("Passwords don't match")
  })
})

test.describe('Testing sign in error handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test('has field errors when empty form is submitted', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign in form' })
    await expect(form).toBeAttached()

    await expect(form.getByLabel('Email')).toBeAttached()
    await expect(form.getByLabel('Password')).toBeAttached()

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const fieldErrors = page.getByRole('alert')
    await expect(fieldErrors).toHaveCount(2)
    await expect(fieldErrors.nth(0)).toContainText('Invalid email')
    await expect(fieldErrors.nth(1)).toContainText('Password must contain at least 6 characters')
  })

  test('has form error when sign in fails', async ({ page }) => {
    const form = page.getByRole('form', { name: 'sign in form' })
    await expect(form).toBeAttached()

    const emailInput = form.getByLabel('Email')
    await emailInput.fill(email)

    const passwordInput = form.getByLabel('Password')
    await passwordInput.fill(password.slice(0, -1))

    const submitButton = form.getByRole('button', { name: 'Submit' })
    await submitButton.click()

    const formError = page.getByRole('alert')
    await expect(formError).toBeAttached()
    await expect(formError).toContainText('Email/Password combination is incorrect')
  })
})

test('signs up, signs out and signs back in', async ({ page }) => {
  await page.goto('/auth')
  await page.getByRole('link', { name: 'Sign Up' }).click()

  // Sign up
  let form = page.getByRole('form', { name: 'sign up form' })
  await expect(form).toBeAttached()

  const fullnameInput = form.getByLabel('Full Name')
  await fullnameInput.fill(fullName)

  let emailInput = form.getByLabel('Email')
  await emailInput.fill(email)

  let passwordInput = form.getByLabel('Password', { exact: true })
  await passwordInput.fill(password)

  const confirmPasswordInput = form.getByLabel('Confirm Password')
  await confirmPasswordInput.fill(password)

  let submitButton = form.getByRole('button', { name: 'Submit' })
  await submitButton.click()

  await page.waitForURL('/')

  // Sign out
  await page.goto('/auth')
  form = page.getByRole('form', { name: 'sign out form' })
  submitButton = form.getByRole('button', { name: 'Logout' })
  await submitButton.click()

  await page.waitForURL('/auth')

  // Sign in
  form = page.getByRole('form', { name: 'sign in form' })
  await expect(form).toBeAttached()

  emailInput = form.getByLabel('Email')
  await emailInput.fill(email)

  passwordInput = form.getByLabel('Password')
  await passwordInput.fill(password)

  submitButton = form.getByRole('button', { name: 'Submit' })
  await submitButton.click()

  await page.waitForURL('/')
})
