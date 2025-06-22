import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_w5FGnXUk2',
    clientId: '7nec8rbfm2j07ng6o9tvqhepda',
    scope: 'phone openid email',
    responseType: 'code',
    redirectUrl: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    customParamsAuthRequest: {
      lang: 'es'
    }
  }
}
