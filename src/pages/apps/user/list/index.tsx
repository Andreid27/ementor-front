// ** React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

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
import { generateSchoolYearOptions } from './utils'

// ** Actions Imports
import {
  fetchData,
  fetchInactiveStudents,
  deleteUser,
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

import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, COLUMN_WIDTHS } from './constants'

// ** Photo Service
import { processStudentPhotos } from './services/photoService'
import EmentorAvatar from 'src/@core/components/ementor-avatar'

// ** renders client column with photo loading
const renderClient = (row: StudentListItem, onAvatarClick?: (studentId: string) => void): JSX.Element => {
  return <StudentAvatar student={row} onClick={onAvatarClick || (() => {})} />
}

// ** Row Options Component
interface RowOptionsProps {
  student: StudentListItem
  onEditGeneration: (student: StudentListItem) => void
  onDeactivate: (student: StudentListItem) => void
}

const RowOptions: React.FC<RowOptionsProps> = ({ student, onEditGeneration, onDeactivate }) => {
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
    onDeactivate(student)
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
  const [isCustomGenerationEdit, setIsCustomGenerationEdit] = useState<boolean>(false)
  const [isUpdatingGeneration, setIsUpdatingGeneration] = useState<boolean>(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState<boolean>(false)
  const [studentToDeactivate, setStudentToDeactivate] = useState<StudentListItem | null>(null)
  const [dateFilter, setDateFilter] = useState<string>('')

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: RootState) => state.user)
  const professorId = store.data?.id

  // ** Generate school year options
  const schoolYearOptions = useMemo(() => generateSchoolYearOptions(), [])

  // ** Fetch students on component mount and always refresh
  useEffect(() => {
    // Always fetch fresh data on page access
    dispatch(fetchData() as any)
  }, [dispatch])

  // ** Get current students based on tab
  const currentStudents = currentTab === 'active' ? store.activeStudents : store.inactiveStudents
  const currentLoading = currentTab === 'active' ? store.loading : store.inactiveLoading

  // ** Extract unique filter options from dataset
  const uniqueGenerations = useMemo(() => {
    if (!currentStudents || currentStudents.length === 0) return []
    const generations = currentStudents
      .map((s: any) => s.generation)
      .filter((gen): gen is string => Boolean(gen))
    return Array.from(new Set(generations)).sort()
  }, [currentStudents])

  const uniquePricingRanges = useMemo(() => {
    if (!currentStudents || currentStudents.length === 0) return []
    const pricings = currentStudents
      .map((s: any) => s.pricing)
      .filter((pricing): pricing is string => Boolean(pricing))
    return Array.from(new Set(pricings)).sort()
  }, [currentStudents])

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

  // ** Load photos for current page only (when pagination changes)
  // Note: We intentionally omit filteredStudents from dependencies to avoid infinite loops
  // The effect runs when page/pageSize changes or when currentStudents change (via currentLoading)
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
              const studentWithPhoto = studentsWithPhotos.find(s => s.id === student.id)
              return studentWithPhoto || student
            })
          })
        } catch (error) {
          console.warn('Failed to load photos for current page:', error)
        }
      }
    }

    loadPhotosForCurrentPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, currentLoading])

  // ** Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: StudentTabValue): void => {
    setCurrentTab(newValue)

    // Reset pagination when changing tabs
    setPaginationModel({ page: 0, pageSize: DEFAULT_PAGE_SIZE })

    // Always fetch fresh inactive students with server-side pagination
    if (newValue === 'inactive' && !store.inactiveLoading && professorId) {
      dispatch(
        fetchInactiveStudents({
          professorId,
          params: {
            page: 0,
            size: DEFAULT_PAGE_SIZE,
            generation: filters.generation || undefined
          }
        }) as any
      )
    }
  }

  // ** Event Handlers
  const handleFilter: SearchChangeHandler = useCallback((val: string) => {
    setFilters(prev => ({ ...prev, searchValue: val }))
  }, [])

  const handlePricingChange: FilterChangeHandler = useCallback(e => {
    setFilters(prev => ({ ...prev, pricing: e.target.value }))
  }, [])

  const handleGenerationChange: FilterChangeHandler = useCallback(
    e => {
      const generation = e.target.value
      setFilters(prev => ({ ...prev, generation }))

      if (currentTab === 'active') {
        // Active tab: use existing logic
        if (generation && generation !== '' && professorId) {
          dispatch(fetchStudentsByGeneration({ professorId, generation }) as any)
        } else {
          dispatch(fetchData() as any)
        }
      } else if (currentTab === 'inactive' && professorId) {
        // Inactive tab: fetch with server-side filtering
        dispatch(
          fetchInactiveStudents({
            professorId,
            params: {
              page: 0,
              size: paginationModel.pageSize,
              generation: generation || undefined
            }
          }) as any
        )
        // Reset to first page when filtering
        setPaginationModel(prev => ({ ...prev, page: 0 }))
      }
    },
    [dispatch, professorId, currentTab, paginationModel.pageSize]
  )

  const handlePaginationChange: PaginationChangeHandler = useCallback(
    model => {
      setPaginationModel(model)

      // For inactive tab, fetch new page from server
      if (currentTab === 'inactive' && professorId) {
        dispatch(
          fetchInactiveStudents({
            professorId,
            params: {
              page: model.page,
              size: model.pageSize,
              generation: filters.generation || undefined
            }
          }) as any
        )
      }
    },
    [currentTab, professorId, dispatch, filters.generation]
  )

  const toggleAddUserDrawer = (): void => {
    setAddUserOpen(!addUserOpen)
  }

  const handleAvatarClick = useCallback(
    (studentUserId: string) => {
      // Find the student data from current tab
      const student = filteredStudents.find(s => s.id === studentUserId)

      if (student) {
        setSelectedStudentId(student.id)
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
    setIsCustomGenerationEdit(false)
    setIsUpdatingGeneration(false)
  }, [])

  const handleDeactivateOpen = useCallback((student: StudentListItem) => {
    setStudentToDeactivate(student)
    setDeactivateDialogOpen(true)
  }, [])

  const handleDeactivateClose = useCallback(() => {
    setDeactivateDialogOpen(false)
    setStudentToDeactivate(null)
  }, [])

  const handleDeactivateConfirm = useCallback(() => {
    if (!studentToDeactivate || !professorId) return

    const effectiveProfessorId = professorId || studentToDeactivate.professorId || ''

    dispatch(
      deactivateStudentRelationship({
        studentUserId: studentToDeactivate.studentUserId,
        professorId: effectiveProfessorId
      }) as any
    )

    handleDeactivateClose()
  }, [studentToDeactivate, professorId, dispatch, handleDeactivateClose])

  const handleDateFilterChange: FilterChangeHandler = useCallback(
    e => {
      const value = e.target.value
      setDateFilter(value)

      if (currentTab === 'inactive' && professorId) {
        let modifiedAfter: string | undefined

        if (value === 'last30days') {
          const date = new Date()
          date.setDate(date.getDate() - 30)
          modifiedAfter = date.toISOString()
        } else if (value === 'last90days') {
          const date = new Date()
          date.setDate(date.getDate() - 90)
          modifiedAfter = date.toISOString()
        } else if (value === 'last6months') {
          const date = new Date()
          date.setMonth(date.getMonth() - 6)
          modifiedAfter = date.toISOString()
        }

        dispatch(
          fetchInactiveStudents({
            professorId,
            params: {
              page: 0,
              size: paginationModel.pageSize,
              generation: filters.generation || undefined,
              modifiedAfter
            }
          }) as any
        )
        setPaginationModel(prev => ({ ...prev, page: 0 }))
      }
    },
    [currentTab, professorId, dispatch, paginationModel.pageSize, filters.generation]
  )

  const handleGenerationUpdate = useCallback(async () => {
    // Use professorId from Redux store.data.id (current logged-in professor)
    const effectiveProfessorId = professorId || studentToEdit?.professorId

    if (!studentToEdit || !effectiveProfessorId) {
      console.error('Missing required data for generation update:', {
        studentToEdit,
        professorId,
        effectiveProfessorId,
        storeData: store.data
      })
      return
    }

    if (!newGeneration) {
      console.error('No generation value provided')
      return
    }

    // Validate generation format if custom generation is provided
    if (newGeneration && !/^\d{4}-\d{4}$/.test(newGeneration)) {
      console.error('Invalid generation format:', newGeneration)
      return
    }

    setIsUpdatingGeneration(true)

    try {
      console.log('Updating generation with data:', {
        studentUserId: studentToEdit.studentUserId,
        professorId: effectiveProfessorId,
        generation: newGeneration,
        validGeneration: true
      })

      await dispatch(
        updateStudentGeneration({
          studentUserId: studentToEdit.studentUserId,
          professorId: effectiveProfessorId,
          generation: newGeneration,
          validGeneration: true
        }) as any
      ).unwrap()

      console.log('Generation updated successfully')
      handleEditGenerationClose()
    } catch (error) {
      console.error('Failed to update generation:', error)
      // Error toast is already shown by the Redux action
      setIsUpdatingGeneration(false)
    }
  }, [studentToEdit, professorId, newGeneration, dispatch, handleEditGenerationClose, store.data])

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
      flex: 0.12,
      minWidth: 110,
      headerName: 'Balance',
      field: 'walletBalance',
      renderCell: ({ row }) => {
        const balance = row.walletBalance ?? 0
        const isNegative = balance < 0
        const isPositive = balance > 0

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon
              icon={isNegative ? 'tabler:arrow-down' : isPositive ? 'tabler:arrow-up' : 'tabler:minus'}
              fontSize={20}
              color={isNegative ? 'error' : isPositive ? 'success' : 'disabled'}
            />
            <Typography
              noWrap
              sx={{
                fontWeight: 500,
                color: isNegative ? 'error.main' : isPositive ? 'success.main' : 'text.secondary'
              }}
            >
              {Math.abs(balance).toFixed(2)} RON
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: COLUMN_WIDTHS.ACTIONS,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <RowOptions student={row} onEditGeneration={handleEditGenerationOpen} onDeactivate={handleDeactivateOpen} />
      )
    }
  ]

  // ** Calculate statistics
  const totalActiveStudents = store.activeStudents.length
  const studentsWithPricing = store.activeStudents.filter(s => s.defaultPricePerSession && s.defaultPricePerSession > 0).length

  // Calculate percentage of students with pricing
  const pricingPercentage = totalActiveStudents > 0
    ? Math.round((studentsWithPricing / totalActiveStudents) * 100)
    : 0

  // Calculate total debt (sum of negative balances)
  const totalDebt = store.activeStudents.reduce((sum, student) => {
    const balance = student.walletBalance ?? 0
    return balance < 0 ? sum + Math.abs(balance) : sum
  }, 0)

  // Calculate number of students in debt
  const studentsInDebt = store.activeStudents.filter(s => (s.walletBalance ?? 0) < 0).length
  const debtPercentage = totalActiveStudents > 0
    ? Math.round((studentsInDebt / totalActiveStudents) * 100)
    : 0

  // ** Calculate students in current generation
  const studentsInCurrentGeneration = useMemo(() => {
    // If a generation filter is selected, count students matching that generation
    if (filters.generation) {
      return store.activeStudents.filter(s => s.generation === filters.generation).length
    }

    // Otherwise, count students in the current school year (first option in dropdown)
    const currentSchoolYear = schoolYearOptions[0]
    if (currentSchoolYear) {
      return store.activeStudents.filter(s => s.generation === currentSchoolYear).length
    }

    return 0
  }, [store.activeStudents, filters.generation, schoolYearOptions])

  // Calculate percentage of students in current generation
  const generationPercentage = totalActiveStudents > 0
    ? Math.round((studentsInCurrentGeneration / totalActiveStudents) * 100)
    : 0

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
              icon='tabler:users'
              avatarColor='primary'
              trendDiff={100}
              trend='positive'
              subtitle='All active students'
            />
          </Grid>

          {/* Students with Pricing Set */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats={studentsWithPricing.toString()}
              title='Students with Pricing'
              icon='tabler:currency-dollar'
              avatarColor='success'
              trendDiff={pricingPercentage}
              trend='positive'
              subtitle={`${pricingPercentage}% of total students`}
            />
          </Grid>

          {/* Total Student Debt */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats={`${totalDebt.toFixed(2)} RON`}
              title='Total Student Debt'
              icon='tabler:alert-circle'
              avatarColor='error'
              trendDiff={debtPercentage}
              trend='negative'
              subtitle={`${studentsInDebt} students in debt`}
            />
          </Grid>

          {/* Students in Current Generation */}
          <Grid item xs={12} md={3} sm={6}>
            <CardStatsHorizontalWithDetails
              stats={studentsInCurrentGeneration.toString()}
              title='Students in Current Generation'
              subtitle={filters.generation || schoolYearOptions[0] || 'N/A'}
              icon='tabler:school'
              avatarColor='info'
              trendDiff={generationPercentage}
              trend='positive'
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
                      {store.inactiveTotalElements > 0 && (
                        <CustomChip
                          rounded
                          size='small'
                          skin='light'
                          color='secondary'
                          label={store.inactiveTotalElements}
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
              <Grid item sm={currentTab === 'inactive' ? 4 : 6} xs={12}>
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
                  {uniqueGenerations.map(gen => (
                    <MenuItem key={gen} value={gen}>
                      {gen}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              {currentTab === 'inactive' && (
                <Grid item sm={4} xs={12}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Deactivated'
                    SelectProps={{
                      value: dateFilter,
                      displayEmpty: true,
                      onChange: handleDateFilterChange
                    }}
                  >
                    <MenuItem value=''>All Time</MenuItem>
                    <MenuItem value='last30days'>Last 30 Days</MenuItem>
                    <MenuItem value='last90days'>Last 90 Days</MenuItem>
                    <MenuItem value='last6months'>Last 6 Months</MenuItem>
                  </CustomTextField>
                </Grid>
              )}
              <Grid item sm={currentTab === 'inactive' ? 4 : 6} xs={12}>
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
                  <MenuItem value=''>All Pricing</MenuItem>
                  {uniquePricingRanges.map(pricing => (
                    <MenuItem key={pricing} value={pricing}>
                      {pricing}
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
            paginationMode={currentTab === 'inactive' ? 'server' : 'client'}
            rowCount={currentTab === 'inactive' ? store.inactiveTotalElements : filteredStudents.length}
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
            {!isCustomGenerationEdit ? (
              <CustomTextField
                select
                fullWidth
                label='Generation'
                value={newGeneration}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setIsCustomGenerationEdit(true)
                    setNewGeneration('')
                  } else {
                    setNewGeneration(e.target.value)
                  }
                }}
              >
                <MenuItem value=''>None</MenuItem>
                {schoolYearOptions.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
                <MenuItem value='custom' sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                  Custom Year Range...
                </MenuItem>
              </CustomTextField>
            ) : (
              <Box>
                <CustomTextField
                  fullWidth
                  label='Custom Generation'
                  value={newGeneration}
                  onChange={e => {
                    let input = e.target.value
                    // Remove any non-digit characters except hyphen
                    input = input.replace(/[^\d-]/g, '')

                    // Auto-format: when user types 4 digits, add hyphen
                    if (input.length === 4 && !input.includes('-')) {
                      input = input + '-'
                    }

                    // Limit to YYYY-YYYY format (9 characters max)
                    if (input.length <= 9) {
                      setNewGeneration(input)
                    }
                  }}
                  placeholder='YYYY-YYYY (e.g., 2025-2027)'
                  helperText='Enter start year, hyphen will be added automatically'
                  inputProps={{ maxLength: 9 }}
                />
                <Button
                  size='small'
                  variant='text'
                  onClick={() => {
                    setIsCustomGenerationEdit(false)
                    setNewGeneration('')
                  }}
                  sx={{ mt: 1 }}
                >
                  Back to standard options
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditGenerationClose} color='secondary' disabled={isUpdatingGeneration}>
            Cancel
          </Button>
          <Button onClick={handleGenerationUpdate} variant='contained' disabled={!newGeneration || isUpdatingGeneration}>
            {isUpdatingGeneration ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={deactivateDialogOpen} onClose={handleDeactivateClose} maxWidth='sm' fullWidth>
        <DialogTitle>Deactivate Student</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant='body1'>
              Are you sure you want to deactivate <strong>{studentToDeactivate?.studentName}</strong>?
            </Typography>
            <Typography variant='body2' sx={{ mt: 2, color: 'text.secondary' }}>
              This will remove the student from your active students list. You can reactivate them later if needed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeactivateClose} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeactivateConfirm} variant='contained' color='error'>
            Deactivate
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
