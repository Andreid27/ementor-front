// ** MUI Imports
import Avatar from '@mui/material/Avatar'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'

// ** Local Types
import { StudentAvatarProps } from '../types'

// ** Constants
import { AVATAR_SETTINGS } from '../constants'

const StudentAvatar: React.FC<StudentAvatarProps> = ({ student, onClick }) => {
  // ** Handle avatar click
  const handleAvatarClick = () => {
    if (onClick) {
      // Use id field which contains the actual student user ID
      const userId = student.id || student.studentUserId
      if (userId) {
        onClick(userId)
      }
    }
  }

  // ** Render with photo if available (pre-loaded by processStudentPhotos)
  if (student.avatar) {
    return (
      <Avatar
        src={student.avatar}
        imgProps={{
          loading: 'lazy',
          referrerPolicy: 'no-referrer' // Prevent Google from tracking referrer for rate limiting
        }}
        sx={{
          mr: AVATAR_SETTINGS.MARGIN_RIGHT,
          width: AVATAR_SETTINGS.SIZE,
          height: AVATAR_SETTINGS.SIZE,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={handleAvatarClick}
      />
    )
  }

  // ** Render fallback with initials
  return (
    <CustomAvatar
      skin='light'
      color={student.avatarColor as any}
      sx={{
        mr: AVATAR_SETTINGS.MARGIN_RIGHT,
        width: AVATAR_SETTINGS.SIZE,
        height: AVATAR_SETTINGS.SIZE,
        fontWeight: AVATAR_SETTINGS.FONT_WEIGHT,
        fontSize: (theme: any) => theme.typography.body1.fontSize,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleAvatarClick}
    >
      {getInitials(student.studentName || student.fullName || 'Student')}
    </CustomAvatar>
  )
}

export default StudentAvatar
