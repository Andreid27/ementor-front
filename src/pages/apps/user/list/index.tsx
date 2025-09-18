// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'
import { GetStaticProps } from 'next'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'
import CardStatsHorizontalWithDetails from 'src/@core/components/card-statistics/card-stats-horizontal-with-details'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { deleteUser } from 'src/store/apps/user'

// ** Third Party Components
import axios from 'axios'

// ** Toast Import
import { Toaster } from 'react-hot-toast'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer'
import UserViewDrawer from 'src/pages/student-profile/components/UserViewDrawer'

// ** Local Components
import StudentAvatar from './components/StudentAvatar'

// ** Local Types and Utils
import {
  UserListProps,
  StudentListItem,
  FilterState,
  PaginationState,
  FilterChangeHandler,
  SearchChangeHandler,
  PaginationChangeHandler,
  MenuClickHandler,
  StudentGridColumn,
  RootState,
  ErrorState
} from './types'

import { userRoleObj, userStatusObj, filterStudents, sortStudents } from './utils'

import {
  DEFAULT_FILTERS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  PRICING_OPTIONS,
  COLUMN_WIDTHS
} from './constants'

// ** API Service
import { fetchActiveStudents } from './services'

// ** Photo Service
import { preloadPhotos } from './services/photoService'

// ** renders client column with photo loading
const renderClient = (row: StudentListItem, onAvatarClick?: (studentId: string) => void): JSX.Element => {
  return <StudentAvatar student={row} onClick={onAvatarClick || (() => {})} />
}

// ** Row Options Component
interface RowOptionsProps {
  id: string
}

const RowOptions: React.FC<RowOptionsProps> = ({ id }) => {
  // ** Hooks
  const dispatch = useDispatch()

  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick: MenuClickHandler = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = (): void => {
    setAnchorEl(null)
  }

  const handleDelete = (): void => {
    dispatch(deleteUser(id) as any)
    handleRowOptionsClose()
  }

  return (
    <>
      <IconButton size='small' onClick={handleRowOptionsClick}>
        <Icon icon='tabler:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={handleRowOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        slotProps={{
          paper: {
            style: { minWidth: '8rem' }
          }
        }}
      >
        <MenuItem
          component={Link}
          sx={{ '& svg': { mr: 2 } }}
          href='/apps/user/view/account'
          onClick={handleRowOptionsClose}
        >
          <Icon icon='tabler:eye' fontSize={20} />
          View
        </MenuItem>
        <MenuItem onClick={handleRowOptionsClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

// ** Main Component
const UserList: React.FC<UserListProps> = ({ apiData }) => {
  // ** State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [addUserOpen, setAddUserOpen] = useState<boolean>(false)
  const [paginationModel, setPaginationModel] = useState<PaginationState>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE
  })
  const [studentState, setStudentState] = useState<ErrorState>({
    loading: true,
    error: null,
    students: []
  })
  const [filteredStudents, setFilteredStudents] = useState<StudentListItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentData, setSelectedStudentData] = useState<StudentListItem | null>(null)

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: RootState) => state.user)

  // ** Fetch students on component mount
  useEffect(() => {
    const loadStudents = async () => {
      setStudentState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const students = await fetchActiveStudents()
        setStudentState({
          loading: false,
          error: null,
          students
        })

        // Preload photos in background
        if (students.length > 0) {
          preloadPhotos(students)
        }
      } catch (error) {
        console.error('Failed to load students:', error)
        setStudentState({
          loading: false,
          error: 'Failed to load students',
          students: []
        })
      }
    }

    loadStudents()
  }, [])

  // ** Filter students when filters or student data changes
  useEffect(() => {
    const filtered = filterStudents(studentState.students, filters)
    setFilteredStudents(filtered)
  }, [studentState.students, filters])

  // ** Event Handlers
  const handleFilter: SearchChangeHandler = useCallback((val: string) => {
    setFilters(prev => ({ ...prev, searchValue: val }))
  }, [])

  const handleRoleChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, role: e.target.value }))
  }, [])

  const handlePricingChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, pricing: e.target.value }))
  }, [])

  const handleStatusChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, status: e.target.value }))
  }, [])

  const handlePaginationChange: PaginationChangeHandler = useCallback(model => {
    setPaginationModel(model)
  }, [])

  const toggleAddUserDrawer = (): void => {
    setAddUserOpen(!addUserOpen)
  }

  const handleAvatarClick = useCallback(
    (studentUserId: string) => {
      // Find the student data
      const student = studentState.students.find(s => s.studentUserId === studentUserId)
      if (student) {
        setSelectedStudentId(studentUserId)
        setSelectedStudentData(student)
        setDrawerOpen(true)
      }
    },
    [studentState.students]
  )

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
    setSelectedStudentId(null)
    setSelectedStudentData(null)
  }, [])

  // ** Column Definitions
  const columns: StudentGridColumn[] = [
    {
      flex: 0.25,
      minWidth: COLUMN_WIDTHS.USER,
      field: 'fullName',
      headerName: 'Student',
      renderCell: ({ row }) => {
        const { studentName, email } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row, handleAvatarClick)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 500,
                  color: 'text.primary',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' }
                }}
                onClick={() => handleAvatarClick(row.studentUserId)}
              >
                {studentName || row.fullName}
              </Typography>
              <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                {email || 'No email available'}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      field: 'role',
      minWidth: COLUMN_WIDTHS.ROLE,
      headerName: 'Role',
      renderCell: ({ row }) => {
        const roleConfig = userRoleObj[row.role] || userRoleObj.student

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CustomAvatar skin='light' sx={{ mr: 4, width: 30, height: 30 }} color={roleConfig.color}>
              <Icon icon={roleConfig.icon} />
            </CustomAvatar>
            <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {row.role}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: COLUMN_WIDTHS.PRICING,
      headerName: 'Pricing',
      field: 'pricing',
      renderCell: ({ row }) => {
        const pricingDisplay = row.defaultPricePerSession ? `$${row.defaultPricePerSession}/session` : 'Not set'

        return (
          <Typography
            noWrap
            sx={{
              fontWeight: 500,
              color: row.defaultPricePerSession ? 'text.primary' : 'text.disabled'
            }}
          >
            {pricingDisplay}
          </Typography>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: COLUMN_WIDTHS.BILLING,
      field: 'billing',
      headerName: 'Billing',
      renderCell: ({ row }) => {
        return (
          <Typography noWrap sx={{ color: 'text.secondary' }}>
            {row.billing}
          </Typography>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: COLUMN_WIDTHS.STATUS,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        const statusColor = userStatusObj[row.status] || 'secondary'

        return (
          <CustomChip
            rounded
            skin='light'
            size='small'
            label={row.status}
            color={statusColor}
            sx={{ textTransform: 'capitalize' }}
          />
        )
      }
    },
    {
      flex: 0.1,
      minWidth: COLUMN_WIDTHS.ACTIONS,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => <RowOptions id={row.id} />
    }
  ]

  return (
    <Grid container spacing={6.5}>
      {/* Statistics Section - Preserved as requested */}
      <Grid item xs={12}>
        {apiData && (
          <Grid container spacing={6}>
            {apiData.statsHorizontalWithDetails.map((item, index) => {
              return (
                <Grid item xs={12} md={3} sm={6} key={index}>
                  <CardStatsHorizontalWithDetails {...item} />
                </Grid>
              )
            })}
          </Grid>
        )}
      </Grid>

      {/* Main Content */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filters' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Role'
                  SelectProps={{
                    value: filters.role,
                    displayEmpty: true,
                    onChange: handleRoleChange
                  }}
                >
                  {ROLE_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Pricing'
                  SelectProps={{
                    value: filters.pricing,
                    displayEmpty: true,
                    onChange: handlePricingChange
                  }}
                >
                  {PRICING_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Status'
                  SelectProps={{
                    value: filters.status,
                    displayEmpty: true,
                    onChange: handleStatusChange
                  }}
                >
                  {STATUS_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          </CardContent>
          <Divider sx={{ m: '0 !important' }} />
          <TableHeader value={filters.searchValue} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
          <DataGrid
            autoHeight
            rowHeight={62}
            rows={filteredStudents}
            columns={columns}
            loading={studentState.loading}
            disableRowSelectionOnClick
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
          />
        </Card>
      </Grid>

      <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />

      {/* Student Detail Drawer */}
      {selectedStudentId && (
        <UserViewDrawer open={drawerOpen} onClose={handleDrawerClose} userId={selectedStudentId} tab='account' />
      )}

      {/* Toast Notifications */}
      <Toaster />
    </Grid>
  )
}

// ** Static Props (preserved for statistics)
export const getStaticProps: GetStaticProps = async () => {
  try {
    const res = await axios.get('/cards/statistics')
    const apiData = res.data

    return {
      props: {
        apiData
      }
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    return {
      props: {
        apiData: null
      }
    }
  }
}

UserList.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default UserList
