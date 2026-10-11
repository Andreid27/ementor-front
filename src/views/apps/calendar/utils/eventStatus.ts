// One definition of a session's state, shared by the calendar grid, the day summary and the event panel.
// The backend sets the flags on every occurrence, virtual series occurrences included:
// completed = marked as held (it is billed), missed = in the past but not marked as held,
// cancelled, upcoming. The labels reuse the panel's action, "Marchează ca Finalizat".

export type EventStatusKey = 'completed' | 'unconfirmed' | 'cancelled' | 'upcoming'

export interface EventStatus {
  key: EventStatusKey
  label: string

  // Short explanation for the legend and the hover title
  hint: string

  // Null for upcoming sessions: they keep the plain dot, only states that need a second look get a mark
  icon: string | null
  color: 'success' | 'warning' | 'error' | 'primary'
}

export const EVENT_STATUSES: Record<EventStatusKey, EventStatus> = {
  upcoming: {
    key: 'upcoming',
    label: 'Viitor',
    hint: 'Programat, încă nu a avut loc',
    icon: null,
    color: 'primary'
  },
  completed: {
    key: 'completed',
    label: 'Finalizat',
    hint: 'Marcat ca ținut și facturat',
    icon: 'tabler:circle-check',
    color: 'success'
  },
  unconfirmed: {
    key: 'unconfirmed',
    label: 'Nefinalizat',
    hint: 'A trecut, dar nu e marcat ca finalizat',
    icon: 'tabler:clock-exclamation',
    color: 'warning'
  },
  cancelled: {
    key: 'cancelled',
    label: 'Anulat',
    hint: 'Nu se facturează',
    icon: 'tabler:circle-x',
    color: 'error'
  }
}

interface StatusFlags {
  completed?: boolean
  cancelled?: boolean
  missed?: boolean
  effectiveEndTime?: string
  effectiveStartTime?: string
  end?: string | Date | null
  start?: string | Date | null
}

// Accepts a raw occurrence from the store or a FullCalendar event (flags under extendedProps)
export const getEventStatus = (event: StatusFlags & { extendedProps?: StatusFlags }): EventStatus => {
  const flags = { ...event, ...(event.extendedProps ?? {}) }

  if (flags.cancelled) return EVENT_STATUSES.cancelled
  if (flags.completed) return EVENT_STATUSES.completed
  if (flags.missed) return EVENT_STATUSES.unconfirmed

  // Older payloads without the missed flag: a session whose end has passed counts as not finalized
  const end = flags.effectiveEndTime ?? flags.end ?? flags.effectiveStartTime ?? flags.start
  if (end && new Date(end).getTime() < Date.now()) return EVENT_STATUSES.unconfirmed

  return EVENT_STATUSES.upcoming
}

// Price as the rest of the calendar writes it: "130 RON", or "Gratuit" for free sessions
export const formatEventPrice = (event: { price?: number | null; seriesPrice?: number | null }): string | null => {
  const price = event.price ?? event.seriesPrice

  if (price === null || price === undefined) return null

  return price === 0 ? 'Gratuit' : `${price} RON`
}
