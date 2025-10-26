// ** MUI Theme Extensions for DataGrid
import { Theme } from '@mui/material/styles'

export const createDataGridTheme = (theme: Theme) => ({
  // Clean, modern DataGrid styling
  '& .MuiDataGrid-root': {
    border: 'none',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    fontFamily: theme.typography.fontFamily
  },

  // Modern column headers
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
    borderBottom: `2px solid ${theme.palette.divider}`,
    borderRadius: 0,
    minHeight: '56px !important',

    '& .MuiDataGrid-columnHeader': {
      padding: theme.spacing(0, 2),
      '&:focus, &:focus-within': {
        outline: 'none'
      },

      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
        textTransform: 'none',
        letterSpacing: '0.025em'
      },

      '& .MuiDataGrid-iconButtonContainer': {
        visibility: 'visible',
        width: 'auto'
      },

      '& .MuiDataGrid-sortIcon': {
        color: theme.palette.primary.main,
        opacity: 1
      }
    }
  },

  // Clean cell styling
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',

    '&:focus, &:focus-within': {
      outline: 'none'
    }
  },

  // Modern row styling with subtle hover effects
  '& .MuiDataGrid-row': {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : `${theme.palette.primary.main}08`,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[2]
    },

    '&.Mui-selected': {
      backgroundColor: `${theme.palette.primary.main}12`,

      '&:hover': {
        backgroundColor: `${theme.palette.primary.main}16`
      }
    },

    // Status-specific row styling with left border indicators
    '&.quiz-row-overdue': {
      backgroundColor: `${theme.palette.error.main}04`,
      borderLeft: `4px solid ${theme.palette.error.main}`,

      '&:hover': {
        backgroundColor: `${theme.palette.error.main}08`,
        boxShadow: `0 2px 8px ${theme.palette.error.main}20`
      }
    },

    '&.quiz-row-completed': {
      backgroundColor: `${theme.palette.success.main}04`,
      borderLeft: `4px solid ${theme.palette.success.main}`,

      '&:hover': {
        backgroundColor: `${theme.palette.success.main}08`,
        boxShadow: `0 2px 8px ${theme.palette.success.main}20`
      }
    },

    '&.quiz-row-in-progress': {
      backgroundColor: `${theme.palette.warning.main}04`,
      borderLeft: `4px solid ${theme.palette.warning.main}`,

      '&:hover': {
        backgroundColor: `${theme.palette.warning.main}08`,
        boxShadow: `0 2px 8px ${theme.palette.warning.main}20`
      }
    }
  },

  // Modern footer styling
  '& .MuiDataGrid-footerContainer': {
    borderTop: `2px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
    minHeight: '56px',

    '& .MuiTablePagination-root': {
      color: theme.palette.text.primary
    },

    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
      fontWeight: 500
    },

    '& .MuiIconButton-root': {
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  },

  // Toolbar styling
  '& .MuiDataGrid-toolbarContainer': {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,

    '& .MuiButton-root': {
      borderRadius: theme.spacing(1),
      textTransform: 'none',
      fontWeight: 500,
      transition: 'all 0.2s ease-in-out',

      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[2]
      }
    }
  },

  // Custom scrollbar
  '& .MuiDataGrid-virtualScroller': {
    '&::-webkit-scrollbar': {
      width: 8,
      height: 8
    },
    '& ::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.action.hover,
      borderRadius: 4
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.action.disabled,
      borderRadius: 4,

      '&:hover': {
        backgroundColor: theme.palette.action.active
      }
    }
  },

  // Loading overlay
  '& .MuiDataGrid-overlay': {
    backgroundColor: `${theme.palette.background.paper}F8`,
    backdropFilter: 'blur(2px)'
  },

  // No rows overlay
  '& .MuiDataGrid-overlayWrapper': {
    minHeight: 400
  },

  // Filter panel styling
  '& .MuiDataGrid-filterForm': {
    padding: theme.spacing(2),
    gap: theme.spacing(2)
  },

  // Column menu styling
  '& .MuiDataGrid-columnMenu': {
    '& .MuiMenuItem-root': {
      borderRadius: theme.spacing(1),
      margin: theme.spacing(0.5),

      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  }
})

// Animation keyframes for smooth interactions
export const dataGridAnimations = {
  '@keyframes slideInUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  },

  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },

  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.4)'
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)'
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)'
    }
  }
}
