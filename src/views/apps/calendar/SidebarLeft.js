// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Icons Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Utils
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { EVENT_STATUSES } from './utils/eventStatus'

const LEGEND_ORDER = ['upcoming', 'completed', 'unconfirmed', 'cancelled']

// A miniature of how the calendar draws a session in each state
const StatusSample = ({ status }) => (
  <Box
    aria-hidden
    sx={theme => ({
      width: 28,
      height: 20,
      flexShrink: 0,
      display: 'flex',
      borderRadius: 1,
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.text.primary,
      border: `1px solid ${status.key === 'unconfirmed' ? theme.palette.primary.main : 'transparent'}`,
      backgroundColor: status.key === 'unconfirmed' ? 'transparent' : hexToRGBA(theme.palette.primary.main, 0.16)
    })}
  >
    {status.icon ? (
      <Icon icon={status.icon} fontSize={14} />
    ) : (
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
    )}
  </Box>
)

const SidebarLeft = props => {
  const {
    store,
    mdAbove,
    dispatch,
    calendarApi,
    calendarsColor,
    leftSidebarOpen,
    leftSidebarWidth,
    handleSelectEvent,
    handleAllCalendars,
    handleCalendarsUpdate,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle
  } = props
  const colorsArr = calendarsColor ? Object.entries(calendarsColor) : []

  // Filter keys are internal ("Personal", "Series-<id>"); people see the series title they gave it
  const seriesTitles = (store.events || []).reduce((titles, event) => {
    if (event.recurringSeriesId && !titles[`Series-${event.recurringSeriesId}`]) {
      titles[`Series-${event.recurringSeriesId}`] = event.seriesTitle || event.title
    }

    return titles
  }, {})

  const filterLabel = key => {
    if (key === 'Personal') return 'Evenimente individuale'

    return seriesTitles[key] || 'Serie fără titlu'
  }

  const renderFilters = colorsArr.length
    ? colorsArr.map(([key, value]) => {
        return (
          <FormControlLabel
            key={key}
            label={filterLabel(key)}
            sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary' } }}
            control={
              <Checkbox
                color={value}
                checked={store.selectedCalendars ? store.selectedCalendars.includes(key) : true}
                onChange={() => dispatch(handleCalendarsUpdate(key))}
              />
            }
          />
        )
      })
    : null

  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
    dispatch(handleSelectEvent(null))
  }
  if (renderFilters) {
    return (
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          disableAutoFocus: true,
          disableScrollLock: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 3,
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            borderRadius: 1,
            boxShadow: 'none',
            width: leftSidebarWidth,
            borderTopRightRadius: 0,
            alignItems: 'flex-start',
            borderBottomRightRadius: 0,
            zIndex: mdAbove ? 2 : 'drawer',
            position: mdAbove ? 'static' : 'absolute'
          },
          '& .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute'
          }
        }}
      >
        <Box sx={{ p: 6, width: '100%' }}>
          <Button fullWidth variant='contained' sx={{ '& svg': { mr: 2 } }} onClick={handleSidebarToggleSidebar}>
            <Icon icon='tabler:plus' fontSize='1.125rem' />
            Adaugă Eveniment
          </Button>
        </Box>

        <Divider sx={{ width: '100%', m: '0 !important' }} />
        <DatePickerWrapper
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            '& .react-datepicker': { boxShadow: 'none !important', border: 'none !important' }
          }}
        >
          <DatePicker inline onChange={date => calendarApi.gotoDate(date)} />
        </DatePickerWrapper>
        <Divider sx={{ width: '100%', m: '0 !important' }} />
        <Box component='section' aria-labelledby='calendar-status-legend' sx={{ p: 6, pb: 2, width: '100%' }}>
          <Typography
            id='calendar-status-legend'
            variant='body2'
            sx={{ mb: 3, color: 'text.secondary', textTransform: 'uppercase' }}
          >
            Stare
          </Typography>
          <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {LEGEND_ORDER.map(key => {
              const status = EVENT_STATUSES[key]

              return (
                <Box component='li' key={key} sx={{ mb: 3, gap: 3, display: 'flex', alignItems: 'flex-start' }}>
                  <StatusSample status={status} />
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {status.label}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {status.hint}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
        <Divider sx={{ width: '100%', m: '0 !important' }} />
        <Box sx={{ p: 6, width: '100%', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
          <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
            Filtre
          </Typography>
          <FormControlLabel
            label='Vezi Tot'
            sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary' } }}
            control={<Checkbox onChange={e => dispatch(handleAllCalendars(e.target.checked))} />}
          />
          {renderFilters}
        </Box>
      </Drawer>
    )
  } else {
    return null
  }
}

export default SidebarLeft
