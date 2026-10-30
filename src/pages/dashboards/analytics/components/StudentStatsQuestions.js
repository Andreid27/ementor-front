// ** MUI Imports
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import ProgressRing from 'src/views/student-ui/ProgressRing'
import StatusPill from 'src/views/student-ui/StatusPill'
import { percent } from 'src/views/student-ui/format'
import { countLabel } from 'src/views/student-ui/countLabel'
import { toneInk } from 'src/views/student-ui/readableAccent'

// The same score bands as the test list: 80% and up, 60–79%, under 60%.
const verdictFor = value => {
  if (value >= 80) return { tone: 'accent', icon: 'tabler:trophy', label: 'Foarte bine' }
  if (value >= 60) return { tone: 'warning', icon: 'tabler:trending-up', label: 'Pe drumul bun' }

  return { tone: 'error', icon: 'tabler:book', label: 'Merită recapitulat' }
}

/**
 * Share of correct answers across every test. Written for both readers: the
 * student on their dashboard and the professor looking at one student.
 */
const StudentStatsQuestions = ({ questions }) => {
  const theme = useTheme()
  const total = questions?.totalQuestions ?? 0
  const correct = questions?.correctQuestions ?? 0
  const value = percent(correct, total)
  const verdict = verdictFor(value)

  const ringColor =
    verdict.tone === 'accent'
      ? theme.palette.primary.main
      : verdict.tone === 'warning'
      ? theme.palette.warning.main
      : theme.palette.error.main

  const rows = [
    { icon: 'tabler:check', color: theme.palette.primary.main, count: correct, label: 'corecte' },
    { icon: 'tabler:x', color: theme.palette.error.main, count: total - correct, label: 'greșite' }
  ]

  return (
    <InsightCard
      title='Răspunsuri corecte'
      subtitle='Din toate testele rezolvate'
      aside={
        total > 0 && (
          <StatusPill tone={verdict.tone} icon={verdict.icon}>
            {verdict.label}
          </StatusPill>
        )
      }
    >
      {total === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Încă nu există răspunsuri. Procentul apare după primul test.
        </Typography>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 5, sm: 8 }
          }}
        >
          <ProgressRing value={value} color={ringColor}>
            <Typography sx={{ fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: 'text.primary' }}>
              {value}%
            </Typography>
            <Typography variant='caption' sx={{ mt: 1, color: 'text.secondary' }}>
              corecte
            </Typography>
          </ProgressRing>

          <Box sx={{ minWidth: 160 }}>
            {rows.map(row => (
              <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Box
                  aria-hidden
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    color: toneInk(theme, row.color),
                    bgcolor: alpha(row.color, theme.palette.mode === 'light' ? 0.12 : 0.16)
                  }}
                >
                  <Icon icon={row.icon} fontSize='1.125rem' />
                </Box>
                <Typography sx={{ color: 'text.primary' }}>
                  <Box component='span' sx={{ fontWeight: 700, fontSize: '1.125rem', mr: 1.5 }}>
                    {row.count}
                  </Box>
                  {row.label}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {countLabel(total, 'o întrebare', 'întrebări')} în total
            </Typography>
          </Box>
        </Box>
      )}
    </InsightCard>
  )
}

export default StudentStatsQuestions
