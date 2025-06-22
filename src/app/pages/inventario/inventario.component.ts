import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {

  userEmail: string | null = null;
  private userAttributesSubscription: Subscription | undefined;

  constructor(private cognitoService: CognitoService) {}

  ngOnInit(): void {
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        if (attributes) {
          this.userEmail = attributes['email'];
        } else {
          this.userEmail = null;
        }
      },
      error => {
        console.error('Error al obtener atributos del usuario en InventarioComponent:', error);
        this.userEmail = null;
      }
    );
  }
}
