import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CrearPrestamoComponent } from '../crear-prestamo/crear-prestamo.component';
import { PrestamosService, Loan } from '../../services/prestamos.service'; 
import { FormsModule } from '@angular/forms'; // Importa FormsModule para ngModel

declare var bootstrap: any;

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
  isLoadingTable: boolean = false;

  @ViewChild(CrearPrestamoComponent) crearPrestamoComponent!: CrearPrestamoComponent;

  constructor(private prestamosService: PrestamosService) { } // Inyecta PrestamosService

  ngOnInit(): void {
    this.getLoans(); // Obtiene los préstamos cuando el componente se inicializa
    const crearPrestamoModal = document.getElementById('crearPrestamoModal');
    if (crearPrestamoModal) {
      crearPrestamoModal.addEventListener('hidden.bs.modal', this.onCrearPrestamoModalHidden.bind(this)); 
    }
  }

  getLoans(): void {
    this.isLoadingTable = true;
    this.prestamosService.getLoans().subscribe( // Usa el método del servicio
      (data) => {
        this.loans = data; // Asigna los datos obtenidos a la propiedad loans
        this.applyFilters(); // Aplica los filtros una vez que los datos se han cargado
        console.log('Préstamos obtenidos:', this.loans); 
         this.isLoadingTable = false;
      },
      (error) => {
        console.error('Error al obtener préstamos:', error);
         this.isLoadingTable = false;
      }
    );
  }

    /**
   * Aplica los filtros de búsqueda y estado a la lista de préstamos.
   */
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

  /**
   * Método para cerrar el modal de Bootstrap programáticamente.
   */
  closeCrearPrestamoModal(): void {
    const modalElement = document.getElementById('crearPrestamoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      // Asegurarse de que el backdrop se elimine si Bootstrap no lo hace automáticamente
      const body = document.body;
      if (body.classList.contains('modal-open')) {
          body.classList.remove('modal-open');
      }
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while (backdrops.length > 0) {
          backdrops[0].parentNode?.removeChild(backdrops[0]);
      }
    }
  }

  /**
   * Método que se ejecuta cuando se ha creado un nuevo préstamo desde el componente hijo.
   * Recarga la lista de préstamos y cierra el modal de creación.
   */
  onLoanCreated(): void {
    console.log('Evento loanCreated recibido. Recargando préstamos...');
    this.getLoans(); // Recargar la lista de préstamos
    this.closeCrearPrestamoModal(); // Cerrar el modal
  }

  

    /**
   * Registra la devolución de un préstamo.
   * @param loanId El ID del préstamo a registrar como devuelto.
   */
  registerReturn(loanId: number | undefined): void {
    if (loanId === undefined) {
      console.error('ID del préstamo no definido para la devolución.');
      alert('Error: No se pudo registrar la devolución. ID del préstamo no disponible.');
      return;
    }

    const loanToUpdate = this.loans.find(loan => loan.idPrestamo === loanId);

    if (!loanToUpdate) {
      console.error('Préstamo no encontrado en la lista para el ID:', loanId);
      alert('Error: No se encontró el préstamo para registrar la devolución.');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres registrar este préstamo como devuelto?')) {
      return; 
    }

    this.prestamosService.updateLoanState(loanId, loanToUpdate.recursoId, 'devuelto').subscribe({
      next: (success: boolean) => { 
        if (success) {
          console.log('Préstamo actualizado a devuelto con éxito.');
          alert('Préstamo registrado como devuelto con éxito!');
          this.getLoans(); 
        } else {
          console.warn('La actualización del préstamo no fue exitosa (el backend devolvió false).');
          alert('Hubo un problema al registrar la devolución. Intente de nuevo.');
        }
      },
      error: (error) => {
        console.error('Error al registrar la devolución del préstamo:', error);
        alert('Hubo un error al registrar la devolución. Por favor, revisa la consola.');
      }
    });
  }

  /**
   * Método para llamar al resetForm del componente hijo CrearPrestamoComponent
   * cuando el modal de crear préstamo se cierra.
   */
  onCrearPrestamoModalHidden(): void {
    if (this.crearPrestamoComponent) {
      this.crearPrestamoComponent.resetForm(); // **Llama al método resetForm del componente hijo**
    }
  }
}