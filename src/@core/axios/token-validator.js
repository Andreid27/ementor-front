// token-validator.js
import jwt_decode from 'jwt-decode';
import store from '../../store/index';
import axios from 'axios';
import * as apiSpec from '../../apiSpec';
import { deleteTokens, deleteUser, updateTokens } from 'src/store/apps/user';
import authConfig from 'src/configs/auth';

const querystring = require('querystring');

// Global token refresh promise
let refreshTokenPromise = null;

export const verifyToken = async token => {
  let decodedToken = jwt_decode(token);
  let currentDate = new Date();

  const handleLogoutHere = () => {
    store.dispatch(deleteUser());
    store.dispatch(deleteTokens());
    window.localStorage.removeItem('userData');
    window.localStorage.removeItem(authConfig.storageTokenKeyName);
    window.location.replace('/login');
  };

  if (decodedToken.exp * 1000 < currentDate.getTime() + 60) {
    if (!refreshTokenPromise) {
      refreshTokenPromise = new Promise(async (resolve, reject) => {
        try {
          const accessTokenParams = {
            grant_type: 'refresh_token',
            client_id: authConfig.clientId,
            refresh_token: getRefreshToken(),
          };

          const response = await axios.post(authConfig.loginEndpoint, querystring.stringify(accessTokenParams), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.access_token);

          // Update Redux store with new tokens
          store.dispatch(
            updateTokens({
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
              sessionState: response.data.session_state
            })
          ).then(() => {
            refreshTokenPromise = null;
            resolve(response.data.access_token);
          }).catch((dispatchError) => {
            refreshTokenPromise = null;
            reject(dispatchError);
          });

        } catch (error) {
          refreshTokenPromise = null;
          handleLogoutHere();
          reject(error);
        }
      });
    }

    return refreshTokenPromise; // Return the global refresh token promise
  } else {
    return token; // If the token is valid, return the current token
  }
};

function getRefreshToken() {
  const state = store.getState();

  return state.user.tokens.refreshToken;
}

export default verifyToken;
