
const notificationMapping = {
  'QuizStudent': {
    'STUDENT': '/quizzes',
    'PROFESSOR': '/all-quizzes',
    'ICON': 'solar:checklist-minimalistic-bold',
  },
  'LessonStudent': {
    'STUDENT': '/lesson',
    'PROFESSOR': '/student-lessons',
    'ICON': 'solar:book-minimalistic-bold',
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
