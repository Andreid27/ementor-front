// ** React Imports
import React, { useCallback, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Components
import QuizDataGrid from './QuizDataGrid'
import QuizErrorBoundary from './QuizErrorBoundary'
import AppleToolbar from './AppleToolbar'

// ** Hooks
import { useQuizData } from '../hooks/useQuizData'

// ** Types
import { DataGridParams } from '../types'

const QuizListingContainer: React.FC = () => {
  const router = useRouter()

  // ** State
  const [searchValue, setSearchValue] = useState('')

  // ** Hooks
  const { quizzes, loading, error, totalCount, refetch, updateParams } = useQuizData()

  // ** Handlers
  const handleQuizSelect = useCallback(
    (quizId: string) => {
      router.push(`/quiz/${quizId}`)
    },
    [router]
  )

  const handleParamsChange = useCallback(
    (params: DataGridParams) => {
      updateParams(params)
    },
    [updateParams]
  )

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      // Trigger the search through params change
      handleParamsChange({
        page: 0,
        pageSize: 5, // Default page size
        sortModel: [],
        filterModel: {
          items: [],
          quickFilterValues: value ? [value] : []
        }
      })
    },
    [handleParamsChange]
  )

  return (
    <QuizErrorBoundary>
      <Box>
        {/* Search toolbar - always visible and outside of loading states */}
        <AppleToolbar onSearchChange={handleSearchChange} searchValue={searchValue} />

        {/* DataGrid content */}
        <QuizDataGrid
          quizzes={quizzes}
          loading={loading}
          error={error}
          totalCount={totalCount}
          onQuizSelect={handleQuizSelect}
          onRefresh={handleRefresh}
          onParamsChange={handleParamsChange}
          searchValue={searchValue}
        />
      </Box>
    </QuizErrorBoundary>
  )
}

export default QuizListingContainer
