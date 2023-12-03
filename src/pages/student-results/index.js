// ** React Imports
import { Card, CardHeader } from '@mui/material'
import { useState } from 'react'
import StudentsTestsTable from 'src/pages/quizzes/componets/table'
import QuizPreview from './componets/quiz-preview'
import StudentsResultsTable from './componets/table'

const AttemptsPage = () => {
  const [preview, setPreview] = useState()

  return (
    <>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} />
        ) : (
          <StudentsResultsTable preview={preview} setPreview={setPreview} />
        )}
      </Card>
    </>
  )
}

//TODO: implement MUI DataGrid Quick Filter from vuexy datagrid

AttemptsPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default AttemptsPage
