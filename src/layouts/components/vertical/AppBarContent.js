// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import Autocomplete from 'src/layouts/components/Autocomplete'
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

// import ShortcutsDropdown from 'src/@core/layouts/components/shared-components/ShortcutsDropdown'
// import LanguageDropdown from 'src/@core/layouts/components/shared-components/LanguageDropdown'
// import UserLanguageDropdown from '../UserLanguageDropdown'

// ** Hook Import
import { useAuth } from 'src/hooks/useAuth'
import { useAppBar } from 'src/context/AppBarContext'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const shortcuts = [
  {
    title: 'Calendar',
    url: '/apps/calendar',
    icon: 'tabler:calendar',
    subtitle: 'Appointments'
  },
  {
    title: 'Invoice App',
    url: '/apps/invoice/list',
    icon: 'tabler:file-invoice',
    subtitle: 'Manage Accounts'
  },
  {
    title: 'User App',
    icon: 'tabler:users',
    url: '/apps/user/list',
    subtitle: 'Manage Users'
  },
  {
    url: '/apps/roles',
    icon: 'tabler:lock',
    subtitle: 'Permissions',
    title: 'Role Management'
  },
  {
    subtitle: 'CRM',
    title: 'Dashboard',
    url: '/dashboards/crm',
    icon: 'tabler:device-analytics'
  },
  {
    title: 'Settings',
    icon: 'tabler:settings',
    subtitle: 'Account Settings',
    url: '/pages/account-settings/account'
  },
  {
    icon: 'tabler:help',
    title: 'Help Center',
    url: '/pages/help-center',
    subtitle: 'FAQs & Articles'
  },
  {
    title: 'Dialogs',
    icon: 'tabler:square',
    subtitle: 'Useful Popups',
    url: '/pages/dialog-examples'
  }
]

const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const auth = useAuth()
  const dispatch = useDispatch()
  const { components, removeComponent } = useAppBar();

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon fontSize='1.5rem' icon='tabler:menu-2' />
          </IconButton>
        ) : null}
        {auth.user && <Autocomplete hidden={hidden} settings={settings} />}
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        {/* Render dynamically added components */}
        {components.map((Component, index) => (
          <Slide key={index} direction="down" in={true} mountOnEnter unmountOnExit>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Component />
              <IconButton onClick={() => removeComponent(index)}>
                <Icon fontSize='1.5rem' icon='tabler:x' />
              </IconButton>
            </Box>
          </Slide>
        ))}
        {components.length == 0 ? (
          <Slide direction="down" in={true} mountOnEnter unmountOnExit>
            <Box >
              <ModeToggler settings={settings} saveSettings={saveSettings} />
              <NotificationDropdown settings={settings} auth={auth} />
            </Box>
          </Slide>) : null}
        {auth.user && (
          <>
            <UserDropdown settings={settings} />
          </>
        )}
      </Box>
    </Box>
  )
}

export default AppBarContent
