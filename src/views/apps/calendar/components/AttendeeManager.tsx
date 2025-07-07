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
  Alert
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import {
  AttendeeWithPhoto,
  AttendeeWithPricing,
  StudentData,
  getAttendeesFromStudentIds,
  mergeAttendeesWithPricing,
  getAttendeeDisplayName,
  getAttendeeInitials,
  getAttendeeAvatar,
  getAttendeeId,
  filterAttendeesBySearch,
  sortAttendeesByName,
  filterAvailableStudents,
  calculateAttendeeStats,
  validateAttendeePricing,
  attendeesToStudentIds,
  createAttendeePricesMap
} from '../utils/attendeeUtils'
import { formatPrice } from '../utils/pricingUtils'

interface AttendeeManagerProps {
  // Student data
  students: StudentData[]

  // Current attendees (as student IDs)
  selectedAttendeeIds: string[]
  onAttendeeIdsChange: (attendeeIds: string[]) => void

  // Pricing
  attendeePrices: { [key: string]: number }
  onAttendeePricesChange: (prices: { [key: string]: number }) => void
  defaultPrice: number

  // Display options
  showPricing?: boolean
  showStatistics?: boolean
  maxHeight?: number

  // States
  isReadOnly?: boolean
  isLoading?: boolean
}

const AttendeeManager: React.FC<AttendeeManagerProps> = ({
  students,
  selectedAttendeeIds,
  onAttendeeIdsChange,
  attendeePrices,
  onAttendeePricesChange,
  defaultPrice,
  showPricing = true,
  showStatistics = true,
  maxHeight = 400,
  isReadOnly = false,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAvailableStudents, setShowAvailableStudents] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    currentAttendees: true,
    availableStudents: false,
    statistics: false
  })

  // Get current attendees with photos and pricing
  const currentAttendees = useMemo(() => {
    const attendeesWithPhotos = getAttendeesFromStudentIds(selectedAttendeeIds, students)
    return mergeAttendeesWithPricing(attendeesWithPhotos, attendeePrices, defaultPrice)
  }, [selectedAttendeeIds, students, attendeePrices, defaultPrice])

  // Get available students for selection
  const availableStudents = useMemo(() => {
    const filtered = filterAvailableStudents(students, selectedAttendeeIds)
    return searchTerm
      ? filtered.filter(student => {
          const name = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim()
          const email = student.email || ''
          const term = searchTerm.toLowerCase()
          return name.toLowerCase().includes(term) || email.toLowerCase().includes(term)
        })
      : filtered
  }, [students, selectedAttendeeIds, searchTerm])

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateAttendeeStats(currentAttendees)
  }, [currentAttendees])

  // Validate pricing
  const pricingValidation = useMemo(() => {
    return validateAttendeePricing(currentAttendees)
  }, [currentAttendees])

  const handleAddAttendee = (studentId: string) => {
    if (!selectedAttendeeIds.includes(studentId)) {
      onAttendeeIdsChange([...selectedAttendeeIds, studentId])
    }
  }

  const handleRemoveAttendee = (studentId: string) => {
    onAttendeeIdsChange(selectedAttendeeIds.filter(id => id !== studentId))

    // Remove custom price if exists
    if (attendeePrices[studentId] !== undefined) {
      const newPrices = { ...attendeePrices }
      delete newPrices[studentId]
      onAttendeePricesChange(newPrices)
    }
  }

  const handlePriceChange = (studentId: string, price: number) => {
    onAttendeePricesChange({
      ...attendeePrices,
      [studentId]: price
    })
  }

  const handleRemoveCustomPrice = (studentId: string) => {
    const newPrices = { ...attendeePrices }
    delete newPrices[studentId]
    onAttendeePricesChange(newPrices)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderAttendeeItem = (attendee: AttendeeWithPricing, index: number) => {
    const attendeeId = getAttendeeId(attendee)
    const displayName = getAttendeeDisplayName(attendee)
    const avatar = getAttendeeAvatar(attendee)
    const initials = getAttendeeInitials(attendee)

    return (
      <ListItem key={attendeeId || index} divider>
        <ListItemAvatar>
          <Avatar src={avatar || undefined} sx={{ width: 40, height: 40 }}>
            {avatar ? null : initials}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={displayName}
          secondary={
            <Box>
              <Typography variant='body2' color='text.secondary'>
                {attendee.email || attendee.studentData?.email || 'No email'}
              </Typography>
              {showPricing && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Price: {formatPrice(attendee.price || 0)}
                  </Typography>
                  {attendee.hasCustomPrice && <Chip label='Custom' size='small' color='primary' variant='outlined' />}
                </Box>
              )}
            </Box>
          }
        />
        {!isReadOnly && (
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {showPricing && (
                <TextField
                  size='small'
                  type='number'
                  value={attendee.individualPrice || ''}
                  onChange={e => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value) && value >= 0) {
                      handlePriceChange(attendeeId, value)
                    } else if (e.target.value === '') {
                      handleRemoveCustomPrice(attendeeId)
                    }
                  }}
                  placeholder={defaultPrice.toString()}
                  sx={{ width: 100 }}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>RON</InputAdornment>
                  }}
                />
              )}
              <IconButton edge='end' onClick={() => handleRemoveAttendee(attendeeId)} color='error' size='small'>
                <RemoveIcon />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    )
  }

  const renderStudentItem = (student: StudentData, index: number) => {
    const studentId = student.id || student.userId || index.toString()
    const displayName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim()
    const initials =
      student.firstName && student.lastName
        ? `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
        : displayName.charAt(0).toUpperCase()

    return (
      <ListItem key={studentId} divider>
        <ListItemAvatar>
          <Avatar src={student.avatar || undefined} sx={{ width: 32, height: 32 }}>
            {student.avatar ? null : initials}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={displayName} secondary={student.email || 'No email'} />
        <ListItemSecondaryAction>
          <IconButton edge='end' onClick={() => handleAddAttendee(studentId)} color='primary' size='small'>
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
        <Paper sx={{ p: 2 }}>
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
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label={`${stats.totalAttendees} Total`} color='default' icon={<PersonIcon />} />
              <Chip label={`${stats.attendeesWithCustomPrice} Custom Price`} color='primary' variant='outlined' />
              <Chip label={`${stats.attendeesWithDefaultPrice} Default Price`} color='secondary' variant='outlined' />
              <Chip label={`Total: ${formatPrice(stats.totalRevenue)}`} color='success' variant='outlined' />
            </Box>

            {!pricingValidation.isValid && (
              <Alert severity='warning' sx={{ mt: 2 }}>
                <Typography variant='body2'>Pricing Issues:</Typography>
                <ul>
                  {pricingValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Collapse>
        </Paper>
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
          <Typography variant='h6'>Current Attendees ({currentAttendees.length})</Typography>
          {expandedSections.currentAttendees ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>

        <Collapse in={expandedSections.currentAttendees}>
          <Divider />
          <List sx={{ maxHeight: maxHeight / 2, overflowY: 'auto' }}>
            {currentAttendees.length === 0 ? (
              <ListItem>
                <ListItemText primary='No attendees selected' secondary='Add students from the available list below' />
              </ListItem>
            ) : (
              currentAttendees.map(renderAttendeeItem)
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
              justifyContent: 'space-between'
            }}
          >
            <Typography variant='h6'>Available Students ({availableStudents.length})</Typography>
            <Button
              variant='text'
              onClick={() => setShowAvailableStudents(!showAvailableStudents)}
              startIcon={showAvailableStudents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showAvailableStudents ? 'Hide' : 'Show'}
            </Button>
          </Box>

          <Collapse in={showAvailableStudents}>
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
              {availableStudents.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary='No students available'
                    secondary={searchTerm ? 'No students match your search' : 'All students are already attendees'}
                  />
                </ListItem>
              ) : (
                availableStudents.map(renderStudentItem)
              )}
            </List>
          </Collapse>
        </Paper>
      )}
    </Box>
  )
}

export default AttendeeManager
