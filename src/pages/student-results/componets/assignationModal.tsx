// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Button } from '@mui/material'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'

// ** Store Hooks
import { useMyRecurringSeries } from 'src/store/apps/calendar/hooks'

// ** Generic Assignment Modal
import GenericAssignmentModal from 'src/@core/components/assignment'
import type { EntityConfig, AssignmentConfig, AssignmentPayload } from 'src/@core/components/assignment'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types
interface QuizView {
  id: string
  title: string
  [key: string]: any
}

type AssignableQuiz = QuizView & { id: string }

/**
 * AssignationModal - Quiz assignment using GenericAssignmentModal
 *
 * This component uses the new GenericAssignmentModal with:
 * - List #1: Quizzes (entities)
 * - List #2: Users grouped by recurring series (fetched internally by GenericAssignmentModal)
 */
interface AssignationModalProps {
  onAssignSuccess?: () => void
}

const AssignationModal = (props: AssignationModalProps) => {
  // ========================================
  // STATE
  // ========================================

  const [quizzes, setQuizzes] = useState<AssignableQuiz[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // ========================================
  // HOOKS
  // ========================================

  // Fetch recurring series automatically
  const recurringSeries = useMyRecurringSeries()

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    fetchQuizzes()
  }, [])

  // ========================================
  // API CALLS
  // ========================================

  const fetchQuizzes = async () => {
    try {
      setLoading(true)

      const response = await apiClient.post(apiSpec.QUIZ_SERVICE + '/paginated', {
        filters: [],
        sorters: [
          { key: 'quizCreation', direction: 'DESC' },
          { key: 'title', direction: 'ASC' }
        ],
        page: 0,
        pageSize: 10000
      })

      // Filter to only include quizzes with an id (type guard)
      const validQuizzes = response.data.data.filter(
        (quiz: any): quiz is AssignableQuiz => quiz.id !== undefined && quiz.id !== null
      )

      setQuizzes(validQuizzes)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Eroare la încărcarea testelor')
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // CONFIGURATION
  // ========================================

  // Configure how entities (quizzes) are displayed in List #1
  const entityConfig: EntityConfig = {
    displayProperty: 'title',
    labelSingular: 'Test',
    labelPlural: 'Teste',
    searchPlaceholder: 'Caută teste...',
    chipColor: 'primary'
  }

  // Configure assignment-specific fields
  const assignmentConfig: AssignmentConfig = {
    fields: [
      {
        key: 'startAfter',
        type: 'datetime',
        label: 'Poate începe după:',
        required: true,
        defaultValue: new Date() // Defaults to current date/time (now)
      }
    ]
  }

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle quiz assignment
   * Creates assignment for each quiz-user combination
   */
  const handleAssign = async (assignment: AssignmentPayload<AssignableQuiz>) => {
    try {
      // Create assignment requests for each quiz-user combination
      const assignments = assignment.entities.flatMap(quiz =>
        assignment.users.map(user => ({
          quizId: quiz.id,
          userId: user.userId,
          startAfter: assignment.options.startAfter.toISOString()
        }))
      )

      // Send to API
      await apiClient.post(apiSpec.QUIZ_SERVICE + '/assign', assignments)

      toast.success('Testele au fost asignate cu succes!')

      // Trigger parent component's refresh callback
      if (props.onAssignSuccess) {
        props.onAssignSuccess()
      }
    } catch (error: any) {
      console.error('Assignment error:', error)
      throw error // Re-throw to let modal handle it
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <GenericAssignmentModal
      // List #1: Entities (Quizzes)
      entities={quizzes}
      entityConfig={entityConfig}
      // List #2: Users grouped by recurring series (fetched internally from store)
      recurringSeries={recurringSeries}
      // Assignment Configuration
      assignmentConfig={assignmentConfig}
      // Callbacks
      onAssign={handleAssign}
      // UI Configuration
      modalTitle='Asignează Teste'
      modalSize='md'
      confirmButtonText='Asignează'
      cancelButtonText='Anulează'
      // Trigger Button
      triggerButton={
        <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large'>
          Asignează un test
        </Button>
      }
    />
  )
}

export default AssignationModal
