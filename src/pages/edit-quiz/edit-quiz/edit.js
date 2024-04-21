// ** React Imports
import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material'

import SubmitComponent from './components/SubmitComponent'
import RadioComponentReview from './components/Radio/RedioComponent'
import { Icon } from '@iconify/react'

const QuizView = props => {
  const { quiz } = props

  return (
    <>
      <Card>
        <CardContent>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                {quiz.title}
              </Typography>
              <IconButton onClick={() => props.setIsEdit(true)}>
                <Icon icon='tabler:pencil' style={{ color: 'secondary' }} fontSize={20} />
              </IconButton>
            </Box>
            <Typography
              variant='h6'
              sx={{
                lineHeight: 1,
                fontSize: '1rem !important',
                padding: '1em',
                paddingLeft: '0.4em',
                color: 'text.secondary',
                maxWidth: '20rem',
                wordBreak: 'break-word'
              }}
            >
              {quiz.description}
            </Typography>
            <Typography
              variant='h6'
              sx={{
                lineHeight: 1,
                fontSize: '1rem !important',
                padding: '1em',
                paddingLeft: '0.4em',
                color: 'text.secondary',
                maxWidth: '20rem',
                wordBreak: 'break-word'
              }}
            ></Typography>
          </Box>

          <Grid container spacing={6}>
            <Grid item xs={12} sm={12}>
              <CardContent sx={{ p: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}></CardContent>
              {quiz.questions.map((question, index) => (
                <RadioComponentReview
                  key={question.id}
                  question={question}
                  answersMap={quiz.submitedQuestionAnswers}
                  viewResults={true}
                  resultSet={quiz}
                />
              ))}
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}>
            <SubmitComponent viewResults={true} loading={false} setCompleted={true} />
          </Box>
        </CardContent>
      </Card>
    </>
  )
}

QuizView.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizView
