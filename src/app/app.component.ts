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
        // Si esta autenticado, navega directamente al dashboard
        this.router.navigate(['/dashboard']);
      } else {
        if (this.router.url === '/') { 
           this.router.navigate(['/home']);
        }
      }
    });
  }
}
