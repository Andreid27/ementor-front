
const notificationMapping = {
  'QuizStudent': {
    'STUDENT': '/quizzes',
    'PROFESSOR': 'NO_REDIRECT',
    'ICON': 'solar:checklist-minimalistic-bold',
  },
  'NEW_ASSIGNMENT': {
    'student': '/assignments',
    'teacher': '/assignments'
  },
  'GRADE_POSTED': {
    'student': '/grades',
    'teacher': '/grades'
  },

};

export default notificationMapping;
