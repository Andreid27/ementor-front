// ** React Imports
import { useEffect, useState } from 'react'

// ** API Imports
import { profileServiceClient } from 'src/services'
import type { WalletSummaryDTO } from 'src/generated/profile-service'

export type MyWalletStatus = 'loading' | 'ready' | 'error'

/** True when there is nothing to list: no balance, no history, no transfer waiting for confirmation. */
export const isWalletEmpty = (summary: WalletSummaryDTO | null) =>
  Boolean(summary) &&
  !summary?.balanceChanges?.length &&
  !summary?.pendingBankTransferPayments?.length &&
  !summary?.wallet?.balance

/**
 * Loads the logged-in student's wallet once, so the dashboard can choose its
 * layout before the wallet card renders and hand the same data to it.
 */
const useMyWallet = (enabled: boolean) => {
  const [summary, setSummary] = useState<WalletSummaryDTO | null>(null)
  const [status, setStatus] = useState<MyWalletStatus>('loading')

  useEffect(() => {
    if (!enabled) return

    let active = true

    profileServiceClient.wallet
      .getMyBalanceHistory()
      .then(response => {
        if (!active) return
        setSummary(response.data)
        setStatus('ready')
      })
      .catch(error => {
        if (!active) return
        console.error('Failed to load the wallet:', error)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [enabled])

  return { summary, status }
}

export default useMyWallet
