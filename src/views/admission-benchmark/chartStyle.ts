// ** MUI Imports
import { Theme } from '@mui/material/styles'

// ** Custom Components Imports
import { countLabel } from 'src/views/student-ui/countLabel'

// ** Types
import type { BenchmarkCohort, BenchmarkScope } from './types'

export const DAY_MS = 24 * 60 * 60 * 1000

/*
 * Line colours for cohorts, used by the student's results chart (always the
 * first) and the professor's comparison page. Each one reaches at least 4.2:1
 * on the card and the page, in both themes, above the 3:1 a line needs. Order
 * keeps the colours that colour-blind eyes confuse (violet and blue) apart, and
 * each slot has its own dash so lines differ without colour too.
 */
const PALETTE = [
  { light: '#6D5FE0', dark: '#A59CF7', dash: undefined },
  { light: '#C2410C', dark: '#FB923C', dash: '10 5' },
  { light: '#0F8577', dark: '#2DD4BF', dash: '2 4' },
  { light: '#BE2E86', dark: '#F07CC0', dash: '12 4 2 4' },
  { light: '#9A6700', dark: '#E7B416', dash: '5 5' },
  { light: '#1D6FD8', dark: '#60A5FA', dash: '18 5' }
]

export const MAX_COHORTS = PALETTE.length

export const cohortColor = (theme: Theme, slot: number) => PALETTE[slot % MAX_COHORTS][theme.palette.mode]

export const cohortDash = (slot: number) => PALETTE[slot % MAX_COHORTS].dash

export const ALL_UNIVERSITIES = 'Toate universitățile'

/** "Medicină, Carol Davila" or "Medicină, toate universitățile". */
export const cohortLabel = ({
  scope,
  specialityName,
  universityName
}: {
  scope: BenchmarkScope | null
  specialityName: string | null
  universityName: string | null
}) =>
  scope === 'SPECIALITY' || !universityName
    ? `${specialityName}, ${ALL_UNIVERSITIES.toLowerCase()}`
    : `${specialityName}, ${universityName}`

export const cohortUniversity = (cohort: BenchmarkCohort) => cohort.universityName ?? ALL_UNIVERSITIES

/** "60,4%": the backend sends one decimal, written the Romanian way. */
export const formatAverage = (average: number) => `${average.toLocaleString('ro-RO', { maximumFractionDigits: 1 })}%`

/** "1 zi până la examen", "20 de zile până la examen", "ziua examenului". */
export const daysToExamLabel = (days: number) =>
  days === 0 ? 'ziua examenului' : `${countLabel(days, '1 zi', 'zile')} până la examen`

/** "12 teste · 3 studenți": how much a cohort point stands on. */
export const cohortCountsLabel = (tests: number, students: number) =>
  `${countLabel(tests, '1 test', 'teste')} · ${countLabel(students, '1 student', 'studenți')}`

/** Noon of a YYYY-MM-DD calendar day, in local time: the middle of that day on a time axis. */
export const dayToTime = (day: string) => {
  const [year, month, date] = day.split('-').map(Number)

  return new Date(year, month - 1, date, 12).getTime()
}

/** The YYYY-MM-DD calendar day a moment falls on, in local time. */
export const timeToDay = (time: number) => {
  const date = new Date(time)
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * How many days on each side a drawn cohort line takes into account, for a
 * chart spanning `spanDays`: a week on short charts, a twentieth of the span
 * on long ones, where a week's wobble would still read as noise.
 */
export const smoothingRadius = (spanDays: number) => Math.max(7, Math.round(spanDays / 20))

/**
 * Evens out a cohort curve for drawing. The server's points already average a
 * 7-day window, but with few tests a day that still leaves steps and
 * plateaus; here each day becomes the average of the days within `radius` of
 * it, nearer days and days with more tests counting more. The days and the
 * counts stay as they were.
 */
export const smoothCurve = <T extends { daysBeforeExam: number; average: number; tests: number }>(
  points: T[],
  radius: number
): T[] =>
  points.map(point => {
    let weighted = 0
    let weights = 0

    points.forEach(other => {
      const distance = Math.abs(other.daysBeforeExam - point.daysBeforeExam)
      if (distance > radius) return

      const weight = (radius + 1 - distance) * Math.max(other.tests, 1)
      weighted += other.average * weight
      weights += weight
    })

    return { ...point, average: Math.round((weighted / weights) * 10) / 10 }
  })

const startOfDay = (time: number) => {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)

  return date
}

/**
 * Calendar ticks for a time axis: Mondays for up to about two months, the
 * first of each month up to about two years, then the first of each year.
 * The axis drops the ones that would overlap.
 */
export const timeTicks = (start: number, end: number) => {
  const spanDays = (end - start) / DAY_MS
  const ticks: number[] = []
  const cursor = startOfDay(start)

  if (spanDays <= 75) {
    cursor.setDate(cursor.getDate() + ((8 - cursor.getDay()) % 7))
    for (; cursor.getTime() <= end; cursor.setDate(cursor.getDate() + 7)) ticks.push(cursor.getTime())

    return {
      ticks,
      format: (time: number) => new Date(time).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
    }
  }

  if (spanDays <= 800) {
    if (cursor.getDate() !== 1) cursor.setMonth(cursor.getMonth() + 1, 1)
    for (; cursor.getTime() <= end; cursor.setMonth(cursor.getMonth() + 1)) ticks.push(cursor.getTime())

    // The year goes on the first label and on every January.
    return {
      ticks,
      format: (time: number, index: number) => {
        const date = new Date(time)

        return date.toLocaleDateString(
          'ro-RO',
          index === 0 || date.getMonth() === 0 ? { month: 'short', year: 'numeric' } : { month: 'short' }
        )
      }
    }
  }

  if (cursor.getMonth() !== 0 || cursor.getDate() !== 1) cursor.setFullYear(cursor.getFullYear() + 1, 0, 1)
  for (; cursor.getTime() <= end; cursor.setFullYear(cursor.getFullYear() + 1)) ticks.push(cursor.getTime())

  return { ticks, format: (time: number) => String(new Date(time).getFullYear()) }
}
