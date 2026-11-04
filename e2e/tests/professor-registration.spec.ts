/**
 * Professor registration, end to end: Keycloak sign-up, the verification email, the professor wizard, and
 * what profile-service and Keycloak store at the end.
 */
import type { Page } from '@playwright/test'
import { test, expect } from '../support/fixtures'
import { bankAccounts, professorProfile } from '../support/db'
import { createVerifiedUser, findUserByEmail, realmRolesOf, userToken } from '../support/keycloak'
import {
  ADDRESS,
  chooseRole,
  createProfessorProfile,
  fillAddressStep,
  logIn,
  newPerson,
  photoRequiredMessage,
  pickOption,
  signUpToWizard,
  tokenClaims,
  uploadPhoto
} from '../support/registration'
import { GOOGLE_PHOTO_URL } from '../support/stack'

const IBAN = 'RO49AAAA1B31007593840000'

// Each test uses its own name, so invitation codes (made from the name) do not depend on earlier runs
let names = 0
const uniqueName = () => `Conf. Dr. E2E Ionescu ${Date.now().toString(36)}${++names}`

const fillProfessorProfileStep = async (page: Page, fullName: string) => {
  await page.getByPlaceholder('Conf. Dr. Ing. Popescu Ion').fill(fullName)
  await page.getByPlaceholder('740123123').fill('722000222')
  await pickOption(page, 'university')
  await pickOption(page, 'speciality')
}

const next = (page: Page) => page.getByRole('button', { name: 'Următorul pas' }).click()
const skip = (page: Page) => page.getByRole('button', { name: 'Săriți acest pas' }).click()
const finish = (page: Page) => page.getByRole('button', { name: 'Finalizare înregistrare' }).click()
const bankStep = (page: Page) => page.getByPlaceholder('RO49AAAA1B31007593840000')
const professorHome = /\/acl\/?$/

test.describe('Professor registration', () => {
  test('a professor with a photo, a bank account and an address gets a full profile', async ({ page }) => {
    const fullName = uniqueName()
    const person = newPerson('professor')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)

    await bankStep(page).fill(IBAN)
    await page.getByPlaceholder('Banca Transilvania').fill('Banca E2E')
    await page.getByPlaceholder('Numele Dvs. Complet').fill('Ionescu E2E')
    await page.getByPlaceholder('BTRLRO22').fill('BTRLRO22')
    await next(page)

    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(professorHome)

    const claims = await tokenClaims(page)
    expect(claims?.roles).toContain('PROFESSOR')
    expect(claims?.profileCompleted).toBeTruthy()

    const user = await findUserByEmail(person.email)
    expect(await realmRolesOf(user!.id)).toContain('PROFESSOR')
    const pictureId = user?.attributes?.pictureId?.[0]
    expect(pictureId).toBeTruthy()

    const profile = professorProfile(user!.id)
    expect(profile).toMatchObject({ picture: pictureId, full_name: fullName, city: ADDRESS.city, street: ADDRESS.street })
    expect(profile?.invitation_code, 'every professor gets an invitation code').toBeTruthy()
    expect(bankAccounts(user!.id)).toEqual([
      { iban: IBAN, bank_name: 'Banca E2E', account_holder_name: 'Ionescu E2E', swift_code: 'BTRLRO22' }
    ])
  })

  test('without a photo the professor cannot continue', async ({ page }) => {
    const fullName = uniqueName()
    const person = newPerson('profnophoto')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    await next(page)

    await expect(photoRequiredMessage(page)).toBeVisible()
    await expect(bankStep(page)).toHaveCount(0)
    const user = await findUserByEmail(person.email)
    expect(professorProfile(user!.id)).toBeNull()
  })

  test('bank details can be skipped', async ({ page }) => {
    const fullName = uniqueName()
    const person = newPerson('profskip')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await skip(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(professorHome)

    const user = await findUserByEmail(person.email)
    expect(professorProfile(user!.id)).toMatchObject({ full_name: fullName, city: ADDRESS.city })
    expect(bankAccounts(user!.id)).toEqual([])
  })

  test('the address is required: an empty one is not sent', async ({ page }) => {
    const fullName = uniqueName()
    const person = newPerson('profnoaddress')
    const creates: number[] = []
    page.on('request', request => {
      if (request.url().includes('/professor-profile/create')) creates.push(1)
    })
    await signUpToWizard(page, person)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await skip(page)

    // The backend cannot store a professor without an address, so the step offers no skip
    await expect(page.getByRole('button', { name: 'Săriți acest pas' })).toHaveCount(0)
    await finish(page)
    await expect(page.getByText('Acest câmp este obligatoriu.').first()).toBeVisible()
    await expect(page.getByText('Eroare la crearea profilului de profesor')).toHaveCount(0)
    expect(creates).toEqual([])

    const user = await findUserByEmail(person.email)
    expect(professorProfile(user!.id)).toBeNull()
  })

  test('an invalid IBAN keeps the professor on the bank step', async ({ page }) => {
    const fullName = uniqueName()
    await signUpToWizard(page, newPerson('profiban'))
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await bankStep(page).fill('RO49 1234')
    await next(page)

    await expect(page.getByText(/IBAN/).filter({ hasText: /caractere|invalid/ })).toBeVisible()
    await expect(bankStep(page)).toBeVisible()
  })

  test('a Google account professor uses the Google photo', async ({ page }) => {
    const fullName = uniqueName()
    const person = newPerson('profgoogle')
    const user = await createVerifiedUser({ ...person, attributes: { picture: [GOOGLE_PHOTO_URL] } })

    await logIn(page, person.email)
    await chooseRole(page, 'Profesor')
    await expect(page.getByText('Încarcă fotografia ta aici')).toHaveCount(0)
    await fillProfessorProfileStep(page, fullName)
    await next(page)
    await skip(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(professorHome)

    expect(await realmRolesOf(user.id)).toContain('PROFESSOR')
    expect(professorProfile(user.id)).toMatchObject({ full_name: fullName })
  })

  test('a second professor with the same name gets a different invitation code', async ({ page }) => {
    const fullName = uniqueName()
    const first = newPerson('samename1')
    const firstUser = await createVerifiedUser(first)
    await createProfessorProfile(await userToken(first.email), fullName)

    const second = newPerson('samename2')
    await signUpToWizard(page, second)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await skip(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(professorHome)

    const secondUser = await findUserByEmail(second.email)
    const firstCode = professorProfile(firstUser.id)?.invitation_code
    const secondCode = professorProfile(secondUser!.id)?.invitation_code
    expect(secondCode).toBeTruthy()
    expect(secondCode).not.toBe(firstCode)
    expect(secondCode).toBe(secondCode.toLowerCase())
  })

  test('a professor with a long name and academic titles can register', async ({ page }) => {
    // Invitation codes are made from the name and the column holds 30 characters
    const fullName = `Conf. Univ. Dr. Ing. Maria-Alexandra Popescu-Ionescu ${Date.now().toString(36)}`
    const person = newPerson('longname')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Profesor')
    await fillProfessorProfileStep(page, fullName)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await skip(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(professorHome)

    const user = await findUserByEmail(person.email)
    const profile = professorProfile(user!.id)
    expect(profile?.full_name).toBe(fullName)
    expect(profile?.invitation_code?.length).toBeLessThanOrEqual(30)
  })
})
