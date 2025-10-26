// CountdownTimer.js

import { Box } from '@mui/material'
import { tr } from 'date-fns/locale'
import React from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const CountdownTimer = props => {
  const currentTime = Date.now() / 1000
  const endTime = props.targetTimestamp / 1000
  const startTime = props.startTime / 1000

  let duration = 0
  let initialRemaining = 0

  if (props.timeFinished || props.completed) {
    // Results view - show total time taken
    duration = endTime - startTime
    initialRemaining = endTime - startTime
  } else {
    // Active quiz - show remaining time from current moment
    const timeLeft = Math.max(0, endTime - currentTime)
    duration = timeLeft
    initialRemaining = timeLeft
  }

  return (
    <>
      <svg>
        <defs>
          <linearGradient id='your-unique-id' x1='1' y1='0' x2='0' y2='0'>
            <stop offset='5%' stopColor='#00CFE8' />
            <stop offset='95%' stopColor='#28C76F' />
          </linearGradient>
        </defs>
      </svg>
      <CountdownCircleTimer
        isPlaying={!(props.timeFinished || props.completed)}
        duration={duration}
        initialRemainingTime={initialRemaining}
        colors={'url(#your-unique-id)'}
        strokeWidth={6}
        size={props.size}
        onComplete={() => {
          props.setCompleted(true) // Set the completed state to true
          props.setTimeFinished(true)

          return [false, 0] // Stop the timer
        }} // Don't repeat the timer
      >
        {({ remainingTime, color }) => {
          // Use Math.floor and modulo for all the calculations
          const hours = Math.floor(Math.abs(remainingTime) / (60 * 60)) % 24
          const minutes = Math.floor(Math.abs(remainingTime) / 60) % 60
          const seconds = Math.floor(Math.abs(remainingTime)) % 60

          return (
            <div className='time-wrapper'>
              <div style={{ color }}>{hours} hours</div>
              <div style={{ color }}>{minutes} minutes</div>
              <div style={{ color }}>{seconds} seconds</div>
            </div>
          )
        }}
      </CountdownCircleTimer>
    </>
  )
}

export default CountdownTimer
