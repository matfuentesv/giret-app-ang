import { PassedInitialConfig } from 'angular-auth-oidc-client';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://us-east-1-9tsb64erp.auth.us-east-1.amazoncognito.com',
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    clientId: '3tspci7ln4fgtdhincrulufljh',  // <- Reemplaza con el real
    scope: 'openid profile email',  // <- Puedes agregar más scopes si lo necesitas
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
  }
}
