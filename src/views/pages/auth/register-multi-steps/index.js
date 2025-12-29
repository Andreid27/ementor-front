// ** React Imports
import { useState } from 'react'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Step Components
import StepRoleSelection from 'src/views/pages/auth/register-multi-steps/StepRoleSelection'
import StudentWizard from 'src/views/pages/auth/register-multi-steps/StudentWizard'
import ProfessorWizard from 'src/views/pages/auth/register-multi-steps/ProfessorWizard'

const RegisterMultiSteps = () => {
  // ** States
  const [selectedRole, setSelectedRole] = useState(null)
  const [showRoleSelection, setShowRoleSelection] = useState(true)

  const handleRoleSelect = role => {
    setSelectedRole(role)
    setShowRoleSelection(false)
  }

  const handleBackToRoleSelection = () => {
    setShowRoleSelection(true)
    setSelectedRole(null)
  }

  return (
    <StepperWrapper sx={{ mb: 11.5 }}>
      {showRoleSelection ? (
        <StepRoleSelection selectedRole={selectedRole} onSelectRole={handleRoleSelect} />
      ) : selectedRole === 'student' ? (
        <StudentWizard onBack={handleBackToRoleSelection} />
      ) : (
        <ProfessorWizard onBack={handleBackToRoleSelection} />
      )}
    </StepperWrapper>
  )
}

export default RegisterMultiSteps
