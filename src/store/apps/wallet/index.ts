import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { WalletDTO } from 'src/generated/profile-service'

// ---------- Types ----------

interface WalletState {
  balance: number | null
  currency: string | null
  loading: boolean
  error: string | null
}

interface RootState {
  wallet: WalletState
}

// ---------- Thunks ----------

/**
 * Fetches the current student's wallet via the generated profile-service client.
 * Uses dynamic import to avoid circular dependency issues (same pattern as user slice).
 */
export const fetchWalletBalance = createAsyncThunk<WalletDTO, void, { rejectValue: string }>(
  'wallet/fetchWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const { profileServiceClient } = await import('src/services')
      const response = await profileServiceClient.wallet.getMyWallet()

      return response.data
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch wallet balance'
      console.error('[wallet] Failed to fetch wallet:', error)

      return rejectWithValue(message)
    }
  }
)

// ---------- Slice ----------

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: null,
    currency: null,
    loading: false,
    error: null
  } as WalletState,
  reducers: {
    clearWallet(state) {
      state.balance = null
      state.currency = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchWalletBalance.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false
        state.balance = action.payload.balance ?? null
        state.currency = action.payload.currency ?? null
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Unknown error'
      })
  }
})

// ---------- Actions ----------

export const { clearWallet } = walletSlice.actions

// ---------- Selectors ----------

export const selectWalletBalance = (state: RootState) => state.wallet.balance

export const selectWalletCurrency = (state: RootState) => state.wallet.currency

export const selectWalletLoading = (state: RootState) => state.wallet.loading

export default walletSlice.reducer
