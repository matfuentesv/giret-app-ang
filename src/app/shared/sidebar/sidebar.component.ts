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
    const clientId = '7nec8rbfm2j07ng6o9tvqhepda';
    const logoutUri = 'http://localhost:4200/home';
    const logoutUrl = `https://us-east-1w5fgnxuk2.auth.us-east-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&federated=1`;

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = logoutUrl;
  }





}
