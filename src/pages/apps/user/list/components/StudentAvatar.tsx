// ** Custom Components
import EmentorAvatar from 'src/@core/components/ementor-avatar'

// ** Local Types
import { StudentAvatarProps } from '../types'

// ** Constants
import { AVATAR_SETTINGS } from '../constants'

const StudentAvatar: React.FC<StudentAvatarProps> = ({ student, onClick }) => {
  // Use id field which contains the actual student user ID
  const userId = student.id || student.studentUserId

  return (
    <EmentorAvatar
      userId={userId}
      user={student}
      name={student.studentName || student.fullName}
      sx={{
        mr: AVATAR_SETTINGS.MARGIN_RIGHT,
        width: AVATAR_SETTINGS.SIZE,
        height: AVATAR_SETTINGS.SIZE,
        fontWeight: AVATAR_SETTINGS.FONT_WEIGHT,
        fontSize: (theme: any) => theme.typography.body1.fontSize,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={() => onClick && userId && onClick(userId)}
    />
  )
}

export default StudentAvatar
