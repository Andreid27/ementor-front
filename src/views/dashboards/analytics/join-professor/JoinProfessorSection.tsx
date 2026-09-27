// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Third Party Imports
import { AnimatePresence, motion } from 'framer-motion'

// ** Local Imports
import JoinProfessorCard from './JoinProfessorCard'
import useMyProfessors from './useMyProfessors'

const MotionGrid = motion.create(Grid)

interface JoinProfessorSectionProps {
  isStudent: boolean
}

/**
 * Dashboard slot for the "join your professor" card. It shows only once
 * my-professors has answered with an empty list, and collapses away as soon as
 * the student has a professor. Kept as its own component so the fetch state
 * does not re-render the whole dashboard.
 */
const JoinProfessorSection = ({ isStudent }: JoinProfessorSectionProps) => {
  const { professors, status, refresh } = useMyProfessors(isStudent)

  const show = isStudent && status === 'ready' && professors.length === 0

  return (
    <AnimatePresence>
      {show && (
        <MotionGrid
          key='join-professor'
          item
          xs={12}
          style={{ overflow: 'hidden' }}
          exit={{ opacity: 0, height: 0, paddingTop: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
        >
          <JoinProfessorCard onJoined={refresh} />
        </MotionGrid>
      )}
    </AnimatePresence>
  )
}

export default JoinProfessorSection
