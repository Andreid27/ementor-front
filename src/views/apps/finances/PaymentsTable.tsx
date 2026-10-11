// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** API
import { profileServiceClient } from 'src/generated/profile-service-client'

// ** Types
import type {
  FinancePaymentRowDTO,
  FinanceStudentRefDTO,
  GetFinancePaymentsStatusEnum
} from 'src/generated/profile-service-client/api'

// ** Local Imports
import useFinanceQuery from './useFinanceQuery'
import { SectionError, StatusChip, StudentIdentity } from './FinanceParts'
import { FinancePeriod, formatDateTime, formatMoney } from './financeUtils'

interface PaymentsTableProps {
  period: FinancePeriod
  refreshKey: number
  onSelectStudent: (student: FinanceStudentRefDTO) => void
}

type StatusColor = 'warning' | 'success' | 'error' | 'secondary'

// Status always ships with an icon and a word, never color alone
export const PAYMENT_STATUS: Record<GetFinancePaymentsStatusEnum, { label: string; color: StatusColor; icon: string }> =
  {
    PENDING: { label: 'Pending', color: 'warning', icon: 'tabler:clock' },
    CONFIRMED: { label: 'Confirmed', color: 'success', icon: 'tabler:check' },
    REJECTED: { label: 'Rejected', color: 'error', icon: 'tabler:x' },
    EXPIRED: { label: 'Expired', color: 'secondary', icon: 'tabler:clock-off' }
  }

export const PaymentStatusChip = ({ status }: { status: GetFinancePaymentsStatusEnum }) => (
  <StatusChip
    label={PAYMENT_STATUS[status].label}
    icon={PAYMENT_STATUS[status].icon}
    color={PAYMENT_STATUS[status].color}
  />
)

// On a phone the table keeps who paid and where it stands; the amount moves under the name
const COMPACT_COLUMNS = {
  createdAt: false,
  amount: false,
  referenceCode: false,
  confirmedAt: false,
  totalAllocated: false
}

const PaymentsTable = ({ period, refreshKey, onSelectStudent }: PaymentsTableProps) => {
  // ** State
  const [status, setStatus] = useState<GetFinancePaymentsStatusEnum | ''>('')
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })

  // ** Hook
  const compact = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  useEffect(() => {
    setPaginationModel(model => ({ ...model, page: 0 }))
  }, [period.from, period.to, status])

  const { data, loading, error, reload } = useFinanceQuery(
    () =>
      profileServiceClient.finance
        .getFinancePayments({
          from: period.from,
          to: period.to,
          status: status ? [status] : undefined,
          page: paginationModel.page,
          size: paginationModel.pageSize
        })
        .then(r => r.data),
    [period.from, period.to, status, paginationModel.page, paginationModel.pageSize, refreshKey]
  )

  const columns: GridColDef<FinancePaymentRowDTO>[] = [
    {
      field: 'createdAt',
      headerName: 'Submitted',
      minWidth: 170,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatDateTime(row.createdAt)}
        </Typography>
      )
    },
    {
      field: 'student',
      headerName: 'Student',
      flex: 1.2,
      minWidth: compact ? 170 : 220,
      sortable: false,
      renderCell: ({ row }) => (
        <StudentIdentity student={row.student} detail={compact ? formatMoney(row.amount, row.currency) : undefined} />
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 130,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(row.amount, row.currency)}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 145,
      sortable: false,
      renderCell: ({ row }) => <PaymentStatusChip status={row.status} />
    },
    {
      field: 'referenceCode',
      headerName: 'Reference',
      minWidth: 170,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {row.referenceCode}
        </Typography>
      )
    },
    {
      field: 'confirmedAt',
      headerName: 'Confirmed',
      minWidth: 170,
      sortable: false,
      renderCell: ({ row }) => (
        <Typography variant='body2' sx={{ color: row.confirmedAt ? 'text.primary' : 'text.secondary' }}>
          {formatDateTime(row.confirmedAt)}
        </Typography>
      )
    },
    {
      field: 'totalAllocated',
      headerName: 'Applied to Sessions',
      minWidth: 170,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant='body2' sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(row.totalAllocated, row.currency)}
          </Typography>
          {row.surplus > 0 && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {`${formatMoney(row.surplus, row.currency)} left over, kept for future sessions`}
            </Typography>
          )}
        </Box>
      )
    }
  ]

  return (
    <Box>
      <Box sx={{ p: 6, pt: 5, display: 'flex', justifyContent: 'flex-end' }}>
        <CustomTextField
          select
          value={status}
          sx={{ width: { xs: '100%', sm: 220 } }}
          SelectProps={{
            displayEmpty: true,
            inputProps: { 'aria-label': 'Payment status' },
            onChange: event => setStatus(event.target.value as GetFinancePaymentsStatusEnum | '')
          }}
        >
          <MenuItem value=''>All Statuses</MenuItem>
          {(Object.keys(PAYMENT_STATUS) as GetFinancePaymentsStatusEnum[]).map(key => (
            <MenuItem key={key} value={key}>
              {PAYMENT_STATUS[key].label}
            </MenuItem>
          ))}
        </CustomTextField>
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
          loading={loading}
          rowCount={data?.totalItems ?? 0}
          paginationMode='server'
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
          localeText={{ noRowsLabel: status ? 'No payments with this status' : 'No payments in this period' }}
          sx={{ '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      )}
    </Box>
  )
}

export default PaymentsTable
