// Theme constants for consistent spacing and styling

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48
} as const

export const BORDER_RADIUS = {
  SM: 4,
  MD: 8,
  LG: 12,
  XL: 16,
  ROUND: '50%'
} as const

export const ELEVATION = {
  CARD: 2,
  HOVER: 4,
  MODAL: 8,
  CELEBRATION: 24
} as const

export const QUIZ_COLORS = {
  STATUS: {
    COMPLETED: '#4caf50',
    IN_PROGRESS: '#ff9800',
    OVERDUE: '#f44336',
    NOT_STARTED: '#2196f3'
  },
  PERFORMANCE: {
    HIGH: '#4caf50',
    MEDIUM: '#ff9800',
    LOW: '#f44336'
  }
} as const
