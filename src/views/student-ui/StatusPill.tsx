// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Local Imports
import { toneInk, toneWash } from './readableAccent'

export type StatusTone = 'accent' | 'info' | 'warning' | 'error' | 'neutral'

interface StatusPillProps {
  tone: StatusTone

  /** Shapes keep the states apart for people who don't tell the colours apart. */
  icon: string
  children: ReactNode
}

/** A small status label: tinted background, readable text, and an icon so colour is never the only cue. */
const StatusPill = ({ tone, icon, children }: StatusPillProps) => {
  const theme = useTheme()

  const base =
    tone === 'accent'
      ? theme.palette.primary.main
      : tone === 'neutral'
      ? theme.palette.text.secondary
      : theme.palette[tone].main

  const color = tone === 'neutral' ? theme.palette.text.secondary : toneInk(theme, base)

  return (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2.5,
        py: 0.75,
        borderRadius: 999,
        fontSize: '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        color,
        bgcolor: alpha(base, tone === 'neutral' ? 0.08 : toneWash(theme))
      }}
    >
      <Icon icon={icon} fontSize='0.9375rem' style={{ flexShrink: 0 }} />
      {children}
    </Box>
  )
}

export default StatusPill
