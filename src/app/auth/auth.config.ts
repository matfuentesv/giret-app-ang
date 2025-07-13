import {PassedInitialConfig} from 'angular-auth-oidc-client';

/**
 * @fileoverview Este archivo define la configuración inicial para el cliente OIDC (OpenID Connect)
 * utilizado en la aplicación Angular. Esta configuración es esencial para la comunicación
 * con el proveedor de identidad (en este caso, Amazon Cognito) y para gestionar el flujo de autenticación.
 */

/**
 * @description Configuración de autenticación para el cliente OIDC.
 * Define cómo la aplicación interactúa con el proveedor de identidad para la autenticación y autorización.
 * @type {PassedInitialConfig}
 */
export const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_4aK8WcVnL',
    clientId: '3u0lfg3m1oqkd2802i1ktkf7jd',
    scope: 'openid email phone',
    responseType: 'code',
    redirectUrl: 'https://giret-app-ang.fly.dev/dashboard',
    postLogoutRedirectUri: 'https://giret-app-ang.fly.dev/home',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    customParamsAuthRequest: {
      lang: 'es'
    }
  }
};

