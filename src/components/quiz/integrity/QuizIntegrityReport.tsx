// ** React Imports
import React, { useState } from 'react'

// ** MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import Icon from 'src/@core/components/icon'

// ** Utils
import {
  BLOCKED_ACTIONS,
  DEVICE_TYPES,
  EXIT_SEVERITIES,
  RISK_LEVELS,
  STATUS_NOTES,
  answerLetter,
  describeStatusReasons,
  formatClockTime,
  formatDuration,
  formatQuizMinute
} from './integrityFormat'
import type { IntegrityExit, QuizIntegrityReportDTO } from './integrityTypes'
import type { QuizIntegrityReportState } from './useQuizIntegrityReport'

/**
 * QuizIntegrityReport - The "Integritatea testului" section of the professor's review page
 *
 * Shows the server's report for the attempt: the risk level with its reasons, an overview, one card per exit
 * (when, how long, the question on screen and what the student did after coming back), idle periods, other
 * signals and the full timeline. Renders nothing when there is no report to show.
 */

interface QuizIntegrityReportProps {
  state: QuizIntegrityReportState
  onRetry: () => void
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant='subtitle1' sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
    {children}
  </Typography>
)

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box>
    <Typography variant='caption' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='body1' sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
)

const ExitCard: React.FC<{ exit: IntegrityExit }> = ({ exit }) => {
  const theme = useTheme()
  const severity = EXIT_SEVERITIES[exit.severity] || EXIT_SEVERITIES.LOW
  const color = theme.palette[severity.color].main
  const actions = exit.afterReturn?.actions || []

  return (
    <Box
      sx={{
        borderLeft: `4px solid ${color}`,
        borderRadius: 1,
        backgroundColor: alpha(color, 0.05),
        px: 3,
        py: 2.5,
        mb: 2
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
          Ieșirea {exit.index}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {formatClockTime(exit.startedAt)} · minutul {formatQuizMinute(exit.offsetMs)}
        </Typography>
        <CustomChip rounded size='small' skin='light' color={severity.color} label={formatDuration(exit.durationMs)} />
        <CustomChip rounded size='small' skin='light' color={severity.color} label={severity.label} />
      </Box>
      <Typography variant='body2' sx={{ mb: exit.questionOnScreen ? 1 : 0 }}>
        {exit.explanation}
      </Typography>
      {exit.questionOnScreen && (
        <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
          Întrebarea {exit.questionOnScreen.number}: {exit.questionOnScreen.text}
        </Typography>
      )}

      {/* The sentence describes the first answer after the return; later ones are listed */}
      {actions.length > 1 && (
        <Box component='ul' sx={{ m: 0, mt: 1, pl: 5 }}>
          {actions.map((action, index) => (
            <Typography component='li' variant='body2' color='text.secondary' key={index}>
              Întrebarea {action.question.number}: {answerLetter(action.answer)} după{' '}
              {formatDuration(action.msAfterReturn)}, {action.correct ? 'corect' : 'greșit'}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  )
}

const otherSignals = (report: QuizIntegrityReportDTO) => {
  const { summary } = report
  const signals: string[] = []

  const blocked = Object.keys(summary.blockedActions || {})
    .map(action => `${BLOCKED_ACTIONS[action] || action} ×${summary.blockedActions[action]}`)
    .join(', ')

  if (blocked) signals.push(`Acțiuni blocate: ${blocked}.`)
  if (summary.frameFocusCount > 0) {
    signals.push(`A scris sau a dat click într-un panou adăugat de o extensie (${summary.frameFocusCount}).`)
  }
  ;(report.domInjections || []).forEach(injection =>
    signals.push(
      `O extensie a adăugat în pagină „${injection.signature}”${injection.knownAs ? ` (${injection.knownAs})` : ''}.`
    )
  )
  if (summary.untrustedAnswerCount > 0) {
    signals.push(`Răspunsuri bifate de un script, nu de elev: ${summary.untrustedAnswerCount}.`)
  }
  if (summary.webdriver) signals.push('Browserul era controlat de un program de automatizare.')
  if (summary.extendedScreen) signals.push('Calculatorul avea mai multe monitoare conectate.')
  if (summary.reducedWindowMs > 0) {
    signals.push(
      `Fereastra testului a ocupat doar o parte din ecran timp de ${formatDuration(summary.reducedWindowMs)}.`
    )
  }
  if (summary.sidePanelSuspectedMs > 0) {
    signals.push(
      `Un panou lateral al browserului a fost deschis timp de ${formatDuration(summary.sidePanelSuspectedMs)}.`
    )
  }

  return signals
}

const ReportCard: React.FC<{ report: QuizIntegrityReportDTO }> = ({ report }) => {
  const theme = useTheme()
  const [showReasons, setShowReasons] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const risk = RISK_LEVELS[report.risk?.level] || RISK_LEVELS.NONE
  const reasons = report.risk?.reasons || []
  const exits = report.exits || []
  const idlePeriods = report.idlePeriods || []
  const timeline = report.timeline || []
  const { summary } = report
  const analysed = report.status === 'VALID' || report.status === 'PARTIAL'
  const statusNote = STATUS_NOTES[report.status]
  const statusReasons = describeStatusReasons(report.statusReasons || [])
  const signals = analysed ? otherSignals(report) : []

  const device = summary.device
    ? [
        DEVICE_TYPES[summary.device.deviceType] || summary.device.deviceType,
        summary.device.platform,
        summary.device.browser
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <Card sx={{ borderTop: `3px solid ${theme.palette[risk.color].main}` }}>
      <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Icon icon='tabler:shield-half' fontSize={22} />
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Integritatea testului
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CustomChip rounded skin='light' color={risk.color} label={risk.label} />
            <Typography variant='body2' color='text.secondary'>
              Scor {report.risk?.score ?? 0}/100
            </Typography>
          </Box>
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1, mb: 3 }}>
          Când a părăsit elevul pagina testului și ce a făcut după ce s-a întors. Browserul nu poate vedea ce altă filă
          sau aplicație a fost deschisă, așa că acestea sunt indicii, nu dovezi.
        </Typography>

        {statusNote && (
          <Alert severity={report.status === 'PARTIAL' ? 'warning' : 'info'} sx={{ mb: 3 }}>
            {statusNote}
            {statusReasons && ` Motiv: ${statusReasons}.`}
          </Alert>
        )}

        {report.overview?.length > 0 && (
          <Box component='ul' sx={{ m: 0, mb: 3, pl: 5 }}>
            {report.overview.map((sentence, index) => (
              <Typography component='li' variant='body2' key={index} sx={{ mb: 0.5 }}>
                {sentence}
              </Typography>
            ))}
          </Box>
        )}

        {analysed && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 3
            }}
          >
            <Stat label='Ieșiri' value={String(summary.exitCount)} />
            <Stat
              label='În afara testului'
              value={`${formatDuration(summary.awayMs)} (${Math.round((summary.awayRatio || 0) * 100)}%)`}
            />
            <Stat label='Cea mai lungă ieșire' value={formatDuration(summary.longestExitMs)} />
            <Stat
              label='Corecte imediat după întoarcere'
              value={
                summary.answersRightAfterReturn?.count
                  ? `${summary.answersRightAfterReturn.correct} din ${summary.answersRightAfterReturn.count}`
                  : '–'
              }
            />
          </Box>
        )}

        {reasons.length > 0 && (
          <>
            <Button
              size='small'
              onClick={() => setShowReasons(shown => !shown)}
              aria-expanded={showReasons}
              endIcon={<Icon icon={showReasons ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize={16} />}
              sx={{ px: 0 }}
            >
              De ce acest nivel?
            </Button>
            <Collapse in={showReasons}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {reasons.map(reason => (
                  <Box key={reason.code} sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, minWidth: 36 }}>
                      +{reason.points}
                    </Typography>
                    <Typography variant='body2'>{reason.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </>
        )}

        {analysed && (
          <>
            <Divider sx={{ mt: 3 }} />
            <SectionTitle>Ieșiri din test</SectionTitle>
            {exits.length > 0 ? (
              exits.map(exit => <ExitCard key={exit.index} exit={exit} />)
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Nu a părăsit testul.
              </Typography>
            )}

            {idlePeriods.length > 0 && (
              <>
                <SectionTitle>Perioade fără activitate</SectionTitle>
                {idlePeriods.map((idle, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant='body2' color='text.secondary'>
                      Minutul {formatQuizMinute(idle.offsetMs)} · {formatDuration(idle.durationMs)}
                    </Typography>
                    <Typography variant='body2'>{idle.explanation}</Typography>
                  </Box>
                ))}
              </>
            )}

            {signals.length > 0 && (
              <>
                <SectionTitle>Alte semnale</SectionTitle>
                <Box component='ul' sx={{ m: 0, pl: 5 }}>
                  {signals.map(signal => (
                    <Typography component='li' variant='body2' key={signal} sx={{ mb: 0.5 }}>
                      {signal}
                    </Typography>
                  ))}
                </Box>
              </>
            )}

            {device && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 3 }}>
                Dispozitiv: {device}
              </Typography>
            )}

            {timeline.length > 0 && (
              <>
                <Button
                  size='small'
                  onClick={() => setShowTimeline(shown => !shown)}
                  aria-expanded={showTimeline}
                  endIcon={<Icon icon={showTimeline ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize={16} />}
                  sx={{ px: 0, mt: 2 }}
                >
                  {showTimeline ? 'Ascunde cronologia' : `Arată cronologia completă (${timeline.length})`}
                </Button>
                <Collapse in={showTimeline} unmountOnExit>
                  <Box sx={{ mt: 1 }}>
                    {timeline.map((entry, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 2, py: 0.5 }}>
                        <Typography variant='body2' color='text.secondary' sx={{ minWidth: 56 }}>
                          {formatQuizMinute(entry.offsetMs)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ minWidth: 96 }}>
                          {entry.questionNumber ? `Întrebarea ${entry.questionNumber}` : ''}
                        </Typography>
                        <Typography variant='body2'>{entry.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const QuizIntegrityReport: React.FC<QuizIntegrityReportProps> = ({ state, onRetry }) => {
  if (state.status === 'idle' || state.status === 'unavailable') return null

  return (
    <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 900 }, mx: 'auto', mt: 2 }}>
      {state.status === 'loading' && (
        <Card>
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            <Skeleton width='40%' height={32} />
            <Skeleton width='90%' />
            <Skeleton width='75%' />
          </CardContent>
        </Card>
      )}

      {state.status === 'error' && (
        <Alert
          severity='warning'
          action={
            <Button color='inherit' size='small' onClick={onRetry}>
              Reîncearcă
            </Button>
          }
        >
          Nu am putut încărca datele despre integritatea testului.
        </Alert>
      )}

      {state.status === 'ready' && <ReportCard report={state.report} />}
    </Box>
  )
}

export default QuizIntegrityReport
