import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Drawer from '@mui/material/Drawer'
import CircularProgress from '@mui/material/CircularProgress'

// ** Demo Components Imports
import UserViewLeft from './UserViewLeft'
import UserViewRight from './UserViewRight'

// ** API and Utility Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import { IconButton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const UserViewDrawer = ({ tab, userId, open, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [profilePictureUrl, setProfilePictureUrl] = useState(null)
  const [profileData, setProfileData] = useState({})
  const [quizzesData, setQuizzesData] = useState([])
  const [lessonStats, setLessonStats] = useState({})
  const [quizStats, setQuizStats] = useState({})

  const quizServiceRequestParams = {
    filters: [
      { "key": "startedAt", "operation": "GREATER", "value": "2000-01-01T00:00:00.00Z" },
      { "key": "studentId", "operation": "EQUAL", "value": userId }
    ],
    sorters: [{ "key": "startedAt", "direction": "DESC" }]
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
            finalUrl = await profilePictureDownloader(profilePicture.url, profilePicture.userId, true);
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

    if (userId) fetchData();
  }, [userId]);

  return (
    userId && open ? (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 375, sm: 500, md: 800 }, maxWidth: '100vw' } }} // Ensure drawer has max width of viewport
      >
        {loading ? (
          <CircularProgress sx={{ m: 'auto' }} />
        ) : (
          <>
            <Header>
              <Typography variant='h5'>Profilul studentului</Typography>
              <IconButton
                size='small'
                onClick={onClose}
                sx={{
                  p: '0.438rem',
                  pt: '0.375rem',
                  borderRadius: 1,
                  color: 'text.primary',
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
                  }
                }}
              >
                <Icon icon='tabler:x' fontSize='1.125rem' />
              </IconButton>
            </Header>
            <Grid container spacing={6} sx={{ p: 4, pr: 0, width: '100%' }}> {/* Ensure Grid takes full width */}
              <Grid item xs={12}>
                <UserViewLeft profileData={profileData} profilePictureUrl={profilePictureUrl} quizStats={quizStats} />
              </Grid>
              <Grid item xs={12}>
                <UserViewRight tab={tab} profileData={profileData} quizStats={quizStats} lessonStats={lessonStats} quizzesData={quizzesData} />
              </Grid>
            </Grid>
          </>
        )}
      </Drawer>

    ) : null
  );
};

UserViewDrawer.acl = {
  action: 'read',
  subject: 'professor-pages'
};

export default UserViewDrawer;
