// ** React Imports
import { Box, Card, CardContent, CardHeader, Radio, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { styled } from '@mui/material/styles'
import { useDispatch } from 'react-redux'
import { updateAnswers } from 'src/store/apps/quiz'

const BoxWrapper = styled(Box)(({ theme }) => ({
  borderWidth: 1,
  display: 'flex',
  cursor: 'pointer',
  borderStyle: 'solid',
  padding: theme.spacing(4),
  borderColor: theme.palette.divider,
  '&:first-of-type': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius
  },
  '&:last-of-type': {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius
  }
}))

const SecondBoxWrapper = styled(Box)(({ theme }) => ({
  borderWidth: 1,
  cursor: 'pointer',
  borderStyle: 'solid',
  padding: theme.spacing(1),
  borderColor: theme.palette.divider,
  '&:first-of-type': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius
  },
  '&:last-of-type': {
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius
  }
}))

const RadioComponent = props => {
  const [option, setOption] = useState('answer0')
  const [corectOption, setCorectOption] = useState()

  const dispatch = useDispatch()

  useEffect(() => {
    props.answersMap.set(props.question.id, option)

    if (props.viewResults) {
      let optionNumber = props.resultSet.correctAnswers.filter(answer => {
        return answer.questionId === props.question.id
      })
      optionNumber[0] ? setCorectOption(`answer${optionNumber[0].answer}`) : null
    }
    dispatch(updateAnswers({ questionId: props.question.id, answer: option }))
  }, [option, props.viewResults])

  return (
    <>
      <Card sx={{ marginBottom: '2em' }}>
        <Typography sx={{ fontWeight: 600, paddingLeft: '2em', paddingTop: '1.5em', fontSize: '1.2rem' }}>
          {props.question.content}
        </Typography>
        <CardContent>
          <SecondBoxWrapper sx={corectOption === 'answer1' ? { borderColor: '#28C76F' } : {}}>
            <BoxWrapper
              onClick={() => setOption('answer1')}
              sx={option === 'answer1' ? { borderColor: '#00CFE8' } : {}}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>A. {props.question.answer1}</Typography>
                </Box>
              </Box>
            </BoxWrapper>
          </SecondBoxWrapper>

          <SecondBoxWrapper sx={corectOption === 'answer2' ? { borderColor: '#28C76F' } : {}}>
            <BoxWrapper
              onClick={() => setOption('answer2')}
              sx={option === 'answer2' ? { borderColor: '#00CFE8' } : {}}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>B. {props.question.answer2}</Typography>
                </Box>
              </Box>
            </BoxWrapper>
          </SecondBoxWrapper>

          <SecondBoxWrapper sx={corectOption === 'answer3' ? { borderColor: '#28C76F' } : {}}>
            <BoxWrapper
              onClick={() => setOption('answer3')}
              sx={option === 'answer3' ? { borderColor: '#00CFE8' } : {}}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>C. {props.question.answer3}</Typography>
                </Box>
              </Box>
            </BoxWrapper>
          </SecondBoxWrapper>
          <SecondBoxWrapper sx={corectOption === 'answer4' ? { borderColor: '#28C76F' } : {}}>
            <BoxWrapper
              onClick={() => setOption('answer4')}
              sx={option === 'answer4' ? { borderColor: '#00CFE8' } : {}}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>D. {props.question.answer4}</Typography>
                </Box>
              </Box>
            </BoxWrapper>
          </SecondBoxWrapper>
          <SecondBoxWrapper sx={corectOption === 'answer5' ? { borderColor: '#28C76F' } : {}}>
            <BoxWrapper
              onClick={() => setOption('answer5')}
              sx={option === 'answer5' ? { borderColor: '#00CFE8' } : {}}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 500 }}>E. {props.question.answer5}</Typography>
                </Box>
              </Box>
            </BoxWrapper>
          </SecondBoxWrapper>
        </CardContent>
      </Card>
    </>
  )
}

RadioComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default RadioComponent
