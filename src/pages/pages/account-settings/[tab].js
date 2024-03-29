// ** Third Party Imports
import axios from 'axios'

// ** Demo Components Imports
import AccountSettings from 'src/views/pages/account-settings/AccountSettings'

const AccountSettingsTab = ({ tab, apiPricingPlanData }) => {
  return <AccountSettings tab={tab} apiPricingPlanData={apiPricingPlanData} />
}

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'account' } },
      { params: { tab: 'security' } },

      // { params: { tab: 'billing' } }, TODO add when is needed, for now commented by me
      { params: { tab: 'notifications' } },
      { params: { tab: 'connections' } }
    ],
    fallback: false
  }
}

export const getStaticProps = async ({ params }) => {
  const res = await axios.get('/pages/pricing')
  const data = res.data

  return {
    props: {
      tab: params?.tab,
      apiPricingPlanData: data.pricingPlans
    }
  }
}

AccountSettingsTab.acl = {
  action: 'read',
  subject: 'common-view'
}

export default AccountSettingsTab
