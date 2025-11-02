import React, { useState, useCallback } from 'react'
import { Box, CircularProgress, Typography, Button, alpha, Pagination, Skeleton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import QuizMobileCard from './QuizMobileCard'
import { EmptyState } from '.'
import RetryButton from './RetryButton'
import { QuizDataGridProps } from '../types'

const QuizMobileList: React.FC<QuizDataGridProps> = ({
  quizzes,
  loading,
  error,
  totalCount,
  onQuizSelect,
  onRefresh,
  onParamsChange
}) => {
  const theme = useTheme()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10) // Mobile-friendly page size

  const totalPages = Math.ceil(totalCount / pageSize)

  const handlePageChange = useCallback(
    (_event: React.ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage)
      onParamsChange({
        page: newPage - 1, // MUI Pagination is 1-indexed, API is 0-indexed
        pageSize,
        sortModel: [],
        filterModel: { items: [], quickFilterValues: [] }
      })

      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [pageSize, onParamsChange]
  )

  // Loading skeleton for mobile
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              borderRadius: 3,
              p: 2.5
            }}
          >
            {/* Title and Status */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Skeleton variant='text' width='80%' height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant='text' width='50%' height={16} />
              </Box>
              <Skeleton variant='rounded' width={100} height={28} />
            </Box>

            {/* Divider */}
            <Box sx={{ my: 2, height: 1, backgroundColor: alpha(theme.palette.divider, 0.1) }} />

            {/* Details Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
                mb: 2.5
              }}
            >
              {[1, 2, 3].map(i => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Skeleton variant='circular' width={20} height={20} sx={{ mx: 'auto', mb: 0.5 }} />
                  <Skeleton variant='text' width='60%' height={20} sx={{ mx: 'auto', mb: 0.25 }} />
                  <Skeleton variant='text' width='80%' height={14} sx={{ mx: 'auto' }} />
                </Box>
              ))}
            </Box>

            {/* Action Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Skeleton variant='rounded' width={150} height={40} />
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <EmptyState title='Ceva nu a funcționat corect' description={error} icon='tabler:alert-circle' />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <RetryButton onRetry={onRefresh} />
        </Box>
      </Box>
    )
  }

  // Empty state
  if (!loading && quizzes.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <EmptyState
          title='Nu există teste disponibile'
          description='Nu există teste alocate în acest moment.'
          actionLabel='Reîmprospătează'
          onAction={onRefresh}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Quiz Cards */}
      {quizzes.map(quiz => (
        <QuizMobileCard key={quiz.id} quiz={quiz} onSelect={onQuizSelect} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
            mb: 2
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
            size='large'
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                backgroundColor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                },
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.18)
                  }
                }
              }
            }}
          />
        </Box>
      )}

      {/* Results summary */}
      <Box sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
        <Typography
          variant='caption'
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '0.75rem'
          }}
        >
          Afișare {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} din {totalCount} teste
        </Typography>
      </Box>
    </Box>
  )
}

export default QuizMobileList
