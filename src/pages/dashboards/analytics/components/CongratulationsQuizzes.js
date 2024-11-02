// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Box } from '@mui/material'
import { useRouter } from 'next/router'

const Illustration = styled('img')(({ theme }) => ({
  right: 20,
  bottom: 0,
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    right: 5,
    width: 110
  }
}))

const CongratulationsQuizzes = props => {
  const router = useRouter()

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          Felicitări {props.user.firstName}! 🎉
        </Typography>
        {props.quizzes && props.quizzes.completedQuizzes > 0 ? (
          <>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Ai reușit să parcurgi până acum</Typography>
            <Typography variant='h4' sx={{ mb: 0.75, color: 'primary.main' }}>
              {props.quizzes.completedQuizzes != 1
                ? `${props.quizzes.completedQuizzes} teste`
                : 'Primul tău test alături de E-mentor!'}
            </Typography>
            <Box sx={{ marginTop: '1rem' }}>
              <Button
                variant='contained'
                onClick={() => {
                  router.push('/quizzes')
                }}
              >
                Continuă testele
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Hai să începem primul test</Typography>
            <Box sx={{ marginTop: '2rem' }}>
              <Button
                variant='contained'
                onClick={() => {
                  router.push('/quizzes')
                }}
              >
                Începe testele chiar acum!
              </Button>
            </Box>
          </>
        )}
        <Illustration width={116} alt='congratulations john' src='/images/cards/congratulations-john.png' />
      </CardContent>
    </Card>
  )
}

export default CongratulationsQuizzes
