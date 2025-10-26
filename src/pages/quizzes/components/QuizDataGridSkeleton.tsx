// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme, alpha } from '@mui/material/styles'
import { Card } from '@mui/material'

// ** Custom Component Imports

interface QuizDataGridSkeletonProps {
  rows?: number
}

const QuizDataGridSkeleton: React.FC<QuizDataGridSkeletonProps> = ({ rows = 5 }) => {
  const theme = useTheme()

  return (
    <>
      {/* DataGrid virtual scroller container */}
      <Box
        sx={{
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Column Headers - matching DataGrid header styling exactly */}
        <Box
          sx={{
            minHeight: 56,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent'
          }}
        >
          {/* Test column - flex: 1, minWidth: 300 */}
          <Box sx={{ flex: 1, minWidth: 300, px: 2, pl: 6, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              TEST
            </Typography>
          </Box>

          {/* Durată column - width: 120, center aligned */}
          <Box sx={{ width: 120, display: 'flex', pl: 6, justifyContent: 'center', alignItems: 'center', px: 2 }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              DURATĂ
            </Typography>
          </Box>

          {/* Dificultate column - width: 140, center aligned */}
          <Box sx={{ width: 140, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2, pl: 6 }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              DIFICULTATE
            </Typography>
          </Box>

          {/* Întrebări column - width: 100, center aligned */}
          <Box sx={{ width: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2, pl: 6 }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              ÎNTREBĂRI
            </Typography>
          </Box>

          {/* Status column - width: 140, center aligned */}
          <Box sx={{ width: 140, display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2, pl: 6 }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: alpha(theme.palette.text.secondary, 0.8),
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              STATUS
            </Typography>
          </Box>

          {/* Actions column - width: 80, center aligned */}
          <Box sx={{ width: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', pl: 6, px: 2 }}>
            {/* Empty for actions */}
          </Box>
        </Box>{' '}
        {/* Data Rows Skeleton */}
        <Box>
          {Array.from({ length: rows }).map((_, index) => (
            <Box
              key={index}
              sx={{
                height: 80,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.4),
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                animation: `pulse 1.5s ease-in-out ${index * 0.1}s infinite alternate`,
                '@keyframes pulse': {
                  '0%': {
                    opacity: 0.6
                  },
                  '100%': {
                    opacity: 1
                  }
                }
              }}
            >
              {/* Test column skeleton - flex: 1, minWidth: 300 */}
              <Box sx={{ flex: 1, minWidth: 300, px: 2, py: 2 }}>
                <Skeleton
                  variant='text'
                  width='85%'
                  height={20}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    fontSize: '0.95rem'
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant='circular' width={16} height={16} />
                  <Skeleton variant='text' width={120} height={14} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Durată column skeleton - width: 120, center */}
              <Box sx={{ width: 120, display: 'flex', justifyContent: 'center', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Skeleton variant='circular' width={16} height={16} />
                  <Skeleton variant='text' width={50} height={16} sx={{ borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Dificultate column skeleton - width: 140, center */}
              <Box sx={{ width: 140, display: 'flex', justifyContent: 'center', px: 2 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Skeleton key={starIndex} variant='circular' width={16} height={16} />
                  ))}
                </Box>
              </Box>

              {/* Întrebări column skeleton - width: 100, center */}
              <Box sx={{ width: 100, display: 'flex', justifyContent: 'center', px: 2 }}>
                <Skeleton
                  variant='text'
                  width={30}
                  height={18}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Status column skeleton - width: 140, center */}
              <Box sx={{ width: 140, display: 'flex', justifyContent: 'center', px: 2 }}>
                <Skeleton
                  variant='rectangular'
                  width={90}
                  height={32}
                  sx={{
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.text.secondary, 0.08)
                  }}
                />
              </Box>

              {/* Actions column skeleton - width: 80, center */}
              <Box sx={{ width: 80, display: 'flex', justifyContent: 'center', px: 2 }}>
                <Skeleton
                  variant='circular'
                  width={40}
                  height={40}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Footer with skeleton pagination */}
      <Box
        sx={{
          minHeight: 64,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2
        }}
      >
        <Skeleton variant='text' width={150} height={20} sx={{ borderRadius: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant='text' width={100} height={20} sx={{ borderRadius: 1 }} />
          <Skeleton variant='rectangular' width={80} height={32} sx={{ borderRadius: 1 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant='circular' width={32} height={32} />
            <Skeleton variant='circular' width={32} height={32} />
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default QuizDataGridSkeleton
