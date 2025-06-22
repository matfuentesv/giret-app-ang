import {Component, OnInit} from '@angular/core';
import { Subscription } from 'rxjs';
import { CognitoService } from '../../auth/cognito.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{

userEmail: string | null = null;
  private userAttributesSubscription: Subscription | undefined;

  constructor(private cognitoService: CognitoService) {}

  ngOnInit(): void {
    // Aquí el cambio clave: la llamada a getUserAttributes() sigue siendo la misma,
    // pero internamente, el CognitoService ahora usa OidcSecurityService.
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        if (attributes) {
          this.userEmail = attributes['email']; // El email vendrá del payload del ID Token de OIDC
        } else {
          this.userEmail = null;
        }
      },
      error => {
        console.error('Error al obtener atributos del usuario en el componente:', error);
        this.userEmail = null;
      }
    );
  }


}
