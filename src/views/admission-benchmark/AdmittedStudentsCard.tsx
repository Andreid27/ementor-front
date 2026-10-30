// ** React Imports
import { useCallback, useEffect, useMemo, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import TableRow from '@mui/material/TableRow'
import Skeleton from '@mui/material/Skeleton'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'framer-motion'
import { useSelector } from 'react-redux'

// ** API Imports
import { fetchAdmissions, isNotFound } from './benchmarkApi'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import { countLabel } from 'src/views/student-ui/countLabel'
import { accentInk } from 'src/views/student-ui/readableAccent'
import { cohortColor } from './chartStyle'

// ** Types
import type { BenchmarkAdmissions } from './types'

interface Speciality {
  id: string
  name: string
  color: string
}

type YearRow = { year: number; total: number } & Record<string, number>

const numberCell = { textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const

/** A legend and tooltip mark for one speciality: a square, as the bars are drawn. */
const Square = ({ color }: { color: string }) => (
  <Box
    component='span'
    aria-hidden
    sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '3px', bgcolor: color }}
  />
)

const YearTooltip = ({
  active,
  label,
  rows,
  specialities
}: {
  active?: boolean
  label?: number
  rows: YearRow[]
  specialities: Speciality[]
}) => {
  const theme = useTheme()
  const row = rows.find(item => item.year === label)

  if (!active || !row) return null

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        minWidth: 180,
        maxWidth: 300,
        borderRadius: '10px',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
        {row.year}
      </Typography>
      {specialities
        .filter(speciality => row[speciality.id] > 0)
        .map(speciality => (
          <Typography
            key={speciality.id}
            variant='body2'
            sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.primary', '& + &': { mt: 1 } }}
          >
            <Square color={speciality.color} />
            {speciality.name}: {row[speciality.id]}
          </Typography>
        ))}
      <Typography
        variant='body2'
        sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}`, fontWeight: 700 }}
      >
        Total: {row.total}
      </Typography>
    </Box>
  )
}

/**
 * How many of the professor's students got in, by exam year and speciality,
 * as stacked bars, with the universities in a table underneath. An admin
 * sees everyone's students. Loaded once with the page, apart from the cohort
 * comparison above it.
 */
const AdmittedStudentsCard = () => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()
  const isAdmin = useSelector(selectUser)?.role === 'ADMIN'

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [data, setData] = useState<BenchmarkAdmissions>({ students: 0, bySpeciality: [], byUniversity: [] })

  const load = useCallback(() => {
    setStatus('loading')
    fetchAdmissions()
      .then(admissions => {
        setData(admissions)
        setStatus('ready')
      })
      .catch(error => {
        // Refused comes back as 404, which here means there is nothing to show.
        if (isNotFound(error)) {
          setData({ students: 0, bySpeciality: [], byUniversity: [] })
          setStatus('ready')

          return
        }
        console.error('Failed to load the admitted students:', error)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Each speciality keeps one colour in every year, in alphabetical order.
  const specialities = useMemo<Speciality[]>(() => {
    const names = new Map(data.bySpeciality.map(item => [item.specialityId, item.specialityName]))

    return Array.from(names, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
      .map((speciality, slot) => ({ ...speciality, color: cohortColor(theme, slot) }))
  }, [data.bySpeciality, theme])

  // Every year from the first to the last, so a year without admissions shows as 0.
  const rows = useMemo<YearRow[]>(() => {
    if (!data.bySpeciality.length) return []

    const years = data.bySpeciality.map(item => item.year)
    const first = Math.min(...years)
    const last = Math.max(...years)

    return Array.from({ length: last - first + 1 }, (_, index) => {
      const year = first + index
      const row = { year, total: 0 } as YearRow
      specialities.forEach(speciality => {
        row[speciality.id] = 0
      })
      data.bySpeciality
        .filter(item => item.year === year)
        .forEach(item => {
          row[item.specialityId] = item.students
          row.total += item.students
        })

      return row
    })
  }, [data.bySpeciality, specialities])

  const axisText = { fill: theme.palette.text.secondary, fontSize: 12 }

  const renderBody = () => {
    if (status === 'loading') {
      return <Skeleton variant='rounded' sx={{ height: { xs: 220, md: 260 }, borderRadius: '10px' }} />
    }

    if (status === 'error') {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Graficul nu s-a încărcat.
          </Typography>
          <Button size='small' onClick={load} sx={{ fontWeight: 600, color: accentInk }}>
            Reîncearcă
          </Button>
        </Box>
      )
    }

    if (data.students === 0) {
      return (
        <Box>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {isAdmin
              ? 'Încă nu există rezultate de admitere.'
              : 'Încă nu ai salvat rezultate de admitere. Le poți adăuga pe pagina fiecărui elev.'}
          </Typography>
          <Button
            size='small'
            component={Link}
            href='/apps/user/list'
            sx={{ mt: 2, ml: -2, fontWeight: 600, color: accentInk }}
          >
            Mergi la elevi
          </Button>
        </Box>
      )
    }

    const summary = rows
      .map(row => {
        const parts = specialities
          .filter(speciality => row[speciality.id] > 0)
          .map(speciality => `${speciality.name} ${row[speciality.id]}`)

        return `${row.year}: ${row.total}${parts.length ? ` (${parts.join(', ')})` : ''}`
      })
      .join('; ')

    return (
      <>
        <Box role='img' aria-label={`Elevi admiși pe ani. ${summary}.`} sx={{ height: { xs: 220, md: 260 } }}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={rows} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
              <XAxis dataKey='year' tickLine={false} axisLine={false} tick={axisText} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={axisText} width={32} />
              <Tooltip
                content={<YearTooltip rows={rows} specialities={specialities} />}
                cursor={{ fill: alpha(theme.palette.text.primary, 0.04) }}
              />
              {specialities.map((speciality, index) => (
                <Bar
                  key={speciality.id}
                  dataKey={speciality.id}
                  stackId='admitted'
                  fill={speciality.color}
                  maxBarSize={56}
                  // A hairline in the card's colour keeps neighbouring specialities apart.
                  stroke={theme.palette.background.paper}
                  strokeWidth={1}
                  isAnimationActive={!reduceMotion}
                >
                  {/* The year's total sits above its bar. */}
                  {index === specialities.length - 1 && (
                    <LabelList
                      dataKey='total'
                      position='top'
                      formatter={(value: number) => (value ? value : '')}
                      style={{ ...axisText, fontWeight: 600, fill: theme.palette.text.primary }}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box
          component='ul'
          sx={{ m: 0, mt: 3, p: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', columnGap: 4, rowGap: 1.5 }}
        >
          {specialities.map(speciality => (
            <Box
              component='li'
              key={speciality.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}
            >
              <Square color={speciality.color} />
              <Typography variant='body2' component='span' sx={{ color: 'inherit' }}>
                {speciality.name}
              </Typography>
            </Box>
          ))}
        </Box>

        <TableContainer sx={{ mt: 5, mx: { xs: -5, sm: -6 }, width: 'auto' }}>
          <Table size='small' aria-label='Elevi admiși pe universități'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: { xs: 5, sm: 6 } }}>An</TableCell>
                <TableCell>Specializare</TableCell>
                <TableCell>Universitate</TableCell>
                <TableCell sx={{ ...numberCell, pr: { xs: 5, sm: 6 } }}>Admiși</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.byUniversity.map(item => (
                <TableRow key={`${item.year}:${item.specialityId}:${item.universityId}`}>
                  <TableCell sx={{ pl: { xs: 5, sm: 6 }, fontVariantNumeric: 'tabular-nums' }}>{item.year}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{item.specialityName}</TableCell>
                  <TableCell>{item.universityName}</TableCell>
                  <TableCell sx={{ ...numberCell, pr: { xs: 5, sm: 6 } }}>{item.students}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  }

  return (
    <InsightCard
      title={isAdmin ? 'Elevi admiși' : 'Elevii tăi admiși'}
      subtitle='După anul examenului și specializare.'
      aside={
        status === 'ready' &&
        data.students > 0 && (
          <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
            {countLabel(data.students, '1 elev admis', 'elevi admiși')}
          </Typography>
        )
      }
    >
      {renderBody()}
    </InsightCard>
  )
}

export default AdmittedStudentsCard
