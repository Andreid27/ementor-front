import React, { useEffect, useState } from 'react'
import { Checkbox, List, ListItem, TextField, Box, Button, Typography, Grid, Rating } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'

const QuestionComponent = props => {
  const [value, setValue] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(props.defaultDificultyLevel)

  const [options, setOptions] = useState([
    { id: 1, text: 'Option 1', isCorrect: false, source: '' },
    { id: 2, text: 'Option 2', isCorrect: false, source: '' },
    { id: 3, text: 'Option 3', isCorrect: false, source: '' },
    { id: 4, text: 'Option 4', isCorrect: false, source: '' },
    { id: 5, text: 'Option 5', isCorrect: false, source: '' }
  ])

  useEffect(() => {
    refreshNumberOfAnswers()
    setDifficultyLevel(props.defaultDificultyLevel)
  }, [props])

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
    console.log(options)
  }

  return (
    <Box border={1} borderRadius={2} p={2} marginBottom={2}>
      <Box display='flex' flexDirection='row' justifyContent='flex-start' alignItems='center'>
        <Typography variant='h6' gutterBottom sx={{ marginLeft: '2%' }}>
          {props.index + 1}.
        </Typography>
        <CustomTextField
          style={{ width: '92.5%', marginLeft: '2.5%' }}
          fullWidth
          value={value}
          label='Întrebare:'
          onChange={e => setValue(e.target.value)}
          placeholder='Care este întrebarea?'
          aria-describedby='validation-async-title'
        />
      </Box>

      <List>
        {options.map((option, index) => (
          <ListItem key={option.id} alignItems='center'>
            <Checkbox
              checked={option.isCorrect}
              onChange={() => handleCheckboxChange(index)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <TextField fullWidth label={`Răspunsul ${option.id}`} />
          </ListItem>
        ))}
      </List>

      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <CustomTextField fullWidth label='Sursă:' placeholder='Sursa' aria-describedby='validation-async-title' />
        </Grid>
        <Grid item xs={6} sm={2}>
          <CustomTextField
            fullWidth
            type='number'
            label='Pagina sursă:'
            placeholder='341'
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
              onChange={(event, newValue) => setDifficultyLevel(newValue)}
              max={3}
              precision={0.5}
            />
          </div>
        </Grid>
        <Grid item xs={8} sm={4}>
          <CustomTextField
            fullWidth
            label='Hint pentru stundent:'
            placeholder='Hint'
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
