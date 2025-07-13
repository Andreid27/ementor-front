/**
 * Constants used throughout the calendar application
 */

export const BLANK_EVENT = {
  title: '',
  start: new Date(),
  end: new Date(),
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

export const DRAWER_STYLES = {
  '& .MuiDrawer-paper': {
    width: ['100%', 'drawerWidth'],
    background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
    borderLeft: '1px solid',
    borderColor: 'divider'
  }
}

export const SIDEBAR_BODY_STYLES = {
  p: (theme: any) => theme.spacing(3, 4, 4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto'
}

export const USER_ROLES = {
  PROFESSOR: 'PROFESSOR',
  ADMIN: 'ADMIN',
  STUDENT: 'STUDENT'
} as const

export const RECURRENCE_PATTERNS = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY'
} as const

export const EVENT_DISPLAY_MODES = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
  DAY_SUMMARY: 'DAY_SUMMARY'
} as const
