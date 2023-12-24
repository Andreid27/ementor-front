// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid } from '@mui/x-data-grid'

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

// ** renders client column
const renderClient = (params, user) => {
  const { row } = params
  const stateNum = Math.floor(Math.random() * 6)
  const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
  const color = states[stateNum]
  if (row.avatar && row.avatar.length) {
    return <CustomAvatar src={`/images/avatars/${row.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
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

const StudentsResultsTable = () => {
  // ** States
  const [users, setUsers] = useState([])

  const columns = [
    {
      flex: 0.275,
      minWidth: 290,
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
      flex: 0.12,
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
    }
  ]

  const [data, setData] = useState({})
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState([{ field: 'assignedAt', sort: 'desc' }])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const isInitialRender = useRef(true)

  const handleSearch = searchValue => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')

    const filteredRows = data.filter(row => {
      return Object.keys(row).some(field => {
        // @ts-ignore
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
          apiClient.post(apiSpec.USER_SERVICE + '/paginated', {
            filters: [
              {
                key: 'role',
                operation: 'EQUAL',
                value: 'STUDENT'

                //TODO continue filter users by role here
              }
            ],
            sorters: [],
            page: 0,
            pageSize: 1000
          }),
          apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
            filters: [],
            sorters: getSorters(),
            page: paginationModel.page,
            pageSize: paginationModel.pageSize
          })
        ])

        setUsers(userServiceResponse.data.data)
        setData(quizServiceResponse.data.data)
        setTotalCount(quizServiceResponse.data.totalCount)
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
      .post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
        filters: [],
        sorters: getSorters(),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize
      })
      .then(response => {
        setData(response.data.data)
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

  return (
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
          <AssignationModal users={users} />
          <DataGrid
            autoHeight
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            paginationMode='server'
            paginationModel={paginationModel}
            slots={{ toolbar: QuickSearchToolbar }}
            onPaginationModelChange={newModel => setPaginationModel(newModel)}
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
          />
        </>
      )}
    </Card>
  )
}

export default StudentsResultsTable
