import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CrearPrestamoComponent } from '../crear-prestamo/crear-prestamo.component';
import { PrestamosService, Loan, Resource } from '../../services/prestamos.service'; // Importa PrestamosService e interfaces
import { FormsModule } from '@angular/forms'; // Importa FormsModule para ngModel

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, CrearPrestamoComponent, FormsModule], // Añade FormsModule a los imports
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css']
})
export class PrestamosComponent implements OnInit {

  loans: Loan[] = []; // Propiedad para almacenar los préstamos obtenidos
  filteredLoans: Loan[] = []; // Propiedad para almacenar los préstamos filtrados
  searchText: string = ''; // Propiedad para el texto de búsqueda del input
  selectedStatus: string = 'Filtrar por estado...'; // Propiedad para el estado seleccionado en el select

  constructor(private prestamosService: PrestamosService) { } // Inyecta PrestamosService

  ngOnInit(): void {
    this.getLoans(); // Obtiene los préstamos cuando el componente se inicializa
  }

  getLoans(): void {
    this.prestamosService.getLoans().subscribe( // Usa el método del servicio
      (data) => {
        this.loans = data; // Asigna los datos obtenidos a la propiedad loans
        this.applyFilters(); // Aplica los filtros una vez que los datos se han cargado
        console.log('Préstamos obtenidos:', this.loans); // Para depuración
      },
      (error) => {
        console.error('Error al obtener préstamos:', error);
      }
    );
  }

  applyFilters(): void {
    let tempLoans = this.loans;

    // Filtro por texto de búsqueda (modelo del recurso o solicitante)
    if (this.searchText) {
      tempLoans = tempLoans.filter(loan =>
        (loan.resource?.modelo?.toLowerCase().includes(this.searchText.toLowerCase()) ||
         loan.solicitante.toLowerCase().includes(this.searchText.toLowerCase()))
      );
    }

    // Filtro por estado
    if (this.selectedStatus && this.selectedStatus !== 'Filtrar por estado...') {
      tempLoans = tempLoans.filter(loan =>
        loan.estado.toLowerCase() === this.selectedStatus.toLowerCase()
      );
    }

    this.filteredLoans = tempLoans; // Asigna la lista filtrada a filteredLoans
  }


  getBadgeClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'atrasado':
        return 'text-bg-danger';
      case 'activo':
        return 'text-bg-warning';
      case 'devuelto':
        return 'text-bg-secondary';
      default:
        return 'text-bg-info'; // Insignia por defecto para otros estados
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    // Asumiendo que dateString es 'YYYY-MM-DD'
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Manejar casos donde la fecha ya podría estar en 'DD/MM/AA' o similar
    return dateString;
  }

  
}