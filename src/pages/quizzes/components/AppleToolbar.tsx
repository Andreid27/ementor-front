import React, { useCallback } from 'react'
import { Box, InputBase, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'
import StudentPageHeader from 'src/views/student-ui/StudentPageHeader'

interface AppleToolbarProps {
  onSearchChange?: (searchValue: string) => void
  searchValue?: string
  subtitle?: string

  /** Searching an empty list finds nothing, so the page hides the field until there are tests. */
  showSearch?: boolean
}

const AppleToolbar: React.FC<AppleToolbarProps> = ({ onSearchChange, searchValue = '', subtitle, showSearch = true }) => {
  const theme = useTheme()

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (onSearchChange) {
        onSearchChange(value)
      }
    },
    [onSearchChange]
  )

  return (
    <StudentPageHeader title='Teste' subtitle={subtitle}>
      {showSearch && (
        <Box
          sx={{
            borderRadius: 3,
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            minWidth: { md: 280 },
            width: { xs: '100%', md: 'auto' },
            height: 44,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              borderColor: alpha(theme.palette.text.primary, 0.3)
            },
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`
            }
          }}
        >
          <SearchIcon aria-hidden sx={{ color: 'text.secondary', fontSize: '1.25rem', mr: 1 }} />
          <InputBase
            placeholder='Caută după titlu'
            value={searchValue}
            onChange={handleSearchChange}
            inputProps={{ 'aria-label': 'Caută teste după titlu', type: 'search', enterKeyHint: 'search' }}
            sx={{
              flex: 1,
              color: 'text.primary',
              fontSize: '0.9375rem',
              '& input::placeholder': {
                color: 'text.secondary',
                opacity: 1
              }
            }}
          />
        </Box>
      )}
    </StudentPageHeader>
  )
}

export default AppleToolbar
