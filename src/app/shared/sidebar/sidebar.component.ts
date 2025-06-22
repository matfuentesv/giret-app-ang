import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {OidcSecurityService} from 'angular-auth-oidc-client';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  private readonly oidcSecurityService = inject(OidcSecurityService);
  constructor(private router: Router) {
  }

  logout(): void {
    this.oidcSecurityService.logoff().subscribe(() => {
      console.log('Cierre de sesión exitoso');
      this.router.navigate(['/']); // O donde quieras redirigir
    });}

}
