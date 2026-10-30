/*
 * The app's 3D characters, each cut off at the bottom so it can stand on the
 * bottom edge of a card. Each student activity has its own character, and the
 * same one introduces that activity on every page.
 */
export const STUDENT_ILLUSTRATIONS = {
  /** Welcomes the student and presents results. */
  host: '/images/pages/create-deal-review-complete.png',

  /** Typing the professor's invitation code on a phone. */
  professor: '/images/pages/add-new-role-illustration.png',

  /**
   * Reading on the sofa. Wider than the others and seen from further away; the
   * close-up girl-with-laptop.png was dropped because her large eyes read as a stare.
   */
  lessons: '/images/pages/faq-illustration.png',
  tests: '/images/cards/congratulations-john.png'
} as const
