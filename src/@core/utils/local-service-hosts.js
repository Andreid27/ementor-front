/*
 * Local end-to-end testing: sends the profile and quiz services' calls to
 * copies running on this machine, while every other service and Keycloak stay
 * on NEXT_PUBLIC_PROD_HOST. Production's ingress strips the /service2 and
 * /service3 prefixes; the local services have none, so the prefix goes too:
 * https://api.e-mentor.ro/service2/admission-benchmark/me becomes
 * http://localhost:49202/admission-benchmark/me.
 *
 * Off unless NEXT_PUBLIC_PROFILE_SERVICE_HOST or NEXT_PUBLIC_QUIZ_SERVICE_HOST
 * is set, and only in development. It rewrites at the browser's network layer,
 * so every client is covered: the axios instances, the generated clients and
 * fetch.
 */
const prodHost = process.env.NEXT_PUBLIC_PROD_HOST

const routes = [
  ['/service2', process.env.NEXT_PUBLIC_PROFILE_SERVICE_HOST],
  ['/service3', process.env.NEXT_PUBLIC_QUIZ_SERVICE_HOST]
].filter(([, host]) => host)

const toLocal = url => {
  for (const [prefix, host] of routes) {
    const remote = `${prodHost}${prefix}`
    if (url === remote || url.startsWith(`${remote}/`) || url.startsWith(`${remote}?`)) {
      return host.replace(/\/$/, '') + url.slice(remote.length)
    }
  }

  return url
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && prodHost && routes.length) {
  const open = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    return open.call(this, method, toLocal(String(url)), ...rest)
  }

  const fetch = window.fetch
  window.fetch = (input, init) => {
    if (typeof input === 'string' || input instanceof URL) return fetch(toLocal(String(input)), init)

    const local = toLocal(input.url)

    return fetch(local === input.url ? input : new Request(local, input), init)
  }

  console.info('[local services]', Object.fromEntries(routes))
}
