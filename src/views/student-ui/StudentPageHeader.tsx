// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface StudentPageHeaderProps {
  title: string
  subtitle?: string

  /** Controls for the page, such as search; they move under the title on phones. */
  children?: ReactNode
}

/** Title row shared by the student's list pages, so Cursuri and Teste open the same way. */
const StudentPageHeader = ({ title, subtitle, children }: StudentPageHeaderProps) => (
  <Box
    sx={{
      px: { xs: 5, md: 6 },
      pt: { xs: 5, md: 6 },
      pb: { xs: 4, md: 5 },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: { xs: 'stretch', md: 'flex-end' },
      justifyContent: 'space-between',
      gap: 3
    }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography
        component='h1'
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          lineHeight: 1.2,
          letterSpacing: '-0.02em'
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: '0.9375rem', lineHeight: 1.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Box>
)

export default StudentPageHeader
