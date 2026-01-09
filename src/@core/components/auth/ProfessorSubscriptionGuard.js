// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSubscriptionStatus,
  selectHasActiveSubscription,
  selectSubscriptionLoading,
  selectSubscriptionError,
  selectIsSubscriptionCacheValid
} from 'src/store/apps/user'

// ** Component Import
import Spinner from 'src/@core/components/spinner'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

/**
 * ProfessorSubscriptionGuard
 *
 * This guard component checks if a professor has an active subscription.
 * - Only applies to PROFESSOR role users with completed profiles
 * - Uses 2-hour caching for subscription status
 * - Redirects to /subscription-required if no active subscription
 * - On API errors, allows user to proceed with a warning (already shown in thunk)
 */
const ProfessorSubscriptionGuard = ({ children }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useAuth()

  // Redux selectors
  const hasActiveSubscription = useSelector(selectHasActiveSubscription)
  const subscriptionLoading = useSelector(selectSubscriptionLoading)
  const subscriptionError = useSelector(selectSubscriptionError)
  const isCacheValid = useSelector(selectIsSubscriptionCacheValid)

  // Local state to track if we've checked subscription
  const [hasChecked, setHasChecked] = useState(false)

  // Check if this guard should be active
  const isProfessorWithProfile = auth.user?.role === 'PROFESSOR' && auth.user?.profileCompleted

  useEffect(() => {
    // Only check subscription for professors with completed profiles
    if (!isProfessorWithProfile) {
      setHasChecked(true)
      return
    }

    // If cache is valid and we have an active subscription, no need to refetch
    if (isCacheValid && hasActiveSubscription) {
      setHasChecked(true)
      return
    }

    // Fetch subscription status
    const checkSubscription = async () => {
      try {
        await dispatch(fetchSubscriptionStatus()).unwrap()
      } catch (error) {
        // Error is handled in the thunk (shows warning toast)
        // Continue to let user proceed
        console.warn('Subscription check failed, proceeding with warning:', error)
      }
      setHasChecked(true)
    }

    checkSubscription()
  }, [dispatch, isProfessorWithProfile, isCacheValid, hasActiveSubscription])

  // Effect to redirect when subscription check completes and user has no active subscription
  useEffect(() => {
    if (!hasChecked || subscriptionLoading) return
    if (!isProfessorWithProfile) return

    // If there was an error, allow user to proceed (per user request)
    if (subscriptionError) {
      return
    }

    // If no active subscription, redirect to subscription-required page
    // But don't redirect if we're already on that page
    if (!hasActiveSubscription && router.pathname !== '/subscription-required') {
      router.replace('/subscription-required')
    }
  }, [hasChecked, subscriptionLoading, hasActiveSubscription, subscriptionError, isProfessorWithProfile, router])

  // Show spinner while loading
  if (isProfessorWithProfile && (subscriptionLoading || !hasChecked)) {
    return <Spinner />
  }

  // If no active subscription and no error, don't render children (will redirect)
  if (
    isProfessorWithProfile &&
    !hasActiveSubscription &&
    !subscriptionError &&
    router.pathname !== '/subscription-required'
  ) {
    return <Spinner />
  }

  // Render children
  return <>{children}</>
}

export default ProfessorSubscriptionGuard
