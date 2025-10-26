# Quiz Page Comprehensive Documentation

## Overview

The Quiz Page is a React-based component system that allows students to take quizzes with a countdown timer, answer multiple-choice questions, and view results. The system is built using Material-UI components and Redux for state management.

## File Structure

```
src/pages/quiz/
├── [...all].js                          # Main quiz page component
└── components/
    ├── CountDown/
    │   └── CountdownTimer.js            # Countdown timer component
    ├── Radio/
    │   └── RedioComponent.js            # Question and answer component
    ├── DialogTransition.js              # Confirmation dialog
    └── SubmitComponent.js               # Submit button and logic
```

## Main Component: QuizAttempt ([...all].js)

### Purpose

The main quiz component that orchestrates the entire quiz-taking experience, from loading quiz data to displaying results.

### State Management

#### Local State Variables

- `quiz`: Object containing quiz data (title, description, questions, endTime)
- `loading`: Boolean indicating if quiz data is being loaded
- `loadingButton`: Boolean for submit button loading state (currently unused)
- `viewResults`: Boolean indicating if results should be displayed
- `completed`: Boolean indicating if quiz has been completed
- `timeFinished`: Boolean indicating if time has run out
- `resultSet`: Object containing quiz results after submission
- `answersMap`: Map object storing user's answers (questionId -> answer)

#### Redux Integration

- Uses `useDispatch` to dispatch actions to the quiz store
- Dispatches `addQuiz` action when quiz data is loaded
- Dispatches `fetchData` action to update dashboard stats after submission

### Key Functions

#### `useEffect` (Quiz Loading)

```javascript
useEffect(() => {
  const quizId = window.location.pathname.split('/')[2]
  apiClient
    .get(apiSpec.QUIZ_SERVICE + `/start/${quizId}`)
    .then(response => {
      setQuiz(response.data)
      dispatch(addQuiz(response.data))
      setLoading(false)
    })
    .catch(error => {
      console.log(error)
    })
}, [])
```

- Extracts quiz ID from URL path
- Makes API call to start/load quiz
- Updates local state and Redux store
- **Issue**: Missing dispatch dependency in dependency array

#### `useEffect` (Quiz Submission)

```javascript
useEffect(() => {
  if (completed) {
    setLoadingButton(true)

    let body = {
      quizStudentId: window.location.pathname.split('/')[2],
      submitedQuestionAnswers: getSubmitedQuestionAnswers()
    }

    if (body.submitedQuestionAnswers.length < quiz.questions.length && !timeFinished) {
      setLoadingButton(false)
      setCompleted(false)
      toast.error('Nu ai raspuns la toate intrebarile')
      return
    }

    apiClient.post(apiSpec.QUIZ_SERVICE + `/submit`, body).then(response => {
      console.log(response)
      setLoadingButton(false)
      setResultSet(response.data)
      setViewResults(true)
      dispatch(fetchData())
    })
  }
}, [completed])
```

- Triggers when `completed` state changes to true
- Validates that all questions are answered (unless time finished)
- Submits quiz answers to backend
- Updates UI to show results
- **Issues**: Missing dependencies in dependency array, misspelled "submited"

#### `getSubmitedQuestionAnswers()`

```javascript
const getSubmitedQuestionAnswers = () => {
  let submitedQuestionAnswers = []
  if (answersMap.size <= 0) {
    return []
  }

  answersMap.forEach((value, key) => {
    if (!value) {
      return
    }
    submitedQuestionAnswers.push({
      questionId: key,
      answer: value.split('')[6] // Extracts answer number from "answer1", "answer2", etc.
    })
  })

  return submitedQuestionAnswers
}
```

- Converts answersMap to API-compatible format
- Extracts numeric answer from string format (e.g., "answer1" -> "1")
- **Issue**: Fragile string parsing logic

#### `handleStartTest()` (Unused)

- Function exists but is never called
- Appears to be leftover code

### UI Structure

#### Header Section

- Quiz title and description
- Results display (when viewing results)
- Countdown timer component

#### Questions Section

- Grid layout containing all quiz questions
- Each question rendered using RadioComponent

#### Footer Section

- Submit/Back button using SubmitComponent

### Access Control

```javascript
QuizAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}
```

## Component: CountdownTimer.js

### Purpose

Displays a circular countdown timer that automatically submits the quiz when time expires.

### Props

- `targetTimestamp`: End time of quiz (timestamp)
- `startTime`: Start time of quiz (timestamp)
- `size`: Size of the circular timer
- `setCompleted`: Function to mark quiz as completed
- `setTimeFinished`: Function to mark time as finished
- `completed`: Boolean indicating if quiz is completed
- `timeFinished`: Boolean indicating if time has expired
- `initialTimeRemaining`: Optional initial remaining time

### Key Logic

#### Time Calculation

```javascript
const startTime = props.startTime / 1000 // Convert to seconds
const endTime = props.targetTimestamp / 1000 // Convert to seconds

let remainingTime = 0
if (props.timeFinished || props.completed) {
  remainingTime = endTime - startTime
} else {
  remainingTime = endTime - startTime
}
```

- **Issue**: Logic is redundant - same calculation in both branches

#### Timer Display

```javascript
{
  ;({ remainingTime, color }) => {
    const hours = Math.floor(remainingTime / (60 * 60)) % 24
    const minutes = Math.floor(remainingTime / 60) % 60
    const seconds = Math.floor(remainingTime) % 60

    return (
      <div className='time-wrapper'>
        <div style={{ color }}>{hours} hours</div>
        <div style={{ color }}>{minutes} minutes</div>
        <div style={{ color }}>{seconds} seconds</div>
      </div>
    )
  }
}
```

#### Timer Completion

```javascript
onComplete={() => {
  props.setCompleted(true)
  props.setTimeFinished(true)
  return [false, 0] // Stop the timer
}}
```

### Styling

- Uses SVG linear gradient for timer colors
- Gradient from cyan (#00CFE8) to green (#28C76F)

## Component: RadioComponent.js (RedioComponent.js)

### Purpose

Renders individual quiz questions with multiple-choice answers and handles answer selection.

### Props

- `question`: Question object containing content and answer options
- `answersMap`: Map object for storing answers
- `setAnswersMap`: Function to update answers map
- `viewResults`: Boolean indicating if results should be shown
- `resultSet`: Object containing correct answers for result display

### State Management

- `option`: Currently selected answer option (default: 'answer0')
- `corectOption`: Correct answer option (when viewing results)

### Key Logic

#### Answer Selection

```javascript
const [option, setOption] = useState('answer0')

// Click handler for each option
onClick={() => {
  if (props.viewResults) {
    return
  }
  setOption('answer1') // or answer2, answer3, etc.
}}
```

#### Result Display Logic

```javascript
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
```

- Updates answersMap with current selection
- Finds correct answer when viewing results
- Dispatches to Redux store

### UI Structure

Each question is rendered as a Card with:

- Question content as header
- Five answer options (A, B, C, D, E) as clickable boxes
- Visual feedback for selected answers (blue border)
- Visual feedback for correct answers when viewing results (green border)

### Styling Logic

```javascript
// Selected answer styling
sx={option === 'answer1' ? { borderColor: '#00CFE8' } : {}}

// Correct answer styling (results view)
sx={corectOption === 'answer1' ? { borderColor: '#28C76F' } : {}}
```

### Access Control

```javascript
RadioComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}
```

## Component: SubmitComponent.js

### Purpose

Handles quiz submission with confirmation dialog and navigation after completion.

### Props

- `viewResults`: Boolean indicating if results are being viewed
- `setCompleted`: Function to mark quiz as completed
- `getSubmitedQuestionAnswers`: Function to get current answers
- `loadingButton`: Boolean for loading state (passed but unused in current implementation)

### State Management

- `dialogOpen`: Boolean controlling confirmation dialog visibility

### Key Functions

#### Dialog Management

```javascript
const handleOpenDialog = () => {
  setDialogOpen(true)
}

const handleCloseDialog = () => {
  setDialogOpen(false)
}
```

#### Quiz Submission

```javascript
const submitQuiz = () => {
  handleOpenDialog()
}

const handleConfirmation = () => {
  props.setCompleted(true)
  handleCloseDialog()
}
```

#### Unanswered Questions Count

```javascript
const getUnasweredQuestions = () => {
  let unasweredQuestions = 0
  let answersMap = props.getSubmitedQuestionAnswers()
  answersMap.forEach(question => {
    if (question.answer === undefined || question.answer === '0') {
      unasweredQuestions++
    }
  })
  return unasweredQuestions
}
```

- **Issue**: Function name misspelled ("Unaswered" should be "Unanswered")

### UI Logic

```javascript
if (props.viewResults) {
  return (
    <Button
      variant='contained'
      color='primary'
      size='large'
      onClick={() => {
        Router.push('/quizzes')
      }}
    >
      Înapoi
    </Button>
  )
}
```

- Shows "Back" button when viewing results
- Shows "Finalize Test" button during quiz

### Access Control

```javascript
SubmitComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}
```

## Component: DialogTransition.js

### Purpose

Displays a confirmation dialog before quiz submission with warning about unanswered questions.

### Props

- `open`: Boolean controlling dialog visibility
- `handleClose`: Function to close dialog
- `handleConfirm`: Function to confirm submission
- `getUnasweredQuestions`: Function to get count of unanswered questions

### Key Features

#### Transition Animation

```javascript
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})
```

#### Warning Logic

```javascript
{
  getUnasweredQuestions() > 0 && (
    <>
      <span style={{ fontWeight: 'bold', color: 'red' }}>
        !!!ATENȚIE!!!!
        <br />
        Aveți {getUnasweredQuestions()} întrebări fără răspuns.
      </span>
      <br />
      <br />
    </>
  )
}
```

#### Dialog Actions

- "Nu, revin la test" (No, return to test) - closes dialog
- "Da, trimit" (Yes, submit) - confirms submission

## Redux Store: quiz/index.js

### Purpose

Manages quiz-related state across the application.

### State Structure

```javascript
const initialState = {
  quiz: {}, // Current quiz data
  answers: new Map(), // User's answers
  newQuiz: {} // For quiz creation (not used in this flow)
}
```

### Actions

#### `addQuiz`

- Stores quiz data in Redux state
- Used when quiz is loaded

#### `updateAnswers`

- Updates the answers Map with new answer
- Called whenever user selects an answer

#### `resetQuiz`

- Resets quiz and answers to initial state

#### `updateNewQuiz` / `resetNewQuiz`

- For quiz creation functionality (not used in quiz-taking flow)

### Selectors

- `selectQuiz`: Gets current quiz data
- `selectAnswers`: Gets current answers map
- `selectNewQuiz`: Gets new quiz data

## Data Flow

### Quiz Loading Flow

1. Component mounts → Extract quiz ID from URL
2. API call to `/start/{quizId}` → Load quiz data
3. Update local state and Redux store
4. Render quiz with countdown timer

### Answer Selection Flow

1. User clicks answer option → Update local state in RadioComponent
2. useEffect triggers → Update answersMap in main component
3. Dispatch to Redux store → Update global answers state

### Quiz Submission Flow

1. User clicks submit → Open confirmation dialog
2. User confirms → Set completed = true
3. useEffect triggers → Validate answers and submit to API
4. API response → Update UI to show results

### Results Display Flow

1. After submission → Set viewResults = true
2. RadioComponent shows correct answers with green borders
3. SubmitComponent shows "Back" button instead of "Submit"

## API Integration

### Endpoints Used

- `GET /service3/quiz/start/{quizId}` - Load quiz data
- `POST /service3/quiz/submit` - Submit quiz answers

### Request/Response Formats

#### Quiz Start Response

```javascript
{
  id: "quiz-id",
  title: "Quiz Title",
  description: "Quiz Description",
  endTime: "2023-12-31T23:59:59Z",
  questions: [
    {
      id: "question-id",
      content: "Question text",
      answer1: "Option A",
      answer2: "Option B",
      answer3: "Option C",
      answer4: "Option D",
      answer5: "Option E"
    }
  ]
}
```

#### Quiz Submit Request

```javascript
{
  quizStudentId: "quiz-id",
  submitedQuestionAnswers: [
    {
      questionId: "question-id",
      answer: "1" // Answer number (1-5)
    }
  ]
}
```

#### Quiz Submit Response

```javascript
{
  correctCount: 8,
  correctAnswers: [
    {
      questionId: "question-id",
      answer: "2" // Correct answer number
    }
  ]
}
```

## Potential Bugs and Issues

### Critical Issues

1. **React Hook Dependencies Missing**

   - Location: Main component useEffect hooks
   - Issue: Missing dependencies in dependency arrays causing potential stale closures
   - Impact: Could lead to incorrect behavior or infinite re-renders

2. **Fragile String Parsing**

   - Location: `getSubmitedQuestionAnswers()` function
   - Issue: `value.split('')[6]` assumes specific string format
   - Impact: Will break if answer format changes from "answer1" to different format

3. **Redundant Time Calculation**

   - Location: CountdownTimer component
   - Issue: Same calculation in both branches of conditional
   - Impact: Confusing logic, potential for bugs if one branch needs to change

4. **Unused State Variable**
   - Location: Main component `loadingButton`
   - Issue: Set but never used for UI feedback
   - Impact: Missing loading state feedback for users

### Medium Issues

5. **Spelling Errors Throughout Codebase**

   - "submited" should be "submitted"
   - "Redio" should be "Radio"
   - "Unaswered" should be "Unanswered"
   - "corect" should be "correct"

6. **Unused Imports**

   - Multiple unused Material-UI components imported
   - `StyledBox` component defined but never used
   - `handleStartTest` function defined but never called

7. **Inconsistent Error Handling**

   - Location: Quiz loading API call
   - Issue: Only logs error to console, no user feedback
   - Impact: Users won't know if quiz failed to load

8. **Hard-coded Answer Options**
   - Location: RadioComponent
   - Issue: Always shows 5 answer options regardless of actual question structure
   - Impact: May show empty options or miss options if question has different structure

### Minor Issues

9. **Mixed Languages in UI**

   - Romanian text mixed with English variable names
   - Could cause confusion for international developers

10. **No Loading State for Submit Button**

    - `loadingButton` state exists but isn't used in UI
    - Users get no feedback during submission

11. **Potential Memory Leaks**

    - No cleanup in useEffect hooks
    - Could cause issues if component unmounts during API calls

12. **Accessibility Issues**

    - Missing ARIA labels for quiz questions
    - No keyboard navigation support for answer selection
    - Color-only indication for correct/selected answers

13. **No Error Boundaries**

    - If any component crashes, entire quiz could become unusable
    - No graceful error handling for component failures

14. **Hardcoded Colors**

    - Colors are hardcoded instead of using theme variables
    - Makes theming and customization difficult

15. **No Validation for Quiz Data**
    - No checks if quiz data is valid before rendering
    - Could crash if API returns unexpected data structure

### Recommendations for Fixes

1. **Fix React Hook Dependencies**: Add all dependencies to useEffect dependency arrays
2. **Improve String Parsing**: Use more robust method to extract answer numbers
3. **Add Error Boundaries**: Wrap components in error boundaries for better error handling
4. **Implement Loading States**: Use the `loadingButton` state for better UX
5. **Add Input Validation**: Validate API responses before using data
6. **Fix Spelling**: Correct all misspelled words throughout codebase
7. **Remove Unused Code**: Clean up unused imports and functions
8. **Add Accessibility**: Implement proper ARIA labels and keyboard navigation
9. **Use Theme Colors**: Replace hardcoded colors with theme variables
10. **Add Error Feedback**: Show user-friendly error messages instead of just console logs
