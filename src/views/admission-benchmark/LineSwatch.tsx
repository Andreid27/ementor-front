// ** MUI Imports
import Box from '@mui/material/Box'

interface LineSwatchProps {
  stroke: string
  dash?: string
  width?: number

  /** Fill of a point mark in the middle, for a series drawn with points. */
  dot?: string

  /** False for a series drawn as points alone. */
  line?: boolean
}

/** A legend mark drawn the way its line is drawn on the chart: colour, thickness, dashes and points. */
const LineSwatch = ({ stroke, dash, width = 2.5, dot, line = true }: LineSwatchProps) => (
  <Box component='svg' aria-hidden width={24} height={12} viewBox='0 0 24 12' sx={{ flexShrink: 0, display: 'block' }}>
    {line && (
      <line
        x1={1}
        y1={6}
        x2={23}
        y2={6}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        strokeLinecap='round'
      />
    )}
    {dot && <circle cx={12} cy={6} r={3.5} fill={dot} stroke={stroke} strokeWidth={2} />}
  </Box>
)

export default LineSwatch
