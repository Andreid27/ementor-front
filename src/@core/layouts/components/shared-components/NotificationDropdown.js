// ** React Imports
import { useState, Fragment, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Util Import
import { getInitials } from 'src/@core/utils/get-initials'
import { useDispatch, useSelector } from 'react-redux'
import { selectNotifications, updateNotification } from 'src/store/apps/notifications'
import timeAgo from 'src/@core/utils/time-ago'
import { selectAllStudents } from 'src/store/apps/user'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'
import TimelineDot from 'src/@core/components/mui/timeline-dot'
import notificationMapping from 'src/@core/layouts/components/shared-components/notificationMapping'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import UseBgColor from 'src/@core/hooks/useBgColor'
import { useWebSocket } from 'src/context/WebSocketContext'

// ** Styled Menu component
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 380,
    overflow: 'hidden',
    marginTop: theme.spacing(4.25),
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0,
    '& .MuiMenuItem-root': {
      margin: 0,
      borderRadius: 0,
      padding: theme.spacing(4, 6),
      '&:hover': {
        backgroundColor: theme.palette.action.hover
      }
    }
  }
}))

// ** Styled MenuItem component
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}))

// ** Styled PerfectScrollbar component
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 349
})

// ** Styled Avatar component
const Avatar = styled(CustomAvatar)({
  width: 38,
  height: 38,
  fontSize: '1.125rem'
})

// ** Styled component for the title in MenuItems
const MenuItemTitle = styled(Typography)({
  fontWeight: 500,
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

// ** Styled component for the subtitle in MenuItems
const MenuItemSubtitle = styled(Typography)({
  flex: '1 1 100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
})

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <Box sx={{ maxHeight: 349, overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
  } else {
    return <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>{children}</PerfectScrollbar>
  }
}

const NotificationDropdown = props => {
  // ** Props
  const { settings } = props
  const dispatch = useDispatch()
  const router = useRouter()
  const userRole = useAuth()?.user?.role
  const { WebSocketService, isConnected } = useWebSocket()
  const bgColors = UseBgColor()

  // ** Select notifications from the Redux store
  const notificationsStoreContent = useSelector(selectNotifications)
  const [notificationsData, setNotificationsData] = useState(notificationsStoreContent.notifications)
  const [newNotifications, setNewNotifications] = useState(notificationsData.filter(notification => notification.readDate === null))
  const users = useSelector(selectAllStudents)


  // ** States
  const [anchorEl, setAnchorEl] = useState(null)

  // ** Hook
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))

  // ** Vars
  const { direction } = settings

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const fetchAvatars = async () => {
      const updatedNotifications = await Promise.all(notificationsStoreContent.notifications.map(async (notification) => {

        if (notification && notification.content && notification.content.avatarType === 'USER' && users && users.length > 0) {
          const user = users.find(user => user.id === notification.createdBy)
          if (user) {
            const profilePicture = extractProfilePicture(user)
            if (profilePicture.type === 'API') {
              // Use PhotoCacheService for unified caching (prevents duplicate fetches)
              const avatar = await photoCacheService.getPhoto('API', profilePicture.url, profilePicture.userId)

              return { ...notification, avatarImg: avatar }
            } else if (profilePicture.type === 'EXTERNAL') {
              // Use PhotoCacheService for EXTERNAL photos to prevent 429 errors
              const avatar = await photoCacheService.getPhoto('EXTERNAL', profilePicture.url, profilePicture.userId)
              return { ...notification, avatarImg: avatar }
            }
          }
        }

        return notification
      }))
      setNotificationsData(updatedNotifications)
      setNewNotifications(updatedNotifications.filter(notification => notification.readDate === null))
    }

    fetchAvatars()
  }, [notificationsStoreContent.notifications])

  const handleViewNotification = (notification) => () => {
    sendViewedNotification([notification.id]);

    const updatedNotifications = notificationsData.map((notificationItem) =>
      notificationItem.id === notification.id ? { ...notificationItem, readDate: new Date().toISOString() } : notificationItem
    );
    setNotificationsData(updatedNotifications);

    const updatedNotification = updatedNotifications.find(item => item.id === notification.id);
    dispatch(updateNotification(updatedNotification));

    redirectToNotification(notification);
    handleDropdownClose();
  }

  const sendViewedNotification = (notificationIdsList) => {
    const instance = WebSocketService.getInstance();

    // ** Handle view notification
    if (instance.stompClient && isConnected) {
      instance.stompClient.send(
        "/app/event", // Your endpoint for sending messages
        {},
        JSON.stringify({ notificationIds: notificationIdsList, action: "READ" })
      );
    } else {
      console.log("WebSocket is not connected or stompClient is undefined.");
    }
  }

  const readAllNotifications = () => {
    const unreadNotifications = notificationsData.filter(notification => notification.readDate === null);
    const notificationIdsList = unreadNotifications.map(notification => notification.id);

    const updatedNotifications = notificationsData.map(notification =>
      notification.readDate === null ? { ...notification, readDate: new Date().toISOString() } : notification
    );
    setNotificationsData(updatedNotifications);
    sendViewedNotification(notificationIdsList);
    notificationIdsList.forEach(id => {
      const notification = updatedNotifications.find(item => item.id === id);
      if (notification) {
        dispatch(updateNotification(notification));
      }
    });
    handleDropdownClose();
  }

  const redirectToNotification = (notification) => {
    const subject = notification.subjectKey;
    const mapping = notificationMapping[subject] ? notificationMapping[subject][userRole] : null;
    if (mapping === undefined || mapping === null) {
      console.log('No URL mapping found for this notification.');

      return;
    } else if (mapping === 'NO_REDIRECT') {
      return;
    }
    const url = userRole === 'STUDENT' ? `${mapping}/${notification.subjectValue}` : `${mapping}/${notification?.content?.isAboutId}`;;

    console.log(url)
    if (url) {
      router.replace(url);
    } else {
      console.log('No URL mapping found for this notification.');
    }
  }

  const getIcon = notification => {
    if (notification && notification.content && notification.content.avatarType) {
      if (notification.content.avatarType === 'USER') {
        return <CustomAvatar src={notification.avatarImg} sx={{ mr: 2, width: '2rem', height: '2rem' }} />
      } else {
        const subject = notification.subjectKey;

        return <Icon icon={notificationMapping[subject] && notificationMapping[subject]['ICON'] ?
          notificationMapping[subject]['ICON'] : 'tabler:brand-feedly'} fontSize='2rem' color={bgColors.primaryFilled.backgroundColor} />
      }
    }
  }

  return (
    <Fragment>
      <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='customized-menu'>
        <Badge
          color='error'
          variant='dot'
          invisible={newNotifications.length > 0 ? false : true}
          sx={{
            '& .MuiBadge-badge': { top: 2, right: 2, boxShadow: theme => `0 0 0 1px ${theme.palette.background.paper}` }
          }}
        >
          <Icon fontSize='1.25rem' icon='tabler:bell' />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: direction === 'ltr' ? 'right' : 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: direction === 'ltr' ? 'right' : 'left' }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ cursor: 'default', userSelect: 'auto', backgroundColor: 'transparent !important' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant='h6' sx={{ cursor: 'text' }}>
              Notificări
            </Typography>
            <CustomChip skin='light' size='small' color='primary' label={`${newNotifications.length} ${newNotifications.length === 1 ? 'nouă' : 'noi'}`} />
          </Box>
        </MenuItem>
        <ScrollWrapper hidden={hidden}>
          {notificationsData.length ? (
            notificationsData.map((notification, index) => (
              <MenuItem key={index} disableRipple disableTouchRipple onClick={handleViewNotification(notification)}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                  {getIcon(notification)}
                  <Box sx={{ mr: 3, ml: 2, flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                    <MenuItemTitle sx={{ whiteSpace: 'normal', fontSize: '0.675rem' }}>{notification.content.title}</MenuItemTitle>
                    <MenuItemSubtitle variant='body2' sx={{ whiteSpace: 'normal', fontSize: '0.7rem' }}>{notification.content.message}</MenuItemSubtitle>
                    <Typography variant='body2' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                      {timeAgo(notification.creation)}
                    </Typography>
                  </Box>
                  {notification.readDate === null ? (
                    <TimelineDot size='small' color={"success"} sx={{ mt: 1.5 }} />
                  ) : (
                    <Box sx={{ width: '8px', height: '8px', mt: 1.5 }} />
                  )}
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disableRipple disableTouchRipple>
              <Typography variant='body2' sx={{ color: 'text.disabled', textAlign: 'center', width: '100%', fontSize: '0.875rem' }}>
                Nu există notificări
              </Typography>
            </MenuItem>
          )}
        </ScrollWrapper>
        {notificationsData.length !== 0 && (
          <MenuItem
            disableRipple
            disableTouchRipple
            sx={{
              borderBottom: 0,
              cursor: 'default',
              userSelect: 'auto',
              backgroundColor: 'transparent !important',
              borderTop: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Button fullWidth variant='contained' onClick={readAllNotifications} size='small'>
              Citește toate notificările
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Fragment>
  )
}

export default NotificationDropdown
