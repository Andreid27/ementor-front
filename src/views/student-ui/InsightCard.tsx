// ** React Imports
import { ReactNode, useId } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

interface InsightCardProps {
  title: string
  subtitle?: string

  /** Shown at the right of the title, such as a summary figure or a status pill. */
  aside?: ReactNode
  children: ReactNode
}

/**
 * The frame of every dashboard card: a title that says what the numbers are,
 * one line of context, and the content. It fills its grid cell, so cards on
 * the same row line up.
 */
const InsightCard = ({ title, subtitle, aside, children }: InsightCardProps) => {
  const titleId = useId()

  return (
    <Card
      component='section'
      aria-labelledby={titleId}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 5, sm: 6 } }}
    >
      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            id={titleId}
            component='h2'
            sx={{ fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.35, color: 'text.primary' }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {aside}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 5 }}>{children}</Box>
    </Card>
  )
}

export default InsightCard
