// ** React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

// ** API
import { profileServiceClient } from 'src/generated/profile-service-client'

// ** Types
import type { FinanceStudentRefDTO } from 'src/generated/profile-service-client/api'

// ** Finance Views
import AgingCard from 'src/views/apps/finances/AgingCard'
import KpiTiles from 'src/views/apps/finances/KpiTiles'
import PeriodBar from 'src/views/apps/finances/PeriodBar'
import IncomeChart from 'src/views/apps/finances/IncomeChart'
import LedgerDrawer from 'src/views/apps/finances/LedgerDrawer'
import BreakdownCard from 'src/views/apps/finances/BreakdownCard'
import PaymentsTable from 'src/views/apps/finances/PaymentsTable'
import StudentsTable from 'src/views/apps/finances/StudentsTable'
import useFinanceQuery from 'src/views/apps/finances/useFinanceQuery'
import { SectionError } from 'src/views/apps/finances/FinanceParts'
import AttentionStrip, { hasAttentionItems } from 'src/views/apps/finances/AttentionStrip'
import {
  FinancePeriod,
  PeriodPreset,
  buildPeriod,
  financeErrorMessage,
  getFinanceColors,
  granularityFor,
  parseDate,
  validateRange
} from 'src/views/apps/finances/financeUtils'

const PRESETS: PeriodPreset[] = ['month', 'year', 'schoolYear', 'custom']

// Restores the period from the address bar so reloads, links and Back keep what the professor was looking at
const periodFromQuery = (query: Record<string, string | string[] | undefined>): FinancePeriod | null => {
  const preset = query.preset as PeriodPreset
  const from = typeof query.from === 'string' ? query.from : ''
  const to = typeof query.to === 'string' ? query.to : ''

  if (!PRESETS.includes(preset) || validateRange(from, to)) return null
  if (preset === 'custom') return { preset, from, to }

  return buildPeriod(preset, parseDate(from))
}

const FinancesPage = () => {
  // ** Hooks
  const theme = useTheme()
  const router = useRouter()
  const { t } = useTranslation()

  // ** State
  const [period, setPeriod] = useState<FinancePeriod>(() => buildPeriod('year'))
  const [refreshKey, setRefreshKey] = useState(0)
  const [tab, setTab] = useState<'students' | 'payments'>('students')
  const [selectedStudent, setSelectedStudent] = useState<FinanceStudentRefDTO | null>(null)
  const [exporting, setExporting] = useState(false)

  const colors = getFinanceColors(theme.palette.mode)
  const granularity = granularityFor(period)
  const finance = profileServiceClient.finance

  useEffect(() => {
    if (!router.isReady) return
    const fromQuery = periodFromQuery(router.query)

    if (fromQuery) setPeriod(fromQuery)

    // Only the first render reads the address bar; afterwards the page writes it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  const handlePeriodChange = (next: FinancePeriod) => {
    setPeriod(next)
    router.replace({ pathname: router.pathname, query: { ...next } }, undefined, { shallow: true, scroll: false })
  }

  const overview = useFinanceQuery(
    () => finance.getFinanceOverview({ from: period.from, to: period.to }).then(r => r.data),
    [period.from, period.to, refreshKey]
  )

  const timeseries = useFinanceQuery(
    () => finance.getFinanceTimeseries({ from: period.from, to: period.to, granularity }).then(r => r.data),
    [period.from, period.to, granularity, refreshKey]
  )

  const aging = useFinanceQuery(() => finance.getFinanceAging().then(r => r.data), [refreshKey])

  const handleExport = async () => {
    setExporting(true)

    try {
      const response = await finance.exportFinanceLedger(
        { from: period.from, to: period.to, format: 'CSV' },
        { responseType: 'blob' }
      )
      const data = response.data as unknown
      const blob = data instanceof Blob ? data : new Blob([String(data)], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = `finance-ledger-${period.from}_${period.to}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(financeErrorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {/* Same translated name as the sidebar item that leads here */}
        <Typography variant='h4' component='h1'>
          {t('Finances')}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <PeriodBar
          period={period}
          onChange={handlePeriodChange}
          generatedAt={overview.data?.generatedAt}
          refreshing={overview.loading && Boolean(overview.data)}
          onRefresh={() => setRefreshKey(key => key + 1)}
          exporting={exporting}
          onExport={handleExport}
        />
      </Grid>

      <Grid item xs={12}>
        {overview.error ? (
          <SectionError error={overview.error} onRetry={overview.reload} />
        ) : (
          <KpiTiles overview={overview.data} loading={overview.loading} period={period} colors={colors} />
        )}
      </Grid>

      {!overview.error && hasAttentionItems(overview.data) && (
        <Grid item xs={12}>
          <AttentionStrip overview={overview.data} />
        </Grid>
      )}

      <Grid item xs={12}>
        <IncomeChart
          timeseries={timeseries.data}
          loading={timeseries.loading}
          error={timeseries.error}
          onRetry={timeseries.reload}
          period={period}
          colors={colors}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <AgingCard
          aging={aging.data}
          loading={aging.loading}
          error={aging.error}
          onRetry={aging.reload}
          colors={colors}
          onSelectStudent={setSelectedStudent}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <BreakdownCard period={period} refreshKey={refreshKey} colors={colors} />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <TabContext value={tab}>
            <TabList
              onChange={(_event: SyntheticEvent, value: 'students' | 'payments') => setTab(value)}
              aria-label='Students and payments'
              sx={{ px: 6, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab value='students' label='Students' />
              <Tab value='payments' label='Payments' />
            </TabList>
            <TabPanel value='students' sx={{ p: 0 }}>
              <StudentsTable period={period} refreshKey={refreshKey} onSelectStudent={setSelectedStudent} />
            </TabPanel>
            <TabPanel value='payments' sx={{ p: 0 }}>
              <PaymentsTable period={period} refreshKey={refreshKey} onSelectStudent={setSelectedStudent} />
            </TabPanel>
          </TabContext>
        </Card>
      </Grid>

      <LedgerDrawer
        student={selectedStudent}
        period={period}
        refreshKey={refreshKey}
        onClose={() => setSelectedStudent(null)}
      />
    </Grid>
  )
}

FinancesPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default FinancesPage
