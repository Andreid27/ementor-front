// ** React Imports
import { Box, Card, CardContent, LinearProgress, Tab, Typography } from '@mui/material'

import { useEffect, useRef, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import toast from 'react-hot-toast'
import { TabContext, TabList } from '@mui/lab'
import FileTab from './components/FileTab'

const Lesson = props => {
  const [lesson, setLesson] = useState(null)
  const [selectedTab, setSelectedTab] = useState('0')
  const [loading, setLoading] = useState(true)
  const startTime = useRef(Date.now()) // Store the start time

  useEffect(() => {
    const lessonId = window.location.pathname.split('/')[2]
    apiClient
      .get(apiSpec.LESSON_SERVICE + `/lesson/student-lesson/${lessonId}`)
      .then(response => {
        setLesson(response.data)
        if (response.data.files && response.data.files.length > 0) {
          setSelectedTab(response.data.files[0].fileId)
        }
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })

    // Function to calculate time spent and make API call
    const saveTimeSpent = () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000)
      console.log('Time spent:', timeSpent)
      apiClient.get(`${apiSpec.LESSON_SERVICE}/lesson/student-lesson-time/${lessonId}?timeToAdd=${timeSpent}`)
    }

    // Event listener for window/tab close event
    window.addEventListener('beforeunload', saveTimeSpent)

    return () => {
      saveTimeSpent() // Save time spent when component unmounts
      window.removeEventListener('beforeunload', saveTimeSpent) // Remove event listener
    }
  }, [])

  const getFilesTab = () => {
    return (
      <TabContext value={selectedTab}>
        <TabList
          variant='scrollable'
          scrollButtons={true}
          onChange={(event, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}`, '& .MuiTab-root': { py: 3.5 } }}
        >
          {lesson.files.map((file, index) => {
            return (
              <Tab key={index} value={file.fileId} label={file.fileName.substring(0, file.fileName.lastIndexOf('.'))} />
            )
          })}
        </TabList>
        {lesson.files.map((file, index) => (
          <FileTab key={file.fileId} file={file} index={index} />
        ))}
      </TabContext>
    )
  }

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
                {lesson.files && lesson.files.length > 0 ? getFilesTab() : null}
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
  subject: 'student-pages'
}

export default Lesson
