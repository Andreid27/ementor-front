import React, { useState, useCallback, useMemo } from 'react'
import { Card, Box, Typography, Rating, IconButton, Tooltip, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridFilterModel,
  GridSortModel,
  GridPaginationModel,
  GridValueGetterParams
} from '@mui/x-data-grid'
import { formatDuration } from 'date-fns'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import BookIcon from '@mui/icons-material/Book'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

import { EmptyState } from '.'
import RetryButton from './RetryButton'
import QuizDataGridSkeleton from './QuizDataGridSkeleton'

import { getDifficultyColor } from '../utils/transformers'
import { QuizDataGridProps, QuizGridRow } from '../types'

// Apple-inspired Status Chip
const AppleStatusChip = ({ status, score }: { status: string; score?: number }) => {
  const theme = useTheme()

  const getStatusConfig = () => {
    if (status === 'completed' && typeof score === 'number') {
      if (score >= 80) {
        return {
          label: `${score}%`,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.12),
          icon: '✓'
        }
      } else if (score >= 60) {
        return {
          label: `${score}%`,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.12),
          icon: '⚠'
        }
      } else {
        return {
          label: `${score}%`,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.12),
          icon: '✗'
        }
      }
    }

    switch (status) {
      case 'in_progress':
        return {
          label: 'În curs',
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.12),
          icon: '●'
        }
      case 'overdue':
        return {
          label: 'Expirat',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.12),
          icon: '!'
        }
      default:
        return {
          label: 'Disponibil',
          color: alpha(theme.palette.text.secondary, 0.8),
          bgColor: alpha(theme.palette.text.secondary, 0.08),
          icon: '○'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        borderRadius: 2.5,
        backgroundColor: config.bgColor,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        minWidth: 90,
        justifyContent: 'center'
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: config.color,
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.025em'
        }}
      >
        {config.icon} {config.label}
      </Typography>
    </Box>
  )
}

// Apple-inspired Action Button
const AppleActionButton = ({ quiz, onStartQuiz }: { quiz: QuizGridRow; onStartQuiz: (id: string) => void }) => {
  const theme = useTheme()

  const getActionConfig = () => {
    if (quiz.status === 'completed') {
      return {
        title: 'Revizuiește rezultatele',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.08)
      }
    } else {
      return {
        title: 'Începe testul',
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.08)
      }
    }
  }

  const config = getActionConfig()

  return (
    <Tooltip title={config.title} placement='top'>
      <IconButton
        onClick={e => {
          e.stopPropagation()
          onStartQuiz(quiz.id)
        }}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: config.bgColor,
          border: `1px solid ${alpha(config.color, 0.2)}`,
          color: config.color,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

          '&:hover': {
            backgroundColor: alpha(config.color, 0.12),
            borderColor: alpha(config.color, 0.3),
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(config.color, 0.25)}`
          },

          '&:active': {
            transform: 'translateY(0)',
            boxShadow: `0 2px 8px ${alpha(config.color, 0.2)}`
          }
        }}
      >
        <PlayArrowIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  )
}
const QuizDataGrid: React.FC<QuizDataGridProps> = ({
  quizzes,
  loading,
  error,
  totalCount,
  onQuizSelect,
  onRefresh,
  onParamsChange
}) => {
  const theme = useTheme()

  // ** State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5
  })
  const [sortModel, setSortModel] = useState<GridSortModel>([])
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: []
  })

  // ** Handlers

  const handlePaginationChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel)
      onParamsChange({
        page: newModel.page,
        pageSize: newModel.pageSize,
        sortModel,
        filterModel: {
          items: filterModel.items || [],
          quickFilterValues: filterModel.quickFilterValues || []
        }
      })
    },
    [sortModel, filterModel, onParamsChange]
  )

  const handleSortChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel)
      onParamsChange({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortModel: newModel,
        filterModel: {
          items: filterModel.items || [],
          quickFilterValues: filterModel.quickFilterValues || []
        }
      })
    },
    [paginationModel, filterModel, onParamsChange]
  )

  const handleFilterChange = useCallback(
    (newModel: GridFilterModel) => {
      setFilterModel(newModel)
      onParamsChange({
        page: 0,
        pageSize: paginationModel.pageSize,
        sortModel,
        filterModel: {
          items: newModel.items || [],
          quickFilterValues: newModel.quickFilterValues || []
        }
      })
      setPaginationModel(prev => ({ ...prev, page: 0 }))
    },
    [paginationModel.pageSize, sortModel, onParamsChange]
  )

  const handleRowClick = useCallback(
    (params: GridRowParams) => {
      onQuizSelect(params.row.id)
    },
    [onQuizSelect]
  )
  // ** Apple-inspired Column Definitions
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'title',
        headerName: 'Test',
        flex: 1,
        minWidth: 300,
        sortable: true,
        filterable: true,
        renderCell: params => (
          <Box sx={{ py: 2 }}>
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                lineHeight: 1.3,
                fontSize: '0.95rem'
              }}
            >
              {params.value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookIcon
                fontSize='small'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.6),
                  fontSize: '1rem'
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.8),
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}
              >
                {params.row.chapter}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'duration',
        headerName: 'Durată',
        width: 120,
        sortable: true,
        filterable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => {
          const formattedDuration = `${params.value} minute`
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <AccessTimeIcon
                fontSize='small'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.6),
                  fontSize: '1rem'
                }}
              />
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}
              >
                {formattedDuration}
              </Typography>
            </Box>
          )
        }
      },
      {
        field: 'difficulty',
        headerName: 'Dificultate',
        width: 140,
        sortable: true,
        filterable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => (
          <Rating
            value={params.value}
            max={5}
            precision={1}
            readOnly
            size='small'
            sx={{
              '& .MuiRating-iconFilled': {
                color: getDifficultyColor(params.value)
              },
              '& .MuiRating-icon': {
                fontSize: '1.1rem'
              }
            }}
          />
        )
      },
      {
        field: 'questionsCount',
        headerName: 'Întrebări',
        width: 105,
        sortable: true,
        filterable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => (
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '0.9rem'
            }}
          >
            {params.value}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 140,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <AppleStatusChip status={params.value} score={params.row.score} />
      },
      {
        field: 'actions',
        headerName: '',
        width: 80,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => <AppleActionButton quiz={params.row} onStartQuiz={onQuizSelect} />
      }
    ],
    [onQuizSelect, theme]
  )
  // ** Row styling with Apple aesthetics
  const getRowClassName = useCallback((params: GridRowParams) => {
    const status = params.row.status
    const score = params.row.score

    if (status === 'completed' && typeof score === 'number') {
      if (score >= 80) return 'quiz-row-success'
      if (score >= 60) return 'quiz-row-warning'
      return 'quiz-row-error'
    }

    switch (status) {
      case 'overdue':
        return 'quiz-row-overdue'
      case 'in_progress':
        return 'quiz-row-in-progress'
      default:
        return ''
    }
  }, [])

  // Use modified skeleton with headers and skeleton rows only (no search)
  if (loading) {
    return <QuizDataGridSkeleton rows={paginationModel.pageSize} />
  }

  if (error) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <EmptyState title='Ceva nu a funcționat corect' description={error} icon='tabler:alert-circle' />
        <Box sx={{ mt: 3 }}>
          <RetryButton onRetry={onRefresh} />
        </Box>
      </Box>
    )
  }

  return (
    <>
      <DataGrid
        rows={quizzes}
        columns={columns}
        loading={false}
        // Pagination
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 25, 50]}
        rowCount={totalCount}
        paginationMode='server'
        // Sorting
        sortModel={sortModel}
        onSortModelChange={handleSortChange}
        sortingMode='server'
        // Filtering
        filterModel={filterModel}
        onFilterModelChange={handleFilterChange}
        filterMode='server'
        // Quick filter (search) configuration
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 }
          }
        }}
        // Row interaction
        onRowClick={handleRowClick}
        getRowClassName={getRowClassName}
        // No toolbar - moved outside
        // Apple-inspired styling
        disableRowSelectionOnClick
        rowHeight={80}
        autoHeight
        sx={{
          border: 'none',
          backgroundColor: 'transparent',

          // Clean header styling
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'transparent',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            minHeight: '56px !important',

            '& .MuiDataGrid-columnHeader': {
              '&:focus, &:focus-within': {
                outline: 'none'
              }
            },

            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.8rem',
              color: alpha(theme.palette.text.secondary, 0.8),
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }
          },

          // Clean cell styling
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            '&:focus, &:focus-within': {
              outline: 'none'
            }
          },

          // Apple-inspired row styling
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

            '&:hover': {
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`
            },

            // Result-based subtle styling
            '&.quiz-row-success': {
              borderLeft: `3px solid ${alpha(theme.palette.success.main, 0.6)}`
            },
            '&.quiz-row-warning': {
              borderLeft: `3px solid ${alpha(theme.palette.warning.main, 0.6)}`
            },
            '&.quiz-row-error': {
              borderLeft: `3px solid ${alpha(theme.palette.error.main, 0.6)}`
            },
            '&.quiz-row-overdue': {
              borderLeft: `3px solid ${alpha(theme.palette.error.main, 0.6)}`
            },
            '&.quiz-row-in-progress': {
              borderLeft: `3px solid ${alpha(theme.palette.info.main, 0.6)}`
            }
          },

          // Clean footer styling
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            minHeight: '64px',

            '& .MuiTablePagination-root': {
              color: theme.palette.text.primary
            }
          },

          // Hide scrollbars for cleaner look
          '& .MuiDataGrid-virtualScroller': {
            '&::-webkit-scrollbar': {
              width: 6,
              height: 6
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.text.secondary, 0.2),
              borderRadius: 3,

              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.3)
              }
            }
          }
        }}
      />

      {!loading && quizzes.length === 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <EmptyState
            title='Nu există teste disponibile'
            description='Nu există teste alocate în acest moment.'
            actionLabel='Reîmprospătează'
            onAction={onRefresh}
          />
        </Box>
      )}
    </>
  )
}

export default QuizDataGrid
