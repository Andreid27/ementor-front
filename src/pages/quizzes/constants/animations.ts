// Animation constants for consistent timing and easing across components

export const ANIMATION_DURATIONS = {
  SHORT: 150,
  MEDIUM: 300,
  LONG: 500,
  CELEBRATION: 2000,
  SCORE_REVEAL: 1000
} as const

export const EASING_FUNCTIONS = {
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)',
  DECELERATION: 'cubic-bezier(0, 0, 0.2, 1)',
  ACCELERATION: 'cubic-bezier(0.4, 0, 1, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const

export const ANIMATION_DELAYS = {
  STAGGER: 100,
  QUESTION_REVEAL: 150,
  RESULT_ITEM: 200
} as const
