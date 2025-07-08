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
  const clientId = '3u0lfg3m1oqkd2802i1ktkf7jd';
  const logoutUri = 'https://giret-app-ang.fly.dev/home';
  const logoutUrl = `https://us-east-14aK8WcVnL.auth.us-east-1.amazoncognito.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&federated=1`;

  localStorage.clear();
  sessionStorage.clear();
  window.location.href = logoutUrl;
}





}
