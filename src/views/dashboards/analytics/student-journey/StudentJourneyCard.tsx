// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'

// ** Third Party Imports
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// ** Local Imports
import CelebrationBurst from './CelebrationBurst'
import { isJourneyFinished, JOURNEY_STEP_IDS, JourneyStepId } from './journeySteps'
import { countLabel } from 'src/views/student-ui/countLabel'
import { JOIN_CODE_INPUT_ID } from '../join-professor/JoinProfessorCard'
import type { MyProfessorDTO } from '../join-professor/joinProfessorApi'
import { accentButtonSx, accentFill, accentInk } from 'src/views/student-ui/readableAccent'
import { STUDENT_ILLUSTRATIONS } from 'src/views/student-ui/illustrations'
import StageBackdrop, { stageBackground } from 'src/views/student-ui/StageBackdrop'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

const TITLE_ID = 'student-journey-title'

type Scene = JourneyStepId | 'finished'

// One character per step, taking turns in the same spot. The host who welcomes
// the student is the one who presents the results at the end.
const ILLUSTRATIONS: Record<Scene, string> = {
  profile: STUDENT_ILLUSTRATIONS.host,
  professor: STUDENT_ILLUSTRATIONS.professor,
  lesson: STUDENT_ILLUSTRATIONS.lessons,
  test: STUDENT_ILLUSTRATIONS.tests,
  finished: STUDENT_ILLUSTRATIONS.host
}

type StepState = 'done' | 'current' | 'upcoming'

const STATE_LABELS: Record<StepState, string> = {
  done: 'finalizat',
  current: 'pasul curent',
  upcoming: 'urmează'
}

const STEP_TITLES: Record<JourneyStepId, { todo: string; done: string }> = {
  profile: { todo: 'Completează profilul', done: 'Profil completat' },
  professor: { todo: 'Conectează-te cu profesorul', done: 'Conectat cu profesorul' },
  lesson: { todo: 'Deschide prima lecție', done: 'Prima lecție deschisă' },
  test: { todo: 'Rezolvă primul test', done: 'Primul test rezolvat' }
}

interface StudentJourneyCardProps {
  firstName?: string
  isFirstVisit: boolean

  /** Steps done according to the data. */
  done: JourneyStepId[]

  /** Steps currently shown as done; they lag behind `done` while milestones play. */
  shown: JourneyStepId[]

  /** The milestone that was just checked, if any. */
  celebrating: JourneyStepId | null
  professors: MyProfessorDTO[]
  professorsFailed: boolean
  lessonsOpened: number
  completedQuizzes: number
  onRetryProfessors: () => void
  onDismiss: () => void

  /** Element the "Vezi rezultatele" action scrolls to. */
  resultsAnchorId: string
}

const milestoneMessage = (id: JourneyStepId, professors: MyProfessorDTO[]) => {
  switch (id) {
    case 'profile':
      return 'Profilul tău e gata. Bun venit în E-mentor!'
    case 'professor':
      return professors.length === 1
        ? `Te-ai conectat cu ${professors[0].professor.fullName}.`
        : 'Te-ai conectat cu profesorii tăi.'
    case 'lesson':
      return 'Ai deschis prima lecție. Urmează primul test.'
    case 'test':
      return 'Ai rezolvat primul test! Rezultatele sunt mai jos.'
  }
}

// ** Step node: a numbered circle that turns into a drawn check mark.
const StepNode = ({ state, number, celebrate }: { state: StepState; number: number; celebrate: boolean }) => {
  const theme = useTheme()

  return (
    <Box aria-hidden sx={{ position: 'relative', width: 32, height: 32, zIndex: 1 }}>
      {celebrate && (
        <>
          <motion.span
            initial={{ scale: 0.9, opacity: 0.55 }}
            animate={{ scale: 2.3, opacity: 0 }}
            transition={{ duration: 0.75, ease: EASE_OUT }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${theme.palette.primary.main}`
            }}
          />
          <CelebrationBurst />
        </>
      )}
      <motion.div
        initial={false}
        animate={{ scale: state === 'done' ? [1, 1.22, 1] : 1 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: '0.875rem',
            fontWeight: 700,
            transition: 'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            ...(state === 'done' && {
              bgcolor: accentFill(theme),
              color: 'common.white'
            }),
            ...(state === 'current' && {
              bgcolor: 'background.paper',
              border: `2px solid ${accentInk(theme)}`,
              boxShadow: `0 0 0 5px ${alpha(theme.palette.primary.main, 0.18)}`
            }),
            ...(state === 'upcoming' && {
              bgcolor: 'background.paper',
              border: `1.5px solid ${alpha(theme.palette.text.primary, 0.32)}`,
              color: 'text.secondary'
            })
          }}
        >
          <AnimatePresence initial={false} mode='wait'>
            {state === 'done' ? (
              <motion.svg
                key='check'
                width={18}
                height={18}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={3}
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <motion.path
                  d='M5 12.5l4.2 4.2L19 7'
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.1 }}
                />
              </motion.svg>
            ) : state === 'current' ? (
              <motion.span
                key='dot'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, transition: { duration: 0.12 } }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: accentInk(theme) }}
              />
            ) : (
              <motion.span key='number' exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                {number}
              </motion.span>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </Box>
  )
}

const StudentJourneyCard = ({
  firstName,
  isFirstVisit,
  done,
  shown,
  celebrating,
  professors,
  professorsFailed,
  lessonsOpened,
  completedQuizzes,
  onRetryProfessors,
  onDismiss,
  resultsAnchorId
}: StudentJourneyCardProps) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()

  const ink = accentInk(theme)
  const finished = isJourneyFinished(shown)

  // The next step comes from the data, so its action is there from the first
  // frame and nobody waits for the checks to finish landing.
  const current = isJourneyFinished(done) ? null : JOURNEY_STEP_IDS.find(id => !done.includes(id)) ?? null

  // While milestones land, the host presents them; then the next step's character takes over.
  const catchingUp = done.some(id => !shown.includes(id))
  const scene: Scene = finished ? 'finished' : catchingUp ? 'profile' : current ?? 'finished'
  const remaining = JOURNEY_STEP_IDS.length - shown.length
  const message = celebrating ? milestoneMessage(celebrating, professors) : null

  // The next characters are tiny, so fetching them up front keeps each swap instant.
  useEffect(() => {
    Object.values(ILLUSTRATIONS).forEach(src => {
      const image = new Image()
      image.src = src
    })
  }, [])

  const scrollBehavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'

  const focusJoinCode = () => {
    const input = document.getElementById(JOIN_CODE_INPUT_ID)
    if (!input) return

    // Scroll the page only: scrollIntoView would also scroll the join card's own
    // clipped content and push its heading against the top edge.
    const box = input.getBoundingClientRect()
    window.scrollTo({
      top: window.scrollY + box.top - (window.innerHeight - box.height) / 2,
      behavior: scrollBehavior
    })
    input.focus({ preventScroll: true })
  }

  const showResults = () => {
    document.getElementById(resultsAnchorId)?.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
  }

  const name = firstName ? `, ${firstName}` : ''

  const title = finished ? `Felicitări${name}!` : isFirstVisit ? `Bun venit${name}!` : `Bine ai revenit${name}!`

  const subtitle = finished
    ? 'Ai terminat primii pași. De acum, panoul îți arată cum evoluezi la teste și lecții.'
    : remaining === 1
    ? 'Mai ai un pas până la primele tale rezultate.'
    : `Mai ai ${remaining} pași până la primele tale rezultate.`

  const stepDetail = (id: JourneyStepId, state: StepState): ReactNode => {
    if (state !== 'done') {
      // After the first test, an unopened lesson is an invitation, not a task.
      if (state === 'upcoming' && finished && id === 'lesson') return 'Lecțiile te așteaptă în Cursuri, oricând vrei.'

      return null
    }

    switch (id) {
      case 'profile':
        return 'Datele tale sunt salvate.'
      case 'professor':
        return professors.length === 1 ? (
          <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <EmentorAvatar
              userId={professors[0].professor.id}
              userType={UserType.PROFESSOR}
              alt=''
              sx={{ width: 22, height: 22, fontSize: '0.65rem', flexShrink: 0 }}
            />
            <Box component='span' sx={{ overflowWrap: 'anywhere' }}>
              {professors[0].professor.fullName}
            </Box>
          </Box>
        ) : (
          countLabel(professors.length, 'un profesor conectat', 'profesori conectați')
        )
      // The title already says "the first one"; a count only adds something from two up.
      case 'lesson':
        return lessonsOpened > 1 ? countLabel(lessonsOpened, 'o lecție deschisă', 'lecții deschise') : null
      case 'test':
        return completedQuizzes > 1 ? countLabel(completedQuizzes, 'un test rezolvat', 'teste rezolvate') : null
    }
  }

  const renderCurrentStep = (id: JourneyStepId) => {
    switch (id) {
      case 'professor':
        return {
          hint: professorsFailed
            ? 'Lista profesorilor nu s-a încărcat. Verifică internetul și încearcă din nou.'
            : 'Scrie codul primit de la profesor. Lecțiile și testele tale vin de acolo.',
          actions: professorsFailed ? (
            <Button variant='contained' onClick={onRetryProfessors} sx={accentButtonSx}>
              Reîncearcă
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={focusJoinCode}
              endIcon={<Icon icon='tabler:arrow-down' fontSize='1.125rem' />}
              sx={accentButtonSx}
            >
              Introdu codul
            </Button>
          )
        }
      case 'lesson':
        return {
          hint: 'Lecțiile trimise de profesor te așteaptă în Cursuri. Timpul de studiu se adună aici, în panou.',
          actions: (
            <>
              <Button
                variant='contained'
                component={Link}
                href='/lessons'
                endIcon={<Icon icon='tabler:arrow-right' fontSize='1.125rem' />}
                sx={accentButtonSx}
              >
                Deschide cursurile
              </Button>
              <Button
                variant='text'
                component={Link}
                href='/quizzes'
                sx={{ minHeight: 44, px: 3, fontWeight: 600, color: ink, width: { xs: '100%', sm: 'auto' } }}
              >
                Sari direct la teste
              </Button>
            </>
          )
        }
      case 'test':
        return {
          hint: 'Un test scurt îți arată ce știi deja și ce mai ai de recapitulat. Rezultatele apar aici, în panou.',
          actions: (
            <Button
              variant='contained'
              component={Link}
              href='/quizzes'
              endIcon={<Icon icon='tabler:arrow-right' fontSize='1.125rem' />}
              sx={accentButtonSx}
            >
              Începe un test
            </Button>
          )
        }
      default:
        return null
    }
  }

  return (
    <MotionConfig reducedMotion='user'>
      <Card
        component='section'
        aria-labelledby={TITLE_ID}
        sx={{
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' }
        }}
      >
        {/* Stage: greeting and the character who walks the student through. */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 200, md: 420 },
            background: stageBackground
          }}
        >
          <StageBackdrop
            sx={{
              right: { xs: -36, md: '6%' },
              bottom: { xs: -70, md: -90 },
              width: { xs: 200, md: 330 },
              height: { xs: 200, md: 330 }
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              px: { xs: 5, sm: 6, md: 8 },
              pt: { xs: 5, sm: 6, md: 8 },
              pb: { xs: 5, md: 4 },
              pr: { xs: '124px', sm: '160px', md: 8 }
            }}
          >
            <Typography
              component='p'
              sx={{
                mb: 1.5,
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: ink
              }}
            >
              Primii pași ·{' '}
              {finished ? (
                'gata'
              ) : (
                <>
                  <Box component='span' sx={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
                    <AnimatePresence initial={false} mode='wait'>
                      <motion.span
                        key={shown.length}
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-100%', opacity: 0, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                        style={{ display: 'inline-block' }}
                      >
                        {shown.length}
                      </motion.span>
                    </AnimatePresence>
                  </Box>{' '}
                  din {JOURNEY_STEP_IDS.length}
                </>
              )}
            </Typography>
            <Typography
              id={TITLE_ID}
              component='h1'
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: { xs: '1.625rem', sm: '1.875rem', md: '2.125rem' },
                lineHeight: 1.15,
                letterSpacing: '-0.02em'
              }}
            >
              {title}
            </Typography>

            {/* Announces each milestone once; the subtitle keeps the overall picture. */}
            <Box role='status' sx={{ mt: 2.5 }}>
              <AnimatePresence initial={false} mode='wait'>
                {message && (
                  <motion.p
                    key={celebrating}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                    style={{ margin: 0 }}
                  >
                    <Box
                      component='span'
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        lineHeight: 1.45,
                        color: ink
                      }}
                    >
                      <Icon icon='tabler:sparkles' fontSize='1.125rem' style={{ flexShrink: 0, marginTop: 2 }} />
                      {message}
                    </Box>
                  </motion.p>
                )}
              </AnimatePresence>
            </Box>
            <Typography sx={{ mt: message ? 1 : 0, maxWidth: '34ch', color: 'text.secondary', lineHeight: 1.55 }}>
              {subtitle}
            </Typography>
          </Box>

          {/* The figure stands on the stage's bottom edge, cut at the waist. */}
          <Box
            aria-hidden
            sx={{
              position: { xs: 'absolute', md: 'relative' },
              zIndex: 0,
              right: { xs: 8, sm: 20, md: 'auto' },
              bottom: { xs: 0, md: 'auto' },
              mt: { md: 'auto' },
              alignSelf: { md: 'flex-end' },
              mr: { md: '10%' },
              height: { xs: 132, sm: 150, md: 248 },

              // Wide characters (the reader on the sofa) shrink to fit instead of reaching the text.
              width: { xs: 116, sm: 150, md: 280 },
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: { xs: 'flex-end', md: 'center' }
            }}
          >
            {finished && celebrating && (
              <CelebrationBurst key={`finish-${celebrating}`} pieces={26} reach={140} delay={0.3} />
            )}
            <AnimatePresence initial={false} mode='wait'>
              <motion.img
                key={ILLUSTRATIONS[scene]}
                src={ILLUSTRATIONS[scene]}
                alt=''
                draggable={false}
                initial={{ opacity: 0, y: 28, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
                exit={{ opacity: 0, y: 14, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
                style={{
                  display: 'block',
                  height: '100%',
                  width: 'auto',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom',
                  transformOrigin: 'bottom center'
                }}
              />
            </AnimatePresence>
          </Box>
        </Box>

        {/* Steps: an ordered list with a rail that fills as the student moves along. */}
        <Box sx={{ px: { xs: 5, sm: 6, md: 8 }, py: { xs: 6, md: 8 }, display: 'flex', flexDirection: 'column' }}>
          <Box component='ol' aria-label='Primii pași' sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {JOURNEY_STEP_IDS.map((id, index) => {
              const state: StepState = shown.includes(id) ? 'done' : id === current ? 'current' : 'upcoming'
              const isLast = index === JOURNEY_STEP_IDS.length - 1
              const detail = stepDetail(id, state)
              const currentStep = state === 'current' ? renderCurrentStep(id) : null

              return (
                <Box
                  component='li'
                  key={id}
                  aria-current={state === 'current' ? 'step' : undefined}
                  sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr)',
                    columnGap: { xs: 3.5, sm: 4 },
                    pb: isLast ? 0 : 5
                  }}
                >
                  {!isLast && (
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        left: 15,
                        top: 38,
                        bottom: 6,
                        width: 2,
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.text.primary, 0.12)
                      }}
                    >
                      <motion.span
                        initial={false}
                        animate={{ scaleY: state === 'done' ? 1 : 0 }}
                        transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.3 }}
                        style={{
                          display: 'block',
                          height: '100%',
                          transformOrigin: 'top',
                          background: theme.palette.primary.main
                        }}
                      />
                    </Box>
                  )}

                  <StepNode state={state} number={index + 1} celebrate={celebrating === id} />

                  <Box sx={{ minWidth: 0, pt: '5px' }}>
                    <Typography
                      component='p'
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        lineHeight: 1.4,
                        color: state === 'upcoming' ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {state === 'done' ? STEP_TITLES[id].done : STEP_TITLES[id].todo}
                      <Box component='span' sx={visuallyHidden}>
                        , {STATE_LABELS[state]}
                      </Box>
                    </Typography>
                    {detail && (
                      <Typography component='div' variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
                        {detail}
                      </Typography>
                    )}

                    <AnimatePresence initial={false}>
                      {currentStep && (
                        <motion.div
                          key={id}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE_OUT }}
                          style={{ overflow: 'hidden' }}
                        >
                          <Typography
                            variant='body2'
                            sx={{ mt: 1, maxWidth: '46ch', color: 'text.secondary', lineHeight: 1.55 }}
                          >
                            {currentStep.hint}
                          </Typography>
                          <Box sx={{ mt: 3.5, mb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {currentStep.actions}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Box>
              )
            })}
          </Box>

          <AnimatePresence initial={false}>
            {finished && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.5 }}
              >
                <Box sx={{ mt: 7, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Button
                    variant='contained'
                    onClick={showResults}
                    endIcon={<Icon icon='tabler:arrow-down' fontSize='1.125rem' />}
                    sx={accentButtonSx}
                  >
                    Vezi rezultatele
                  </Button>
                  <Button
                    variant='text'
                    onClick={onDismiss}
                    sx={{
                      minHeight: 44,
                      px: 3,
                      fontWeight: 600,
                      color: 'text.secondary',
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Ascunde ghidul
                  </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Card>
    </MotionConfig>
  )
}

export default StudentJourneyCard
