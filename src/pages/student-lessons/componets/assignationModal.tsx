// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import { Button, LinearProgress } from '@mui/material'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import lessonServiceClient, { PaginatedRequest } from 'src/generated/lesson-service-client'

// ** Type Imports
import type { UserDTO } from 'src/generated/profile-service/api'
import type { LessonView } from 'src/generated/lesson-service/api'

// ** Store Hooks
import { useMyRecurringSeries } from 'src/store/apps/calendar/hooks'

// ** Generic Assignment Modal
import GenericAssignmentModal from 'src/@core/components/assignment'
import type { EntityConfig, AssignmentConfig, AssignmentPayload } from 'src/@core/components/assignment'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Types
// Extend LessonView to ensure id is required for assignment
type AssignableLesson = LessonView & { id: string }

/**
 * AssignationModal - Lesson assignment using GenericAssignmentModal
 *
 * This component uses the new GenericAssignmentModal with:
 * - List #1: Lessons (entities)
 * - List #2: Users grouped by recurring series
 */
interface AssignationModalProps {
  users: UserDTO[]
  onAssignSuccess?: () => void
}

const AssignationModal = (props: AssignationModalProps) => {
  // ========================================
  // STATE
  // ========================================

  const [lessons, setLessons] = useState<AssignableLesson[]>([])
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
    fetchLessons()
  }, [])

  // ========================================
  // API CALLS
  // ========================================

  const fetchLessons = async () => {
    try {
      setLoading(true)

      const paginatedRequest: PaginatedRequest = {
        filters: [],
        sorters: [
          { key: 'creation', direction: 'DESC' },
          { key: 'title', direction: 'ASC' }
        ],
        page: 0,
        pageSize: 10000
      }

      const response = await lessonServiceClient.lessons.getPaginated({
        paginatedRequest
      })

      // Filter to only include lessons with an id (type guard)
      const validLessons = response.data.data.filter(
        (lesson): lesson is AssignableLesson => lesson.id !== undefined && lesson.id !== null
      )

      setLessons(validLessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      toast.error('Eroare la încărcarea lecțiilor')
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // CONFIGURATION
  // ========================================

  // Configure how entities (lessons) are displayed in List #1
  const entityConfig: EntityConfig = {
    displayProperty: 'title',
    labelSingular: 'Lecție',
    labelPlural: 'Lecții',
    searchPlaceholder: 'Caută lecții...',
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
      },
      {
        key: 'isVisible',
        type: 'boolean',
        label: 'Este vizibilă?',
        defaultValue: true // Changed from false to true
      }
    ]
  }

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle lesson assignment
   * Creates assignment for each lesson-user combination
   */
  const handleAssign = async (assignment: AssignmentPayload<AssignableLesson>) => {
    try {
      // Create assignment requests for each lesson-user combination
      const assignments = assignment.entities.flatMap(lesson =>
        assignment.users.map(user => ({
          lessonId: lesson.id,
          userId: user.userId,
          startAfter: assignment.options.startAfter.toISOString(),
          isVisible: assignment.options.isVisible
        }))
      )

      // Send to API
      await apiClient.post(apiSpec.LESSON_SERVICE + '/lesson/assign', assignments)

      toast.success('Lecțiile au fost asignate cu succes!')

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

  if (loading) {
    return <LinearProgress />
  }

  return (
    <GenericAssignmentModal
      // List #1: Entities (Lessons)
      entities={lessons}
      entityConfig={entityConfig}
      // List #2: Users grouped by recurring series
      users={props.users}
      recurringSeries={recurringSeries}
      // Assignment Configuration
      assignmentConfig={assignmentConfig}
      // Callbacks
      onAssign={handleAssign}
      // UI Configuration
      modalTitle='Asignează Lecții'
      modalSize='md'
      confirmButtonText='Asignează'
      cancelButtonText='Anulează'
      // Trigger Button
      triggerButton={
        <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large'>
          Asignează o lecție
        </Button>
      }
    />
  )
}

export default AssignationModal
