/**
 * Student lookup for widgets that show students by id (payments, quiz activity, events, notifications).
 *
 * Returns a function from a student id to the student, covering active and inactive students. Ids the store
 * does not know yet are looked up in one batch, so students who left the class still show their name and photo.
 */
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMissingStudents, selectKnownStudents } from 'src/store/apps/user'

export const studentDisplayName = (student: any): string | null => {
  if (!student) return null

  const name = [student.firstName, student.lastName]
    .map((part: string | undefined) => part?.trim())
    .filter(Boolean)
    .join(' ')

  return name || student.studentName || student.email || null
}

export const useKnownStudents = (studentIds: Array<string | null | undefined>) => {
  const dispatch = useDispatch()
  const known = useSelector(selectKnownStudents)

  const ids = Array.from(new Set(studentIds.filter(Boolean) as string[])).sort()
  const idsKey = ids.join(',')
  const missingKey = ids.filter(id => !known[id]).join(',')

  useEffect(() => {
    if (missingKey) {
      // @ts-ignore - thunk dispatch typing
      dispatch(fetchMissingStudents(missingKey.split(',')))
    }
  }, [dispatch, idsKey, missingKey])

  return useCallback((studentId: string | null | undefined) => (studentId && known[studentId]) || null, [known])
}
