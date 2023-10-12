// ** React Imports
import { Card, CardHeader } from '@mui/material'
import { useState } from 'react'
import TableStickyHeader from 'src/pages/quizzes/componets/table'

const QuizzesTable = () => {
  return (
    <>
      <Card>
        <CardHeader title='Sticky Header' />
        <TableStickyHeader />
      </Card>
    </>
  )
}

export default QuizzesTable
