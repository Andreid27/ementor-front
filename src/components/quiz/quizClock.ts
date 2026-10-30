/**
 * quizClock - Works out how much quiz time is left from the server's deadline
 *
 * The countdown used to subtract one second per timer tick, so it fell behind whenever the browser slowed its
 * timers (a hidden tab, a locked phone) and the automatic submit arrived late. The remaining time is now computed
 * from the deadline with two clocks: the wall clock corrected by the offset to the server clock, and the monotonic
 * clock. The smaller value wins, so neither a device that slept (the monotonic clock stops) nor a computer clock
 * set back (the wall clock jumps) adds time.
 */

export interface QuizClock {
  /** Server clock minus browser clock, estimated when the start response arrived */
  clockOffsetMs: number

  /** When the quiz ends, in epoch milliseconds on the server clock */
  deadlineServerMs: number

  /** Time from the start response to the deadline */
  durationMs: number

  arrivedWallMs: number
  arrivedMonoMs: number
}

export const parseServerTime = (value?: string | null): number | null => {
  if (!value) return null

  const time = Date.parse(value)

  return Number.isFinite(time) ? time : null
}

export const createQuizClock = (
  input: { serverTime?: string | null; endTime?: string | null; maxTimeMinutes: number },
  arrivedWallMs: number,
  arrivedMonoMs: number
): QuizClock => {
  const limitMs = input.maxTimeMinutes * 60000
  const endTime = parseServerTime(input.endTime)

  // Older backends send no serverTime, but the start response's endTime is the server time plus the time limit
  const serverNow = parseServerTime(input.serverTime) ?? (endTime !== null ? endTime - limitMs : arrivedWallMs)

  let deadline = endTime ?? serverNow + limitMs

  // A deadline that is not after the start would submit the quiz at once
  if (!(deadline > serverNow)) deadline = serverNow + limitMs

  return {
    clockOffsetMs: Math.round(serverNow - arrivedWallMs),
    deadlineServerMs: deadline,
    durationMs: deadline - serverNow,
    arrivedWallMs,
    arrivedMonoMs
  }
}

export const getRemainingMs = (clock: QuizClock, nowWallMs: number, nowMonoMs: number): number => {
  const byWallClock = clock.deadlineServerMs - (nowWallMs + clock.clockOffsetMs)
  const byMonotonicClock = clock.arrivedMonoMs + clock.durationMs - nowMonoMs

  return Math.min(byWallClock, byMonotonicClock)
}
