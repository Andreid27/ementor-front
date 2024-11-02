// ** React Imports
import { Button, Card, CardHeader } from '@mui/material'
import { useEffect, useState } from 'react'
import TestsTable from 'src/pages/all-quizzes/componets/table'
import QuizPreview from './componets/quiz-preview'
import { margin } from '@mui/system'
import { useRouter } from 'next/router'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { updateAllStudents } from 'src/store/apps/user'

const QuizzesPage = () => {
  const [preview, setPreview] = useState()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const dispatch = useDispatch()

  const createTest = () => {
    router.push('/edit-quiz/new')
  }

  useEffect(() => {
    try {
      apiClient.get("service3/users/role/STUDENT")
        .then(response => {
          setUsers(response.data)
          dispatch(updateAllStudents(response.data))
        })
        .catch(error => {
          console.log(error)
          toast.error('Nu s-au putut prelua utilizatorii')
        })
    } catch (error) {
      console.error(error)
    }
  }, [])

  return (
    <>
      <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large' onClick={createTest}>
        Creează un test nou
      </Button>
      <Card>
        {preview ? (
          <QuizPreview preview={preview} setPreview={setPreview} users={users} />
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
