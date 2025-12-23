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
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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
import {
  fetchData,
  fetchInactiveStudents,
  deleteUser,
  fetchProfessorGenerations,
  fetchStudentsByGeneration,
  deactivateStudentRelationship,
  updateStudentGeneration
} from 'src/store/apps/user'

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
  StudentTabValue
} from './types'

import { userRoleObj, userStatusObj, filterStudents, transformStudentData } from './utils'

import {
  DEFAULT_FILTERS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  PRICING_OPTIONS,
  COLUMN_WIDTHS
} from './constants'

// ** Photo Service
import { processStudentPhotos } from './services/photoService'
import EmentorAvatar from 'src/@core/components/ementor-avatar'

// ** Auth Hook
import { useAuth } from 'src/hooks/useAuth'

// ** renders client column with photo loading
const renderClient = (row: StudentListItem, onAvatarClick?: (studentId: string) => void): JSX.Element => {
  return <StudentAvatar student={row} onClick={onAvatarClick || (() => {})} />
}

// ** Row Options Component
interface RowOptionsProps {
  student: StudentListItem
  onEditGeneration: (student: StudentListItem) => void
}

const RowOptions: React.FC<RowOptionsProps> = ({ student, onEditGeneration }) => {
  // ** Hooks
  const dispatch = useDispatch()
  const auth = useAuth()

  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick: MenuClickHandler = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleRowOptionsClose = (): void => {
    setAnchorEl(null)
  }

  const handleDeactivate = (): void => {
    if (window.confirm(`Are you sure you want to deactivate ${student.studentName}?`)) {
      dispatch(
        deactivateStudentRelationship({
          studentUserId: student.studentUserId,
          professorId: auth.user?.userId || student.professorId || ''
        }) as any
      )
    }
    handleRowOptionsClose()
  }

  const handleEditGeneration = (): void => {
    onEditGeneration(student)
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
            style: { minWidth: '10rem' }
          }
        }}
      >
        <MenuItem onClick={handleRowOptionsClose} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:eye' fontSize={20} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditGeneration} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='tabler:calendar' fontSize={20} />
          Edit Generation
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleDeactivate} sx={{ '& svg': { mr: 2 }, color: 'error.main' }}>
          <Icon icon='tabler:user-x' fontSize={20} />
          Deactivate
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
  const [currentTab, setCurrentTab] = useState<StudentTabValue>('active')
  const [filteredStudents, setFilteredStudents] = useState<StudentListItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentData, setSelectedStudentData] = useState<StudentListItem | null>(null)
  const [editGenerationOpen, setEditGenerationOpen] = useState<boolean>(false)
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null)
  const [newGeneration, setNewGeneration] = useState<string>('')

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: RootState) => state.user)
  const auth = useAuth()
  const professorId = auth.user?.userId

  // ** Fetch students on component mount and always refresh
  useEffect(() => {
    // Always fetch fresh data on page access
    dispatch(fetchData() as any)

    // Fetch generations for filtering
    if (professorId) {
      dispatch(fetchProfessorGenerations(professorId) as any)
    }
  }, [dispatch, professorId])

  // ** Get current students based on tab
  const currentStudents = currentTab === 'active' ? store.activeStudents : store.inactiveStudents
  const currentLoading = currentTab === 'active' ? store.loading : store.inactiveLoading

  // ** Transform raw data if needed and apply filters
  useEffect(() => {
    if (currentStudents && Array.isArray(currentStudents)) {
      // Check if data needs transformation (has firstName/lastName fields)
      const needsTransform = currentStudents.some((student: any) => student.firstName || student.lastName)
      const studentsToFilter = needsTransform ? transformStudentData(currentStudents as any) : currentStudents

      // Apply filters
      const filtered = filterStudents(studentsToFilter, filters)
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents([])
    }
  }, [currentStudents, filters, currentLoading])

  // ** Load photos for current page only (when pagination or filtered data changes)
  useEffect(() => {
    const loadPhotosForCurrentPage = async () => {
      if (filteredStudents.length === 0 || currentLoading) return

      // Calculate which students are on the current page
      const startIndex = paginationModel.page * paginationModel.pageSize
      const endIndex = startIndex + paginationModel.pageSize
      const studentsOnPage = filteredStudents.slice(startIndex, endIndex)

      // Load photos only for students on current page (like ACLPage does)
      if (studentsOnPage.length > 0) {
        try {
          // studentsOnPage already has 'attributes' field preserved from transformation
          // Pass studentsOnPage as both parameters - they already contain the needed data
          const studentsWithPhotos = await processStudentPhotos(studentsOnPage, studentsOnPage as any)

          // Update the filtered students with the loaded photos
          setFilteredStudents(prev => {
            return prev.map(student => {
              const studentWithPhoto = studentsWithPhotos.find(s => s.studentUserId === student.studentUserId)
              return studentWithPhoto || student
            })
          })
        } catch (error) {
          console.warn('Failed to load photos for current page:', error)
        }
      }
    }

    loadPhotosForCurrentPage()
  }, [paginationModel.page, paginationModel.pageSize, filteredStudents.length, currentLoading])

  // ** Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: StudentTabValue): void => {
    setCurrentTab(newValue)

    // Always fetch fresh inactive students (not cached)
    if (newValue === 'inactive' && !store.inactiveLoading) {
      dispatch(fetchInactiveStudents() as any)
    }

    // Reset pagination when changing tabs
    setPaginationModel({ page: 0, pageSize: DEFAULT_PAGE_SIZE })
  }

  // ** Event Handlers
  const handleFilter: SearchChangeHandler = useCallback((val: string) => {
    setFilters(prev => ({ ...prev, searchValue: val }))
  }, [])

  const handlePricingChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, pricing: e.target.value }))
  }, [])

  const handleStatusChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, status: e.target.value }))
  }, [])

  const handleGenerationChange: FilterChangeHandler = useCallback(
    e => {
      const generation = e.target.value
      setFilters(prev => ({ ...prev, generation }))

      // Fetch students by generation if a specific generation is selected
      if (generation && generation !== '' && professorId) {
        dispatch(fetchStudentsByGeneration({ professorId, generation }) as any)
      } else {
        // If "All Generations" is selected, fetch all students
        dispatch(fetchData() as any)
      }
    },
    [dispatch, professorId]
  )

  const handlePaginationChange: PaginationChangeHandler = useCallback(model => {
    setPaginationModel(model)
  }, [])

  const toggleAddUserDrawer = (): void => {
    setAddUserOpen(!addUserOpen)
  }

  const handleAvatarClick = useCallback(
    (studentUserId: string) => {
      // Find the student data from current tab
      const student = filteredStudents.find(s => s.studentUserId === studentUserId)
      if (student) {
        setSelectedStudentId(studentUserId)
        setSelectedStudentData(student)
        setDrawerOpen(true)
      }
    },
    [filteredStudents]
  )

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false)
    setSelectedStudentId(null)
    setSelectedStudentData(null)
  }, [])

  const handleEditGenerationOpen = useCallback((student: StudentListItem) => {
    setStudentToEdit(student)
    setNewGeneration(student.generation || '')
    setEditGenerationOpen(true)
  }, [])

  const handleEditGenerationClose = useCallback(() => {
    setEditGenerationOpen(false)
    setStudentToEdit(null)
    setNewGeneration('')
  }, [])

  const handleGenerationUpdate = useCallback(() => {
    if (!studentToEdit || !professorId) return

    dispatch(
      updateStudentGeneration({
        studentUserId: studentToEdit.studentUserId,
        professorId: professorId,
        generation: newGeneration,
        validGeneration: true
      }) as any
    )

    handleEditGenerationClose()
  }, [studentToEdit, professorId, newGeneration, dispatch, handleEditGenerationClose])

  // ** Column Definitions
  const columns: StudentGridColumn[] = [
    {
      flex: 0.3,
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
      minWidth: 120,
      headerName: 'Generation',
      field: 'generation',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon icon='tabler:calendar' fontSize={20} />
            <Typography noWrap sx={{ fontWeight: 500 }}>
              {row.generation || 'Not set'}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon
              icon={row.defaultPricePerSession ? 'tabler:currency-dollar' : 'tabler:alert-circle'}
              fontSize={20}
              color={row.defaultPricePerSession ? 'inherit' : 'disabled'}
            />
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                color: row.defaultPricePerSession ? 'text.primary' : 'text.disabled'
              }}
            >
              {pricingDisplay}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      minWidth: COLUMN_WIDTHS.STATUS,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        const isActive = row.status === 'active'
        const statusColor = isActive ? 'success' : 'secondary'
        const statusLabel = isActive ? 'Active' : row.status || 'Inactive'

        return (
          <CustomChip
            rounded
            skin='light'
            size='small'
            label={statusLabel}
            color={statusColor}
            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
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
      renderCell: ({ row }) => <RowOptions student={row} onEditGeneration={handleEditGenerationOpen} />
    }
  ]

  // ** Calculate statistics
  const totalActiveStudents = store.activeStudents.length
  const studentsWithPricing = store.activeStudents.filter(s => s.defaultPricePerSession && s.defaultPricePerSession > 0).length

  return (
    <Grid container spacing={6.5}>
      {/* Statistics Section - Student Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          {/* Total Active Students */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats={totalActiveStudents.toString()}
              title='Total Active Students'
              icon={<Icon icon='tabler:users' />}
              color='primary'
            />
          </Grid>

          {/* Students with Pricing Set */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats={studentsWithPricing.toString()}
              title='Students with Pricing'
              icon={<Icon icon='tabler:currency-dollar' />}
              color='success'
            />
          </Grid>

          {/* Placeholder for Pending Payments - Will use API */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats='--'
              title='Pending Payments'
              subtitle='Coming Soon'
              icon={<Icon icon='tabler:clock' />}
              color='warning'
            />
          </Grid>

          {/* Placeholder for Total Revenue - Will use API */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats='--'
              title='Total Revenue'
              subtitle='Coming Soon'
              icon={<Icon icon='tabler:chart-line' />}
              color='info'
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid item xs={12}>
        <Card>
          <TabContext value={currentTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleTabChange} aria-label='student status tabs'>
                <Tab
                  value='active'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon icon='tabler:user-check' />
                      <span>Active Students</span>
                      {store.activeStudents.length > 0 && (
                        <CustomChip
                          rounded
                          size='small'
                          skin='light'
                          color='success'
                          label={store.activeStudents.length}
                        />
                      )}
                    </Box>
                  }
                />
                <Tab
                  value='inactive'
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon icon='tabler:user-x' />
                      <span>Inactive Students</span>
                      {store.inactiveStudents.length > 0 && (
                        <CustomChip
                          rounded
                          size='small'
                          skin='light'
                          color='secondary'
                          label={store.inactiveStudents.length}
                        />
                      )}
                    </Box>
                  }
                />
              </TabList>
            </Box>
          </TabContext>

          <CardHeader title='Search Filters' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Generation'
                  SelectProps={{
                    value: filters.generation || '',
                    displayEmpty: true,
                    onChange: handleGenerationChange
                  }}
                >
                  <MenuItem value=''>All Generations</MenuItem>
                  {store.generations?.map(gen => (
                    <MenuItem key={gen} value={gen}>
                      {gen}
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
            loading={currentLoading}
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

      {/* Edit Generation Dialog */}
      <Dialog open={editGenerationOpen} onClose={handleEditGenerationClose} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Student Generation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant='body2' sx={{ mb: 4 }}>
              Update the generation for <strong>{studentToEdit?.studentName}</strong>
            </Typography>
            <CustomTextField
              select
              fullWidth
              label='Generation'
              value={newGeneration}
              onChange={e => setNewGeneration(e.target.value)}
            >
              <MenuItem value=''>None</MenuItem>
              {store.generations?.map((gen: string) => (
                <MenuItem key={gen} value={gen}>
                  {gen}
                </MenuItem>
              ))}
            </CustomTextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditGenerationClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleGenerationUpdate} variant='contained' disabled={!newGeneration}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

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
