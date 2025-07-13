import {Component, inject, OnInit} from '@angular/core';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {NgIf} from '@angular/common';

/**
 * @fileoverview Este componente `HomeComponent` sirve como la página de inicio de la aplicación.
 * Gestiona el estado de autenticación del usuario utilizando `angular-auth-oidc-client`
 * y proporciona funcionalidades para iniciar sesión y cerrar sesión.
 */
@Component({
  selector: 'app-home',
  imports: [
    NgIf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  /**
   * @description Servicio de seguridad OIDC inyectado para manejar la autenticación.
   * Utiliza la función `inject` para obtener una instancia del servicio.
   * @private
   * @type {OidcSecurityService}
   */
  private readonly oidcSecurityService = inject(OidcSecurityService);

  /**
   * @description Observable que proporciona la configuración actual de OIDC.
   * Puede ser utilizado para mostrar detalles de la configuración en la plantilla.
   * @type {Observable<OpenIdConfiguration | undefined>}
   */
  configuration$ = this.oidcSecurityService.getConfiguration();

  /**
   * @description Observable que emite los datos del usuario autenticado.
   * Contiene información como el nombre, email, etc., del usuario.
   * @type {Observable<UserData | undefined>}
   */
  userData$ = this.oidcSecurityService.userData$;

  /**
   * @description Bandera que indica si el usuario está autenticado.
   * Aunque no se actualiza directamente en `ngOnInit` en el código proporcionado,
   * se espera que se actualice a través de una suscripción al estado de autenticación
   * del `oidcSecurityService` en una implementación completa.
   * @type {boolean}
   */
  isAuthenticated = false;

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado.
   * @returns {void}
   */
  ngOnInit(): void {

  }

  /**
   * @description Inicia el flujo de autenticación OIDC.
   * Redirige al usuario al proveedor de identidad para iniciar sesión.
   * @returns {void}
   */
  login(): void {
    this.oidcSecurityService.authorize();
  }

  /**
   * @description Inicia el flujo de cierre de sesión OIDC.
   * Redirige al usuario al proveedor de identidad para cerrar la sesión y luego
   * lo redirige de vuelta a la aplicación.
   * @returns {void}
   */
  logout(): void {
    this.oidcSecurityService.logoff().subscribe((result) => {
      console.log('Logged out', result);
    });
  }
}
