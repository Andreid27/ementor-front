// ** React Imports
import { Button, Card, CardHeader } from '@mui/material'
import { useEffect, useState } from 'react'
import TestsTable from 'src/pages/all-quizzes/componets/table'
import QuizPreview from '../quizzes/componets/quiz-preview'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { fetchData } from 'src/store/apps/user'

const QuizzesPage = () => {
  const router = useRouter()

  const [preview, setPreview] = useState(
    window.location.pathname.split('/')[2] && window.location.pathname.split('/')[2].length === 36
      ? { id: window.location.pathname.split('/')[2] }
      : null
  )

  const [users, setUsers] = useState([])
  const dispatch = useDispatch()
  const store = useSelector(state => state.user)

  const createTest = () => {
    router.push('/edit-quiz/new')
  }

  useEffect(() => {
    if (router && router.query && router.query.all) {
      if (router.query.all.length > 0 && router.query.all[0].length === 36) {
        setPreview({ id: router.query.all[0] })
      } else if (router.query.all.length === 0) {
        setPreview(null)
      }
    }
  }, [router.query])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // For quiz preview, we need all active students
        // Use the existing fetchData action to get all active students
        await dispatch(fetchData()).unwrap()
      } catch (error) {
        console.log(error)
        toast.error('Nu s-au putut prelua utilizatorii')
      }
    }

    fetchUsers()
  }, [dispatch])

  // Update users when activeStudents changes
  useEffect(() => {
    setUsers(store.activeStudents || [])
  }, [store.activeStudents])

  return (
    <>
      <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large' onClick={createTest}>
        Creează un test nou
      </Button>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} users={users} userRole={'PROFESSOR'} />
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
