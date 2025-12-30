/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = user => {
  // If profile is not completed OR user has no role, redirect to register page
  if (!user.profileCompleted || !user.role) {
    return '/register/'
  }

  // Profile is completed, route based on role
  const role = user.role
  if (role === 'STUDENT') {
    return '/dashboards/analytics'
  } else if (role === 'PROFESSOR') {
    return '/acl'
  } else {
    return '/dashboards/crm'
  }
}

export default getHomeRoute
