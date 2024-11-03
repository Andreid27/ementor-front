// ** Third Party Imports
import axios from 'axios'
import { useRouter } from 'next/router'

// ** Demo Components Imports
import UserViewPage from './components/UserViewPage'

const UserView = ({ invoiceData, tab, userId }) => {
  const router = useRouter()

  // Access `tab` and `userId` from props or router query for client-side routing
  const currentTab = tab || router.query.params?.[0]
  const currentUserId = userId || router.query.params?.[1]

  return <UserViewPage tab={currentTab} userId={currentUserId} invoiceData={invoiceData} />
}

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { params: ['account'] } },
      { params: { params: ['security'] } },
      { params: { params: ['billing-plan'] } },
      { params: { params: ['notification'] } },
      { params: { params: ['connection'] } }
    ],
    fallback: "blocking"  // Dynamically render pages if not pre-rendered
  }
}

export const getStaticProps = async ({ params }) => {
  // Destructure params, with fallback to [null, null] if not provided
  const [tab, userId] = params?.params || [null, null]

  const res = await axios.get('/apps/invoice/invoices')
  const invoiceData = res.data.allData

  return {
    props: {
      invoiceData,
      tab: tab || null,       // Ensure `tab` is defined or set to `null`
      userId: userId || null  // Ensure `userId` is defined or set to `null`
    }
  }
}

// ** Access Control Logic
UserView.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default UserView
