import {PassedInitialConfig} from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_4aK8WcVnL',
    clientId: '3u0lfg3m1oqkd2802i1ktkf7jd',
    scope: 'openid email phone',
    responseType: 'code',
    redirectUrl: 'http://localhost:4200/dashboard',
    postLogoutRedirectUri: 'http://localhost:4200/home',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    customParamsAuthRequest: {
      lang: 'es'
    }
  }
};

