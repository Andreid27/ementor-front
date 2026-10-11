// ** Third Party Imports
import {
  addDays,
  addMonths,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isValid,
  parseISO,
  startOfMonth
} from 'date-fns'
import { ro } from 'date-fns/locale'

// ** Types
import type {
  FinanceKpisDTO,
  FinanceStudentRefDTO,
  FinanceTimeseriesBucketDTO,
  GetFinanceTimeseriesGranularityEnum
} from 'src/generated/profile-service-client/api'

export type PeriodPreset = 'month' | 'year' | 'schoolYear' | 'custom'

export type Granularity = GetFinanceTimeseriesGranularityEnum

export interface FinancePeriod {
  preset: PeriodPreset
  from: string
  to: string
}

// Backend rejects ranges longer than this (contract § 1)
export const MAX_RANGE_DAYS = 1096

// ** Dates

const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd')

// Everything people read is Romanian: "4 oct 2026", "octombrie 2026", "duminică"
const fmt = (date: Date, pattern: string): string => format(date, pattern, { locale: ro })

// Date-only strings are parsed as local calendar dates, so 2026-10-01 never shifts a day
export const parseDate = (value: string): Date => parseISO(value)

// School years run 1 September to 31 August
const schoolYearStart = (date: Date): Date =>
  new Date(date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1, 8, 1)

export const buildPeriod = (preset: Exclude<PeriodPreset, 'custom'>, anchor: Date = new Date()): FinancePeriod => {
  if (preset === 'year') {
    return {
      preset,
      from: toIsoDate(new Date(anchor.getFullYear(), 0, 1)),
      to: toIsoDate(new Date(anchor.getFullYear(), 11, 31))
    }
  }

  if (preset === 'schoolYear') {
    const start = schoolYearStart(anchor)

    return { preset, from: toIsoDate(start), to: toIsoDate(addDays(addYears(start, 1), -1)) }
  }

  return { preset: 'month', from: toIsoDate(startOfMonth(anchor)), to: toIsoDate(endOfMonth(anchor)) }
}

export const shiftPeriod = (period: FinancePeriod, direction: 1 | -1): FinancePeriod => {
  const from = parseDate(period.from)

  if (period.preset === 'month') return buildPeriod('month', addMonths(from, direction))
  if (period.preset === 'year' || period.preset === 'schoolYear')
    return buildPeriod(period.preset, addYears(from, direction))

  return period
}

export const isCurrentPeriod = (period: FinancePeriod): boolean => {
  if (period.preset === 'custom') return true
  const current = buildPeriod(period.preset)

  return current.from === period.from && current.to === period.to
}

export const periodDays = (from: string, to: string): number =>
  differenceInCalendarDays(parseDate(to), parseDate(from)) + 1

export const formatDateRange = (from: string, to: string): string => {
  const start = parseDate(from)
  const end = parseDate(to)

  if (from === to) return fmt(start, 'd MMM yyyy')
  if (start.getFullYear() !== end.getFullYear()) return `${fmt(start, 'd MMM yyyy')} – ${fmt(end, 'd MMM yyyy')}`
  if (start.getMonth() !== end.getMonth()) return `${fmt(start, 'd MMM')} – ${fmt(end, 'd MMM yyyy')}`

  return `${fmt(start, 'd')} – ${fmt(end, 'd MMM yyyy')}`
}

export const periodLabel = (period: FinancePeriod): string => {
  const from = parseDate(period.from)

  switch (period.preset) {
    case 'month':
      return fmt(from, 'MMMM yyyy')
    case 'year':
      return fmt(from, 'yyyy')
    case 'schoolYear':
      return `Anul școlar ${from.getFullYear()}–${from.getFullYear() + 1}`
    default:
      return formatDateRange(period.from, period.to)
  }
}

// The period inside a sentence: "în octombrie 2026", "în anul școlar 2026–2027", "în perioada 1 – 15 oct 2026"
export const periodPhrase = (period: FinancePeriod): string => {
  if (period.preset === 'custom') return `în perioada ${periodLabel(period)}`
  if (period.preset === 'schoolYear') return `în ${periodLabel(period).replace(/^Anul/, 'anul')}`

  return `în ${periodLabel(period)}`
}

// Names of the previous / next / back-to-now buttons for each kind of period
export const PERIOD_NAV: Record<
  Exclude<PeriodPreset, 'custom'>,
  { previous: string; next: string; current: string }
> = {
  month: { previous: 'Luna anterioară', next: 'Luna următoare', current: 'Luna Aceasta' },
  year: { previous: 'Anul anterior', next: 'Anul următor', current: 'Anul Acesta' },
  schoolYear: { previous: 'Anul școlar anterior', next: 'Anul școlar următor', current: 'Anul Școlar Curent' }
}

// Name of the comparison period the overview returns, used in "față de septembrie"
export const comparisonLabel = (preset: PeriodPreset, previousStart: string, previousEnd: string): string => {
  const start = parseDate(previousStart)

  if (preset === 'month') return fmt(start, 'MMMM')
  if (preset === 'year') return fmt(start, 'yyyy')
  if (preset === 'schoolYear') return `${start.getFullYear()}–${start.getFullYear() + 1}`

  return formatDateRange(previousStart, previousEnd)
}

// Weeks for a month, months for anything longer than a quarter
export const granularityFor = (period: FinancePeriod): Granularity => {
  const days = periodDays(period.from, period.to)

  if (days <= 14) return 'DAY'
  if (days <= 92) return 'WEEK'

  return 'MONTH'
}

export const validateRange = (from: string, to: string): string | null => {
  if (!from || !to || !isValid(parseDate(from)) || !isValid(parseDate(to)))
    return 'Alege o dată de început și una de sfârșit.'
  if (from > to) return 'Data de început nu poate fi după data de sfârșit.'
  if (periodDays(from, to) > MAX_RANGE_DAYS) return 'Alege un interval de cel mult 3 ani.'

  return null
}

export const formatDay = (value: string | null | undefined): string =>
  value ? fmt(parseDate(value), 'd MMM yyyy') : '—'

// Instants arrive in UTC and are shown in the viewer's local time
export const formatDateTime = (value: string | null | undefined): string =>
  value ? fmt(new Date(value), 'd MMM yyyy, HH:mm') : '—'

// Calendar date of an instant in the viewer's time zone, as yyyy-MM-dd
export const localDate = (value: string): string => format(new Date(value), 'yyyy-MM-dd')

export const formatInstantDay = (value: string | null | undefined): string =>
  value ? fmt(new Date(value), 'd MMM yyyy') : '—'

export const formatTime = (value: string | null | undefined): string => (value ? format(new Date(value), 'HH:mm') : '')

const isWholeMonth = (bucket: FinanceTimeseriesBucketDTO): boolean => {
  const start = parseDate(bucket.bucketStart)

  return start.getDate() === 1 && bucket.bucketEnd === toIsoDate(endOfMonth(start))
}

export const bucketAxisLabel = (bucket: FinanceTimeseriesBucketDTO, granularity: Granularity): string => {
  const start = parseDate(bucket.bucketStart)

  if (granularity === 'MONTH') return fmt(start, 'MMM')
  if (granularity === 'WEEK') return fmt(start, 'd MMM')

  return fmt(start, 'd')
}

export const bucketTitle = (bucket: FinanceTimeseriesBucketDTO, granularity: Granularity): string => {
  const start = parseDate(bucket.bucketStart)

  if (granularity === 'DAY') return fmt(start, 'EEEE, d MMMM yyyy')
  if (granularity === 'MONTH' && isWholeMonth(bucket)) return fmt(start, 'MMMM yyyy')

  return formatDateRange(bucket.bucketStart, bucket.bucketEnd)
}

// ** Money

const round2 = (value: number): number => Math.round(value * 100) / 100

// Romanian number format: 12.191 RON, 1.430,00 RON
const moneyFormat = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const wholeFormat = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 })
const compactFormat = new Intl.NumberFormat('ro-RO', { notation: 'compact', maximumFractionDigits: 1 })

// Exact amount for tables and ledgers: 1.430,00 RON
export const formatMoney = (value: number | null | undefined, currency: string): string =>
  value === null || value === undefined ? '—' : `${moneyFormat.format(value)} ${currency}`

// Amount in a sentence: drops ",00" so whole sums read cleanly, keeps bani when there are any
export const formatAmount = (value: number | null | undefined, currency: string): string => {
  if (value === null || value === undefined) return '—'

  return Number.isInteger(round2(value)) ? `${wholeFormat.format(value)} ${currency}` : formatMoney(value, currency)
}

// Headline figures that sit side by side are all whole RON, so they line up and compare at a glance;
// cents stay in tooltips, tables and the ledger
export const formatWhole = (value: number | null | undefined, currency: string): string =>
  value === null || value === undefined ? '—' : `${wholeFormat.format(Math.round(value))} ${currency}`

// Axis ticks: 0 / 500 / 1,5 K
export const formatCompact = (value: number): string => compactFormat.format(value)

export const formatPercent = (fraction: number | null | undefined): string =>
  fraction === null || fraction === undefined ? '—' : `${Math.round(fraction * 100)}%`

// Romanian counts: 1 ședință, 3 ședințe, 20 de ședințe, 101 ședințe, 120 de ședințe
export const formatCount = (count: number, singular: string, plural: string): string => {
  if (count === 1) return `1 ${singular}`

  const lastTwoDigits = Math.abs(count) % 100
  const takesDe = count !== 0 && (lastTwoDigits === 0 || lastTwoDigits >= 20)

  return `${wholeFormat.format(count)} ${takesDe ? 'de ' : ''}${plural}`
}

// ** Derived figures

type PlanParts = Pick<FinanceKpisDTO, 'earned' | 'awaitingCompletion' | 'expected'>

// What the professor should earn in the period: every session that wasn't cancelled, at each student's
// price. That is what is already confirmed, plus past sessions not confirmed yet, plus sessions still to come.
// Cancelled sessions are reported separately; absent students are never charged, so neither counts.
export const shouldEarnOf = (parts: PlanParts): number =>
  round2(parts.earned + parts.awaitingCompletion + parts.expected)

// The figures the whole tab is built on, named the same way everywhere. "Finalizat" is the calendar's
// own word: a session counts once the professor marks it with "Marchează ca Finalizat".
export const TERMS = {
  shouldEarn: {
    label: 'Planificat',
    hint: 'Toate ședințele programate, la prețul fiecărui elev, ținute sau încă viitoare'
  },
  confirmed: {
    label: 'Finalizat',
    hint: 'Ședințe marcate ca ținute în calendar. Elevii datorează această sumă.'
  },
  received: {
    label: 'Încasat',
    hint: 'Plăți de la elevi pe care le-ai confirmat'
  },
  stillOwed: {
    label: 'Restanțe',
    hint: 'Ședințe finalizate și neplătite ale elevilor activi'
  }
} as const

export interface Delta {
  fraction: number
  direction: 'up' | 'down' | 'flat'
}

export const deltaOf = (current: number, previous: number): Delta | null => {
  if (!previous) return null
  const fraction = (current - previous) / Math.abs(previous)

  if (Math.abs(fraction) < 0.005) return { fraction: 0, direction: 'flat' }

  return { fraction, direction: fraction > 0 ? 'up' : 'down' }
}

export const studentName = (student: FinanceStudentRefDTO | null | undefined): string =>
  [student?.firstName, student?.lastName].filter(Boolean).join(' ') || 'Cont șters'

// ** Chart colors
// Should earn and confirmed are two steps of the brand green (theme primary): the lighter one is the
// target, the stronger one is what is certain. Received is blue, the one contrasting hue, kept apart from
// green for red-green color blindness. Aging is a red ramp, older = stronger.
// Every set was checked with the dataviz palette validator against the theme's paper color.

export interface FinanceColors {
  shouldEarn: string
  confirmed: string
  received: string
  aging: [string, string, string, string]
}

const LIGHT_COLORS: FinanceColors = {
  shouldEarn: '#3AC975',
  confirmed: '#00773D',
  received: '#2A78D6',
  aging: ['#EE8A8A', '#E05A5B', '#C23B3C', '#8E2A2B']
}

const DARK_COLORS: FinanceColors = {
  shouldEarn: '#00773D',
  confirmed: '#0AB05E',
  received: '#3987E5',
  aging: ['#B44445', '#D85A5B', '#EC7F80', '#F6B0B0']
}

export const getFinanceColors = (mode: 'light' | 'dark'): FinanceColors =>
  mode === 'dark' ? DARK_COLORS : LIGHT_COLORS

// ** Errors

export const financeErrorMessage = (error: any): string => {
  const status = error?.response?.status

  if (status === 401) return 'Sesiunea a expirat. Autentifică-te din nou ca să vezi finanțele.'
  if (status === 403) return 'Finanțele sunt disponibile doar pentru conturile de profesor.'
  if (status === 404) return 'Rapoartele financiare nu sunt încă disponibile pe server.'

  // The server explains bad requests in English; the cause on this page is always the chosen period
  if (status === 400) return 'Perioada aleasă nu este validă. Alege alt interval.'

  return 'Secțiunea nu s-a putut încărca. Verifică conexiunea și încearcă din nou.'
}
