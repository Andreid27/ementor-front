// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Types
import { PriceGroup } from 'src/pages/apps/user/list/utils'

interface PriceGroupsCardProps {
  groups: PriceGroup[]
}

// One hue at stepped strength, so color only encodes order and never clashes
// with the success/error meaning used by the other cards
const PRIMARY_STRENGTHS = [1, 0.7, 0.45, 0.25]

const formatRon = (value: number): string => `${value.toFixed(2)} RON`

const formatStudents = (count: number): string => `${count} ${count === 1 ? 'student' : 'students'}`

const PriceGroupsCard = ({ groups = [] }: PriceGroupsCardProps) => {
  // ** Hook
  const theme = useTheme()

  const totalStudents = groups.reduce((sum, group) => sum + group.studentCount, 0)
  const totalAmount = groups.reduce((sum, group) => sum + group.total, 0)

  // "Other prices" merges several prices, so it stays neutral instead of taking a step of the hue
  const getGroupColor = (group: PriceGroup, index: number): string =>
    group.priceCount > 1
      ? theme.palette.secondary.main
      : alpha(theme.palette.primary.main, PRIMARY_STRENGTHS[index] ?? PRIMARY_STRENGTHS[PRIMARY_STRENGTHS.length - 1])

  return (
    <Card>
      <CardContent>
        <Box sx={{ gap: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography sx={{ mb: 1, color: 'text.secondary' }}>Price Groups</Typography>
            <Typography variant='h4' sx={{ mb: 1, fontVariantNumeric: 'tabular-nums' }}>
              {formatRon(totalAmount)}
            </Typography>
            <Typography variant='h6' sx={{ color: 'text.secondary' }}>
              {totalStudents > 0 ? `${formatStudents(totalStudents)} · one session each` : 'No prices set yet'}
            </Typography>
          </Box>
          <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 38, height: 38 }}>
            <Icon icon='tabler:tags' fontSize={24} />
          </CustomAvatar>
        </Box>

        {groups.length > 0 && (
          <>
            {/* Share of students per price; decorative, the legend below carries the same numbers as text */}
            <Box aria-hidden sx={{ my: 5, height: 8, gap: 0.5, display: 'flex' }}>
              {groups.map((group, index) => (
                <Box
                  key={group.label}
                  sx={{
                    minWidth: 4,
                    flexBasis: 0,
                    borderRadius: 1,
                    flexGrow: group.studentCount,
                    bgcolor: getGroupColor(group, index)
                  }}
                />
              ))}
            </Box>

            <Grid container spacing={4}>
              {groups.map((group, index) => (
                <Grid item xs={6} md={3} key={group.label}>
                  <Box sx={{ mb: 1, gap: 2, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        flexShrink: 0,
                        borderRadius: '50%',
                        bgcolor: getGroupColor(group, index)
                      }}
                    />
                    <Typography variant='body2' noWrap sx={{ color: 'text.secondary' }}>
                      {group.priceCount > 1 ? `${group.label} (${group.priceCount})` : group.label}
                    </Typography>
                  </Box>
                  <Typography variant='h6' sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatRon(group.total)}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                    {`${formatStudents(group.studentCount)} · ${Math.round(
                      (group.studentCount / totalStudents) * 100
                    )}%`}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PriceGroupsCard
