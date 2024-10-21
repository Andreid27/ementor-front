// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import CardActivityTimeline from './components/Timeline'
import { useDispatch } from 'react-redux'
import { selectAllStudents, updateAllStudents } from 'src/store/apps/user'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'

const ACLPage = () => {
  const dispatch = useDispatch()
  const [users, setUsers] = useState(dispatch(selectAllStudents))
  const [loading, setLoading] = useState(true)
  const [quizzesData, setQuizzesData] = useState([])

  const quizServiceRequestParams =
  {
    filters: [
      {
        "key": "startedAt",
        "operation": "GREATER",
        "value": "2000-01-01T00:00:00.00Z"
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
        const [userServiceResponse, quizServiceResponse] = await Promise.all([
          apiClient.get("service3/users/role/STUDENT"),
          apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
            filters: quizServiceRequestParams.filters,
            sorters: quizServiceRequestParams.sorters,
            page: 0,
            pageSize: 10
          })
        ])
        dispatch(updateAllStudents(userServiceResponse.data))
        setUsers(userServiceResponse.data)
        const processedData = await processStudentQuizzesData(quizServiceResponse.data.data, userServiceResponse.data);
        setQuizzesData(processedData)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  const processStudentQuizzesData = async (data, users) => {
    const usersOnPage = data.map(row => row.studentId)
    let uniqueUsers = [...new Set(usersOnPage)];
    let processedUsersList = []
    for (const userId of uniqueUsers) {
      const user = users.find(user => user.id === userId)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    const result = await Promise.all(
      processedUsersList.map(async profilePicture => {
        if (profilePicture.type === 'API') {
          const avatar = await profilePictureDownloader(profilePicture.url, profilePicture.userId);

          return { ...profilePicture, avatar: avatar || null };
        }
        else if (profilePicture.type === 'EXTERNAL') {
          return { ...profilePicture, avatar: profilePicture.url };
        }
        else {
          return { ...profilePicture, avatar: null };
        }
      }));

    return data.map(row => {
      const user = result.find(user => user.userId === row.studentId)

      return { ...row, avatar: user.avatar }
    })
  }

  return (
    <Grid container spacing={6}>
      <Grid item md={6} xs={12}>
        <CardActivityTimeline quizzesData={quizzesData} users={users} loading={loading} />
      </Grid>
    </Grid>
  )
}
ACLPage.acl = {
  action: 'read',
  subject: 'acl-page'
}

export default ACLPage
