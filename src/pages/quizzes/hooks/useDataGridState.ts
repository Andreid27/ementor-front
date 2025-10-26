// ** React Imports
import { useState, useCallback, useMemo } from 'react'

// ** MUI DataGrid Types
import { GridPaginationModel, GridSortModel, GridFilterModel } from '@mui/x-data-grid'

// ** Types
import { DataGridParams } from '../types'

interface UseDataGridStateProps {
  initialPageSize?: number
  onParamsChange: (params: DataGridParams) => void
}

interface UseDataGridStateReturn {
  paginationModel: GridPaginationModel
  sortModel: GridSortModel
  filterModel: GridFilterModel
  searchValue: string
  setPaginationModel: (model: GridPaginationModel) => void
  setSortModel: (model: GridSortModel) => void
  setFilterModel: (model: GridFilterModel) => void
  setSearchValue: (value: string) => void
  handlePaginationChange: (newModel: GridPaginationModel) => void
  handleSortChange: (newModel: GridSortModel) => void
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleClearSearch: () => void
  resetToFirstPage: () => void
}

export const useDataGridState = ({
  initialPageSize = 10,
  onParamsChange
}: UseDataGridStateProps): UseDataGridStateReturn => {
  // ** State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize
  })

  const [sortModel, setSortModel] = useState<GridSortModel>([])

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: []
  })

  const [searchValue, setSearchValue] = useState('')

  // ** Memoized current params
  const currentParams = useMemo(
    (): DataGridParams => ({
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      sortModel,
      filterModel
    }),
    [paginationModel, sortModel, filterModel]
  )

  // ** Handlers
  const handlePaginationChange = useCallback(
    (newModel: GridPaginationModel) => {
      setPaginationModel(newModel)
      onParamsChange({
        ...currentParams,
        page: newModel.page,
        pageSize: newModel.pageSize
      })
    },
    [currentParams, onParamsChange]
  )

  const handleSortChange = useCallback(
    (newModel: GridSortModel) => {
      setSortModel(newModel)
      onParamsChange({
        ...currentParams,
        sortModel: newModel
      })
    },
    [currentParams, onParamsChange]
  )

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setSearchValue(value)

      const newFilterModel = {
        ...filterModel,
        quickFilterValues: value ? [value] : []
      }
      setFilterModel(newFilterModel)

      // Reset to first page when searching
      const newPaginationModel = { ...paginationModel, page: 0 }
      setPaginationModel(newPaginationModel)

      onParamsChange({
        page: 0,
        pageSize: newPaginationModel.pageSize,
        sortModel,
        filterModel: newFilterModel
      })
    },
    [paginationModel.pageSize, sortModel, filterModel, onParamsChange]
  )

  const handleClearSearch = useCallback(() => {
    setSearchValue('')
    const newFilterModel = {
      ...filterModel,
      quickFilterValues: []
    }
    setFilterModel(newFilterModel)

    onParamsChange({
      ...currentParams,
      filterModel: newFilterModel
    })
  }, [currentParams, filterModel, onParamsChange])

  const resetToFirstPage = useCallback(() => {
    const newPaginationModel = { ...paginationModel, page: 0 }
    setPaginationModel(newPaginationModel)
    onParamsChange({
      ...currentParams,
      page: 0
    })
  }, [currentParams, paginationModel, onParamsChange])

  return {
    paginationModel,
    sortModel,
    filterModel,
    searchValue,
    setPaginationModel,
    setSortModel,
    setFilterModel,
    setSearchValue,
    handlePaginationChange,
    handleSortChange,
    handleSearchChange,
    handleClearSearch,
    resetToFirstPage
  }
}
