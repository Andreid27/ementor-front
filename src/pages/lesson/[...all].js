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
  Tab,
  Typography
} from '@mui/material'

import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import toast from 'react-hot-toast'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import LinearProgressWithLabel from './components/LiniarProgessWithLabel'
import FileTab from './components/FileTab'

const Lesson = props => {
  const [lesson, setLesson] = useState(null)
  const [selectedTab, setSelectedTab] = useState('0')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lessonId = window.location.pathname.split('/')[2]
    apiClient
      .get(apiSpec.LESSON_SERVICE + `/lesson/${lessonId}`)
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
            return <Tab key={index} value={file.fileId} label={file.fileName} />
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
  subject: 'professor-pages'
}

export default Lesson
