// ** React Imports
import { Card, CardHeader } from '@mui/material'
import { useState } from 'react'
import StudentLessons from './componets/table'
import LessonCard from './componets/lesson-card'

const data = {
  value: 'starter',
  title: 'Starter',
  content: 'A simple start for everyone.'
}

const icon = { icon: 'tabler:rocket', iconProps: { fontSize: '1.75rem', style: { marginBottom: 8 } } }

const LessonPage = () => {
  return (
    <>
      <Card>
        <StudentLessons />
      </Card>
    </>
  )
}

LessonPage.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default LessonPage
