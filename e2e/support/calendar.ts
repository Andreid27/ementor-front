/**
 * Setup for the calendar scenarios, done through the local profile-service as the professor: a professor,
 * students in their class with a price each, and events with those students on them. Plus read-only checks
 * on what a finished event stored and charged.
 */
import type { Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { expect } from './fixtures'
import { createVerifiedUser, removeRealmRoles, userToken } from './keycloak'
import { ADDRESS, createProfessorProfile, logIn, newPerson, prerequisites, type Person } from './registration'
import { BACKEND_DIR, E2E_DATABASE, POSTGRES_CONTAINER, PROFILE_SERVICE_URL } from './stack'

export interface Professor extends Person {
  id: string
  token: string
}

export interface Student extends Person {
  id: string
  name: string
}

const api = async (token: string, method: string, path: string, body?: unknown): Promise<any> => {
  const response = await fetch(`${PROFILE_SERVICE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text}`)

  return text ? JSON.parse(text) : null
}

export const createProfessor = async (): Promise<Professor> => {
  const person = newPerson('calendar-prof')
  const user = await createVerifiedUser(person)
  await createProfessorProfile(await userToken(person.email), `${person.firstName} ${person.lastName}`)

  // profile-service acts on the first realm role in the token, and the realm's default role (which brings
  // STUDENT) can come before PROFESSOR; without it the professor's calls are refused as a student's
  await removeRealmRoles(user.id, ['default-roles-e-mentor'])

  // A fresh token carries the professor role the profile just gave the account
  const professor = { ...person, id: user.id, token: await userToken(person.email) }
  giveSubscription(professor)

  return professor
}

const createStudentProfile = async (token: string) => {
  const { universities, counties } = await prerequisites(token)
  const university = universities[0]
  await api(token, 'POST', '/student-profile/create', {
    universityId: university.id,
    specialityId: university.specialities[0].specialityId,
    desiredExamDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
    school: 'Liceul E2E',
    schoolDomain: 'REAL',
    schoolSpeciality: 'NATURAL_SCIENCES',
    schoolGrade: 9.5,
    phone: '722000111',
    address: { countyId: counties[0].id, city: ADDRESS.city, street: ADDRESS.street, number: ADDRESS.number }
  })
}

/** A student with a finished profile, added to the professor's class at this price per session (none if null). */
export const addStudent = async (professor: Professor, firstName: string, price: number | null): Promise<Student> => {
  const person = { ...newPerson(`calendar-${firstName.toLowerCase()}`), firstName }
  const user = await createVerifiedUser(person)
  await createStudentProfile(await userToken(person.email))
  await api(professor.token, 'POST', '/student-professor-relationships/add-student-by-email', {
    studentEmail: person.email,
    ...(price === null ? {} : { defaultPricePerSession: price })
  })

  return { ...person, id: user.id, name: `${person.firstName} ${person.lastName}` }
}

export const deactivateStudent = (professor: Professor, student: Student) =>
  api(professor.token, 'DELETE', `/student-professor-relationships/${student.id}/${professor.id}`)

/** On the event at their usual price, or at a price set for them on this event. */
export const attendee = (student: Student, customPrice?: number) => ({
  attendeeId: student.id,
  expected: true,
  attended: false,
  hasCustomPricing: customPrice !== undefined,
  ...(customPrice === undefined ? {} : { customPrice })
})

/**
 * A few minutes from now: the backend refuses to create an event in the past, and the professor can finish
 * an event that has not started yet. It stays in today's cell of the month view unless run just before midnight.
 */
export const shortlyFromNow = (): Date => {
  const start = new Date(Date.now() + 5 * 60 * 1000)
  start.setSeconds(0, 0)

  return start
}

export const createSeries = (
  professor: Professor,
  event: { title: string; start: Date; price: number; attendees: ReturnType<typeof attendee>[] }
) =>
  api(professor.token, 'POST', '/events/series', {
    title: event.title,
    startTime: event.start.toISOString(),
    duration: 'PT1H',
    pattern: 'WEEKLY',
    price: event.price,
    eventAttendees: event.attendees
  })

export const createSingularEvent = (
  professor: Professor,
  event: { title: string; start: Date; price: number; attendees: ReturnType<typeof attendee>[] }
) =>
  api(professor.token, 'POST', '/events/singular', {
    title: event.title,
    startTime: event.start.toISOString(),
    duration: 'PT1H',
    price: event.price,
    eventAttendees: event.attendees
  })

// ---------- the calendar page ----------

/** Log in, land on the professor's home page as usual (it loads the class list), then open the calendar. */
export const openCalendarAs = async (page: Page, professor: Professor) => {
  const classList = page.waitForResponse(
    response => response.url().endsWith('/student-professor-relationships/students') && response.ok()
  )
  await logIn(page, professor.email)
  await page.waitForURL(url => url.pathname.startsWith('/acl'))
  await classList
  // The store is kept in localStorage; let it save the class list before the calendar page reloads it
  await page.waitForFunction(() => {
    const root = window.localStorage.getItem('persist:root')

    return Boolean(root && JSON.parse(JSON.parse(root).user).activeStudentsFetchedAt)
  })
  await page.goto('/apps/calendar')
}

export const openEvent = async (page: Page, title: string) => {
  await page.locator('.fc-event', { hasText: title }).first().click()
}

/** Open the finish wizard of the open event and go to its last step, the attendees. */
export const finishWizardToAttendees = async (page: Page) => {
  await page.getByRole('button', { name: 'Finalizează', exact: true }).click()
  await goToAttendeesStep(page)
}

/** The step labels of the finish wizard can be clicked once the (pre-filled) times are valid. */
export const goToAttendeesStep = async (page: Page) => {
  await page.getByText('Gestionează Participanții', { exact: true }).click()
  await expect(page.getByText('Gestionează Participanții la Eveniment')).toBeVisible()
}

/**
 * In the finish wizard, set when the event really ended (step 1, "Ore Reale & Durata"), typed into the date
 * field as the Romanian format shows it: DD.MM.YYYY HH:mm.
 */
export const setActualEnd = async (page: Page, end: Date) => {
  const two = (n: number) => String(n).padStart(2, '0')
  const digits = `${two(end.getDate())}${two(end.getMonth() + 1)}${end.getFullYear()}${two(end.getHours())}${two(
    end.getMinutes()
  )}`
  await page.getByText('Ore Reale & Durata', { exact: true }).click()
  // The field is split into sections (day, month, ...): start at the first and type each in turn
  await page.getByLabel('Ora Reală de Sfârșit').click()
  for (let section = 0; section < 5; section++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.type(digits, { delay: 50 })
}

/** In the finish wizard, turn on "adjust prices to the real duration" (step 3). */
export const adjustPricesToDuration = async (page: Page) => {
  await page.getByText('Ajustarea Prețurilor', { exact: true }).click()
  await page.getByLabel('Ajustează prețurile proporțional în funcție de durata reală').check()
}

/** The row of a student among the event's attendees: only those rows have a price field. */
export const attendeeRow = (page: Page, student: Student) =>
  page.locator('li', { hasText: student.name }).filter({ has: page.locator('input[type=number]') })

/** Add a student from the "Elevi Disponibili" list, opening it first if it is closed. */
export const addFromAvailable = async (page: Page, student: Student) => {
  const row = page.locator('li', { hasText: student.name }).filter({ hasNot: page.locator('input[type=number]') })
  if (!(await row.first().isVisible())) await page.getByText('Elevi Disponibili').click()
  await row.first().getByText(student.name).click()
  await expect(attendeeRow(page, student)).toBeVisible()
}

export const removeAttendee = async (page: Page, student: Student) => {
  await attendeeRow(page, student).getByRole('button').last().click()
  await expect(attendeeRow(page, student)).toHaveCount(0)
}

export const priceOf = (page: Page, student: Student) => attendeeRow(page, student).locator('input[type=number]')

// ---------- what was stored (read-only) ----------

const databaseUser = (): string => {
  const env = readFileSync(`${BACKEND_DIR}/profile-service/.env`, 'utf8')
  const user = env.match(/^DATABASE_USERNAME=(.*)$/m)?.[1]?.trim()
  if (!user) throw new Error('DATABASE_USERNAME missing from profile-service/.env')

  return user
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

const uuid = (id: string): string => {
  if (!UUID.test(id)) throw new Error(`not a uuid: ${id}`)

  return id
}

// A data-changing statement runs in a WITH clause, since it cannot be a subquery
const rows = (sql: string): Record<string, any>[] =>
  execFileSync(
    'docker',
    [
      'exec',
      POSTGRES_CONTAINER,
      'psql',
      '-U',
      databaseUser(),
      '-d',
      E2E_DATABASE,
      '-At',
      '-c',
      `with t as (${sql}) select row_to_json(t) from t`
    ],
    { encoding: 'utf8' }
  )
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))

/** The calendar is behind the paid plan; the test professor gets one straight in the e2e database. */
export const giveSubscription = (professor: Professor) =>
  rows(
    `insert into professor_subscriptions (professor_id, status, is_active, current_period_end)
     values ('${uuid(professor.id)}', 'active', true, now() + interval '30 days') returning id`
  )

const attendeesOf = (professor: Professor, title: string, finishedOnly: boolean) =>
  Object.fromEntries(
    rows(
      `select a.attendee_id, a.is_expected, a.is_attended, a.has_custom_pricing, a.custom_price
         from event_attendees a
         join event_occurrence o on o.id = a.event_occurrence_id
         left join recurring_series s on s.id = o.recurring_series_id
        where ${finishedOnly ? 'o.actual_end_time is not null' : 'true'}
          and coalesce(o.professor_id, s.professor_id) = '${uuid(professor.id)}'
          and coalesce(s.title, o.title) = '${title.replace(/'/g, "''")}'`
    ).map(row => [row.attendee_id, row])
  )

/** The attendees stored on the professor's finished event of this title, by student id. */
export const finishedAttendees = (professor: Professor, title: string) => attendeesOf(professor, title, true)

/** The attendees stored on the professor's event of this title (a session of a series included), by student id. */
export const savedAttendees = (professor: Professor, title: string) => attendeesOf(professor, title, false)

/** What the student's wallet was charged for events, as positive amounts. */
export const eventCharges = (student: Student): number[] =>
  rows(
    `select amount from wallet_balance_changes
      where user_id = '${uuid(student.id)}' and change_type = 'EVENT_CHARGE' order by creation`
  ).map(row => Math.abs(Number(row.amount)))
