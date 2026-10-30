// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'

/** Placeholder with the shape of the journey guide: a tinted stage and four steps. */
export const JourneySkeleton = () => (
  <Card
    aria-hidden
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
      overflow: 'hidden'
    }}
  >
    <Box
      sx={{
        minHeight: { xs: 200, md: 420 },
        p: { xs: 5, sm: 6, md: 8 },
        bgcolor: theme => alpha(theme.palette.primary.main, 0.08)
      }}
    >
      <Skeleton width={140} height={18} />
      <Skeleton width='70%' height={44} sx={{ mt: 1 }} />
      <Skeleton width='85%' height={20} sx={{ mt: 2 }} />
    </Box>
    <Box sx={{ px: { xs: 5, sm: 6, md: 8 }, py: { xs: 6, md: 8 } }}>
      {[0, 1, 2, 3].map(index => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: index === 3 ? 0 : 6 }}>
          <Skeleton variant='circular' width={32} height={32} sx={{ flexShrink: 0 }} />
          <Skeleton width={index === 2 ? '60%' : '45%'} height={22} />
        </Box>
      ))}
    </Box>
  </Card>
)

export const CardSkeleton = () => (
  <Card aria-hidden sx={{ p: { xs: 5, sm: 6 }, height: '100%' }}>
    <Skeleton width={120} height={24} />
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}>
      <Skeleton variant='rounded' width={56} height={56} sx={{ borderRadius: '16px' }} />
      <Skeleton width='50%' height={22} />
      <Skeleton width='70%' height={18} />
    </Box>
  </Card>
)

/** Shown on the very first load, before any dashboard data exists on this device. */
const DashboardSkeleton = () => (
  <>
    <Grid item xs={12}>
      <JourneySkeleton />
    </Grid>
    <Grid item xs={12} md={6}>
      <CardSkeleton />
    </Grid>
    <Grid item xs={12} md={6}>
      <CardSkeleton />
    </Grid>
  </>
)

export default DashboardSkeleton
