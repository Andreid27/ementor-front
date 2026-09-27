// ** React Imports
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, darken, styled, Theme, useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'

// ** Third Party Imports
import { AnimatePresence, MotionConfig, motion, useAnimationControls, useReducedMotion } from 'framer-motion'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// ** API Imports
import {
  createIdempotencyKey,
  INVITATION_CODE_MIN_LENGTH,
  JoinErrorInfo,
  joinProfessorByCode,
  normalizeInvitationCode,
  previewProfessorByCode,
  ProfessorPreviewDTO,
  resolveJoinError
} from './joinProfessorApi'

type Step = 'enter' | 'checking' | 'preview' | 'joining' | 'joined'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

// How long the "Conectat" stamp stays on screen before the dashboard refreshes.
const JOINED_HOLD_MS = 2600

const INPUT_ID = 'join-professor-code'
const STATUS_ID = 'join-professor-status'

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const drift = keyframes`
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(var(--dx), var(--dy), 0) scale(1.18); }
`

const sheen = keyframes`
  0% { transform: translateX(-120%); }
  40%, 100% { transform: translateX(120%); }
`

const Root = styled(motion.section)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  isolation: 'isolate',
  borderRadius: 20,
  color: theme.palette.common.white,

  // Everything is derived from the theme palette, so the card follows the
  // customizer's primary colour instead of assuming Vuexy's default violet.
  background: `linear-gradient(120deg, ${darken(theme.palette.primary.dark, 0.55)} 0%, ${darken(
    theme.palette.primary.main,
    0.2
  )} 52%, ${theme.palette.primary.main} 100%)`,
  padding: theme.spacing(7, 5, 8),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(10)
  },
  [theme.breakpoints.up('md')]: {
    minHeight: 420,
    padding: theme.spacing(14)
  }
}))

const Orb = styled('span')({
  position: 'absolute',
  zIndex: 0,
  borderRadius: '50%',
  pointerEvents: 'none',
  mixBlendMode: 'screen',
  animation: `${drift} var(--duration) ease-in-out infinite alternate`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  }
})

const Grain = styled('span')({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  backgroundImage: GRAIN,
  opacity: 0.26,
  mixBlendMode: 'overlay'
})

// The code the student types, echoed as oversized outline type behind the card.
const GhostCode = styled('span')(({ theme }) => ({
  position: 'absolute',
  zIndex: 0,
  right: '-0.04em',
  bottom: '-0.2em',
  transition: 'font-size 0.3s ease',
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.05em',
  whiteSpace: 'nowrap',
  color: 'transparent',
  WebkitTextStroke: `1.5px ${alpha(theme.palette.common.white, 0.16)}`,
  pointerEvents: 'none',
  userSelect: 'none',

  // On phones it would sit behind the headline and the hint, so it is desktop-only.
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}))

const NOTCH_RADIUS = 12

/**
 * Cuts two half-circle notches into one edge of a ticket segment, so the two
 * segments read as a single ticket torn along the perforation. Each notch lives
 * in its own mask layer that covers half the box, which keeps the maths
 * independent of the segment's size.
 */
const notchMask = (edge: 'top' | 'right' | 'bottom' | 'left') => {
  const hole = (at: string) => `radial-gradient(circle ${NOTCH_RADIUS}px at ${at}, transparent 98%, #000 100%)`

  switch (edge) {
    case 'right':
      return `${hole('100% 0')} top / 100% 51% no-repeat, ${hole('100% 100%')} bottom / 100% 51% no-repeat`
    case 'left':
      return `${hole('0 0')} top / 100% 51% no-repeat, ${hole('0 100%')} bottom / 100% 51% no-repeat`
    case 'bottom':
      return `${hole('0 100%')} left / 51% 100% no-repeat, ${hole('100% 100%')} right / 51% 100% no-repeat`
    case 'top':
      return `${hole('0 0')} left / 51% 100% no-repeat, ${hole('100% 0')} right / 51% 100% no-repeat`
  }
}

// The part of the ticket that holds the code (or the professor, once found).
const StubSegment = ({ children, shimmer }: { children: ReactNode; shimmer: boolean }) => (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      bgcolor: 'background.paper',
      color: 'text.primary',
      borderRadius: { xs: '16px 16px 0 0', md: '16px 0 0 16px' },
      borderBottom: { xs: '2px dashed', md: 'none' },
      borderRight: { xs: 'none', md: '2px dashed' },
      borderColor: 'divider',
      p: { xs: 5, sm: 6 },
      minHeight: { md: 112 },
      WebkitMask: { xs: notchMask('bottom'), md: notchMask('right') },
      mask: { xs: notchMask('bottom'), md: notchMask('right') },
      '&::after': shimmer
        ? {
            content: '""',
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: (theme: Theme) =>
              `linear-gradient(100deg, transparent 30%, ${alpha(
                theme.palette.primary.main,
                0.14
              )} 50%, transparent 70%)`,
            animation: `${sheen} 5.5s ease-in-out 1.4s infinite`,
            '@media (prefers-reduced-motion: reduce)': {
              display: 'none'
            }
          }
        : undefined
    }}
  >
    {children}
  </Box>
)

// The tear-off part of the ticket that holds the action.
const ActionSegment = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 1,
      width: { xs: '100%', md: 264 },
      flexShrink: 0,
      bgcolor: 'background.paper',
      color: 'text.primary',
      borderRadius: { xs: '0 0 16px 16px', md: '0 16px 16px 0' },
      p: { xs: 4, sm: 5 },
      WebkitMask: { xs: notchMask('top'), md: notchMask('left') },
      mask: { xs: notchMask('top'), md: notchMask('left') }
    }}
  >
    {children}
  </Box>
)

const BURST = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2
  const distance = index % 2 === 0 ? 130 : 84

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: index % 3 === 0 ? 10 : 7,
    radius: index % 3 === 1 ? 2 : '50%',
    tone: index % 4
  }
})

const faceVariants = {
  enter: { opacity: 0, rotateX: 75 },
  center: { opacity: 1, rotateX: 0, transition: { duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, rotateX: -75, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT, when: 'beforeChildren', staggerChildren: 0.09 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }
}

interface JoinProfessorCardProps {
  /** Called once the student is connected, so the dashboard can reload their professors. */
  onJoined: () => void
}

const JoinProfessorCard = ({ onJoined }: JoinProfessorCardProps) => {
  const [step, setStep] = useState<Step>('enter')
  const [code, setCode] = useState('')
  const [professor, setProfessor] = useState<ProfessorPreviewDTO | null>(null)
  const [error, setError] = useState<JoinErrorInfo | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const joinButtonRef = useRef<HTMLButtonElement>(null)
  const idempotencyKey = useRef('')
  const pendingFocus = useRef<'input' | 'join' | null>(null)
  const joinedTimer = useRef<ReturnType<typeof setTimeout>>()

  const theme = useTheme()
  const shake = useAnimationControls()
  const reduceMotion = useReducedMotion()

  useEffect(() => () => clearTimeout(joinedTimer.current), [])

  const face = step === 'enter' || step === 'checking' ? 'code' : 'professor'
  const cleanCode = code.replace(/-+$/, '')

  const fail = (info: JoinErrorInfo) => {
    setError(info)
    shake.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.45 } })
  }

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(normalizeInvitationCode(event.target.value))
    setError(null)
  }

  const handleFindProfessor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 'checking') return

    if (cleanCode.length < INVITATION_CODE_MIN_LENGTH) {
      fail({
        kind: 'notFound',
        message: cleanCode
          ? 'Codul are cel puțin 3 caractere. Verifică ce ți-a trimis profesorul.'
          : 'Scrie mai întâi codul primit de la profesor.'
      })
      inputRef.current?.focus()

      return
    }

    setCode(cleanCode)
    setError(null)
    setStep('checking')

    try {
      const preview = await previewProfessorByCode(cleanCode)

      idempotencyKey.current = createIdempotencyKey()
      pendingFocus.current = 'join'
      setProfessor(preview)
      setStep('preview')
    } catch (err) {
      console.error('Professor preview failed:', err)
      setStep('enter')
      fail(resolveJoinError(err, cleanCode))
      inputRef.current?.focus()
    }
  }

  const handleJoin = async () => {
    if (!professor || step === 'joining') return

    setError(null)
    setStep('joining')

    try {
      // The same key is reused if the student retries after a failure, so a
      // request that reached the server but lost its response is not doubled.
      await joinProfessorByCode(professor.invitationCode || cleanCode, idempotencyKey.current)
      setStep('joined')
      joinedTimer.current = setTimeout(onJoined, JOINED_HOLD_MS)
    } catch (err) {
      console.error('Join by code failed:', err)
      const info = resolveJoinError(err, cleanCode)

      setStep('preview')
      fail(info)
      if (info.kind === 'alreadyJoined') {
        joinedTimer.current = setTimeout(onJoined, JOINED_HOLD_MS)
      }
    }
  }

  const handleChangeCode = () => {
    pendingFocus.current = 'input'
    setProfessor(null)
    setError(null)
    setStep('enter')
  }

  const handleFaceShown = (definition: unknown) => {
    if (definition !== 'center') return

    if (pendingFocus.current === 'join') joinButtonRef.current?.focus()
    if (pendingFocus.current === 'input') inputRef.current?.focus()
    pendingFocus.current = null
  }

  const ghostText = professor?.invitationCode || code || 'cod'

  // Shrinks as the code grows, so the echo always spans roughly half the card.
  const ghostFontSize = `min(16rem, ${(100 / Math.max(ghostText.length, 3)).toFixed(2)}vw)`

  const burstColors = [
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.common.white,
    theme.palette.success.main
  ]

  // Soft light spot in one of the theme's accent colours.
  const glow = (color: string, strength: number) =>
    `radial-gradient(circle, ${alpha(color, strength)} 0%, ${alpha(color, 0)} 65%)`

  const renderStatus = () => {
    if (error) {
      return (
        <Box
          role='alert'
          sx={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 2,
            px: 3.5,
            py: 2,
            borderRadius: '10px',
            bgcolor: 'error.main',
            color: 'error.contrastText',
            fontWeight: 500
          }}
        >
          <Icon icon='tabler:alert-circle' fontSize='1.25rem' style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error.message}</span>
        </Box>
      )
    }

    if (step === 'joined' && professor) {
      return (
        <span role='status'>
          Te-ai conectat cu {professor.fullName}. Lecțiile și testele primite de la profesor apar aici, în panou.
        </span>
      )
    }

    if (face === 'professor') {
      return 'Verifică dacă acesta este profesorul tău, apoi conectează-te.'
    }

    return 'Codul seamănă cu numele profesorului, scris cu litere mici și cratime.'
  }

  return (
    <MotionConfig reducedMotion='user'>
      <Root aria-labelledby='join-professor-title' variants={cardVariants} initial='hidden' animate='visible'>
        <Orb
          aria-hidden
          sx={{
            width: { xs: 320, md: 460 },
            height: { xs: 320, md: 460 },
            top: { xs: -160, md: -200 },
            right: { xs: -140, md: -80 },
            background: glow(theme.palette.info.main, 0.65),
            '--dx': '-70px',
            '--dy': '50px',
            '--duration': '14s'
          }}
        />
        <Orb
          aria-hidden
          sx={{
            width: { xs: 260, md: 360 },
            height: { xs: 260, md: 360 },
            bottom: { xs: -150, md: -190 },
            right: { xs: '10%', md: '28%' },
            background: glow(theme.palette.info.main, 0.4),
            '--dx': '60px',
            '--dy': '-40px',
            '--duration': '18s'
          }}
        />
        <Orb
          aria-hidden
          sx={{
            width: 380,
            height: 380,
            top: '15%',
            left: -190,
            background: glow(theme.palette.primary.light, 0.6),
            '--dx': '80px',
            '--dy': '30px',
            '--duration': '22s'
          }}
        />
        <Grain aria-hidden />
        <GhostCode aria-hidden style={{ fontSize: ghostFontSize }}>
          {ghostText}
        </GhostCode>

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <motion.div variants={itemVariants}>
            <Typography
              id='join-professor-title'
              component='h2'
              sx={{
                color: 'common.white',
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem' },
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                maxWidth: '16ch'
              }}
            >
              Conectează-te cu profesorul tău
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Typography
              sx={{
                mt: { xs: 3, md: 4 },
                maxWidth: '52ch',
                color: alpha(theme.palette.common.white, 0.86),
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.55
              }}
            >
              Scrie codul primit de la profesor. După ce te conectezi, lecțiile, testele și programările voastre apar
              aici.
            </Typography>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box
              sx={{
                position: 'relative',
                mt: { xs: 6, md: 9 },
                filter: `drop-shadow(0 22px 36px ${alpha(darken(theme.palette.primary.dark, 0.7), 0.45)})`
              }}
            >
              <motion.div animate={shake}>
                <AnimatePresence mode='wait' initial={false}>
                  <motion.div
                    key={face}
                    variants={faceVariants}
                    initial='enter'
                    animate='center'
                    exit='exit'
                    onAnimationComplete={handleFaceShown}
                    style={{ transformPerspective: 1000 }}
                  >
                    {face === 'code' ? (
                      <Box
                        component='form'
                        noValidate
                        onSubmit={handleFindProfessor}
                        sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}
                      >
                        <StubSegment shimmer={step === 'enter' && !code && !error}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, sm: 4 }, width: '100%' }}>
                            <Box
                              aria-hidden
                              sx={{
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                width: 52,
                                height: 52,
                                borderRadius: '14px',
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                color: 'primary.main'
                              }}
                            >
                              <Icon icon='tabler:key' fontSize='1.75rem' />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                component='label'
                                htmlFor={INPUT_ID}
                                sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}
                              >
                                Codul profesorului
                              </Typography>
                              <InputBase
                                id={INPUT_ID}
                                inputRef={inputRef}
                                value={code}
                                onChange={handleCodeChange}
                                placeholder='maria-popescu'
                                fullWidth
                                inputProps={{
                                  readOnly: step === 'checking',
                                  autoComplete: 'off',
                                  autoCapitalize: 'none',
                                  autoCorrect: 'off',
                                  spellCheck: false,
                                  enterKeyHint: 'go',
                                  'aria-invalid': Boolean(error),
                                  'aria-describedby': STATUS_ID
                                }}
                                sx={{
                                  fontSize: { xs: '1.375rem', sm: '1.75rem' },
                                  fontWeight: 700,
                                  letterSpacing: '-0.01em',
                                  color: error ? 'error.main' : 'text.primary',
                                  '& input': { p: 0, height: 'auto', lineHeight: 1.3 },
                                  '& input::placeholder': { color: 'text.disabled', opacity: 1, fontWeight: 600 }
                                }}
                              />
                            </Box>
                          </Box>
                        </StubSegment>
                        <ActionSegment>
                          <Button
                            type='submit'
                            variant='contained'
                            size='large'
                            fullWidth
                            disabled={step === 'checking'}
                            sx={{ minHeight: 56, fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            {step === 'checking' && <CircularProgress size={18} color='inherit' sx={{ mr: 2.5 }} />}
                            {step === 'checking' ? 'Se caută…' : 'Caută profesorul'}
                          </Button>
                        </ActionSegment>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                        <StubSegment shimmer={false}>
                          {professor && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3.5, sm: 5 }, minWidth: 0 }}>
                              <EmentorAvatar
                                userId={professor.id}
                                userType={UserType.PROFESSOR}
                                alt={professor.fullName}
                                sx={{
                                  width: { xs: 56, sm: 68 },
                                  height: { xs: 56, sm: 68 },
                                  flexShrink: 0,
                                  boxShadow: `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 5px ${theme.palette.primary.main}`
                                }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    lineHeight: 1.2,
                                    color: 'text.primary',
                                    overflowWrap: 'anywhere'
                                  }}
                                >
                                  {professor.fullName}
                                </Typography>
                                {[
                                  { icon: 'tabler:school', text: professor.university },
                                  { icon: 'tabler:book', text: professor.speciality }
                                ]
                                  .filter(line => line.text)
                                  .map(line => (
                                    <Typography
                                      key={line.icon}
                                      variant='body2'
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        mt: 1,
                                        color: 'text.secondary'
                                      }}
                                    >
                                      <Icon icon={line.icon} fontSize='1rem' style={{ flexShrink: 0 }} />
                                      {line.text}
                                    </Typography>
                                  ))}
                              </Box>
                            </Box>
                          )}
                        </StubSegment>
                        <ActionSegment>
                          {step === 'joined' ? (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2.5,
                                minHeight: 56,
                                color: 'text.secondary'
                              }}
                            >
                              <CircularProgress size={18} color='inherit' />
                              Îți actualizăm panoul
                            </Box>
                          ) : (
                            <>
                              <Button
                                ref={joinButtonRef}
                                variant='contained'
                                size='large'
                                fullWidth
                                onClick={handleJoin}
                                disabled={step === 'joining'}
                                sx={{ minHeight: 56, fontSize: '1rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                              >
                                {step === 'joining' && <CircularProgress size={18} color='inherit' sx={{ mr: 2.5 }} />}
                                {step === 'joining' ? 'Se conectează…' : 'Conectează-mă'}
                              </Button>
                              <Button
                                variant='text'
                                fullWidth
                                onClick={handleChangeCode}
                                disabled={step === 'joining'}
                                sx={{ minHeight: 44 }}
                              >
                                Schimbă codul
                              </Button>
                            </>
                          )}
                        </ActionSegment>
                      </Box>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {step === 'joined' && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    zIndex: 2,
                    top: { xs: -22, md: -26 },
                    right: { xs: 16, md: 290 },
                    pointerEvents: 'none'
                  }}
                >
                  {!reduceMotion &&
                    BURST.map((particle, index) => (
                      <motion.span
                        key={index}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ x: particle.x, y: particle.y, opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.12 }}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: particle.size,
                          height: particle.size,
                          marginLeft: -particle.size / 2,
                          marginTop: -particle.size / 2,
                          borderRadius: particle.radius,
                          background: burstColors[particle.tone]
                        }}
                      />
                    ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 2.4, rotate: -22 }}
                    animate={{ opacity: 1, scale: 1, rotate: -8 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 17 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3.5,
                        py: 1.5,
                        borderRadius: '10px',
                        border: `3px solid ${theme.palette.success.main}`,
                        outline: `1.5px solid ${theme.palette.success.main}`,
                        outlineOffset: '3px',
                        bgcolor: 'background.paper',
                        color: 'success.main',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.25rem' },
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Icon icon='tabler:circle-check' fontSize='1.5rem' />
                      Conectat
                    </Box>
                  </motion.div>
                </Box>
              )}
            </Box>
          </motion.div>

          <Box
            id={STATUS_ID}
            sx={{
              mt: 4,
              minHeight: 44,
              maxWidth: '64ch',
              color: alpha(theme.palette.common.white, 0.8),
              fontSize: '0.9375rem',
              lineHeight: 1.5
            }}
          >
            {renderStatus()}
          </Box>
        </Box>
      </Root>
    </MotionConfig>
  )
}

export default JoinProfessorCard
