// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { roRO } from '@mui/x-date-pickers/locales'

// ** Third Party Imports
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ro'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** API Imports
import * as apiSpec from 'src/apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import { fetchAdmissionResults, saveAdmissionResult } from './benchmarkApi'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import InsightCard from 'src/views/student-ui/InsightCard'
import { accentButtonSx, accentInk, toneInk } from 'src/views/student-ui/readableAccent'

// ** Types
import type { AdmissionResult, AdmissionResultRequest } from './types'

interface Speciality {
  specialityId: string
  name: string
}

interface University {
  id: string
  name: string
  specialities: Speciality[]
}

/** The target fields of the student's profile, as /student-profile/get-full returns them. */
interface StudentTarget {
  universityId?: string | null
  universityValue?: string | null
  specialityId?: string | null
  specialityValue?: string | null
  desiredExamDate?: string | null
}

interface Form {
  score: string
  universityId: string
  specialityId: string
  examDate: Dayjs | null
}

interface AdmissionResultCardProps {
  studentId: string
  profile: StudentTarget
}

const EMPTY_FORM: Form = { score: '', universityId: '', specialityId: '', examDate: null }

const toForm = (result: AdmissionResult): Form => ({
  score:
    result.admissionScore === null || result.admissionScore === undefined
      ? ''
      : String(result.admissionScore).replace('.', ','),
  universityId: result.admissionUniversityId ?? '',
  specialityId: result.admissionSpecialityId ?? '',
  examDate: result.admissionExamDate ? dayjs(result.admissionExamDate) : null
})

/** Romanian decimals use a comma; both are accepted. Returns the number, or what is wrong with it. */
const readScore = (text: string): { value: number | null; error?: string } => {
  const normalized = text.trim().replace(',', '.')

  if (!normalized) return { value: null }
  if (normalized.startsWith('-')) return { value: null, error: 'Media nu poate fi negativă.' }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { value: null, error: 'Scrie un număr, de exemplu 87,50.' }
  if (/\.\d{3,}$/.test(normalized)) return { value: null, error: 'Cel mult două zecimale.' }
  if (normalized.split('.')[0].replace(/^0+(?=\d)/, '').length > 5) {
    return { value: null, error: 'Media are prea multe cifre.' }
  }

  return { value: Number(normalized) }
}

const toRequest = (form: Form): AdmissionResultRequest => ({
  admissionScore: readScore(form.score).value,
  admissionUniversityId: form.universityId || null,
  admissionSpecialityId: form.specialityId || null,
  admissionExamDate: form.examDate?.isValid() ? form.examDate.format('YYYY-MM-DD') : null
})

const sameRequest = (a: AdmissionResultRequest, b: AdmissionResultRequest) =>
  a.admissionScore === b.admissionScore &&
  a.admissionUniversityId === b.admissionUniversityId &&
  a.admissionSpecialityId === b.admissionSpecialityId &&
  a.admissionExamDate === b.admissionExamDate

/**
 * Where a student got in, entered by their professor (or an admin). The result
 * is what puts the student into the admitted cohorts that every student's
 * results chart compares against. Never shown on the student's own pages.
 */
const AdmissionResultCard = ({ studentId, profile }: AdmissionResultCardProps) => {
  const theme = useTheme()
  const user = useSelector(selectUser)
  const role: string | undefined = user?.role
  const canEdit = role === 'PROFESSOR' || role === 'ADMIN'

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [universities, setUniversities] = useState<University[]>([])
  const [results, setResults] = useState<AdmissionResult[]>([])
  const [professorId, setProfessorId] = useState('')
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [serverScoreError, setServerScoreError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!canEdit || !studentId) return

    setStatus('loading')
    Promise.all([
      apiClient.get(`${apiSpec.STUDENT_PROFILE_CONTROLLER}/profile-prerequire`),

      // A professor reads only their own relationship; an admin reads every professor's.
      fetchAdmissionResults(studentId, role === 'PROFESSOR' ? user?.id : undefined)
    ])
      .then(([prerequire, relationships]) => {
        setUniversities(prerequire.data?.universities ?? [])
        setResults(relationships)
        const first = relationships[0]
        setProfessorId(first?.professorId ?? '')
        setForm(first ? toForm(first) : EMPTY_FORM)
        setStatus('ready')
      })
      .catch(error => {
        console.error('Failed to load the admission result:', error)
        setStatus('error')
      })
  }, [canEdit, role, studentId, user?.id])

  useEffect(() => {
    load()
  }, [load])

  if (!canEdit) return null

  const current = results.find(result => result.professorId === professorId)

  // Nothing to edit when the student has no relationship with this professor.
  if (status === 'ready' && !current) return null

  const saved = current ? toRequest(toForm(current)) : toRequest(EMPTY_FORM)
  const request = toRequest(form)
  const scoreCheck = readScore(form.score)
  const scoreError = scoreCheck.error ?? serverScoreError
  const dirty = !sameRequest(request, saved)
  const valid = !scoreCheck.error && (form.examDate === null || form.examDate.isValid())

  const university = universities.find(item => item.id === form.universityId)
  const specialities = university?.specialities ?? []

  // A stored speciality the university no longer lists stays visible instead of going blank.
  const specialityOptions =
    form.specialityId && !specialities.some(item => item.specialityId === form.specialityId)
      ? [
          ...specialities,
          { specialityId: form.specialityId, name: current?.admissionSpecialityValue ?? 'Specializare' }
        ]
      : specialities

  const universityOptions =
    form.universityId && !university
      ? [
          ...universities,
          { id: form.universityId, name: current?.admissionUniversityValue ?? 'Universitate', specialities: [] }
        ]
      : universities

  const target =
    !form.universityId && !form.specialityId && profile.universityId && profile.specialityId
      ? `${profile.specialityValue}, ${profile.universityValue}`
      : null

  const profileExamMonth = profile.desiredExamDate
    ? new Date(profile.desiredExamDate).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
    : null

  const edit = (changes: Partial<Form>) => {
    setForm(previous => ({ ...previous, ...changes }))
    setSaveError(null)
    if ('score' in changes) setServerScoreError(null)
  }

  const chooseUniversity = (universityId: string) => {
    const next = universities.find(item => item.id === universityId)
    const keepsSpeciality = next?.specialities.some(item => item.specialityId === form.specialityId)
    edit({ universityId, specialityId: keepsSpeciality ? form.specialityId : '' })
  }

  const chooseProfessor = (id: string) => {
    const next = results.find(result => result.professorId === id)
    setProfessorId(id)
    setForm(next ? toForm(next) : EMPTY_FORM)
    setServerScoreError(null)
    setSaveError(null)
  }

  const save = async () => {
    setSaving(true)
    setServerScoreError(null)
    setSaveError(null)

    try {
      const updated = await saveAdmissionResult(studentId, professorId, request)
      setResults(previous =>
        previous.map(result => (result.professorId === professorId ? { ...result, ...updated } : result))
      )
      setForm(toForm({ ...(current as AdmissionResult), ...updated }))
      toast.success('Rezultatul de admitere a fost salvat.')
    } catch (error: any) {
      const code = error?.response?.status

      // The server only refuses the score; it explains in English, so the field says it in Romanian.
      if (code === 400) setServerScoreError('Media trebuie să fie cel puțin 0, cu cel mult două zecimale.')
      else if (code === 404) setSaveError('Universitatea sau specializarea nu mai există. Alege-le din nou.')
      else setSaveError('Rezultatul nu s-a salvat. Verifică conexiunea și încearcă din nou.')
    } finally {
      setSaving(false)
    }
  }

  const professorPicker = results.length > 1 && (
    <CustomTextField
      select
      size='small'
      label='Profesor'
      value={professorId}
      onChange={event => chooseProfessor(event.target.value)}
      sx={{ minWidth: 200 }}
    >
      {results.map(result => (
        <MenuItem key={result.professorId} value={result.professorId}>
          {result.professorName ?? result.professorId}
        </MenuItem>
      ))}
    </CustomTextField>
  )

  const renderBody = () => {
    if (status === 'loading') {
      return (
        <Grid container spacing={5} aria-hidden>
          {[0, 1, 2, 3].map(index => (
            <Grid item xs={12} sm={6} key={index}>
              <Skeleton variant='text' width={120} />
              <Skeleton variant='rounded' height={38} />
            </Grid>
          ))}
        </Grid>
      )
    }

    if (status === 'error') {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Rezultatul de admitere nu s-a încărcat.
          </Typography>
          <Button size='small' onClick={load} sx={{ fontWeight: 600, color: accentInk }}>
            Reîncearcă
          </Button>
        </Box>
      )
    }

    return (
      <Box
        component='form'
        noValidate
        onSubmit={event => {
          event.preventDefault()
          if (dirty && valid && !saving) save()
        }}
      >
        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              select
              fullWidth
              label='Universitate'
              value={form.universityId}
              onChange={event => chooseUniversity(event.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value=''>
                <Box component='span' sx={{ color: 'text.secondary' }}>
                  Alege
                </Box>
              </MenuItem>
              {universityOptions.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              select
              fullWidth
              label='Specializare'
              value={form.specialityId}
              onChange={event => edit({ specialityId: event.target.value })}
              disabled={!form.universityId}
              SelectProps={{ displayEmpty: true }}
              helperText={form.universityId ? undefined : 'Alege întâi universitatea.'}
            >
              <MenuItem value=''>
                <Box component='span' sx={{ color: 'text.secondary' }}>
                  Alege
                </Box>
              </MenuItem>
              {specialityOptions.map(item => (
                <MenuItem key={item.specialityId} value={item.specialityId}>
                  {item.name}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          {target && (
            <Grid item xs={12} sx={{ pt: '8px !important' }}>
              <Button
                size='small'
                onClick={() => {
                  const next = universities.find(item => item.id === profile.universityId)
                  const known = next?.specialities.some(item => item.specialityId === profile.specialityId)
                  edit({
                    universityId: profile.universityId ?? '',
                    specialityId: known ? profile.specialityId ?? '' : ''
                  })
                }}
                sx={{ ml: -2, fontWeight: 600, color: accentInk, textAlign: 'left' }}
              >
                Folosește ținta elevului: {target}
              </Button>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <CustomTextField
              fullWidth
              label='Medie de admitere'
              placeholder='87,50'
              value={form.score}
              onChange={event => edit({ score: event.target.value })}
              error={Boolean(scoreError)}
              helperText={scoreError}
              inputProps={{ inputMode: 'decimal', autoComplete: 'off' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale='ro'
              localeText={roRO.components.MuiLocalizationProvider.defaultProps.localeText}
            >
              <DatePicker
                label='Data examenului'
                value={form.examDate}
                onChange={value => edit({ examDate: value })}
                format='DD.MM.YYYY'
                // The styled field's props type is narrower than the picker's slot type, as in the calendar forms.
                slots={{ textField: CustomTextField as any }}
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    fullWidth: true,
                    helperText: `Dacă rămâne gol, folosim data examenului din profilul elevului${
                      profileExamMonth ? ` (${profileExamMonth})` : ''
                    }.`
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
          <Button type='submit' variant='contained' disabled={!dirty || !valid || saving} sx={accentButtonSx}>
            {saving ? 'Se salvează…' : 'Salvează'}
          </Button>
          {dirty && !saving && (
            <Button
              onClick={() => {
                setForm(current ? toForm(current) : EMPTY_FORM)
                setServerScoreError(null)
                setSaveError(null)
              }}
              sx={{ minHeight: 44, color: 'text.secondary' }}
            >
              Renunță
            </Button>
          )}
          {saveError && (
            <Typography role='alert' variant='body2' sx={{ color: toneInk(theme, theme.palette.error.main) }}>
              {saveError}
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <InsightCard
      title='Rezultat admitere'
      subtitle='Intră în linia celor admiși pe care o văd elevii în graficul de rezultate.'
      aside={professorPicker}
    >
      {renderBody()}
    </InsightCard>
  )
}

export default AdmissionResultCard
