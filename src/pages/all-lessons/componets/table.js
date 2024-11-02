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
import QuickSearchToolbar from 'src/views/table/data-grid/QuickSearchToolbar'

// ** Data Import
import * as apiSpec from '../../../apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import { Button, LinearProgress } from '@mui/material'
import Router, { useRouter } from 'next/router'
import DeleteDialogTransition from './DeleteDialogTransition'

const escapeRegExp = value => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const useStyles = makeStyles({
  button: {
    padding: '1%',
    width: '10px',
    minHeight: '40px'
  }
})

const LessonsTable = () => {
  // ** States
  const classes = useStyles()

  const columns = [
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
      headerName: 'Capitol',
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.chapterTitles}
        </Typography>
      )
    },
    {
      flex: 0.04,
      type: 'date',
      minWidth: 100,
      headerName: 'Dată asignare',
      field: 'creation',
      valueGetter: params => new Date(params.value),
      renderCell: params => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {new Date(params.row.creation).toLocaleString('ro-RO', {
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
  const [sortModel, setSortModel] = useState([{ field: 'creation', sort: 'desc' }])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogOpenRow, setDialogOpenRow] = useState({})
  const router = useRouter()

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

  //Fetch data from api after modifying datagrid filters/sorters/pagination
  useEffect(() => {
    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/paginated', {
        filters: [],
        sorters: getSorters(),
        page: paginationModel.page,
        pageSize: paginationModel.pageSize
      })
      .then(response => {
        setData(response.data.data)
        setTotalCount(response.data.totalCount)
        if (loading) {
          setLoading(false)
        }
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

  const handleViewLesson = params => {
    console.log(params.row.id)
    Router.push(`/view-lesson/${params.row.id}`)
  }

  const handleCreateLesson = () => {
    router.push('/edit-lesson/new')
  }

  const handleOpenDialog = (row, event) => {
    event.stopPropagation()
    setDialogOpenRow({ id: row.id, title: row.title })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleConfirmation = () => {
    apiClient
      .delete(`${apiSpec.LESSON_SERVICE}/lesson/delete/${dialogOpenRow.id}`)
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
      <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large' onClick={handleCreateLesson}>
        Creează o lecție nouă
      </Button>
      <Card>
        <CardHeader title='Cursuri' />
        <Box sx={{ px: 3, pb: 3, pl: '1.7%' }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Aici puteți vedea lecțiile pe care le-ați creat.
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
              onCellClick={handleViewLesson}
            />
          </>
        )}
      </Card>
    </>
  )
}

export default LessonsTable
