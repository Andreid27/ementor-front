// ** React Imports
import { Button, Card, CardHeader } from '@mui/material'
import { useState } from 'react'
import TestsTable from 'src/pages/all-quizzes/componets/table'
import QuizPreview from './componets/quiz-preview'
import { margin } from '@mui/system'
import { useRouter } from 'next/router'

const QuizzesPage = () => {
  const [preview, setPreview] = useState()
  const router = useRouter()

  const createTest = () => {
    router.push('/edit-quiz/new')
  }

  return (
    <>
      <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large' onClick={createTest}>
        Creează un test nou
      </Button>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} />
        ) : (
          <TestsTable preview={preview} setPreview={setPreview} />
        )}
      </Card>
    </>
  )
}

QuizzesPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizzesPage
