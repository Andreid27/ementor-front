/**
 * The students on a calendar event: the price a student is shown and charged, and how a student who has left
 * the class is treated when the professor finishes the event.
 *
 * Prices follow the backend's rule: the price set for a student on the event, else their own price while they
 * are in the class, else the event's price.
 */
import type { Page } from '@playwright/test'
import { test, expect } from '../support/fixtures'
import {
  addFromAvailable,
  addStudent,
  adjustPricesToDuration,
  attendee,
  attendeeRow,
  createProfessor,
  createSeries,
  createSingularEvent,
  deactivateStudent,
  eventCharges,
  finishedAttendees,
  finishWizardToAttendees,
  goToAttendeesStep,
  openCalendarAs,
  openEvent,
  priceOf,
  removeAttendee,
  savedAttendees,
  setActualEnd,
  shortlyFromNow
} from '../support/calendar'

const present = (page: Page, student: Parameters<typeof attendeeRow>[1]) =>
  attendeeRow(page, student).getByRole('checkbox', { name: 'A Participat' })

const finish = async (page: Page) => {
  await page.getByRole('button', { name: 'Finalizează Eveniment' }).click()
  await expect(page.getByText('Eveniment Finalizat cu Succes!')).toBeVisible()
}

test.describe('Calendar: students on an event', () => {
  test('a student taken out of the class is not marked present when the event is finished', async ({ page }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const bogdan = await addStudent(professor, 'Bogdan', 200)
    const title = `Grupa de luni ${Date.now()}`
    await createSeries(professor, {
      title,
      start: shortlyFromNow(),
      price: 100,
      attendees: [attendee(ana), attendee(bogdan)]
    })
    await deactivateStudent(professor, bogdan)

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await finishWizardToAttendees(page)

    // Still listed, so the professor can see them, but shown as inactive and not present
    await expect(attendeeRow(page, bogdan)).toBeVisible()
    await expect(attendeeRow(page, bogdan).getByText('Inactiv')).toBeVisible()
    await expect(present(page, bogdan)).not.toBeChecked()
    await expect(attendeeRow(page, ana).getByText('Inactiv')).toHaveCount(0)
    await expect(present(page, ana)).toBeChecked()
    // Ana pays her own price; Bogdan, out of the class, would pay the event's
    await expect(priceOf(page, ana)).toHaveValue('150')
    await expect(priceOf(page, bogdan)).toHaveValue('100')

    await finish(page)

    const stored = finishedAttendees(professor, title)
    expect(stored[bogdan.id]).toMatchObject({ is_attended: false })
    expect(stored[ana.id]).toMatchObject({ is_attended: true })
    expect(eventCharges(bogdan)).toEqual([])
    expect(eventCharges(ana)).toEqual([150])
  })

  test('a student who left but did come can still be marked present, and pays what is shown', async ({ page }) => {
    const professor = await createProfessor()
    const bogdan = await addStudent(professor, 'Bogdan', 200)
    const title = `Ultima ora ${Date.now()}`
    await createSingularEvent(professor, { title, start: shortlyFromNow(), price: 100, attendees: [attendee(bogdan)] })
    await deactivateStudent(professor, bogdan)

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await finishWizardToAttendees(page)
    await present(page, bogdan).check()
    await expect(priceOf(page, bogdan)).toHaveValue('100')
    await finish(page)

    expect(finishedAttendees(professor, title)[bogdan.id]).toMatchObject({ is_attended: true })
    expect(eventCharges(bogdan)).toEqual([100])
  })

  test('a student added while finishing starts present, at their own price or the event price if they have none', async ({
    page
  }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const dana = await addStudent(professor, 'Dana', 220)
    const elena = await addStudent(professor, 'Elena', null)
    const title = `Meditatie ${Date.now()}`
    await createSingularEvent(professor, { title, start: shortlyFromNow(), price: 100, attendees: [attendee(ana)] })

    await openCalendarAs(page, professor)
    await openEvent(page, title)

    // A slow class list: until it is in, nobody can be added and the event cannot be finished
    let releaseClassList = () => {}
    const classListHeld = new Promise<void>(resolve => (releaseClassList = resolve))
    await page.route('**/student-professor-relationships/students', async route => {
      await classListHeld
      await route.continue()
    })
    await finishWizardToAttendees(page)
    await expect(page.getByText('Se verifică elevii din clasă…')).toBeVisible()
    await expect(page.getByText('Elevi Disponibili')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Finalizează Eveniment' })).toBeDisabled()
    releaseClassList()
    await expect(attendeeRow(page, ana)).toBeVisible()

    await addFromAvailable(page, dana)
    await addFromAvailable(page, elena)

    await expect(priceOf(page, dana)).toHaveValue('220')
    await expect(priceOf(page, elena)).toHaveValue('100')
    await expect(priceOf(page, ana)).toHaveValue('150')

    // A student added while finishing was there: they start as present
    await expect(present(page, dana)).toBeChecked()
    await expect(present(page, elena)).toBeChecked()
    await finish(page)

    // Dana's price is her usual one, not a custom price on the event
    expect(finishedAttendees(professor, title)[dana.id]).toMatchObject({ is_attended: true, has_custom_pricing: false })
    expect(eventCharges(dana)).toEqual([220])
    expect(eventCharges(elena)).toEqual([100])
    expect(eventCharges(ana)).toEqual([150])
  })

  test('the price set for a student on the event is shown and charged', async ({ page }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const title = `Pret special ${Date.now()}`
    await createSingularEvent(professor, {
      title,
      start: shortlyFromNow(),
      price: 100,
      attendees: [attendee(ana, 130)]
    })

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await finishWizardToAttendees(page)
    await expect(priceOf(page, ana)).toHaveValue('130')
    await finish(page)

    expect(eventCharges(ana)).toEqual([130])
  })

  test('editing a recurring event: a new student starts at their own price, one put back keeps the price set for them', async ({
    page
  }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const dana = await addStudent(professor, 'Dana', 220)
    const title = `Grupa de joi ${Date.now()}`
    await createSeries(professor, { title, start: shortlyFromNow(), price: 100, attendees: [attendee(ana, 130)] })

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await page.getByTitle('Editează Eveniment').click()

    await expect(priceOf(page, ana)).toHaveValue('130')
    await addFromAvailable(page, dana)
    await expect(priceOf(page, dana)).toHaveValue('220')
    await removeAttendee(page, ana)
    await addFromAvailable(page, ana)
    await expect(priceOf(page, ana)).toHaveValue('130')
  })

  test('a student added in the event form is saved at their usual price, and pays it when the event is finished', async ({
    page
  }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const dana = await addStudent(professor, 'Dana', 220)
    const title = `Grupa de vineri ${Date.now()}`
    await createSeries(professor, { title, start: shortlyFromNow(), price: 100, attendees: [attendee(ana)] })

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await page.getByTitle('Editează Eveniment').click()
    await addFromAvailable(page, dana)
    await expect(priceOf(page, dana)).toHaveValue('220')
    // The total at the top of the list adds up the prices shown: 150 + 220
    await expect(page.getByText('$370', { exact: true })).toBeVisible()

    // The form saves this session (its default scope), which is where the backend stores the attendees
    const saved = page.waitForResponse(
      response => response.url().includes('/events/occurrence/modify') && response.ok()
    )
    await page.getByRole('button', { name: 'Actualizează Eveniment' }).click()
    await saved

    // Saved without a custom price, so the session follows Dana's own price, as the backend does
    expect(savedAttendees(professor, title)[dana.id]).toMatchObject({ has_custom_pricing: false, is_attended: false })

    await page.keyboard.press('Escape')
    await openEvent(page, title)
    await finishWizardToAttendees(page)
    await expect(priceOf(page, dana)).toHaveValue('220')
    await expect(present(page, dana)).toBeChecked()
    await finish(page)

    expect(eventCharges(dana)).toEqual([220])
    expect(eventCharges(ana)).toEqual([150])
  })

  test('a price set for a student on one event does not follow them to the next event the professor makes', async ({
    page
  }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const title = `Pret doar aici ${Date.now()}`
    await createSingularEvent(professor, {
      title,
      start: shortlyFromNow(),
      price: 100,
      attendees: [attendee(ana, 130)]
    })

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await page.getByTitle('Editează Eveniment').click()
    await expect(priceOf(page, ana)).toHaveValue('130')

    // Close it and start a new event: the sidebar, and the form in it, stay mounted
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Adaugă Eveniment' }).click()
    await addFromAvailable(page, ana)
    await expect(priceOf(page, ana)).toHaveValue('150')
  })

  test('prices adjusted to the real duration are worked out once, however often attendance is changed', async ({
    page
  }) => {
    const professor = await createProfessor()
    const ana = await addStudent(professor, 'Ana', 150)
    const dana = await addStudent(professor, 'Dana', 220)
    const title = `Ora prelungita ${Date.now()}`
    const start = shortlyFromNow()
    await createSingularEvent(professor, { title, start, price: 100, attendees: [attendee(ana)] })

    await openCalendarAs(page, professor)
    await openEvent(page, title)
    await page.getByRole('button', { name: 'Finalizează', exact: true }).click()

    // Planned one hour, held an hour and a half: prices go to 150%
    await setActualEnd(page, new Date(start.getTime() + 90 * 60 * 1000))
    await expect(page.getByText('Aceasta reprezintă 150% din durata planificată.')).toBeVisible()
    await adjustPricesToDuration(page)
    await goToAttendeesStep(page)

    await expect(priceOf(page, ana)).toHaveValue('225')
    await addFromAvailable(page, dana)
    await expect(priceOf(page, dana)).toHaveValue('330')

    for (const student of [dana, ana]) {
      await present(page, student).uncheck()
      await present(page, student).check()
    }
    await expect(priceOf(page, dana)).toHaveValue('330')
    await expect(priceOf(page, ana)).toHaveValue('225')

    // A price typed for a student stands as typed; turning Custom off goes back to the adjusted usual price
    await priceOf(page, ana).fill('200')
    await expect(priceOf(page, ana)).toHaveValue('200')
    // (while prices are adjusted every price counts as custom, so the switch turns itself back on)
    await attendeeRow(page, ana).getByRole('checkbox', { name: 'Custom' }).click()
    await expect(priceOf(page, ana)).toHaveValue('225')
    await priceOf(page, dana).fill('300')
    await present(page, dana).uncheck()
    await present(page, dana).check()
    await expect(priceOf(page, dana)).toHaveValue('300')

    await finish(page)

    expect(eventCharges(ana)).toEqual([225])
    expect(eventCharges(dana)).toEqual([300])
  })
})
