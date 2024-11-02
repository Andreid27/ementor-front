// ** React Imports
import { Card, CardHeader } from '@mui/material'
import { useState } from 'react'
import StudentsTestsTable from 'src/pages/quizzes/componets/table'
import QuizPreview from './componets/quiz-preview'

const QuizzesPage = () => {
  const [preview, setPreview] = useState()


  return (
    <>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} />
        ) : (
          <StudentsTestsTable preview={preview} setPreview={setPreview} />
        )}
      </Card>
    </>
  )
}

QuizzesPage.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizzesPage
