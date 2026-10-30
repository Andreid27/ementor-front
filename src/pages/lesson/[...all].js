// ** React Imports
import { useCallback, useEffect, useId, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import { TabContext, TabList } from '@mui/lab'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { useSelector } from 'react-redux'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'

// ** Custom Components Imports
import LessonFileTab from 'src/views/lesson-viewer/LessonFileTab'
import { PdfViewerPlaceholder } from 'src/views/lesson-viewer/PdfViewer'
import useReadingTracker from 'src/views/lesson-viewer/useReadingTracker'
import useLessonProgress from 'src/views/lesson-viewer/useLessonProgress'
import IllustratedState from 'src/views/student-ui/IllustratedState'
import StatusPill from 'src/views/student-ui/StatusPill'
import { stageBackground } from 'src/views/student-ui/StageBackdrop'
import { countLabel } from 'src/views/student-ui/countLabel'
import { formatStudyTime } from 'src/views/student-ui/format'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'

const fileTitle = file => {
  const name = file.fileName ?? ''

  return name.lastIndexOf('.') > 0 ? name.substring(0, name.lastIndexOf('.')) : name
}

const statusDisplay = (status, idleLabel) =>
  ({
    reading: {
      tone: 'accent',
      icon: 'tabler:player-play',
      label: 'Se înregistrează',
      note: 'Timpul de studiu crește cât citești.'
    },
    idle: {
      tone: 'warning',
      icon: 'tabler:player-pause',
      label: 'Pe pauză',
      note: `Nicio activitate de ${idleLabel}. Dă pagina sau mișcă mouse-ul ca să continui.`
    },
    'page-limit': {
      tone: 'warning',
      icon: 'tabler:player-pause',
      label: 'Pe pauză',
      note: 'Ai stat mult pe pagina asta. Timpul continuă când treci la pagina următoare.'
    },
    hidden: { tone: 'neutral', icon: 'tabler:player-pause', label: 'Pe pauză', note: 'Lecția nu e pe ecran.' },
    waiting: {
      tone: 'neutral',
      icon: 'tabler:hourglass',
      label: 'Se pregătește',
      note: 'Timpul pornește când apare prima pagină.'
    }
  }[status])

const Metric = ({ label, value, caption, progress }) => (
  <Box>
    <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 0.5, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2, color: 'text.primary' }}>
      {value}
      {caption && (
        <Box component='span' sx={{ ml: 1.5, fontWeight: 400, fontSize: '0.875rem', color: 'text.secondary' }}>
          {caption}
        </Box>
      )}
    </Typography>
    {/* The bar keeps its space before there is a value, so the strip does not grow when it arrives. */}
    <LinearProgress
      variant='determinate'
      value={progress === null ? 0 : Math.min(100, progress)}
      aria-hidden={progress === null}
      aria-label={progress === null ? undefined : `${label}: ${Math.round(Math.min(100, progress))}%`}
      sx={{ mt: 2, height: 6, borderRadius: 3, visibility: progress === null ? 'hidden' : 'visible' }}
    />
  </Box>
)

/** Shown over the page when counting has paused for lack of activity, so it is seen in fullscreen too. */
const PausePrompt = ({ idleLabel, onResume }) => {
  const theme = useTheme()
  const titleId = useId()

  return (
    <Box
      role='alertdialog'
      aria-labelledby={titleId}
      sx={{
        maxWidth: 340,
        p: 6,
        borderRadius: '16px',
        textAlign: 'center',
        bgcolor: 'background.paper',
        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.25)}`
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          mx: 'auto',
          mb: 4,
          borderRadius: '16px',
          color: accentInk(theme),
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.16)
        }}
      >
        <Icon icon='tabler:coffee' fontSize='1.75rem' />
      </Box>
      <Typography id={titleId} component='h2' sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
        Mai citești?
      </Typography>
      <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.6 }}>
        Timpul de studiu s-a oprit după {idleLabel} fără activitate. Pornește din nou când continui.
      </Typography>
      <Button variant='contained' autoFocus onClick={onResume} sx={{ ...accentButtonSx, width: '100%', mt: 5 }}>
        Continui lectura
      </Button>
    </Box>
  )
}

const Lesson = () => {
  const theme = useTheme()
  const router = useRouter()
  const user = useSelector(selectUser)
  const lessonId = router.isReady ? router.query.all?.[0] : undefined

  const [lesson, setLesson] = useState(null)
  const [status, setStatus] = useState('loading')
  const [selectedFile, setSelectedFile] = useState(null)
  const [page, setPage] = useState({ number: 1, total: 0 })
  const [showHow, setShowHow] = useState(false)
  const [resumedFrom, setResumedFrom] = useState(null)
  const [viewerKey, setViewerKey] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const { progress, setPage: savePage, markRead } = useLessonProgress(user?.id, lessonId)
  const progressRef = useRef(progress)
  progressRef.current = progress

  const loadLesson = useCallback(() => {
    if (!lessonId) return
    setStatus('loading')

    apiClient
      .get(apiSpec.LESSON_SERVICE + `/lesson/student-lesson/${lessonId}`)
      .then(response => {
        const firstFile = response.data.files?.[0]?.fileId ?? null
        const lastPage = firstFile ? progressRef.current[firstFile]?.lastPage ?? 1 : 1

        // Set together, so the resume note is there in the first frame with the lesson.
        setLesson(response.data)
        setSelectedFile(firstFile)
        setResumedFrom(lastPage > 1 ? lastPage : 0)
        setStatus('ready')
      })
      .catch(error => {
        console.error('Failed to load the lesson:', error)
        setStatus('error')
      })
  }, [lessonId])

  useEffect(() => {
    loadLesson()
  }, [loadLesson])

  const knownPages = Object.values(progress).reduce((sum, file) => sum + (file.numPages || 0), 0)
  const totalPages = Math.max(knownPages, page.total)
  const secondsPerPage = lesson?.timeToRead && totalPages ? lesson.timeToRead / totalPages : undefined

  const pageKey = selectedFile && page.total ? `${selectedFile}:${page.number}` : null

  const tracker = useReadingTracker({
    lessonId,
    enabled: status === 'ready' && Boolean(lesson?.files?.length),
    secondsPerPage,
    pageKey,
    fullscreen,
    onPageRead: key => {
      const separator = key.lastIndexOf(':')
      markRead(key.slice(0, separator), Number(key.slice(separator + 1)))
    }
  })

  const handlePageChange = useCallback(
    (number, total) => {
      setPage({ number, total })
      if (selectedFile) savePage(selectedFile, number, total)
    },
    [selectedFile, savePage]
  )

  const restartFromFirstPage = () => {
    if (selectedFile) savePage(selectedFile, 1, page.total)
    setResumedFrom(0)
    setViewerKey(key => key + 1)
  }

  if (status === 'error') {
    return (
      <Card>
        <IllustratedState
          icon='tabler:cloud-off'
          tone='error'
          title='Lecția nu s-a încărcat'
          description='Verifică conexiunea la internet și încearcă din nou.'
          actions={
            <Button variant='contained' onClick={loadLesson} sx={accentButtonSx}>
              Reîncearcă
            </Button>
          }
        />
      </Card>
    )
  }

  // While loading, the page keeps its final layout and fills it with placeholders
  // of the same size, so nothing moves when the lesson arrives.
  const loading = status === 'loading'
  const files = lesson?.files ?? []
  const chapters = (lesson?.chapters ?? []).map(chapter => chapter.title).filter(Boolean)
  const estimate = lesson?.timeToRead ?? 0
  const studied = (lesson?.totalTime ?? 0) + tracker.sessionSeconds
  const idleLabel = formatStudyTime(tracker.limits.idleSeconds)
  const display = statusDisplay(loading ? 'waiting' : tracker.status, idleLabel)
  const readPages = selectedFile ? progress[selectedFile]?.read.length ?? 0 : 0
  const currentFile = files.find(file => file.fileId === selectedFile)

  return (
    <Box sx={{ '@media print': { display: 'none' } }}>
      <Card aria-busy={loading}>
        <Box sx={{ px: { xs: 5, sm: 6 }, pt: { xs: 4, sm: 5 }, pb: 5 }}>
          <Button
            component={Link}
            href='/lessons'
            startIcon={<Icon icon='tabler:arrow-left' fontSize='1.125rem' />}
            sx={{ ml: -2, mb: 3, minHeight: 44, color: 'text.secondary', fontWeight: 600 }}
          >
            Cursuri
          </Button>
          {(loading || chapters.length > 0) && (
            <Typography
              component='p'
              sx={{
                mb: 1,
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: accentInk(theme)
              }}
            >
              {loading ? <Skeleton width={150} /> : chapters.join(' · ')}
            </Typography>
          )}
          <Typography
            component='h1'
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: { xs: '1.625rem', md: '2.125rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              overflowWrap: 'anywhere'
            }}
          >
            {loading ? <Skeleton width='55%' /> : lesson.title}
          </Typography>
          {(loading || estimate > 0) && (
            <Typography sx={{ mt: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon='tabler:clock' fontSize='1.125rem' aria-hidden />
              {loading ? <Skeleton width={180} /> : `Aproximativ ${formatStudyTime(estimate)} de citit`}
            </Typography>
          )}
          {loading && (
            <Typography variant='body2' sx={{ mt: 3, lineHeight: 1.6 }}>
              <Skeleton width='40%' />
            </Typography>
          )}
          {lesson?.description && (
            <Typography
              component='div'
              variant='body2'
              sx={{
                mt: 3,
                maxWidth: '70ch',
                color: 'text.secondary',
                lineHeight: 1.6,
                '& a': { color: accentInk },

                // The professor's HTML brings browser paragraph margins (1em), which
                // the placeholder line cannot know about; keep only the gaps between paragraphs.
                '& p': { my: 0 },
                '& p + p': { mt: 2 }
              }}
              dangerouslySetInnerHTML={{ __html: lesson.description }}
            />
          )}
        </Box>

        {!loading && files.length === 0 ? (
          <IllustratedState
            icon='tabler:file-off'
            title='Lecția nu are încă materiale'
            description='Profesorul nu a atașat niciun fișier. Revino mai târziu.'
            actions={
              <Button variant='contained' component={Link} href='/lessons' sx={accentButtonSx}>
                Înapoi la cursuri
              </Button>
            }
          />
        ) : (
          <>
            {/* What is being counted, always in view: the student should never have to guess. */}
            <Box
              sx={{
                mx: { xs: 4, sm: 6 },
                mb: 5,
                p: { xs: 4, sm: 5 },
                borderRadius: '16px',
                background: stageBackground
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
                <Box
                  role='status'
                  sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5, flex: '1 1 260px' }}
                >
                  <StatusPill tone={display.tone} icon={display.icon}>
                    {display.label}
                  </StatusPill>
                  <Typography variant='body2' sx={{ color: 'text.secondary', flex: '1 1 200px' }}>
                    {display.note}
                  </Typography>
                </Box>
                <Button
                  size='small'
                  onClick={() => setShowHow(value => !value)}
                  aria-expanded={showHow}
                  endIcon={<Icon icon={showHow ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize='1rem' />}
                  sx={{ minHeight: 36, fontWeight: 600, color: accentInk }}
                >
                  Cum se măsoară?
                </Button>
              </Box>
              <Collapse in={showHow}>
                <Typography variant='body2' sx={{ mt: 3, maxWidth: '72ch', color: 'text.secondary', lineHeight: 1.6 }}>
                  Timpul de studiu se adună doar cât citești: lecția e pe ecran și ai folosit mouse-ul, tastatura sau
                  ecranul tactil în ultimele {idleLabel}
                  {fullscreen ? '' : ' (5 min când citești pe tot ecranul)'}. Dacă lecția rămâne deschisă în fundal sau
                  nu o citește nimeni, timpul se oprește singur. O pagină contează ca parcursă după câteva secunde de
                  citit pe ea.
                </Typography>
              </Collapse>
              <Box
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: { xs: 4, sm: 6 }
                }}
              >
                <Metric
                  label='Timp de studiu'
                  value={loading ? '—' : formatStudyTime(studied)}
                  caption={!loading && estimate > 0 ? `din ~${formatStudyTime(estimate)}` : null}
                  progress={estimate > 0 ? (studied / estimate) * 100 : null}
                />
                <Metric
                  label={
                    files.length > 1 && currentFile ? `Pagini parcurse · ${fileTitle(currentFile)}` : 'Pagini parcurse'
                  }
                  value={page.total ? `${readPages} din ${page.total}` : '—'}
                  caption={null}
                  progress={page.total ? (readPages / page.total) * 100 : null}
                />
              </Box>
            </Box>

            {resumedFrom > 1 && (
              <Box
                sx={{
                  mx: { xs: 4, sm: 6 },
                  mb: 4,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 2,
                  color: 'text.secondary'
                }}
              >
                <Icon icon='tabler:bookmark' fontSize='1.125rem' color={accentInk(theme)} aria-hidden />
                <Typography variant='body2'>Ai continuat de la pagina {resumedFrom}, unde ai rămas.</Typography>
                <Button size='small' onClick={restartFromFirstPage} sx={{ fontWeight: 600, color: accentInk }}>
                  Începe de la prima pagină
                </Button>
              </Box>
            )}

            <Box sx={{ px: { xs: 2, sm: 6 }, pb: { xs: 4, sm: 6 } }}>
              {/* Same frame and padding as the viewer inside its tab panel. */}
              {loading && (
                <Box sx={{ py: 6 }}>
                  <PdfViewerPlaceholder />
                </Box>
              )}
              <TabContext value={selectedFile ?? ''}>
                {files.length > 1 && (
                  <TabList
                    variant='scrollable'
                    scrollButtons='auto'
                    aria-label={`Fișierele lecției: ${countLabel(files.length, 'un fișier', 'fișiere')}`}
                    onChange={(_event, value) => {
                      setSelectedFile(value)
                      setPage({ number: 1, total: 0 })
                    }}
                    sx={{ borderBottom: `1px solid ${theme.palette.divider}`, '& .MuiTab-root': { py: 3.5 } }}
                  >
                    {files.map(file => (
                      <Tab key={file.fileId} value={file.fileId} label={fileTitle(file)} />
                    ))}
                  </TabList>
                )}
                {files.map((file, index) => (
                  <LessonFileTab
                    key={file.fileId}
                    file={file}
                    index={index}
                    viewerKey={file.fileId === selectedFile ? viewerKey : 0}
                    viewerProps={{
                      initialPage: progress[file.fileId]?.lastPage ?? 1,
                      onPageChange: handlePageChange,
                      onFullscreenChange: setFullscreen,
                      overlay:
                        tracker.status === 'idle' ? (
                          <PausePrompt idleLabel={idleLabel} onResume={tracker.resume} />
                        ) : null
                    }}
                  />
                ))}
              </TabContext>
            </Box>
          </>
        )}
      </Card>
    </Box>
  )
}

Lesson.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default Lesson
