// ** MUI Imports
import Box from '@mui/material/Box'
import { alpha, SxProps, Theme, useTheme } from '@mui/material/styles'

// ** Local Imports
import { accentInk } from './readableAccent'

/** The soft green wash a character stands on: the "stage" of the student pages. */
export const stageBackground = (theme: Theme) => {
  const light = theme.palette.mode === 'light'

  return `linear-gradient(155deg, ${alpha(theme.palette.primary.main, light ? 0.14 : 0.16)} 0%, ${alpha(
    theme.palette.primary.main,
    light ? 0.05 : 0.07
  )} 100%)`
}

interface StageBackdropProps {
  /** Position and size of the halo; the ring follows it. */
  sx?: SxProps<Theme>
}

/**
 * A light halo with a thin orbit ring around it, placed behind a character. It
 * is the same backdrop the app's sign-in illustrations stand on. Decorative only.
 */
const StageBackdrop = ({ sx }: StageBackdropProps) => {
  const theme = useTheme()

  return (
    <Box
      aria-hidden
      sx={[
        {
          position: 'absolute',
          borderRadius: '50%',
          pointerEvents: 'none',
          background: `radial-gradient(circle, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(
            theme.palette.background.paper,
            0
          )} 70%)`,
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: { xs: -14, md: -22 },
            borderRadius: '50%',
            border: `1px solid ${alpha(accentInk(theme), 0.16)}`
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    />
  )
}

export default StageBackdrop
