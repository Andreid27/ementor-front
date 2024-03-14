// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'

// ** Icon Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { CardHeader, Grid, LinearProgress } from '@mui/material'
import LessonCard from './lesson-card'
import Router from 'next/router'

const StudentLessons = props => {
  // ** States
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('desc')
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [orderBy, setOrderBy] = useState()
  const [selected, setSelected] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const handleChange = lessonStudentId => {
    if (typeof lessonStudentId === 'string') {
      setSelected(lessonStudentId)
      Router.push(`/lesson/${lessonStudentId}`)
    } else {
      setSelected(null)
    }
  }

  useEffect(() => {
    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/assigned-paginated', {
        filters: [],
        sorters: getSorters(), // TODO !!! FIX sorters and filters !!
        page: page,
        pageSize: rowsPerPage
      })
      .then(response => {
        setLessons(response.data.data)
        setTotalCount(response.data.totalCount)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
  }, [page, orderBy, order, rowsPerPage])

  const getSorters = () => {
    let sorters = [
      {
        key: 'startAfter',
        direction: order.toUpperCase()
      },
      {
        key: 'assignedAt',
        direction: order.toUpperCase()
      }
    ]
    if (orderBy === 'chapterTitles') {
      sorters.push({
        key: 'chapterTitles',
        direction: order.toUpperCase()
      })
    }
    if (orderBy === 'title') {
      sorters.push({
        key: 'title',
        direction: order.toUpperCase()
      })
    }
    if (orderBy === 'creation') {
      sorters.push({
        key: 'creation',
        direction: order.toUpperCase()
      })
    }

    return sorters
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      <CardHeader title='Cursurile tale' />

      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <Box sx={{ p: '2rem' }}>
          <Grid container spacing={6}>
            {lessons.map((item, index) => (
              <LessonCard
                key={index}
                lesson={item}
                selected={selected}
                name='custom-radios-icons'
                handleChange={handleChange}
                gridProps={{ sm: 6, xs: 12 }}
              />
            ))}
          </Grid>
          <Box>
            <TablePagination
              page={page}
              component='div'
              count={totalCount}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[6, 8, 16, 32]}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Box>
      )}
    </>
  )
}

export default StudentLessons
