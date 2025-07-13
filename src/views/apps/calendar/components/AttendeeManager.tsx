import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  Chip,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
  Collapse,
  Alert,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AttachMoney as AttachMoneyIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material'

// Import EventAttendeeDTO and utilities
import { EventAttendeeDTO } from 'src/generated/profile-service'
import {
  studentToEventAttendeeDTO,
  enrichAttendeesWithStudentData,
  addAttendee,
  removeAttendee,
  updateAttendeePrice,
  updateAttendanceStatus,
  calculateTotalRevenue,
  getExpectedCount,
  getAttendedCount,
  getExpectedAttendees,
  getAttendedAttendees
} from '../utils/eventAttendeeUtils'

export interface StudentData {
  id?: string
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  profilePicture?: string
  [key: string]: any
}

interface AttendeeManagerProps {
  // Student data
  students?: StudentData[]

  // Current attendees using EventAttendeeDTO
  attendees?: EventAttendeeDTO[]
  onAttendeesChange: (attendees: EventAttendeeDTO[]) => void

  // Default settings
  defaultPrice: number
  eventType?: 'singular' | 'recurring' | 'occurrence'

  // Display options
  showPricing?: boolean
  showAttendanceTracking?: boolean
  showStatistics?: boolean
  maxHeight?: number

  // States
  isReadOnly?: boolean
  isLoading?: boolean
  isNewEvent?: boolean
}

const AttendeeManager: React.FC<AttendeeManagerProps> = ({
  students,
  attendees,
  onAttendeesChange,
  defaultPrice,
  eventType = 'singular',
  showPricing = true,
  showAttendanceTracking = false,
  showStatistics = true,
  maxHeight = 400,
  isReadOnly = false,
  isLoading = false,
  isNewEvent = true
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    currentAttendees: true,
    availableStudents: false,
    statistics: true
  })

  // Enrich attendees with student data for display
  const enrichedAttendees = useMemo(() => {
    return enrichAttendeesWithStudentData(attendees || [], students || [])
  }, [attendees, students])

  // Filter available students (not already added)
  const availableStudents = useMemo(() => {
    if (!attendees || !Array.isArray(attendees)) {
      return students || []
    }

    const attendeeIds = attendees.map(a => a.attendeeId)
    return (students || []).filter(student => {
      const studentId = student.userId || student.id
      return studentId && !attendeeIds.includes(studentId)
    })
  }, [students, attendees])

  // Filter students by search term
  const filteredAvailableStudents = useMemo(() => {
    if (!searchTerm) return availableStudents
    const term = searchTerm.toLowerCase()
    return availableStudents.filter(student => {
      const name = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
      const email = (student.email || '').toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [availableStudents, searchTerm])

  // Calculate statistics
  const statistics = useMemo(() => {
    const safeAttendees = attendees || []
    const expectedCount = getExpectedCount(safeAttendees)
    const attendedCount = getAttendedCount(safeAttendees)
    const totalRevenue = calculateTotalRevenue(safeAttendees, defaultPrice)
    const expectedAttendees = getExpectedAttendees(safeAttendees)
    const attendedAttendees = getAttendedAttendees(safeAttendees)

    return {
      total: safeAttendees.length,
      expected: expectedCount,
      attended: attendedCount,
      expectedRevenue: calculateTotalRevenue(expectedAttendees, defaultPrice),
      actualRevenue: calculateTotalRevenue(attendedAttendees, defaultPrice),
      totalRevenue
    }
  }, [attendees, defaultPrice])

  // Helper functions
  const getStudentDisplayName = (student: StudentData) => {
    return student.firstName && student.lastName
      ? `${student.firstName} ${student.lastName}`
      : student.firstName || student.lastName || student.email || 'Unknown'
  }

  const getStudentInitials = (student: StudentData) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
    }
    if (student.firstName) return student.firstName.charAt(0).toUpperCase()
    if (student.email) return student.email.charAt(0).toUpperCase()
    return '?'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Event handlers
  const handleAddAttendee = (student: StudentData) => {
    const updatedAttendees = addAttendee(attendees || [], student, {
      expected: true,
      customPrice: defaultPrice,
      defaultPrice: defaultPrice
    })
    onAttendeesChange(updatedAttendees)
  }

  const handleRemoveAttendee = (attendeeId: string) => {
    const updatedAttendees = removeAttendee(attendees || [], attendeeId)
    onAttendeesChange(updatedAttendees)
  }

  const handleUpdatePrice = (attendeeId: string, price: number) => {
    const updatedAttendees = updateAttendeePrice(attendees || [], attendeeId, price, defaultPrice)
    onAttendeesChange(updatedAttendees)
  }

  const handleToggleExpected = (attendeeId: string, expected: boolean) => {
    const safeAttendees = attendees || []

    // Find the attendee to check if they have custom pricing
    const attendee = safeAttendees.find(a => a.attendeeId === attendeeId)

    // Prevent unchecking "Expected" if attendee has custom pricing
    // This is required by database constraint: event_attendees_pricing_check
    if (!expected && attendee?.hasCustomPricing) {
      console.warn('Cannot set expected=false for attendee with custom pricing due to database constraint')
      return // Don't allow the change
    }

    const updatedAttendees = safeAttendees.map(attendee =>
      attendee.attendeeId === attendeeId ? { ...attendee, expected } : attendee
    )
    onAttendeesChange(updatedAttendees)
  }

  const handleToggleAttended = (attendeeId: string, attended: boolean) => {
    const updatedAttendees = updateAttendanceStatus(attendees || [], attendeeId, attended)
    onAttendeesChange(updatedAttendees)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Render functions
  const renderAttendeeItem = (attendee: EventAttendeeDTO, index: number) => {
    const student = (students || []).find(s => s.userId === attendee.attendeeId || s.id === attendee.attendeeId)
    if (!student) return null

    const displayName = getStudentDisplayName(student)
    const initials = getStudentInitials(student)
    const attendeePrice = attendee.hasCustomPricing ? attendee.customPrice || 0 : defaultPrice

    return (
      <ListItem key={attendee.attendeeId || index} divider>
        <ListItemAvatar>
          <Avatar src={student.profilePicture || student.picture}>{initials}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body1'>{displayName}</Typography>
              {attendee.expected && (
                <Tooltip title='Expected to attend'>
                  <EventAvailableIcon fontSize='small' color='primary' />
                </Tooltip>
              )}
              {attendee.attended && (
                <Tooltip title='Attended'>
                  <CheckCircleIcon fontSize='small' color='success' />
                </Tooltip>
              )}
            </Box>
          }
          secondary={
            <Box sx={{ mt: 1 }}>
              {/* Student email */}
              <Typography variant='caption' display='block' color='textSecondary'>
                {student.email}
              </Typography>

              {/* Attendance controls */}
              {showAttendanceTracking && !isReadOnly && (
                <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={attendee.expected || false}
                        onChange={e => handleToggleExpected(attendee.attendeeId!, e.target.checked)}
                        size='small'
                        // Disable if attendee has custom pricing (database constraint requirement)
                        disabled={attendee.hasCustomPricing || false}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Expected
                        {attendee.hasCustomPricing && (
                          <Tooltip title='Cannot be disabled when attendee has custom pricing'>
                            <AttachMoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          </Tooltip>
                        )}
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={attendee.attended || false}
                        onChange={e => handleToggleAttended(attendee.attendeeId!, e.target.checked)}
                        size='small'
                      />
                    }
                    label='Attended'
                    sx={{ m: 0 }}
                  />
                </Box>
              )}

              {/* Pricing controls */}
              {showPricing && !isReadOnly && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    type='number'
                    value={attendeePrice}
                    onChange={e => handleUpdatePrice(attendee.attendeeId!, parseFloat(e.target.value) || 0)}
                    size='small'
                    sx={{ width: 100 }}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>
                    }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={attendee.hasCustomPricing || false}
                        onChange={e => {
                          if (!e.target.checked) {
                            handleUpdatePrice(attendee.attendeeId!, defaultPrice)
                          }
                        }}
                        size='small'
                      />
                    }
                    label='Custom'
                    sx={{ m: 0 }}
                  />
                </Box>
              )}

              {/* Display pricing if read-only */}
              {showPricing && isReadOnly && (
                <Typography variant='caption' color='primary'>
                  Price: {formatCurrency(attendeePrice)}
                  {attendee.hasCustomPricing && ' (Custom)'}
                </Typography>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          {!isReadOnly && (
            <IconButton edge='end' onClick={() => handleRemoveAttendee(attendee.attendeeId!)} color='error'>
              <RemoveIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  const renderAvailableStudentItem = (student: StudentData) => {
    const studentId = student.userId || student.id
    if (!studentId) return null

    const displayName = getStudentDisplayName(student)
    const initials = getStudentInitials(student)

    return (
      <ListItem key={studentId} button onClick={() => handleAddAttendee(student)} disabled={isReadOnly}>
        <ListItemAvatar>
          <Avatar src={student.profilePicture || student.picture}>{initials}</Avatar>
        </ListItemAvatar>
        <ListItemText primary={displayName} secondary={student.email} />
        <ListItemSecondaryAction>
          <IconButton edge='end' onClick={() => handleAddAttendee(student)} disabled={isReadOnly} color='primary'>
            <AddIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Statistics */}
      {showStatistics && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('statistics')}
            >
              <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Attendee Statistics
              </Typography>
              {expandedSections.statistics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>

            <Collapse in={expandedSections.statistics}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Chip
                      label={`${statistics.total} Total`}
                      color='primary'
                      icon={<PersonIcon />}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Chip
                      label={`${statistics.expected} Expected`}
                      color='default'
                      icon={<EventAvailableIcon />}
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  {showAttendanceTracking && (
                    <Grid item xs={6} sm={3}>
                      <Chip
                        label={`${statistics.attended} Attended`}
                        color='success'
                        icon={<CheckCircleIcon />}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  )}
                  {showPricing && (
                    <Grid item xs={6} sm={3}>
                      <Chip
                        label={`${formatCurrency(statistics.totalRevenue)} Revenue`}
                        color='secondary'
                        icon={<AttachMoneyIcon />}
                        sx={{ width: '100%' }}
                      />
                    </Grid>
                  )}
                </Grid>

                {showPricing && showAttendanceTracking && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='body2' color='textSecondary'>
                      Expected Revenue: {formatCurrency(statistics.expectedRevenue)} | Actual Revenue:{' '}
                      {formatCurrency(statistics.actualRevenue)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Current Attendees */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={() => toggleSection('currentAttendees')}
        >
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={(attendees || []).length} color='primary'>
              <GroupIcon />
            </Badge>
            Current Attendees
          </Typography>
          {expandedSections.currentAttendees ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>

        <Collapse in={expandedSections.currentAttendees}>
          <Divider />
          <List sx={{ maxHeight: maxHeight / 2, overflowY: 'auto' }}>
            {(attendees || []).length === 0 ? (
              <ListItem>
                <ListItemText primary='No attendees selected' secondary='Add students from the available list below' />
              </ListItem>
            ) : (
              (attendees || []).map((attendee, index) => renderAttendeeItem(attendee, index))
            )}
          </List>
        </Collapse>
      </Paper>

      {/* Available Students */}
      {!isReadOnly && (
        <Paper sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => toggleSection('availableStudents')}
          >
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={availableStudents.length} color='secondary'>
                <PersonIcon />
              </Badge>
              Available Students
            </Typography>
            {expandedSections.availableStudents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Box>

          <Collapse in={expandedSections.availableStudents}>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                size='small'
                placeholder='Search students...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <List sx={{ maxHeight: maxHeight / 2, overflowY: 'auto' }}>
              {filteredAvailableStudents.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary='No students available'
                    secondary={searchTerm ? 'No students match your search' : 'All students are already attendees'}
                  />
                </ListItem>
              ) : (
                filteredAvailableStudents.map(student => renderAvailableStudentItem(student))
              )}
            </List>
          </Collapse>
        </Paper>
      )}

      {/* Loading and Error States */}
      {isLoading && <Alert severity='info'>Loading attendee data...</Alert>}
    </Box>
  )
}

export default AttendeeManager
