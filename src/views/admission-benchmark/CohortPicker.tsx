// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import LineSwatch from './LineSwatch'
import { MAX_COHORTS, cohortColor, cohortDash, cohortLabel, cohortUniversity } from './chartStyle'
import { countLabel } from 'src/views/student-ui/countLabel'
import { accentInk } from 'src/views/student-ui/readableAccent'

// ** Types
import type { BenchmarkCohort } from './types'

export interface CohortSelection {
  key: string

  /** Fixes the cohort's colour and dash for as long as it stays chosen. */
  slot: number
}

interface CohortPickerProps {
  cohorts: BenchmarkCohort[]
  selected: CohortSelection[]
  onAdd: (key: string) => void
  onRemove: (key: string) => void
}

/** Keeps the always-open list inside the popover instead of floating over it. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const InlineList = ({ disablePortal, anchorEl, open, ...other }: any) => <Box {...other} />

/** The chosen cohorts as removable chips in their line's colour, and a searchable list to add more. */
const CohortPicker = ({ cohorts, selected, onAdd, onRemove }: CohortPickerProps) => {
  const theme = useTheme()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  const byKey = new Map(cohorts.map(cohort => [cohort.key, cohort]))
  const chosen = new Set(selected.map(item => item.key))
  const full = selected.length >= MAX_COHORTS

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
      {selected.map(({ key, slot }) => {
        const cohort = byKey.get(key)
        if (!cohort) return null
        const name = cohortLabel(cohort)

        return (
          <Chip
            key={key}
            variant='outlined'
            icon={
              <Box sx={{ display: 'flex', ml: '10px !important' }}>
                <LineSwatch stroke={cohortColor(theme, slot)} dash={cohortDash(slot)} />
              </Box>
            }
            label={name}
            onDelete={() => onRemove(key)}
            deleteIcon={
              <Box component='span' aria-label={`Scoate ${name} din grafic`} sx={{ display: 'flex' }}>
                <Icon icon='tabler:x' fontSize={16} />
              </Box>
            }
            sx={{
              height: 'auto',
              minHeight: 36,
              maxWidth: '100%',
              borderColor: 'divider',
              '& .MuiChip-label': { py: 1.5, whiteSpace: 'normal', overflowWrap: 'anywhere', color: 'text.primary' }
            }}
          />
        )
      })}

      <Button
        variant='outlined'
        onClick={event => setAnchor(event.currentTarget)}
        disabled={full}
        startIcon={<Icon icon='tabler:plus' fontSize={18} />}
        sx={{
          minHeight: 36,
          fontWeight: 600,
          color: accentInk,
          borderColor: 'divider',
          '&:hover': { borderColor: accentInk }
        }}
      >
        Adaugă cohortă
      </Button>
      {full && (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Poți compara cel mult {MAX_COHORTS} cohorte.
        </Typography>
      )}

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, width: { xs: 'calc(100vw - 32px)', sm: 420 }, p: 3 } } }}
      >
        <Autocomplete
          open
          options={cohorts}
          groupBy={cohort => cohort.specialityName}
          getOptionLabel={cohort => `${cohort.specialityName} ${cohortUniversity(cohort)}`}
          getOptionDisabled={cohort => chosen.has(cohort.key)}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          value={null}
          onChange={(_event, cohort) => {
            if (!cohort) return
            onAdd(cohort.key)
            setAnchor(null)
          }}
          noOptionsText='Nicio cohortă nu se potrivește.'
          ListboxProps={{ style: { maxHeight: 320 } }}
          slotProps={{ paper: { elevation: 0, sx: { mt: 2, boxShadow: 'none' } } }}
          PopperComponent={InlineList}
          renderOption={(props, cohort) => (
            <Box
              component='li'
              {...props}
              key={cohort.key}
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}
            >
              <span>{cohortUniversity(cohort)}</span>
              <Typography
                component='span'
                variant='body2'
                sx={{ ml: 'auto', flexShrink: 0, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
              >
                {chosen.has(cohort.key) ? 'pe grafic' : countLabel(cohort.students, '1 student', 'studenți')}
              </Typography>
            </Box>
          )}
          renderInput={params => (
            <CustomTextField
              {...params}
              autoFocus
              fullWidth
              placeholder='Caută specializarea sau universitatea'
              inputProps={{ ...params.inputProps, 'aria-label': 'Caută o cohortă' }}
            />
          )}
        />
      </Popover>
    </Box>
  )
}

export default CohortPicker
