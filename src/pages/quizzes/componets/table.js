// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Paper from '@mui/material/Paper'
import { visuallyHidden } from '@mui/utils'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import TableSortLabel from '@mui/material/TableSortLabel'
import TablePagination from '@mui/material/TablePagination'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { CardHeader, LinearProgress, Rating } from '@mui/material'
import { useTheme } from '@emotion/react'

const headCells = [
  {
    id: 'title',
    numeric: false,
    disablePadding: true,
    label: 'Nume'
  },
  {
    id: 'chapterTitles',
    numeric: false,
    disablePadding: false,
    label: 'Capitol'
  },
  {
    id: 'maxTime',
    numeric: true,
    disablePadding: false,
    label: 'Durata'
  },
  {
    id: 'difficultyLevel',
    numeric: true,
    disablePadding: false,
    label: 'Dificultate'
  }
]
function EnhancedTableHead(props) {
  // ** Props
  const { order, orderBy, onRequestSort } = props

  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              onClick={createSortHandler(headCell.id)}
              direction={orderBy === headCell.id ? order : 'asc'}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

const EnhancedTableToolbar = props => {
  // ** Prop
  const { numSelected } = props

  return <span></span>
}

const EnhancedTable = props => {
  // ** States
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('desc')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState()
  const [selected, setSelected] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const theme = useTheme()

  useEffect(() => {
    apiClient
      .post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
        filters: [],
        sorters: getSorters(), // TODO !!! FIX sorters and filters !!
        page: page,
        pageSize: rowsPerPage
      })
      .then(response => {
        setQuizzes(response.data.data)
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
    if (orderBy === 'maxTime') {
      sorters.push({
        key: 'maxTime',
        direction: order.toUpperCase()
      })
    }
    if (orderBy === 'difficultyLevel') {
      sorters.push({
        key: 'difficultyLevel',
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

  const handleClick = (event, quizId) => {
    props.setPreview(quizId)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const isSelected = name => selected.indexOf(name) !== -1

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalCount) : 0

  function hexToRgba(hex, opacity) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^#/, '');

    // Parse r, g, b values
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Return RGBA string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function calculateRowColor(correctPercentage) {
    if (correctPercentage == 0) {
      return hexToRgba(theme.palette.info.light, 0);  // 30% intensity
    }
    if (correctPercentage < 0.5) {
      return hexToRgba(theme.palette.error.light, 0.1);  // 30% intensity
    } else if (correctPercentage < 0.8) {
      return hexToRgba(theme.palette.warning.light, 0.1);  // 30% intensity
    } else {
      return hexToRgba(theme.palette.primary.light, 0.1);  // 30% intensity
    }
  }



  return (
    <>
      <CardHeader title='Testele tale' />

      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <>
          <EnhancedTableToolbar numSelected={selected.length} />
          {totalCount === 0 ? (
            <>
              <Box sx={{ padding: '1.5rem' }}>
                <Typography sx={{ mb: 2, color: 'text.primary' }}>Nu ai niciun test asignat</Typography>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                  Contactează-ți profesorul pentru a începe testele.
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle'>
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    rowCount={totalCount}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {/* if you don't need to support IE11, you can replace the `stableSort` call with: rows.slice().sort(getComparator(order, orderBy)) */}
                    {/* {stableSort(rows, getComparator(order, orderBy)) */}
                    {quizzes.map((row, index) => {
                      const isItemSelected = isSelected(row.id)
                      const labelId = `enhanced-table-checkbox-${index}`
                      const correctPercentage = row.correctAnswers ? row.correctAnswers / row.questionsCount : 0

                      return (
                        <TableRow
                          hover
                          tabIndex={-1}
                          key={row.id}
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                          onClick={event => handleClick(event, row)}
                          style={{ cursor: 'pointer', backgroundColor: calculateRowColor(correctPercentage) }}
                        >
                          <TableCell component='th' id={labelId} scope='row' padding='none'>
                            {row.title}
                          </TableCell>
                          <TableCell align='left'>{row.chapterTitles}</TableCell>
                          <TableCell align='right'>{row.maxTime}</TableCell>
                          <TableCell align='right'>
                            <Rating
                              readOnly
                              defaultValue={row.difficultyLevel}
                              max={3}
                              precision={row.difficultyLevel}
                              name='read-only'
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {emptyRows > 0 && (
                      <TableRow
                        sx={{
                          height: 53 * emptyRows
                        }}
                      >
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                page={page}
                component='div'
                count={totalCount}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </>
      )}
    </>
  )
}

export default EnhancedTable
