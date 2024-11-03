// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import UserViewLeft from './UserViewLeft'
import UserViewRight from './UserViewRight'
import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import { CircularProgress } from '@mui/material'



const UserView = ({ tab, userId, invoiceData }) => {
  const [loading, setLoading] = useState(true)
  const [profilePictureUrl, setProfilePictureUrl] = useState(null)
  const [profileData, setProfileData] = useState({})
  const [quizzesData, setQuizzesData] = useState([])
  const [lessonStats, setLessonStats] = useState({})
  const [quizStats, setQuizStats] = useState({})

  const quizServiceRequestParams =
  {
    filters: [
      {
        "key": "startedAt",
        "operation": "GREATER",
        "value": "2000-01-01T00:00:00.00Z"
      },
      {
        "key": "studentId",
        "operation": "EQUAL",
        "value": userId
      }
    ],
    sorters: [
      {
        "key": "startedAt",
        "direction": "DESC"
      }
    ]
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileServiceResponse, quizzesResponse, quizStatsResponse, lessonStatsResponse] = await Promise.all([
          apiClient.get(apiSpec.PROFILE_CONTROLLER + '/get-full/' + userId),
          apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
            filters: quizServiceRequestParams.filters,
            sorters: quizServiceRequestParams.sorters,
            page: 0,
            pageSize: 1000
          }),
          apiClient.get(`${apiSpec.QUIZ_SERVICE}/dashboard-stats/${userId}`),
          apiClient.get(`${apiSpec.LESSON_CONTROLLER}/dashboard-stats/${userId}`)
        ]);

        if (profileServiceResponse.status === 200) {
          const profilePicture = extractProfilePicture(profileServiceResponse.data, true);
          let finalUrl;

          if (profilePicture.type === 'API') {
            finalUrl = await profilePictureDownloader(profilePicture.url, profilePicture.userId);
          } else if (profilePicture.type === 'EXTERNAL') {
            finalUrl = profilePicture.url;
          } else {
            finalUrl = null;
          }

          setProfilePictureUrl(finalUrl);
          setProfileData(profileServiceResponse.data);
          setQuizzesData(quizzesResponse.data.data);
          setQuizStats(quizStatsResponse.data);
          setLessonStats(lessonStatsResponse.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };


    fetchData()
  }, [userId])

  return (
    loading ? <CircularProgress /> :
      <Grid container spacing={6}>
        <Grid item xs={12} md={5} lg={4}>
          <UserViewLeft profileData={profileData} profilePictureUrl={profilePictureUrl} quizStats={quizStats} />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <UserViewRight tab={tab} profileData={profileData} quizStats={quizStats} lessonStats={lessonStats} quizzesData={quizzesData} />
        </Grid>
      </Grid>
  )
}

UserView.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default UserView
