// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API
import { profileServiceClient } from 'src/generated/profile-service-client'

// ** Types
import type {
  FinanceStudentRefDTO,
  FinanceStudentRowDTO,
  GetFinanceStudentsSortEnum
} from 'src/generated/profile-service-client/api'

// ** Local Imports
import useFinanceQuery from './useFinanceQuery'
import { SectionError, StudentIdentity, gridLocaleText } from './FinanceParts'
import { FinancePeriod, TERMS, formatDay, formatDateTime, formatMoney } from './financeUtils'

interface StudentsTableProps {
  period: FinancePeriod
  refreshKey: number
  onSelectStudent: (student: FinanceStudentRefDTO) => void
}

// Grid columns that the backend can sort by
const SORT_FIELDS: Record<string, GetFinanceStudentsSortEnum> = {
  student: 'name',
  earnedInPeriod: 'earned',
  outstanding: 'outstanding'
}

const DEFAULT_SORT: GridSortModel = [{ field: 'outstanding', sort: 'desc' }]

const amountSx = (value: number | null | undefined) => ({
  fontVariantNumeric: 'tabular-nums',
  color: value ? 'text.primary' : 'text.secondary'
})

// On a phone the table keeps only who it is and what they owe; the ledger holds the rest
const COMPACT_COLUMNS = {
  effectivePrice: false,
  sessionsInPeriod: false,
  earnedInPeriod: false,
  collectedInPeriod: false,
  lastPaymentDate: false
}

const RELATIONSHIP_LABELS: Record<string, string | undefined> = {
  INACTIVE: 'Elev inactiv',
  SUSPENDED: 'Elev suspendat'
}

const StudentsTable = ({ period, refreshKey, onSelectStudent }: StudentsTableProps) => {
  // ** State
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })

  // ** Hook
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)

    return () => clearTimeout(timeout)
  }, [search])

  // A new period, search or order starts again from the first page
  useEffect(() => {
    setPaginationModel(model => ({ ...model, page: 0 }))
  }, [period.from, period.to, debouncedSearch, sortModel])

  const sort = sortModel[0] ?? DEFAULT_SORT[0]

  const { data, loading, error, reload } = useFinanceQuery(
    () =>
      profileServiceClient.finance
        .getFinanceStudents({
          from: period.from,
          to: period.to,
          sort: SORT_FIELDS[sort.field] ?? 'outstanding',
          direction: sort.sort ?? 'desc',
          page: paginationModel.page,
          size: paginationModel.pageSize,
          search: debouncedSearch || undefined
        })
        .then(r => r.data),
    [
      period.from,
      period.to,
      sort.field,
      sort.sort,
      paginationModel.page,
      paginationModel.pageSize,
      debouncedSearch,
      refreshKey
    ]
  )

  const currency = data?.currency ?? ''

  const columns: GridColDef<FinanceStudentRowDTO>[] = [
    {
      field: 'student',
      headerName: 'Elev',
      flex: 1.4,
      minWidth: compact ? 170 : 220,
      // A former student says so under the name, in words, so the name keeps the full column width
      renderCell: ({ row }) => (
        <StudentIdentity
          student={row.student}
          detail={row.relationshipStatus ? RELATIONSHIP_LABELS[row.relationshipStatus] : 'Nu mai este elevul tău'}
        />
      )
    },
    {
      field: 'effectivePrice',
      headerName: 'Preț',
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant='body2' sx={amountSx(row.effectivePrice)}>
            {formatMoney(row.effectivePrice, currency)}
          </Typography>
          {row.effectivePriceSource === 'LAST_CHARGE' && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Ultimul preț facturat
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'sessionsInPeriod',
      headerName: 'Ședințe',
      minWidth: 110,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={amountSx(row.sessionsInPeriod)}>
          {row.sessionsInPeriod}
        </Typography>
      )
    },
    {
      field: 'earnedInPeriod',
      headerName: TERMS.confirmed.label,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={amountSx(row.earnedInPeriod)}>
          {formatMoney(row.earnedInPeriod, currency)}
        </Typography>
      )
    },
    {
      field: 'collectedInPeriod',
      headerName: TERMS.received.label,
      minWidth: 130,
      sortable: false,
      align: 'right',
      headerAlign: 'right',

      // Money paid ahead of sessions is rare, so it rides under Received instead of taking a column
      renderCell: ({ row }) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body2' sx={amountSx(row.collectedInPeriod)}>
            {formatMoney(row.collectedInPeriod, currency)}
          </Typography>
          {row.credit > 0 && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {`${formatMoney(row.credit, currency)} în avans`}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'outstanding',
      headerName: TERMS.stillOwed.label,
      minWidth: compact ? 130 : 160,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body2' sx={{ ...amountSx(row.outstanding), fontWeight: row.outstanding ? 600 : 400 }}>
            {formatMoney(row.outstanding, currency)}
          </Typography>
          {row.oldestUnpaidSessionDate && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {`Din ${formatDay(row.oldestUnpaidSessionDate)}`}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'lastPaymentDate',
      headerName: 'Ultima Plată',
      minWidth: 160,
      sortable: false,
      renderCell: ({ row }) =>
        row.lastPaymentDate ? (
          <Box>
            <Typography variant='body2' sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(row.lastPaymentAmount, currency)}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {formatDateTime(row.lastPaymentDate)}
            </Typography>
          </Box>
        ) : (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Niciodată
          </Typography>
        )
    }
  ]

  return (
    <Box>
      <Box sx={{ p: 6, pt: 5, display: 'flex', justifyContent: 'flex-end' }}>
        <CustomTextField
          value={search}
          placeholder='Caută elevi'
          onChange={event => setSearch(event.target.value)}
          inputProps={{ 'aria-label': 'Caută elevi' }}
          sx={{ width: { xs: '100%', sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' fontSize={18} />
              </InputAdornment>
            )
          }}
        />
      </Box>
      {error ? (
        <Box sx={{ px: 6, pb: 6 }}>
          <SectionError error={error} onRetry={reload} />
        </Box>
      ) : (
        <DataGrid
          autoHeight
          rowHeight={64}
          rows={data?.items ?? []}
          columns={columns}
          columnVisibilityModel={compact ? COMPACT_COLUMNS : {}}
          getRowId={row => row.student.studentId}
          loading={loading}
          rowCount={data?.totalItems ?? 0}
          paginationMode='server'
          sortingMode='server'
          sortingOrder={['desc', 'asc']}
          sortModel={sortModel}
          onSortModelChange={model => setSortModel(model.length ? model : DEFAULT_SORT)}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          disableColumnMenu
          disableRowSelectionOnClick
          onRowClick={({ row }) => onSelectStudent(row.student)}
          onCellKeyDown={(params, event) => {
            // Rows open the ledger from the keyboard too, not only with a click
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelectStudent(params.row.student)
            }
          }}
          localeText={gridLocaleText(debouncedSearch ? 'Niciun elev nu se potrivește căutării' : 'Niciun elev încă')}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      )}
    </Box>
  )
}

export default StudentsTable
