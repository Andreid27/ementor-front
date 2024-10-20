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
import * as apiSpec from '../../../apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import componentTypes from 'src/pages/student-results/componets/componentsType.json'
import { Button, LinearProgress } from '@mui/material'
import AssignationModal from './assignationModal'
import { useDispatch } from 'react-redux'
import { fetchData, updateAllStudents } from 'src/store/apps/user'
import Router from 'next/router'
import DeleteDialogTransition from './DeleteDialogTransition'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

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

const getScoreType = (correctCount, totalCount) => {
  if (!correctCount || correctCount === 0) {
    return {
      color: 'info',
      text: 'N/A'
    }
  }
  const score = (correctCount / totalCount) * 100
  if (score <= 50) {
    return {
      color: 'error',
      text: `${correctCount}/${totalCount}`
    }
  }
  if (score <= 80) {
    return {
      color: 'warning',
      text: `${correctCount}/${totalCount}`
    }
  }

  return {
    color: 'success',
    text: `${correctCount}/${totalCount}`
  }
}

const useStyles = makeStyles({
  button: {
    padding: '1%',
    width: '10px',
    minHeight: '40px'
  }
})

const StudentsResultsTable = () => {
  // ** States
  const [users, setUsers] = useState([])
  const classes = useStyles()

  const columns = [
    {
      flex: 0.2,
      minWidth: 250,
      field: 'studentId',
      headerName: 'Student',
      renderCell: params => {
        const { row } = params
        const user = users.find(user => user.id === row.studentId)

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(params, user)}
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
      headerName: 'Test',
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
      flex: 0.18,
      field: 'componentType',
      minWidth: 120,
      headerName: 'Tip complement',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {componentTypes.find(item => item.type === params.row.componentType)?.name}
        </Typography>
      )
    },
    {
      flex: 0.08,
      minWidth: 80,
      field: 'correctAnswers',
      headerName: 'Status',
      renderCell: params => {
        const status = getScoreType(params.row.correctAnswers, params.row.questionsCount)

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
      type: 'date',
      minWidth: 100,
      headerName: 'Dată asignare',
      field: 'assignedAt',
      valueGetter: params => new Date(params.value),
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {new Date(params.row.assignedAt).toLocaleString('ro-RO', {
            timeZone: 'UTC',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
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
          onClick={event => handleOpenDialog(params.row, event)}
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
        const [userServiceResponse, quizServiceResponse] = await Promise.all([
          apiClient.get("service3/users/role/STUDENT"),
          apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
            filters: [],
            sorters: getSorters(),
            page: paginationModel.page,
            pageSize: paginationModel.pageSize
          })
        ])
        dispatch(updateAllStudents(userServiceResponse.data))
        setUsers(userServiceResponse.data)
        const processedData = await processStudentQuizzesData(quizServiceResponse.data.data, userServiceResponse.data);
        setData(processedData)
        setTotalCount(quizServiceResponse.data.totalCount)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;

      return;
    }

    // Define the async function
    const fetchAndProcessData = async () => {
      try {
        const response = await apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
          filters: [],
          sorters: getSorters(),
          page: paginationModel.page,
          pageSize: paginationModel.pageSize,
        });

        // Await the processing of student quizzes data
        const processedData = await processStudentQuizzesData(response.data.data, users);

        // Set the processed data to the state
        setData(processedData);
        setTotalCount(response.data.totalCount);
      } catch (error) {
        console.log(error);
      }
    };

    // Call the async function
    fetchAndProcessData();
  }, [paginationModel, filteredData, sortModel]);

  const getSorters = () => {
    const apiSortingConfig = sortModel.map(sortItem => ({
      key: sortItem.field,
      direction: sortItem.sort.toUpperCase()
    }))

    return apiSortingConfig
  }

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

  const handleViewAttempt = params => {
    Router.push(`/review-attempt/${params.row.id}`)
  }

  const handleOpenDialog = (row, event) => {
    event.stopPropagation()
    setDialogOpenRow({ id: row.id, title: row.title, student: users.find(user => user.id === row.studentId) })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleConfirmation = () => {
    apiClient
      .delete(`${apiSpec.QUIZ_SERVICE}/delete-assigned/${dialogOpenRow.id}`)
      .then(response => {
        if (response.status === 204) {
          toast.success('Încercarea a fost ștearsă cu succes!')

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
            Aici puteți vedea rezultatele studenților la testele pe care le-ați creat.
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
            <DataGrid
              autoHeight
              columns={columns}
              pageSizeOptions={[10, 35, 70]}
              sortingMode='server'
              filterMode='server'
              paginationMode='server'
              paginationModel={paginationModel}
              sortModel={sortModel}
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
              onCellClick={handleViewAttempt}
            />
          </>
        )}
      </Card>
    </>
  )
}

export default StudentsResultsTable
