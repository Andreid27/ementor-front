// ** React Imports
import { ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { GridToolbarFilterButton } from '@mui/x-data-grid'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface QuickSearchToolbarProps {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  clearSearch: () => void
}

const QuickSearchToolbar: React.FC<QuickSearchToolbarProps> = ({ value, onChange, clearSearch }) => {
  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <GridToolbarFilterButton />
      <CustomTextField
        value={value}
        placeholder='Caută teste...'
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon fontSize='1.25rem' icon='tabler:search' />
            </Box>
          ),
          endAdornment: (
            <IconButton
              size='small'
              title='Șterge căutarea'
              aria-label='Clear search'
              onClick={clearSearch}
              sx={{ visibility: value ? 'visible' : 'hidden' }}
            >
              <Icon fontSize='1.25rem' icon='tabler:x' />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
    </Box>
  )
}

export default QuickSearchToolbar
