// ** MUI Imports
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableContainer from '@mui/material/TableContainer'
import { useTheme } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'

// ** Custom Components Imports
import { MAX_COHORTS, cohortColor, cohortLabel, cohortUniversity } from './chartStyle'

// ** Types
import type { BenchmarkCohort } from './types'
import type { CohortSelection } from './CohortPicker'

interface CohortTableProps {
  cohorts: BenchmarkCohort[]
  selected: CohortSelection[]
  onToggle: (key: string) => void
}

const numberCell = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const

/**
 * Every cohort with an admission curve. A row's checkbox, or the row itself,
 * puts the cohort on the chart or takes it off; the box takes the line's colour.
 */
const CohortTable = ({ cohorts, selected, onToggle }: CohortTableProps) => {
  const theme = useTheme()
  const slots = new Map(selected.map(item => [item.key, item.slot]))
  const full = selected.length >= MAX_COHORTS

  return (
    <TableContainer>
      <Table size='small' aria-label='Cohortele cu rezultate de admitere'>
        <TableHead>
          <TableRow>
            <TableCell padding='checkbox'>
              <Box component='span' sx={visuallyHidden}>
                Pe grafic
              </Box>
            </TableCell>
            <TableCell>Specializare</TableCell>
            <TableCell>Universitate</TableCell>
            <TableCell sx={numberCell}>Studenți</TableCell>
            <TableCell sx={numberCell}>Teste</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts.map(cohort => {
            const slot = slots.get(cohort.key)
            const checked = slot !== undefined
            const disabled = !checked && full
            const color = checked ? cohortColor(theme, slot) : undefined

            return (
              <TableRow
                key={cohort.key}
                hover={!disabled}
                selected={checked}
                onClick={() => !disabled && onToggle(cohort.key)}
                sx={{ cursor: disabled ? 'not-allowed' : 'pointer', '&.Mui-selected': { bgcolor: 'transparent' } }}
              >
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onClick={event => event.stopPropagation()}
                    onChange={() => onToggle(cohort.key)}
                    inputProps={{
                      'aria-label': `${checked ? 'Scoate de pe grafic' : 'Arată pe grafic'}: ${cohortLabel(cohort)}`
                    }}
                    sx={
                      color
                        ? {
                            // The theme's box is drawn in green; a chosen cohort's box takes its line's colour.
                            '&.Mui-checked svg path:first-of-type': { fill: color },

                            // Dark-theme line colours are light, so the tick turns dark to stay visible.
                            ...(theme.palette.mode === 'dark' && {
                              '&.Mui-checked svg path:last-of-type': {
                                fill: theme.palette.background.paper,
                                stroke: theme.palette.background.paper
                              }
                            })
                          }
                        : undefined
                    }
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{cohort.specialityName}</TableCell>
                <TableCell sx={{ color: cohort.universityName ? 'text.primary' : 'text.secondary' }}>
                  {cohortUniversity(cohort)}
                </TableCell>
                <TableCell sx={numberCell}>{cohort.students}</TableCell>
                <TableCell sx={numberCell}>{cohort.tests.toLocaleString('ro-RO')}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default CohortTable
