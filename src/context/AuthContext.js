import { useEffect, useState, createContext } from 'react';
import { useRouter } from 'next/router';
import authConfig from 'src/configs/auth';
import { useDispatch, useSelector } from 'react-redux';
import { addUser, deleteTokens, deleteUser, updateTokens } from '../store/apps/user/index';
import { fetchData } from 'src/store/apps/dashboard';
import { useKeycloak } from '@react-keycloak/ssr';
import Cookies from 'universal-cookie';
import jwt from 'jsonwebtoken';

const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultProvider.user);
  const [loading, setLoading] = useState(defaultProvider.loading);
  const dispatch = useDispatch();
  const router = useRouter();
  const { keycloak, initialized } = useKeycloak();
  const cookies = new Cookies();

  // Extract necessary fields from the decoded token
  const extractUserData = (decodedToken) => ({
    email: decodedToken.email,
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name,
    role: decodedToken.realm_access.roles.includes('PROFESSOR') ? 'PROFESSOR' : 'STUDENT',
  });

  // Update user data and tokens
  const updateAuthData = (token) => {
    const parsedToken = jwt.decode(token);
    const extractedUserData = extractUserData(parsedToken);

    // Update cookies
    cookies.set('userData', JSON.stringify(extractedUserData), {
      path: '/',
      domain: '.e-mentor.ro',
      sameSite: 'None',
      secure: true,
    });
    cookies.set(authConfig.storageTokenKeyName, token, {
      path: '/',
      domain: '.e-mentor.ro',
      sameSite: 'None',
      secure: true,
    });

    // Update localStorage
    window.localStorage.setItem('userData', JSON.stringify(extractedUserData));
    window.localStorage.setItem(authConfig.storageTokenKeyName, token);

    // Update Redux store and state
    dispatch(updateTokens({ accessToken: token, refreshToken: keycloak.refreshToken }));
    dispatch(addUser(extractedUserData));
    setUser(extractedUserData);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (initialized) {
        if (keycloak.authenticated) {
          const token = keycloak.token;
          if (token) {
            updateAuthData(token);
            dispatch(fetchData());
          }
          setLoading(false);
        } else {
          keycloak.login();
        }
      }
    };

    initAuth();
  }, [initialized, keycloak, dispatch]);

  useEffect(() => {
    if (keycloak) {
      const onTokenRefresh = () => {
        if (keycloak.token) {
          updateAuthData(keycloak.token);
        }
      };

      // Listen for token refresh events
      keycloak.onAuthSuccess = onTokenRefresh;
      keycloak.onAuthRefreshError = onTokenRefresh;
    }
  }, [keycloak]);

  useEffect(() => {
    if (user) {
      const returnUrl = router.query.returnUrl || '/';
      router.replace(returnUrl);
    }
  }, [user]);

  const handleLogin = async () => {
    if (!keycloak.authenticated) {
      keycloak.login();
    }
  };

  const handleLogout = async () => {
    // Clear user data and tokens
    dispatch(deleteUser());
    dispatch(deleteTokens());
    setUser(null);

    // Remove cookies and localStorage
    cookies.remove('userData', {
      path: '/',
      domain: '.e-mentor.ro',
      sameSite: 'None',
      secure: true,
    });
    cookies.remove(authConfig.storageTokenKeyName, {
      path: '/',
      domain: '.e-mentor.ro',
      sameSite: 'None',
      secure: true,
    });
    window.localStorage.removeItem('userData');
    window.localStorage.removeItem(authConfig.storageTokenKeyName);

    // Logout from Keycloak
    keycloak.logout();
  };

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
