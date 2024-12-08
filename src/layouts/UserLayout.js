import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';

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

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings';
import { useAppBar } from 'src/context/AppBarContext';

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings();
  const { clearComponents } = useAppBar();
  const router = useRouter();
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  useEffect(() => {
    const handleRouteChange = () => {
      clearComponents();
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events, clearComponents]);

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
      {children}
    </Layout>
  );
};

export default UserLayout;
