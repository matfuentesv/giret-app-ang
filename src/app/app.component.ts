import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './shared/footer/footer.component';
import {HeaderComponent} from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {OidcSecurityService} from 'angular-auth-oidc-client';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FooterComponent,SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
   title = 'giret-app-ang';
  private readonly oidcSecurityService = inject(OidcSecurityService);
  protected readonly router = inject(Router);

  constructor() {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        // Si está autenticado, navega directamente al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Si no está autenticado y no está en la ruta 'home' (o si 'home' no requiere AuthGuard),
        // asegúrate de que el usuario sea dirigido a 'home' o a la página de login.
        // Aquí no necesitamos una acción explícita si la ruta por defecto ya es 'home'
        // y no estás en /dashboard
        if (this.router.url === '/') { // Si la URL es la raíz y no está autenticado, redirige a home
           this.router.navigate(['/home']);
        }
      }
    });
  }
}
