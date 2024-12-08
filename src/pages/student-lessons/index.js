// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'
import { makeStyles } from '@mui/styles'
import { TrashX } from 'tabler-icons-react'
import toast from 'react-hot-toast'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Data Import
import * as apiSpec from '../../apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import { Button, Checkbox, LinearProgress } from '@mui/material'
import AssignationModal from './componets/assignationModal'
import { useDispatch } from 'react-redux'
import { fetchData, updateAllStudents } from 'src/store/apps/user'
import Router from 'next/router'
import DeleteDialogTransition from './componets/DeleteDialogTransition'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import UserViewDrawer from '../student-profile/components/UserViewDrawer'

// ** renders client column
const renderClient = (params, user) => {
  const { row } = params
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']

  // Use the user ID as a seed to generate a consistent index
  const stateNum = parseInt(user.id, 16) % states.length
  const color = states[stateNum]

  if (row.avatar && row.avatar.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {
    return (
      <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}>
        {getInitials(user.lastName ? `${user.firstName} ${user.lastName} ` : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const getScoreType = totalTime => {
  if (!totalTime || totalTime === 0) {
    return {
      color: 'info',
      text: 'N/A'
    }
  }
  const score = (totalTime / 60).toFixed(1)
  if (totalTime <= 600) {
    return {
      color: 'error',
      text: `${score} min`
    }
  }
  if (totalTime <= 1500) {
    return {
      color: 'warning',
      text: `${score} min`
    }
  }

  return {
    color: 'success',
    text: `${score} min`
  }
}

const useStyles = makeStyles({
  button: {
    padding: '1%',
    width: '10px',
    minHeight: '40px'
  }
})

const StudentsLessonsTable = () => {
  // ** States
  const [users, setUsers] = useState([])
  const classes = useStyles()

  const columns = [
    {
      flex: 0.2,
      minWidth: 230,
      field: 'studentId',
      headerName: 'Student',
      renderCell: params => {
        const { row } = params
        const user = users.find(user => user.id === row.userId)

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              className={classes.button}
              sx={{ "&:hover": { backgroundColor: "transparent" } }}
              color='secondary'
              onClick={event => handleOpenDialog(params.row, event, 'PROFILE')}
            >
              {renderClient(params, user)}
            </Button>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography noWrap variant='caption'>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 120,
      headerName: 'Lecție',
      field: 'title',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.title}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 90,
      field: 'chapterTitles',
      headerName: 'Capitol test',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.chapterTitles}
        </Typography>
      )
    },

    {
      flex: 0.14,
      minWidth: 100,
      headerName: 'începe/Citit',
      field: 'startAfter',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box>
              {new Date(params.row.startAfter).toLocaleString('ro-RO', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Box>
            <Box sx={{ fontWeight: 'bold' }}>
              {params.row.firstRead
                ? new Date(params.row.firstRead).toLocaleString('ro-RO', {
                  timeZone: 'UTC',
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'N/A'}
            </Box>
          </Box>
        </Typography>
      )
    },

    {
      flex: 0.105,
      minWidth: 80,
      field: 'totalTime',
      headerName: 'Timp citit',
      renderCell: params => {
        const status = getScoreType(params.row.totalTime)

        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={status ? status.color : 'primary'}
            label={status ? status.text : 'N/A'}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },
    {
      flex: 0.04,
      headerName: 'Vizibil',
      field: 'isVisible',
      renderCell: params => <Checkbox checked={params.row.isVisible} />
    },
    {
      flex: 0.075,
      headerName: 'Dată asignare',
      field: 'assignedAt',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {new Date(params.row.assignedAt).toLocaleString('ro-RO', {
            timeZone: 'UTC',
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          })}
        </Typography>
      )
    },
    {
      flex: 0.065,
      field: 'actions',
      headerName: 'DEL',
      renderCell: params => (
        <Button
          className={classes.button}
          variant='text'
          color='error'
          onClick={event => handleOpenDialog(params.row, event, 'DELETE')}
        >
          <TrashX size={20} strokeWidth={2} color={'#EA5455'} />
        </Button>
      )
    }
  ]

  const [data, setData] = useState({})
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState([{ field: 'assignedAt', sort: 'desc' }])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogOpenRow, setDialogOpenRow] = useState({})
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const isInitialRender = useRef(true)
  const dispatch = useDispatch()

  const handleSearch = searchValue => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')

    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        return searchRegex.test(row[field].toString())
      })
    })
    if (searchValue.length) {
      setFilteredData(filteredRows)
    } else {
      setFilteredData([])
    }
  }

  // Fetch at initial render with all users

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userServiceResponse, lessonServiceResponse] = await Promise.all([
          apiClient.get("service3/users/role/STUDENT"),
          apiClient.post(apiSpec.LESSON_SERVICE + '/lesson/assigned-paginated', {
            filters: [],
            sorters: getSorters(),
            page: paginationModel.page,
            pageSize: paginationModel.pageSize
          })
        ])
        dispatch(updateAllStudents(userServiceResponse.data))
        setUsers(userServiceResponse.data)
        const processedData = await processStudentLessonsData(lessonServiceResponse.data.data, userServiceResponse.data);
        setData(processedData)
        setTotalCount(lessonServiceResponse.data.totalCount)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  //Fetch data from api after modifying datagrid filters/sorters/pagination
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false

      return
    }
    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/assigned-paginated', {
        filters: [],
        sorters: getSorters(),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize
      })
      .then(async response => {
        const processedData = await processStudentLessonsData(response.data.data, users);
        setData(processedData)
        setTotalCount(response.data.totalCount)
      })
      .catch(error => {
        console.log(error)
      })
  }, [paginationModel, filteredData, sortModel])

  const getSorters = () => {
    const apiSortingConfig = sortModel.map(sortItem => ({
      key: sortItem.field,
      direction: sortItem.sort.toUpperCase()
    }))

    return apiSortingConfig
  }

  const processStudentLessonsData = async (data, users) => {
    const usersOnPage = data.map(row => row.userId)
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
      const user = result.find(user => user.userId === row.userId)

      return { ...row, avatar: user.avatar }
    })
  }

  const handleViewLesson = params => {
    Router.push(`/view-lesson/${params.row.lessonId}`)
  }

  const handleOpenDialog = (row, event, dialogType) => {
    event.stopPropagation()
    if (dialogType === 'DELETE') {
      setDialogOpenRow({ id: row.lessonStudentId, title: row.title, student: users.find(user => user.id === row.userId) })
      setDialogOpen(true)
    } else if (dialogType === 'PROFILE') {
      setSelectedStudentId(row.userId)
      setProfileDrawerOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setProfileDrawerOpen(false)
  }

  const handleConfirmation = () => {
    apiClient
      .delete(`${apiSpec.LESSON_SERVICE}/lesson/delete-assigned/${dialogOpenRow.id}`)
      .then(response => {
        if (response.status === 204) {
          toast.success('Lecția a fost ștearsă cu succes!')

          //TODO update data after delete

          handleCloseDialog()
        }
      })
      .catch(error => {
        console.log(error)
        toast.error(error.toString())
      })
  }

  return (
    <>
      <AssignationModal users={users} />
      <Card>
        <CardHeader title='Rezultate studenți' />
        <Box sx={{ px: 3, pb: 3, pl: '1.7%' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Aici puteți vedea rezultatele studenților la lecțiile pe care le-ați asignat.
          </Typography>
        </Box>
        {loading ? (
          <>
            <LinearProgress />
          </>
        ) : (
          <>
            {dialogOpen && dialogOpenRow && (
              <DeleteDialogTransition
                open={dialogOpen}
                handleClose={handleCloseDialog}
                handleConfirm={handleConfirmation}
                dialogOpenRow={dialogOpenRow}
              />
            )}
            {profileDrawerOpen && (
              <UserViewDrawer open={profileDrawerOpen} onClose={handleCloseDialog} userId={selectedStudentId} tab="account" />
            )}
            <DataGrid
              autoHeight
              columns={columns}
              pageSizeOptions={[10, 35, 70]}
              sortingMode='server'
              filterMode='server'
              paginationMode='server'
              paginationModel={paginationModel}
              sortModel={sortModel}
              getRowId={row => row.lessonStudentId}
              slots={{ toolbar: QuickSearchToolbar }}
              onPaginationModelChange={newModel => setPaginationModel(newModel)}
              onSortModelChange={newModel => setSortModel(newModel)}
              rows={filteredData.length ? filteredData : data}
              rowCount={totalCount}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.125rem'
                }
              }}
              slotProps={{
                baseButton: {
                  size: 'medium',
                  variant: 'outlined'
                },
                toolbar: {
                  value: searchText,
                  clearSearch: () => handleSearch(''),
                  onChange: event => handleSearch(event.target.value)
                }
              }}
              onCellClick={handleViewLesson}
            />
          </>
        )}
      </Card>
    </>
  )
}

StudentsLessonsTable.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default StudentsLessonsTable
