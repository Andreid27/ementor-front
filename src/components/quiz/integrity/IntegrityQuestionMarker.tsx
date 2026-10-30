// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'

// ** Utils
import { QUESTION_FLAGS, formatDuration } from './integrityFormat'
import type { IntegrityQuestionStats } from './integrityTypes'

const MIN_AWAY_MS = 1000

const shownFlags = (stats: IntegrityQuestionStats) => (stats.flags || []).filter(flag => QUESTION_FLAGS[flag])

export const hasIntegrityMarker = (stats?: IntegrityQuestionStats) =>
  Boolean(stats && (shownFlags(stats).length > 0 || stats.awayWhileOnScreenMs >= MIN_AWAY_MS))

/**
 * IntegrityQuestionMarker - Marks a question in the professor's review that was answered right after an exit,
 * read while another window had focus, or left for a while before its first answer
 */
const IntegrityQuestionMarker: React.FC<{ stats?: IntegrityQuestionStats }> = ({ stats }) => {
  if (!hasIntegrityMarker(stats)) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {shownFlags(stats).map(flag => (
        <CustomChip
          key={flag}
          rounded
          size='small'
          skin='light'
          color={flag === 'VIEWED_WHILE_UNFOCUSED' ? 'warning' : 'error'}
          icon={<Icon icon='tabler:alert-triangle' fontSize={14} />}
          label={QUESTION_FLAGS[flag]}
        />
      ))}
      {stats.awayWhileOnScreenMs >= MIN_AWAY_MS && (
        <CustomChip
          rounded
          size='small'
          skin='light'
          color='secondary'
          icon={<Icon icon='tabler:door-exit' fontSize={14} />}
          label={`În afara testului înainte de răspuns: ${formatDuration(stats.awayWhileOnScreenMs)}`}
        />
      )}
    </Box>
  )
}

export default IntegrityQuestionMarker
