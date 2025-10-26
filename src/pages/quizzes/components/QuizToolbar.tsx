// ** React Imports
import React, { useState, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { useTheme, alpha } from '@mui/material/styles'

// ** Icons
import SearchIcon from '@mui/icons-material/Search'

interface QuizToolbarProps {
  onSearch?: (searchTerm: string) => void
  disabled?: boolean
}

const QuizToolbar: React.FC<QuizToolbarProps> = ({ onSearch, disabled = false }) => {
  const theme = useTheme()
  const [searchValue, setSearchValue] = useState('')

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSearchValue(value)
      onSearch?.(value)
    },
    [onSearch]
  )

  return (
    <Box
      sx={{
        minHeight: 72,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        backgroundColor: 'transparent',
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
        Quizzes
      </Typography>

      <TextField
        placeholder='Search quizzes...'
        value={searchValue}
        onChange={handleSearchChange}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.6),
                  fontSize: '1.2rem'
                }}
              />
            </InputAdornment>
          )
        }}
        sx={{
          minWidth: 280,
          '& .MuiInputBase-root': {
            borderRadius: 3,
            backgroundColor: disabled
              ? alpha(theme.palette.background.paper, 0.4)
              : alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            height: 44,
            fontSize: '0.95rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

            '&:hover': !disabled
              ? {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
                }
              : {},

            '&.Mui-focused': !disabled
              ? {
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`
                }
              : {},

            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
              borderColor: alpha(theme.palette.divider, 0.08),
              cursor: 'not-allowed'
            }
          },
          '& .MuiInputBase-input': {
            padding: '12px 16px',
            '&::placeholder': {
              color: alpha(theme.palette.text.secondary, 0.6),
              opacity: 1
            },
            '&.Mui-disabled': {
              color: alpha(theme.palette.text.secondary, 0.5),
              WebkitTextFillColor: alpha(theme.palette.text.secondary, 0.5)
            }
          },
          '& .MuiInputAdornment-root': {
            marginLeft: 1
          }
        }}
      />
    </Box>
  )
}

export default QuizToolbar
