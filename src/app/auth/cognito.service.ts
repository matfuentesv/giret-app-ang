// src/app/services/cognito.service.ts (MODIFICADO)
import { Injectable } from '@angular/core';
import { OidcSecurityService, UserDataResult } from 'angular-auth-oidc-client';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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