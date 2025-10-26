import React, { useCallback } from 'react'
import { Box, Typography, InputBase, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import SearchIcon from '@mui/icons-material/Search'

interface AppleToolbarProps {
  onSearchChange?: (searchValue: string) => void
  searchValue?: string
}

const AppleToolbar: React.FC<AppleToolbarProps> = ({ onSearchChange, searchValue = '' }) => {
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
    <Box
      sx={{
        width: '100%',
        minHeight: 72,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <Typography
        variant='h5'
        sx={{
          fontWeight: 600,
          fontSize: '1.75rem',
          color: 'text.primary',
          letterSpacing: '-0.025em'
        }}
      >
        Teste
      </Typography>
      <Box
        sx={{
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          minWidth: 280,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderColor: alpha(theme.palette.divider, 0.2)
          },
          '&:focus-within': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
          }
        }}
      >
        <SearchIcon
          sx={{
            color: alpha(theme.palette.text.secondary, 0.6),
            fontSize: '1.25rem',
            mr: 1
          }}
        />
        <InputBase
          placeholder='Caută teste...'
          value={searchValue}
          onChange={handleSearchChange}
          sx={{
            flex: 1,
            color: 'text.primary',
            fontSize: '0.9rem',
            '& input::placeholder': {
              color: alpha(theme.palette.text.secondary, 0.6),
              opacity: 1
            }
          }}
        />
      </Box>
    </Box>
  )
}

export default AppleToolbar
