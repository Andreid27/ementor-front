// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import PaymentTimeline from './components/PaymentTimeline'
import { useSelector } from 'react-redux'
import { selectAllStudents } from 'src/store/apps/user'
import apiClient from 'src/@core/axios/axiosEmentor'
import { profileServiceClient } from 'src/generated/profile-service-client'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import { BankTransferPaymentDTO } from 'src/generated/profile-service'

// Define a user interface that matches the actual user data structure
interface User {
  id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
}

interface EnhancedPaymentData extends BankTransferPaymentDTO {
  avatar?: string | null
  payerName?: string
}

const PaymentACLPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(useSelector(selectAllStudents))
  const [loading, setLoading] = useState<boolean>(true)
  const [paymentsData, setPaymentsData] = useState<EnhancedPaymentData[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const userServiceResponse = await apiClient.get('service3/users/role/STUDENT')
      const paymentServiceResponse = await profileServiceClient.adminPayment.getAllPendingPayments()

      setUsers(userServiceResponse.data)

      const processedData = await processPaymentData(paymentServiceResponse.data || [], userServiceResponse.data)
      setPaymentsData(processedData)
    } catch (error) {
      console.error('Failed to fetch payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const processPaymentData = async (
    payments: BankTransferPaymentDTO[],
    users: User[]
  ): Promise<EnhancedPaymentData[]> => {
    // Get unique user IDs from payments
    const userIds = payments.map(payment => payment.payerId).filter((id): id is string => Boolean(id))
    const uniqueUserIds = Array.from(new Set(userIds))

    // Process user profile pictures
    let processedUsersList: any[] = []
    for (const userId of uniqueUserIds) {
      const user = users.find(u => u.id === userId)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    // Download avatars
    const result = await Promise.all(
      processedUsersList.map(async profilePicture => {
        if (profilePicture.type === 'API') {
          const avatar = await profilePictureDownloader(profilePicture.url, profilePicture.userId)
          return { ...profilePicture, avatar: avatar || null }
        } else if (profilePicture.type === 'EXTERNAL') {
          return { ...profilePicture, avatar: profilePicture.url }
        } else {
          return { ...profilePicture, avatar: null }
        }
      })
    )

    // Enhance payments with avatar data
    return payments.map(payment => {
      const user = result.find(u => u.userId === payment.payerId)
      return { ...payment, avatar: user?.avatar || null }
    })
  }

  const handlePaymentConfirmed = () => {
    // Refresh the data when a payment is confirmed
    fetchData()
  }

  return (
    <Grid container spacing={6}>
      <Grid item md={6} xs={12}>
        <PaymentTimeline
          paymentsData={paymentsData}
          users={users}
          loading={loading}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      </Grid>
    </Grid>
  )
}

PaymentACLPage.acl = {
  action: 'read',
  subject: 'payment-acl-page'
}

export default PaymentACLPage
