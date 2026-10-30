// ** React Imports
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'

// ** API Imports
import { fetchCohorts, fetchCurves, isNotFound } from 'src/views/admission-benchmark/benchmarkApi'

// ** Custom Components Imports
import PeriodToggle from 'src/views/admission-benchmark/PeriodToggle'
import CohortTable from 'src/views/admission-benchmark/CohortTable'
import CohortPicker, { CohortSelection } from 'src/views/admission-benchmark/CohortPicker'
import CohortCurvesChart, { PlottedCurve } from 'src/views/admission-benchmark/CohortCurvesChart'
import AdmittedStudentsCard from 'src/views/admission-benchmark/AdmittedStudentsCard'
import { MAX_COHORTS } from 'src/views/admission-benchmark/chartStyle'
import IllustratedState from 'src/views/student-ui/IllustratedState'
import { accentButtonSx } from 'src/views/student-ui/readableAccent'

// ** Types
import type { BenchmarkCohort, BenchmarkCurve } from 'src/views/admission-benchmark/types'

const PERIODS = [
  { days: 30, short: '30 zile' },
  { days: 90, short: '3 luni' },
  { days: 180, short: '6 luni' },
  { days: 365, short: '1 an' },
  { days: 730, short: '2 ani' }
]

const DEFAULT_DAYS = 730
const STORAGE_KEY = 'ementor.benchmark-cohorts'

const readSavedKeys = (): string[] => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')

    return Array.isArray(saved) ? saved.filter(key => typeof key === 'string') : []
  } catch {
    return []
  }
}

const saveKeys = (keys: string[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch {
    // Without storage the page simply opens on the first cohort next time.
  }
}

/** The lowest colour slot no chosen cohort holds, so a cohort keeps its colour while others come and go. */
const freeSlot = (selected: CohortSelection[]) => {
  const taken = new Set(selected.map(item => item.slot))

  return Array.from({ length: MAX_COHORTS }, (_, slot) => slot).find(slot => !taken.has(slot)) ?? 0
}

const sectionTitle = { fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.35, color: 'text.primary' } as const

/**
 * Lets a professor compare how admitted students were scoring in the days
 * before their exam, cohort against cohort. The curves are rebuilt every
 * night from the admission results professors enter on each student's page.
 */
const AdmissionBenchmarkPage = () => {
  const [cohortsStatus, setCohortsStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [cohorts, setCohorts] = useState<BenchmarkCohort[]>([])
  const [computedAt, setComputedAt] = useState<string | null>(null)
  const [selected, setSelected] = useState<CohortSelection[]>([])
  const [days, setDays] = useState(DEFAULT_DAYS)

  const [curves, setCurves] = useState<BenchmarkCurve[]>([])
  const [curvesStatus, setCurvesStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const requestId = useRef(0)

  const loadCohorts = useCallback(() => {
    setCohortsStatus('loading')
    fetchCohorts()
      .then(data => {
        const known = new Set(data.cohorts.map(cohort => cohort.key))

        // Saved cohorts that no longer have a curve are dropped; with none left, the first one opens.
        let keys = readSavedKeys()
          .filter(key => known.has(key))
          .slice(0, MAX_COHORTS)
        if (!keys.length && data.cohorts.length) keys = [data.cohorts[0].key]

        setCohorts(data.cohorts)
        setComputedAt(data.computedAt)
        setSelected(keys.map((key, slot) => ({ key, slot })))
        setCohortsStatus('ready')
      })
      .catch(error => {
        if (isNotFound(error)) {
          setCohorts([])
          setCohortsStatus('ready')

          return
        }
        console.error('Failed to load the admission cohorts:', error)
        setCohortsStatus('error')
      })
  }, [])

  useEffect(() => {
    loadCohorts()
  }, [loadCohorts])

  useEffect(() => {
    if (cohortsStatus === 'ready' && cohorts.length) saveKeys(selected.map(item => item.key))
  }, [cohortsStatus, cohorts.length, selected])

  const keys = selected.map(item => item.key).join(',')

  const loadCurves = useCallback(() => {
    const id = ++requestId.current

    if (!keys) {
      setCurves([])
      setCurvesStatus('ready')

      return
    }

    setCurvesStatus('loading')
    fetchCurves(keys.split(','), days)
      .then(data => {
        if (id !== requestId.current) return
        setCurves(data.curves)
        if (data.computedAt) setComputedAt(data.computedAt)
        setCurvesStatus('ready')
      })
      .catch(error => {
        if (id !== requestId.current) return
        if (isNotFound(error)) {
          setCurves([])
          setCurvesStatus('ready')

          return
        }
        console.error('Failed to load the admission curves:', error)
        setCurvesStatus('error')
      })
  }, [keys, days])

  useEffect(() => {
    if (cohortsStatus === 'ready' && cohorts.length) loadCurves()
  }, [cohortsStatus, cohorts.length, loadCurves])

  const add = (key: string) =>
    setSelected(previous =>
      previous.some(item => item.key === key) || previous.length >= MAX_COHORTS
        ? previous
        : [...previous, { key, slot: freeSlot(previous) }]
    )

  const remove = (key: string) => setSelected(previous => previous.filter(item => item.key !== key))

  const toggle = (key: string) => (selected.some(item => item.key === key) ? remove(key) : add(key))

  // Lines follow the chips' order; a curve that came back for a cohort no longer chosen is not drawn.
  const plotted = useMemo<PlottedCurve[]>(() => {
    const byKey = new Map(curves.map(curve => [curve.key, curve]))

    return selected.flatMap(({ key, slot }) => {
      const curve = byKey.get(key)

      return curve ? [{ curve, slot }] : []
    })
  }, [curves, selected])

  const header = (
    <Grid item xs={12}>
      <Typography variant='h4' component='h1'>
        Benchmark admitere
      </Typography>
      <Typography sx={{ mt: 1, color: 'text.secondary' }}>
        Media la teste a studenților admiși, în zilele dinaintea examenului.
      </Typography>
    </Grid>
  )

  // Loaded on its own, so it shows whatever state the cohort comparison is in.
  const admitted = (
    <Grid item xs={12}>
      <AdmittedStudentsCard />
    </Grid>
  )

  if (cohortsStatus === 'loading') {
    return (
      <Grid container spacing={6}>
        {header}
        <Grid item xs={12}>
          <Card sx={{ p: { xs: 5, sm: 6 } }} aria-busy>
            <Skeleton variant='rounded' width={180} height={36} />
            <Skeleton variant='rounded' sx={{ mt: 5, height: { xs: 280, md: 340 } }} />
          </Card>
        </Grid>
        {admitted}
      </Grid>
    )
  }

  if (cohortsStatus === 'error') {
    return (
      <Grid container spacing={6}>
        {header}
        <Grid item xs={12}>
          <Card>
            <IllustratedState
              icon='tabler:cloud-off'
              tone='error'
              title='Cohortele nu s-au încărcat'
              description='Verifică conexiunea la internet și încearcă din nou.'
              actions={
                <Button variant='contained' onClick={loadCohorts} sx={accentButtonSx}>
                  Reîncearcă
                </Button>
              }
            />
          </Card>
        </Grid>
        {admitted}
      </Grid>
    )
  }

  if (!cohorts.length) {
    return (
      <Grid container spacing={6}>
        {header}
        <Grid item xs={12}>
          <Card>
            <IllustratedState
              icon='tabler:chart-line'
              title='Încă nu există rezultate de admitere'
              description='Adaugă rezultatul de admitere pe pagina fiecărui elev ca să apară aici.'
              actions={
                <Button variant='contained' component={Link} href='/apps/user/list' sx={accentButtonSx}>
                  Mergi la elevi
                </Button>
              }
            />
          </Card>
        </Grid>
        {admitted}
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      {header}

      <Grid item xs={12}>
        <Card component='section' aria-labelledby='benchmark-chart-title' sx={{ p: { xs: 5, sm: 6 } }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 4,
              mb: 5
            }}
          >
            <Typography id='benchmark-chart-title' component='h2' sx={sectionTitle}>
              Comparație
            </Typography>
            <PeriodToggle periods={PERIODS} value={days} onChange={setDays} />
          </Box>
          <Box sx={{ mb: 5 }}>
            <CohortPicker cohorts={cohorts} selected={selected} onAdd={add} onRemove={remove} />
          </Box>
          <CohortCurvesChart plotted={plotted} days={days} status={curvesStatus} onRetry={loadCurves} />
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card component='section' aria-labelledby='benchmark-table-title'>
          <Box sx={{ px: { xs: 5, sm: 6 }, pt: { xs: 5, sm: 6 }, pb: 3 }}>
            <Typography id='benchmark-table-title' component='h2' sx={sectionTitle}>
              Toate cohortele
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
              Bifează o cohortă ca s-o adaugi pe grafic.
            </Typography>
          </Box>
          <CohortTable cohorts={cohorts} selected={selected} onToggle={toggle} />
          {computedAt && (
            <Typography variant='body2' sx={{ px: { xs: 5, sm: 6 }, py: 4, color: 'text.secondary' }}>
              Actualizat{' '}
              {new Date(computedAt).toLocaleString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          )}
        </Card>
      </Grid>

      {admitted}
    </Grid>
  )
}

AdmissionBenchmarkPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default AdmissionBenchmarkPage
