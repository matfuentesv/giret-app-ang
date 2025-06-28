import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CrearPrestamoComponent } from '../crear-prestamo/crear-prestamo.component';

@Component({
  selector: 'app-prestamos',
  imports: [CommonModule,CrearPrestamoComponent],
  templateUrl: './prestamos.component.html',
  styleUrl: './prestamos.component.css'
})
export class PrestamosComponent {

}
