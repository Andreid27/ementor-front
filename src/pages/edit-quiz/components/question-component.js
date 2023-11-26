import { Checkbox, List, ListItem, TextField, Typography } from '@mui/material'
import React from 'react'

export default function QuestionComponent() {
  const [checked, setChecked] = React.useState(false)

  const handleChange = event => {
    setChecked(event.target.checked)
  }

  //TODO continue here with the question component
  return (
    <>
      <List>
        <ListItem alignItems='center'>
          <Checkbox checked={checked} onChange={handleChange} inputProps={{ 'aria-label': 'primary checkbox' }} />
          <TextField fullWidth disabled={checked} label='disable when checkbox checked' />
        </ListItem>
        <ListItem alignItems='center'>
          <Checkbox checked={checked} onChange={handleChange} inputProps={{ 'aria-label': 'primary checkbox' }} />
          <TextField fullWidth disabled={!checked} label='enable when checkbox checked' />
        </ListItem>
      </List>
    </>
  )
}
