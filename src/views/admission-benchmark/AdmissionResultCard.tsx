// ** Third Party Imports
import { useSelector } from 'react-redux'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import AdmissionResultForm, { StudentTarget } from './AdmissionResultForm'

interface AdmissionResultCardProps {
  studentId: string
  profile: StudentTarget
}

/** The admission result on the professor's view of one student. Professors and admins only. */
const AdmissionResultCard = ({ studentId, profile }: AdmissionResultCardProps) => {
  const role: string | undefined = useSelector(selectUser)?.role

  if (role !== 'PROFESSOR' && role !== 'ADMIN') return null

  return (
    <InsightCard
      title='Rezultat admitere'
      subtitle='Intră în linia celor admiși pe care o văd elevii în graficul de rezultate.'
    >
      <AdmissionResultForm studentId={studentId} profile={profile} />
    </InsightCard>
  )
}

export default AdmissionResultCard
