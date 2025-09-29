// Payment Service - Handles payment related operations
import { profileServiceClient } from '../generated/profile-service-client'
import type { GenerateReferenceRequest, PaymentReferenceDTO, BankAccountDTO } from '../generated/profile-service'

export class PaymentService {
  /**
   * Generate payment reference code
   */
  static async generatePaymentReference(request: GenerateReferenceRequest): Promise<PaymentReferenceDTO | null> {
    try {
      const response = await profileServiceClient.payment.generateReference({
        generateReferenceRequest: request
      })

      return response.data
    } catch (error) {
      console.error('Failed to generate payment reference:', error)
      return null
    }
  }

  /**
   * Get available bank accounts for a professor
   */
  static async getProfessorBankAccounts(professorId: string): Promise<BankAccountDTO[]> {
    try {
      const response = await profileServiceClient.bankAccount.getBankAccountsForProfessor({
        professorId
      })

      return response.data || []
    } catch (error) {
      console.error('Failed to fetch professor bank accounts:', error)
      return []
    }
  }

  /**
   * Validate payment amount based on wallet balance
   */
  static validatePaymentAmount(amount: number, walletBalance?: number): { isValid: boolean; message?: string } {
    if (amount <= 0) {
      return { isValid: false, message: 'Suma trebuie să fie pozitivă' }
    }

    if (amount < 1) {
      return { isValid: false, message: 'Suma minimă este 1 RON' }
    }

    if (walletBalance !== undefined && walletBalance > 0) {
      return {
        isValid: false,
        message: `Nu puteți efectua plăți dacă aveți un sold pozitiv în cont (${walletBalance} RON)`
      }
    }

    return { isValid: true }
  }

  /**
   * Get suggested payment amount based on wallet state
   */
  static getSuggestedPaymentAmount(walletBalance?: number, lastPaymentAmount?: number): number {
    if (walletBalance === undefined) return 0

    if (walletBalance < 0) {
      // User owes money, suggest the debt amount
      return Math.abs(walletBalance)
    }

    // If balance is 0, suggest last payment amount or default
    if (walletBalance === 0) {
      return lastPaymentAmount || 100 // Default to 100 RON
    }

    return 0
  }

  /**
   * Format bank account display
   */
  static formatBankAccount(account: BankAccountDTO): string {
    return `${account.bankName} - ${account.iban}`
  }

  /**
   * Check if user can make payments
   */
  static canMakePayment(walletBalance?: number): boolean {
    if (walletBalance === undefined) return true
    return walletBalance <= 0
  }
}

export default PaymentService
