import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Group as GroupIcon, AttachMoney as MoneyIcon, Settings as SettingsIcon } from '@mui/icons-material'
import AttendeeManager from './AttendeeManager'
import AttendeePricingManager from './AttendeePricingManager'
import useAttendeeManagement from '../hooks/useAttendeeManagement'
import { formatPrice } from '../utils/pricingUtils'

interface EventAttendeeManagementProps {
  // Event data
  eventId?: string
  seriesId?: string
  occurrenceId?: string
  eventType: 'singular' | 'recurring' | 'occurrence'

  // Current event data
  initialAttendeeIds?: string[]
  initialAttendeePrices?: { [key: string]: number }
  defaultPrice?: number

  // Student data
  students: any[]

  // Form integration
  onAttendeeIdsChange?: (ids: string[]) => void
  onAttendeePricesChange?: (prices: { [key: string]: number }) => void

  // State
  isReadOnly?: boolean
  isNewEvent?: boolean
}

const EventAttendeeManagement: React.FC<EventAttendeeManagementProps> = ({
  eventId,
  seriesId,
  occurrenceId,
  eventType,
  initialAttendeeIds = [],
  initialAttendeePrices = {},
  defaultPrice = 0,
  students,
  onAttendeeIdsChange,
  onAttendeePricesChange,
  isReadOnly = false,
  isNewEvent = false
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [showPricingHelp, setShowPricingHelp] = useState(false)

  // Use the attendee management hook
  const {
    attendees,
    attendeeIds,
    attendeePrices,
    isLoading,
    error,
    setAttendeeIds,
    setAttendeePrices,
    addAttendee,
    removeAttendee,
    setAttendeePrice,
    removeAttendeePrice,
    refreshAttendees,
    totalAttendees,
    totalRevenue,
    averagePrice,
    attendeesWithCustomPrice,
    saveAttendeePricesForSeries,
    saveAttendeePricesForSingularEvent,
    saveAttendeePricesForOccurrence
  } = useAttendeeManagement({
    eventId,
    seriesId,
    occurrenceId,
    students,
    initialAttendeeIds,
    initialAttendeePrices,
    defaultPrice,
    autoFetchAttendees: !isNewEvent
  })

  // Sync changes with parent component
  React.useEffect(() => {
    onAttendeeIdsChange?.(attendeeIds)
  }, [attendeeIds, onAttendeeIdsChange])

  React.useEffect(() => {
    onAttendeePricesChange?.(attendeePrices)
  }, [attendeePrices, onAttendeePricesChange])

  // Auto-save attendee prices for existing events
  React.useEffect(() => {
    if (!isNewEvent && !isReadOnly && attendeePrices && Object.keys(attendeePrices).length > 0) {
      const autoSavePrices = async () => {
        try {
          if (seriesId) {
            await saveAttendeePricesForSeries(seriesId, attendeePrices)
          } else if (occurrenceId) {
            await saveAttendeePricesForOccurrence(occurrenceId, attendeePrices)
          } else if (eventId) {
            await saveAttendeePricesForSingularEvent(eventId, attendeePrices)
          }
        } catch (error) {
          console.error('Failed to auto-save attendee prices:', error)
        }
      }

      // Debounce the auto-save to avoid too many API calls
      const timeoutId = setTimeout(autoSavePrices, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [
    attendeePrices,
    isNewEvent,
    isReadOnly,
    eventId,
    seriesId,
    occurrenceId,
    saveAttendeePricesForSeries,
    saveAttendeePricesForSingularEvent,
    saveAttendeePricesForOccurrence
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        <Typography variant='body2'>Error loading attendees: {error}</Typography>
        <Button size='small' onClick={refreshAttendees} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon />
              Event Attendees
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {totalAttendees} attendees • {formatPrice(totalRevenue)} total revenue
            </Typography>
          </Box>

          <Button variant='outlined' size='small' startIcon={<SettingsIcon />} onClick={() => setShowPricingHelp(true)}>
            Help
          </Button>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant='fullWidth' indicatorColor='primary'>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                Manage Attendees ({totalAttendees})
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Pricing ({attendeesWithCustomPrice} custom)
              </Box>
            }
            disabled={totalAttendees === 0}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <AttendeeManager
            students={students}
            selectedAttendeeIds={attendeeIds}
            onAttendeeIdsChange={setAttendeeIds}
            attendeePrices={attendeePrices}
            onAttendeePricesChange={setAttendeePrices}
            defaultPrice={defaultPrice}
            showPricing={true}
            showStatistics={true}
            isReadOnly={isReadOnly}
            isLoading={isLoading}
          />
        )}

        {activeTab === 1 && !isNewEvent && (
          <AttendeePricingManager
            eventId={eventId}
            seriesId={seriesId}
            occurrenceId={occurrenceId}
            eventType={eventType}
            attendeeIds={attendeeIds}
            students={students}
            attendeePrices={attendeePrices}
            defaultPrice={defaultPrice}
            isReadOnly={isReadOnly}
            onPricingUpdated={refreshAttendees}
          />
        )}

        {activeTab === 1 && isNewEvent && (
          <Alert severity='info' sx={{ m: 2 }}>
            <Typography variant='body2'>
              Individual pricing will be available after creating the event. You can set a default price and add
              attendees now.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Help Dialog */}
      <Dialog open={showPricingHelp} onClose={() => setShowPricingHelp(false)} maxWidth='md' fullWidth>
        <DialogTitle>Attendee Pricing Help</DialogTitle>
        <DialogContent>
          <Typography variant='h6' gutterBottom>
            How Attendee Pricing Works
          </Typography>

          <Typography variant='body2' paragraph>
            <strong>Default Price:</strong> Set a base price that applies to all attendees by default.
          </Typography>

          <Typography variant='body2' paragraph>
            <strong>Custom Pricing:</strong> Override the default price for specific attendees. This is useful for
            different student types, discounts, or special arrangements.
          </Typography>

          <Typography variant='body2' paragraph>
            <strong>Event Types:</strong>
          </Typography>
          <ul>
            <li>
              <strong>Singular Events:</strong> One-time events with individual pricing
            </li>
            <li>
              <strong>Recurring Series:</strong> Series-wide pricing that applies to all occurrences
            </li>
            <li>
              <strong>Event Occurrences:</strong> Override pricing for specific occurrences in a series
            </li>
          </ul>

          <Typography variant='body2' paragraph>
            <strong>Price Management:</strong>
          </Typography>
          <ul>
            <li>Prices are saved immediately when you confirm changes</li>
            <li>Custom prices override default prices</li>
            <li>You can remove custom prices to fall back to default</li>
            <li>All prices are in RON (Romanian Leu)</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPricingHelp(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EventAttendeeManagement
