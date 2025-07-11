// auth.config.spec.ts
import { authConfig } from './auth.config';
import { OpenIdConfiguration } from 'angular-auth-oidc-client'; // Import the type

describe('authConfig', () => {
  let config: OpenIdConfiguration;

  beforeAll(() => {
   
    if (authConfig.config && !Array.isArray(authConfig.config)) {
      config = authConfig.config;
    } else {
    
      fail('authConfig.config is not a single OpenIdConfiguration object as expected.');
    }
  });


  it('should have a defined configuration', () => {
    expect(authConfig).toBeDefined();
    expect(authConfig.config).toBeDefined();
  });

  it('should have the correct authority', () => {
    expect(config.authority).toBe('https://cognito-idp.us-east-1.amazonaws.com/us-east-1_4aK8WcVnL');
  });

  it('should have the correct clientId', () => {
    expect(config.clientId).toBe('3u0lfg3m1oqkd2802i1ktkf7jd');
  });

  it('should have the correct scope', () => {
    expect(config.scope).toBe('openid email phone');
  });

  it('should have responseType set to "code"', () => {
    expect(config.responseType).toBe('code');
  });

  it('should have the correct redirectUrl', () => {
    expect(config.redirectUrl).toBe('https://giret-app-ang.fly.dev/dashboard');
  });

  it('should have the correct postLogoutRedirectUri', () => {
    expect(config.postLogoutRedirectUri).toBe('https://giret-app-ang.fly.dev/home');
  });

  it('should have silentRenew set to true', () => {
    expect(config.silentRenew).toBeTrue();
  });

  it('should have useRefreshToken set to true', () => {
    expect(config.useRefreshToken).toBeTrue();
  });

  it('should have renewTimeBeforeTokenExpiresInSeconds set to 30', () => {
    expect(config.renewTimeBeforeTokenExpiresInSeconds).toBe(30);
  });

  it('should have customParamsAuthRequest with lang: "es"', () => {
    expect(config.customParamsAuthRequest).toEqual({ lang: 'es' });
  });
});