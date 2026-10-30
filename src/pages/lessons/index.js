// ** MUI Imports
import Card from '@mui/material/Card'

// ** Custom Components Imports
import StudentLessons from './componets/table'

const LessonPage = () => {
  return (
    <Card>
      <StudentLessons />
    </Card>
  )
}

LessonPage.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default LessonPage
