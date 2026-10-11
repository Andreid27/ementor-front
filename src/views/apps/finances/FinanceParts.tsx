// ** MUI Imports
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// ** Types
import type { FinanceStudentRefDTO } from 'src/generated/profile-service-client/api'

// ** Utils
import { financeErrorMessage, studentName } from './financeUtils'

// The theme's tinted alerts put colored text on a tint of the same color (1.7–2.9:1). Here only the icon
// keeps the color; text and actions use the regular text color (6.3:1 light, 4.5:1 dark).
export const readableAlertSx = (color: 'warning' | 'info' | 'error') => ({
  color: 'text.primary',
  '& .MuiAlertTitle-root': { color: 'text.primary' },
  '& .MuiAlert-icon': { color: `${color}.main` }
})

interface SectionErrorProps {
  error: unknown
  onRetry: () => void
}

export const SectionError = ({ error, onRetry }: SectionErrorProps) => (
  <Alert
    severity='error'
    sx={readableAlertSx('error')}
    action={
      <Button variant='outlined' color='inherit' size='small' onClick={onRetry}>
        Reîncearcă
      </Button>
    }
  >
    {financeErrorMessage(error)}
  </Alert>
)

interface LegendKeyProps {
  color: string
  shape?: 'bar' | 'line'
}

// Mirrors the mark it stands for: a square for bars, a short stroke for the line
export const LegendKey = ({ color, shape = 'bar' }: LegendKeyProps) => (
  <Box
    aria-hidden
    sx={{
      flexShrink: 0,
      bgcolor: color,
      ...(shape === 'line' ? { width: 14, height: 2, borderRadius: 1 } : { width: 10, height: 10, borderRadius: 0.5 })
    }}
  />
)

interface StudentIdentityProps {
  student: FinanceStudentRefDTO
  detail?: string
  size?: number
}

export const StudentIdentity = ({ student, detail, size = 34 }: StudentIdentityProps) => {
  const name = studentName(student)

  return (
    <Box sx={{ minWidth: 0, gap: 3, display: 'flex', alignItems: 'center' }}>
      <EmentorAvatar
        userId={student.studentId}
        userType={UserType.STUDENT}
        alt={name}
        sx={{ width: size, height: size, fontSize: size * 0.4, flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>
          {name}
        </Typography>
        {detail && (
          <Typography noWrap variant='body2' sx={{ color: 'text.secondary' }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

interface StatusChipProps {
  label: string
  icon: string
  color: 'success' | 'warning' | 'error' | 'secondary'
}

// Status is always an icon plus a word. The theme's light chips color the word too (1.8–2.9:1 on their
// tint); here only the icon carries the color and the word uses the regular text color.
export const StatusChip = ({ label, icon, color }: StatusChipProps) => (
  <CustomChip
    rounded
    size='small'
    skin='light'
    color={color}
    label={label}
    icon={<Icon icon={icon} fontSize={14} />}
    sx={{ color: 'text.primary', '& .MuiChip-icon': { color: `${color}.main` } }}
  />
)

// Romanian table texts, shared with the student list
export { gridLocaleText } from 'src/@core/utils/grid-locale-ro'

// Holds the previous render at reduced opacity while a section refetches, so nothing jumps
export const refetchSx = (refetching: boolean) => ({
  opacity: refetching ? 0.55 : 1,
  transition: 'opacity 150ms ease-out'
})
