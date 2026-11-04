/**
 * Steps of the sign-up flow, as a person does them: the Keycloak pages, the email, the app's wizard.
 */
import type { Page } from '@playwright/test'
import { expect } from './fixtures'
import { verificationLink } from './mailpit'
import { KEYCLOAK_URL, PASSWORD, PHOTO, PROFILE_SERVICE_URL, REALM } from './stack'

export interface Person {
  email: string
  firstName: string
  lastName: string
}

let counter = 0

/** A new person with an address nobody has used. */
export const newPerson = (tag: string): Person => ({
  email: `e2e.${tag}.${Date.now()}.${++counter}@e-mentor.test`,
  firstName: 'Ioana',
  lastName: `Test ${tag}`
})

// ---------- Keycloak ----------

export const openKeycloakLogin = async (page: Page) => {
  await page.goto('/login')
  await page.waitForURL(url => url.href.startsWith(`${KEYCLOAK_URL}/realms/${REALM}/`))
}

export const fillKeycloakRegistration = async (page: Page, person: Person, password = PASSWORD) => {
  await openKeycloakLogin(page)
  await page.getByRole('link', { name: 'Register' }).click()
  await page.locator('#email').fill(person.email)
  await page.locator('#password').fill(password)
  await page.locator('#password-confirm').fill(password)
  await page.locator('#firstName').fill(person.firstName)
  await page.locator('#lastName').fill(person.lastName)
  await page.getByRole('button', { name: 'Register' }).click()
}

export const verifyEmailFromInbox = async (page: Page, email: string) => {
  await page.goto(await verificationLink(email))
}

/** Sign up, confirm the email and land on the app's role choice. */
export const signUpToWizard = async (page: Page, person: Person) => {
  await fillKeycloakRegistration(page, person)
  await expect(page.getByText('You need to verify your email address')).toBeVisible()
  await verifyEmailFromInbox(page, person.email)
  await expect(page.getByRole('heading', { name: 'Alegeți rolul dvs.' })).toBeVisible()
}

export const logIn = async (page: Page, email: string, password = PASSWORD) => {
  await openKeycloakLogin(page)
  await page.locator('#username').fill(email)
  await page.locator('#password').fill(password)
  await page.locator('#kc-login').click()
}

// ---------- the app's wizard ----------

export const chooseRole = async (page: Page, role: 'Student' | 'Profesor') => {
  await page.getByText(role, { exact: true }).click()
}

/** Choose an option of the select whose hidden input has this name; the first real option by default. */
export const pickOption = async (page: Page, inputName: string, option?: string): Promise<string> => {
  await page.locator('.MuiInputBase-root', { has: page.locator(`input[name="${inputName}"]`) }).getByRole('combobox').click()
  const choice = option ? page.getByRole('option', { name: option, exact: true }) : page.getByRole('option').nth(1)
  const text = await choice.innerText()
  await choice.click()

  return text.trim()
}

export const PERSONAL = {
  phone: '722000111',
  school: 'Liceul E2E',
  grade: '9.5'
}

export const fillStudentPersonalStep = async (page: Page, values: Partial<typeof PERSONAL> = {}) => {
  const v = { ...PERSONAL, ...values }
  await page.getByPlaceholder('740123123').fill(v.phone)
  await pickOption(page, 'university')
  await pickOption(page, 'speciality')
  await pickOption(page, 'schoolDomain', 'Real')
  await pickOption(page, 'schoolSpeciality', 'Stiinte ale Naturii')
  await page.getByPlaceholder('Colegiul Național "Gheorghe Lazăr"').fill(v.school)
  await page.getByPlaceholder('9.99').fill(v.grade)
}

/** Choose the photo, crop it and wait for the upload; returns the upload's HTTP status. */
export const uploadPhoto = async (page: Page): Promise<number> => {
  const upload = page.waitForResponse(response => response.url().includes('/profile-image/upload'))
  await page.locator('input[type=file]').setInputFiles(PHOTO)
  await page.getByRole('button', { name: 'Crop' }).click()

  return (await upload).status()
}

export const ADDRESS = { city: 'București', street: 'Strada Testelor', number: '12' }

export const fillAddressStep = async (page: Page) => {
  await pickOption(page, 'countyId')
  await page.getByPlaceholder('București').fill(ADDRESS.city)
  await page.getByPlaceholder('Bulevardul Unirii').fill(ADDRESS.street)
  await page.getByPlaceholder('124').fill(ADDRESS.number)
}

export const personalStepVisible = (page: Page) => page.getByRole('heading', { name: 'Informații personale' })
export const addressStepVisible = (page: Page) => page.getByRole('button', { name: 'Finalizare cont' })
export const photoRequiredMessage = (page: Page) => page.getByText('Fotografia de profil este obligatorie.')

/** The claims of the access token the app holds. */
export const tokenClaims = (page: Page) =>
  page.evaluate(() => {
    const token = window.localStorage.getItem('accessToken')
    if (!token) return null
    const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))

    return {
      sub: claims.sub as string,
      roles: (claims.realm_access?.roles || []) as string[],
      profileCompleted: claims.profile_completed,
      picture: claims.picture as string | undefined
    }
  })

// ---------- setup through the API ----------

/** profile-service's lists of universities and specialities. */
export const prerequisites = async (token: string) => {
  const response = await fetch(`${PROFILE_SERVICE_URL}/student-profile/profile-prerequire`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) throw new Error(`profile-prerequire: ${response.status}`)

  return response.json()
}

export const createProfessorProfile = async (token: string, fullName: string) => {
  const { universities, counties } = await prerequisites(token)
  const university = universities[0]
  const response = await fetch(`${PROFILE_SERVICE_URL}/professor-profile/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      universityId: university.id,
      specialityId: university.specialities[0].specialityId,
      address: { countyId: counties[0].id, city: ADDRESS.city, street: ADDRESS.street, number: ADDRESS.number },
      bankAccounts: []
    })
  })
  if (!response.ok) throw new Error(`professor-profile/create: ${response.status} ${await response.text()}`)
}
