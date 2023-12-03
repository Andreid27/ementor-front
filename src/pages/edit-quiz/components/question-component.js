import React, { useEffect, useRef, useState } from 'react'
import { Checkbox, List, ListItem, TextField, Box, Button, Typography, Grid, Rating } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import isEqual from 'lodash/isEqual'

const QuestionComponent = props => {
  const [questionContent, setQuestionContent] = useState({
    content: '',
    correctAnswer: 0,
    source: '',
    sourcePage: 0,
    difficultyLevel: props.difficultyLevel,
    hint: ''
  })
  const [difficultyLevel, setDifficultyLevel] = useState(0)
  const [componentType, setComponentType] = useState('CS')

  const [options, setOptions] = useState([
    { id: 1, text: 'Option 1', isCorrect: false },
    { id: 2, text: 'Option 2', isCorrect: false },
    { id: 3, text: 'Option 3', isCorrect: false },
    { id: 4, text: 'Option 4', isCorrect: false },
    { id: 5, text: 'Option 5', isCorrect: false }
  ])

  const updateQuestionField = (fieldName, value) => {
    setQuestionContent(prevContent => ({
      ...prevContent,
      [fieldName]: value
    }))
  }

  useEffect(() => {
    refreshNumberOfAnswers()
    if (props.defaultDificultyLevel) {
      setDifficultyLevel(Number(props.defaultDificultyLevel))
      updateQuestionField('difficultyLevel', Number(props.defaultDificultyLevel))
    }
    setComponentType(props.componentType)
  }, [props])

  const [prevQuestionContent, setPrevQuestionContent] = useState(questionContent)
  const [prevOptions, setPrevOptions] = useState(options)

  useEffect(() => {
    // Check if values have changed
    const questionContentChanged = !isEqual(questionContent, prevQuestionContent)
    const optionsChanged = !isEqual(options, prevOptions)

    // If either has changed, trigger the update
    if (questionContentChanged || optionsChanged) {
      props.updateQuestionValue(props.index, questionContent, options)
    }

    // Update state with current values for the next render
    setPrevQuestionContent(questionContent)
    setPrevOptions(options)
  }, [questionContent, options])

  const refreshNumberOfAnswers = () => {
    const updatedOptions = [...options]

    // Check if the number of answers has increased
    while (updatedOptions.length < props.numberOfAnswers) {
      updatedOptions.push({
        id: updatedOptions.length + 1,
        text: `Option ${updatedOptions.length + 1}`,
        isCorrect: false
      })
    }

    // Check if the number of answers has decreased
    while (updatedOptions.length > props.numberOfAnswers) {
      updatedOptions.pop()
    }

    setOptions(updatedOptions)
  }

  const handleCheckboxChange = index => {
    const updatedOptions = [...options]
    updatedOptions[index].isCorrect = !updatedOptions[index].isCorrect
    setOptions(updatedOptions)
    if (updatedOptions[index].isCorrect) {
      updateQuestionField('correctAnswer', index + 1)
    }
  }

  const handleTextField = (index, value) => {
    const updatedOptions = [...options]
    updatedOptions[index] = {
      ...updatedOptions[index],
      text: value
    }
    setOptions(updatedOptions)
  }

  return (
    <Box border={1} borderRadius={2} p={2} marginBottom={2} marginTop={'2rem'}>
      <Box display='flex' flexDirection='row' justifyContent='flex-start' alignItems='center'>
        <Typography variant='h6' gutterBottom sx={{ marginLeft: '2%' }}>
          {props.index + 1}.
        </Typography>
        <CustomTextField
          style={{ width: '92.5%', marginLeft: '2.5%' }}
          fullWidth
          value={questionContent.content}
          label='Întrebare:'
          onChange={e => updateQuestionField('content', e.target.value)}
          placeholder='Care este întrebarea?'
          aria-describedby='validation-async-title'
        />
      </Box>

      <List>
        {options.map((option, index) => (
          <ListItem key={option.id} alignItems='center'>
            <Checkbox
              checked={option.isCorrect}
              onChange={() => {
                handleCheckboxChange(index)
              }}
              disabled={options.some(opt => opt.isCorrect && opt.id !== option.id) && componentType != 'CM'}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <TextField
              fullWidth
              label={`Răspunsul ${option.id}`}
              onChange={e => handleTextField(index, e.target.value)}
            />
          </ListItem>
        ))}
      </List>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <CustomTextField
            fullWidth
            label='Sursă:'
            placeholder='Sursa'
            aria-describedby='validation-async-title'
            value={questionContent.source}
            onChange={e => updateQuestionField('source', e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <CustomTextField
            fullWidth
            type='number'
            label='Pagina sursă:'
            placeholder='341'
            value={questionContent.sourcePage}
            onChange={e => updateQuestionField('sourcePage', e.target.value)}
            aria-describedby='validation-async-title'
          />
        </Grid>
        <Grid item xs={3} sm={3}>
          <div>
            <Typography variant='subtitle2' gutterBottom>
              Grad de dificultate
            </Typography>
            <Rating
              value={difficultyLevel}
              onChange={(event, newValue) => {
                setDifficultyLevel(newValue)
                updateQuestionField('difficultyLevel', newValue)
              }}
              max={3}
              defaultValue={0}
              precision={1}
            />
          </div>
        </Grid>
        <Grid item xs={8} sm={4}>
          <CustomTextField
            fullWidth
            label='Hint pentru stundent:'
            placeholder='Hint'
            value={questionContent.hint}
            onChange={e => updateQuestionField('hint', e.target.value)}
            aria-describedby='validation-async-title'
          />
        </Grid>
      </Grid>

      <Box display='flex' flexDirection='column' justifyContent='space-between' alignItems='flex-end'>
        <Button
          variant='outlined'
          color='error'
          sx={{ marginRight: '1rem', marginTop: '1rem' }}
          onClick={() => props.removeQuestion(props.index)}
        >
          Șterge întrebarea
        </Button>
      </Box>
    </Box>
  )
}

export default QuestionComponent
