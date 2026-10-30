// Non-breaking, so "3 h 45 min" never splits across lines.
const NBSP = ' '

/** "3 h 45 min", "45 min", "sub un minut". */
export const formatStudyTime = (seconds: number) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return 'sub un minut'
  if (minutes < 60) return `${minutes}${NBSP}min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest ? `${hours}${NBSP}h${NBSP}${rest}${NBSP}min` : `${hours}${NBSP}h`
}

const ron = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 })

/** "1.250 RON", always positive; the caller says whether it is owed or paid. */
export const formatRon = (amount: number) => `${ron.format(Math.abs(amount))} RON`

/** "25 oct." */
export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })

/** Whole percentages read faster than "68.64%"; the exact counts sit next to them. */
export const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0)
