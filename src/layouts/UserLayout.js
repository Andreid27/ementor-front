import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch } from 'react-redux';

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout';

// ** Navigation Imports
import VerticalNavItems from 'src/navigation/vertical';
import HorizontalNavItems from 'src/navigation/horizontal';

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems';
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems';

import VerticalAppBarContent from './components/vertical/AppBarContent';
import HorizontalAppBarContent from './components/horizontal/AppBarContent';

// ** Wallet Warning Components (student only)
import StudentWalletWarningBanner from 'src/components/wallet/StudentWalletWarningBanner';
import StudentWalletWarningModal from 'src/components/wallet/StudentWalletWarningModal';
import { fetchWalletBalance } from 'src/store/apps/wallet';

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings';
import { useAppBar } from 'src/context/AppBarContext';
import { useAuth } from 'src/hooks/useAuth';

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings();
  const { clearComponents } = useAppBar();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    const handleRouteChange = () => {
      clearComponents();
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, clearComponents]);

  // Fetch wallet balance on mount for students
  useEffect(() => {
    if (isStudent) {
      dispatch(fetchWalletBalance());
    }
  }, [isStudent, dispatch]);

  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical';
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: VerticalNavItems(),
        },
        appBar: {
          content: (props) => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          ),
        },
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            navItems: HorizontalNavItems(),
          },
          appBar: {
            content: () => <HorizontalAppBarContent hidden={hidden} settings={settings} saveSettings={saveSettings} />,
          },
        },
      })}
    >
      {isStudent && <StudentWalletWarningBanner />}
      {children}
      {isStudent && <StudentWalletWarningModal />}
    </Layout>
  );
};

export default UserLayout;
