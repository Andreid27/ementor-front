
const notificationMapping = {
  'QuizStudent': {
    'STUDENT': '/quizzes',
    'teacher': '/review-attempt',
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
