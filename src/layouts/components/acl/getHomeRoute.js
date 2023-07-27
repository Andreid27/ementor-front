/**
 *  Set Home URL based on User Roles
 */
const getHomeRoute = role => {
  if (role === 'STUDENT') return '/dashboards/analytics'
  else return '/dashboards/crm'
}

export default getHomeRoute
