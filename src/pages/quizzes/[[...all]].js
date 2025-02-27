// ** React Imports
import { Card } from '@mui/material'
import { useState, useEffect } from 'react'
import StudentsTestsTable from 'src/pages/quizzes/componets/table'
import QuizPreview from './componets/quiz-preview'
import { useRouter } from 'next/router'

const QuizzesPage = () => {
  const router = useRouter()

  const [preview, setPreview] = useState(
    window.location.pathname.split('/')[2] &&
      window.location.pathname.split('/')[2].length === 36
      ? { id: window.location.pathname.split('/')[2] } : null)

  useEffect(() => {
    if (router && router.query && router.query.all) {
      if (router.query.all.length > 0 && router.query.all[0].length === 36) {
        setPreview({ id: router.query.all[0] })
      } else if (router.query.all.length === 0) {
        setPreview(null)
      }
    }
  }, [router.query])

  return (
    <>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} userRole={'STUDENT'} />
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
