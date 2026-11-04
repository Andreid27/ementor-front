/**
 * Student registration, end to end: Keycloak sign-up, the verification email, the app's wizard, and what
 * profile-service and Keycloak store at the end.
 */
import { test, expect, blockProduction } from '../support/fixtures'
import { studentProfile, professorProfile, relationship } from '../support/db'
import { createVerifiedUser, findUserByEmail, realmRolesOf, userToken } from '../support/keycloak'
import {
  ADDRESS,
  PERSONAL,
  addressStepVisible,
  chooseRole,
  createProfessorProfile,
  fillAddressStep,
  fillKeycloakRegistration,
  fillStudentPersonalStep,
  logIn,
  newPerson,
  personalStepVisible,
  photoRequiredMessage,
  signUpToWizard,
  tokenClaims,
  uploadPhoto
} from '../support/registration'
import { GOOGLE_PHOTO_URL } from '../support/stack'

const skipInvitation = (page: any) => page.getByRole('button', { name: 'Săriți acest pas' }).click()
const next = (page: any) => page.getByRole('button', { name: 'Următorul pas' }).click()
const finish = (page: any) => page.getByRole('button', { name: 'Finalizare cont' }).click()
const dashboard = /\/dashboards\/analytics\/?$/

test.describe('Student registration', () => {
  test('email sign-up with a photo creates the student profile', async ({ page }) => {
    const person = newPerson('student')
    const ownThumbnail: number[] = []
    page.on('response', response => {
      if (new URL(response.url()).pathname.replace(/\/$/, '') === '/thumbnail/download') ownThumbnail.push(response.status())
    })

    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(dashboard)

    const claims = await tokenClaims(page)
    expect(claims?.roles).toContain('STUDENT')
    expect(claims?.profileCompleted).toBeTruthy()

    const user = await findUserByEmail(person.email)
    expect(user?.emailVerified).toBe(true)
    expect(await realmRolesOf(user!.id)).toContain('STUDENT')
    const pictureId = user?.attributes?.pictureId?.[0]
    expect(pictureId, 'Keycloak keeps the uploaded photo id').toBeTruthy()

    const profile = studentProfile(user!.id)
    expect(profile).toMatchObject({
      picture: pictureId,
      picture_url: null,
      school: PERSONAL.school,
      school_grade: 9.5,
      school_domain: 'REAL',
      school_speciality: 'NATURAL_SCIENCES',
      phone: `+40${PERSONAL.phone}`,
      city: ADDRESS.city,
      street: ADDRESS.street,
      number: ADDRESS.number
    })

    // The new student's own photo loads in the top bar
    await expect.poll(() => ownThumbnail).toContain(200)
  })

  test('without a photo the student cannot leave the personal step', async ({ page }) => {
    const person = newPerson('nophoto')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)
    await next(page)

    await expect(photoRequiredMessage(page)).toBeVisible()
    await expect(personalStepVisible(page)).toBeVisible()
    await expect(addressStepVisible(page)).toHaveCount(0)

    const user = await findUserByEmail(person.email)
    expect(await realmRolesOf(user!.id)).not.toContain('STUDENT')
    expect(studentProfile(user!.id)).toBeNull()
  })

  test('a Google account uses its Google photo and needs no upload', async ({ page }) => {
    const person = newPerson('google')
    const user = await createVerifiedUser({ ...person, attributes: { picture: [GOOGLE_PHOTO_URL] } })

    await logIn(page, person.email)
    await expect(page.getByRole('heading', { name: 'Alegeți rolul dvs.' })).toBeVisible()
    expect((await tokenClaims(page))?.picture).toBe(GOOGLE_PHOTO_URL)

    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await expect(page.getByText('Încarcă fotografia ta aici')).toHaveCount(0)
    await fillStudentPersonalStep(page)
    await next(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(dashboard)

    expect(studentProfile(user.id)).toMatchObject({ picture: null, picture_url: GOOGLE_PHOTO_URL })
    expect(await realmRolesOf(user.id)).toContain('STUDENT')
  })

  test('a valid invitation code connects the student to the professor', async ({ page }) => {
    const professor = newPerson('inviter')
    const professorUser = await createVerifiedUser(professor)
    const professorName = `Conf. Dr. E2E Inviter ${Date.now().toString(36)}`
    await createProfessorProfile(await userToken(professor.email), professorName)
    const code = professorProfile(professorUser.id)?.invitation_code
    expect(code, 'the professor got an invitation code').toBeTruthy()

    const person = newPerson('invited')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await page.getByLabel('Cod de invitație').fill(code)
    await page.getByRole('button', { name: 'Verifică codul' }).click()
    await expect(page.getByText(professorName)).toBeVisible()
    await page.getByRole('button', { name: 'Continuați cu acest profesor' }).click()
    await fillStudentPersonalStep(page)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await fillAddressStep(page)
    await finish(page)
    await page.waitForURL(dashboard)

    const user = await findUserByEmail(person.email)
    expect(relationship(user!.id, professorUser.id), 'the student is linked to the professor').not.toBeNull()
  })

  test('an unknown invitation code is refused and the step can be skipped', async ({ page }) => {
    await signUpToWizard(page, newPerson('badcode'))
    await chooseRole(page, 'Student')
    await page.getByLabel('Cod de invitație').fill('cod-inexistent-e2e')
    await page.getByRole('button', { name: 'Verifică codul' }).click()

    await expect(page.getByText('Cod invalid. Verificați codul și încercați din nou.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuați cu acest profesor' })).toHaveCount(0)
    await skipInvitation(page)
    await expect(personalStepVisible(page)).toBeVisible()
  })

  test('an invalid phone number and grade keep the student on the personal step', async ({ page }) => {
    await signUpToWizard(page, newPerson('invalid'))
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page, { phone: '12345', grade: '11' })
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)

    await expect(page.getByText('Acest număr de telefon nu este valid.')).toBeVisible()
    await expect(page.getByText('Nota trebuie să fie între 1 și 10.')).toBeVisible()
    await expect(addressStepVisible(page)).toHaveCount(0)
  })

  test('going back from the address step keeps the answers and saves nothing', async ({ page }) => {
    const person = newPerson('back')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await fillAddressStep(page)
    await page.getByRole('button', { name: 'Previous' }).click()

    await expect(personalStepVisible(page)).toBeVisible()
    await expect(page.getByPlaceholder('740123123')).toHaveValue(PERSONAL.phone)
    await expect(page.getByPlaceholder('Colegiul Național "Gheorghe Lazăr"')).toHaveValue(PERSONAL.school)
    await expect(page.getByPlaceholder('9.99')).toHaveValue(PERSONAL.grade)

    // Going back must not register the student
    await page.waitForTimeout(2_000)
    const user = await findUserByEmail(person.email)
    expect(studentProfile(user!.id)).toBeNull()

    // The uploaded photo is still there: no new upload is needed to move on
    await next(page)
    await expect(addressStepVisible(page)).toBeVisible()
  })

  test('a failed save shows an error and the student can try again', async ({ page }) => {
    const person = newPerson('retry')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await fillAddressStep(page)

    await page.route('**/student-profile/create', route => route.fulfill({ status: 500, body: '{}' }))
    await finish(page)
    await expect(page.getByText('Eroare la crearea profilului')).toBeVisible()
    await expect(addressStepVisible(page)).toBeVisible()

    await page.unroute('**/student-profile/create')
    await finish(page)
    await page.waitForURL(dashboard)
    const user = await findUserByEmail(person.email)
    expect(studentProfile(user!.id)).not.toBeNull()
  })

  test('an empty address is not sent', async ({ page }) => {
    const person = newPerson('noaddress')
    const creates: number[] = []
    page.on('request', request => {
      if (request.url().includes('/student-profile/create')) creates.push(1)
    })
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)
    expect(await uploadPhoto(page)).toBe(200)
    await next(page)
    await finish(page)

    await expect(page.getByText('Acest câmp este obligatoriu.').first()).toBeVisible()
    await expect(page.getByText('Eroare la crearea profilului')).toHaveCount(0)
    await expect(addressStepVisible(page)).toBeVisible()
    expect(creates).toEqual([])
    const user = await findUserByEmail(person.email)
    expect(studentProfile(user!.id)).toBeNull()
  })

  test('a failed photo upload does not count as a photo', async ({ page }) => {
    await signUpToWizard(page, newPerson('uploadfail'))
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await fillStudentPersonalStep(page)

    await page.route('**/profile-image/upload', route => route.fulfill({ status: 500, body: '{}' }))
    expect(await uploadPhoto(page)).toBe(500)
    await next(page)

    await expect(photoRequiredMessage(page)).toBeVisible()
    await expect(addressStepVisible(page)).toHaveCount(0)
  })

  test('a student who leaves halfway is brought back to the wizard on the next login', async ({ page }) => {
    const person = newPerson('resume')
    await signUpToWizard(page, person)
    await chooseRole(page, 'Student')
    await skipInvitation(page)
    await page.getByRole('button', { name: 'Sign Out' }).click()
    // The app goes through /login to Keycloak; wait for the login form rather than for one of the URLs
    await expect(page.locator('#kc-login')).toBeVisible()

    await logIn(page, person.email)
    await expect(page.getByRole('heading', { name: 'Alegeți rolul dvs.' })).toBeVisible()
  })

  test('an unconfirmed email cannot reach the app', async ({ page, browser }) => {
    const person = newPerson('unverified')
    await fillKeycloakRegistration(page, person)
    await expect(page.getByText('You need to verify your email address')).toBeVisible()

    // A fresh browser, as if the person came back later without opening the email
    const context = await browser.newContext()
    await blockProduction(context)
    const later = await context.newPage()
    await logIn(later, person.email)
    await expect(later.getByText('You need to verify your email address')).toBeVisible()
    expect(later.url()).not.toContain('localhost:3000')
    await context.close()
  })

  test('an email that already has an account cannot sign up again', async ({ page }) => {
    const person = newPerson('duplicate')
    await createVerifiedUser(person)
    await fillKeycloakRegistration(page, person)

    await expect(page.getByText('Email already exists.')).toBeVisible()
  })
})
