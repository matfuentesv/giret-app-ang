import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

/**
 * @fileoverview Este archivo define un `AuthGuard` para las rutas de Angular.
 * El propósito de este guard es proteger rutas específicas, asegurando que solo
 * los usuarios autenticados puedan acceder a ellas. Utiliza el `OidcSecurityService`
 * para verificar el estado de autenticación del usuario.
 */

/**
 * @description `AuthGuard` es una función `CanActivateFn` de Angular.
 * Se utiliza para determinar si una ruta puede ser activada.
 * Si el usuario no está autenticado, redirige a la página de inicio ('/')
 * y previene la activación de la ruta.
 * @returns {Observable<boolean | UrlTree>} Un observable que emite `true` si el usuario está autenticado
 * y la ruta puede ser activada, o `false` y una redirección si no lo está.
 */
export const AuthGuard: CanActivateFn = () => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return oidcSecurityService.isAuthenticated$.pipe(
    map(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
