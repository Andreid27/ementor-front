// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { MotionConfig, motion } from 'framer-motion'

interface ProgressRingProps {
  /** 0–100. */
  value: number
  size?: number
  thickness?: number
  color?: string

  /** What sits in the middle, usually the value as text. */
  children?: ReactNode
}

/**
 * A determinate ring that fills once when it first appears. It is drawn, not
 * read: the value is always also written in the middle, so the ring itself is
 * hidden from screen readers.
 */
const ProgressRing = ({ value, size = 148, thickness = 12, color, children }: ProgressRingProps) => {
  const theme = useTheme()
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const stroke = color ?? theme.palette.primary.main

  return (
    <MotionConfig reducedMotion='user'>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          aria-hidden
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={alpha(theme.palette.text.primary, 0.08)}
            strokeWidth={thickness}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke={stroke}
            strokeWidth={thickness}
            strokeLinecap='round'
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          {children}
        </Box>
      </Box>
    </MotionConfig>
  )
}

export default ProgressRing
