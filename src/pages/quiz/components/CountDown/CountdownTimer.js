// CountdownTimer.js

import { Box } from '@mui/material'
import { tr } from 'date-fns/locale'
import React from 'react'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const CountdownTimer = props => {
  const startTime = props.startTime / 1000 // use UNIX timestamp in seconds
  const endTime = props.targetTimestamp / 1000 // use UNIX timestamp in seconds

  let remainingTime = 0
  if (props.timeFinished || props.completed) {
    remainingTime = endTime - startTime
  } else {
    remainingTime = endTime - startTime
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
        duration={props.initialTimeRemaining ? props.initialTimeRemaining : remainingTime}
        initialRemainingTime={props.initialTimeRemaining ? remainingTime : null}
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
          const hours = Math.floor(remainingTime / (60 * 60)) % 24
          const minutes = Math.floor(remainingTime / 60) % 60
          const seconds = Math.floor(remainingTime) % 60

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
