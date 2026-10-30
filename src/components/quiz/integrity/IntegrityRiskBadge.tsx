// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'

// ** Utils
import { RISK_LEVELS, formatExitsSummary } from './integrityFormat'
import type { RiskLevel } from './integrityTypes'

interface IntegrityRiskBadgeProps {
  riskLevel?: string | null
  exitCount?: number | null
  awayMs?: number | null

  // Narrow table cells: only the number of exits, the rest in the tooltip
  compact?: boolean
}

// Risk levels worth a badge; NONE, missing data and unknown values show nothing
export const hasIntegrityBadge = (riskLevel?: string | null) =>
  riskLevel === 'LOW' || riskLevel === 'MEDIUM' || riskLevel === 'HIGH'

/**
 * IntegrityRiskBadge - The quiz integrity risk next to a score in the professor's results lists,
 * for example "4 ieșiri · 3 min 40 s" in the risk colour
 */
const IntegrityRiskBadge: React.FC<IntegrityRiskBadgeProps> = ({ riskLevel, exitCount, awayMs, compact = false }) => {
  if (!hasIntegrityBadge(riskLevel)) return null

  const risk = RISK_LEVELS[riskLevel as RiskLevel]
  const exits = exitCount ? formatExitsSummary(exitCount, awayMs || 0) : null
  const description = exits ? `${risk.label} · ${exits}` : risk.label

  return (
    <Tooltip title={`Integritatea testului: ${description}`}>
      <Box component='span' sx={{ display: 'inline-flex' }} aria-label={`Integritatea testului: ${description}`}>
        <CustomChip
          rounded
          size='small'
          skin='light'
          color={risk.color}
          icon={<Icon icon='tabler:eye-off' fontSize={14} />}
          label={compact ? exitCount || '!' : exits || risk.label}
          sx={{ '& .MuiChip-label': { fontWeight: 500 } }}
        />
      </Box>
    </Tooltip>
  )
}

export default IntegrityRiskBadge
