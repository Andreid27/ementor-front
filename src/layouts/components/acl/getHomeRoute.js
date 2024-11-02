/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = user => {
  const role = user.role
  if (role === 'STUDENT') {
    return user.profileCompleted === false ? '/register/' : '/dashboards/analytics'
  } else if (role === 'PROFESSOR') return '/acl'
  else return '/dashboards/crm'
}

export default getHomeRoute
