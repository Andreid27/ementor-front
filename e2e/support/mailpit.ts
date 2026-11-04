/**
 * Mailpit catches the emails the local Keycloak sends.
 */
import { MAILPIT_URL } from './stack'

/** The link in the verification email Keycloak sent to this address. */
export const verificationLink = async (email: string, timeoutMs = 30_000): Promise<string> => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const list = await (await fetch(`${MAILPIT_URL}/api/v1/messages?limit=500`)).json()
    const message = list.messages.find((m: any) =>
      m.To.some((to: { Address: string }) => to.Address.toLowerCase() === email.toLowerCase())
    )
    if (message) {
      const full = await (await fetch(`${MAILPIT_URL}/api/v1/message/${message.ID}`)).json()
      const link = full.Text.match(/https?:\/\/\S+action-token\S+/)?.[0]
      if (link) return link
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  throw new Error(`No verification email reached Mailpit for ${email}`)
}
