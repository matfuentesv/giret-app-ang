import { Injectable } from '@angular/core';
import { OidcSecurityService, UserDataResult } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * @fileoverview Este servicio `CognitoService` interactúa con el `OidcSecurityService`
 * de `angular-auth-oidc-client` para proporcionar acceso a los atributos del usuario autenticado.
 * Está diseñado para abstraer la obtención de datos del usuario desde el flujo OIDC.
 */
@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  constructor(private oidcSecurityService: OidcSecurityService) {}

  // Este método se basa en el ID token que angular-auth-oidc-client ya tiene
  getUserAttributes(): Observable<{ [key: string]: string } | null> {
    return this.oidcSecurityService.userData$.pipe(
      map((userDataResult: UserDataResult) => {
        if (userDataResult.userData) {
          // El 'userData' ya contiene el payload del ID token
          return userDataResult.userData as { [key: string]: string };
        }
        return null;
      }),
      catchError((err) => {
        console.error('Error al obtener atributos del usuario desde oidcSecurityService:', err);
        return of(null);
      })
    );
  }

 
}