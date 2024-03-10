// ** React Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Typography
} from '@mui/material'

import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

const Lesson = props => {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const { asPath } = useRouter()

  useEffect(() => {
    const lessonId = asPath.split('/')[2]
    apiClient
      .get(apiSpec.LESSON_SERVICE + `/lesson/${lessonId}`)
      .then(response => {
        setLesson(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  return (
    <Box
      sx={{
        '@media print': {
          display: 'none'
        }
      }}
    >
      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <>
          <Card>
            <CardContent>
              <Box>
                <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                  {lesson.title}
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    lineHeight: 1,
                    fontSize: '1rem !important',
                    padding: '1em',
                    paddingLeft: '0.4em',
                    color: 'text.secondary',
                    maxWidth: '20rem',
                    wordBreak: 'break-word'
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: lesson.description }}></div>
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    lineHeight: 1,
                    fontSize: '1rem !important',
                    padding: '1em',
                    paddingLeft: '0.4em',
                    color: 'text.secondary',
                    maxWidth: '20rem',
                    wordBreak: 'break-word'
                  }}
                ></Typography>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

Lesson.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default Lesson
