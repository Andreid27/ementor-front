// ** React Imports
import React from 'react'

// ** MUI Imports
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

/**
 * QuizIntegrityNotice - Tells the student, at the start of the quiz, that leaving the page is recorded and shown
 * to the professor (quiz integrity contract, section 13)
 */

const NOTICE =
  'Pe durata testului se înregistrează când și cât timp părăsești pagina testului. Profesorul tău va vedea aceste informații.'

const QuizIntegrityNotice: React.FC = () => (
  <Alert severity='info' icon={<Icon icon='tabler:eye' fontSize={20} />} sx={{ mb: 3, alignItems: 'center' }}>
    {NOTICE}
  </Alert>
)

export default QuizIntegrityNotice
