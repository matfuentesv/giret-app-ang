import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CrearPrestamoComponent } from '../crear-prestamo/crear-prestamo.component';
import { PrestamosService, Loan } from '../../services/prestamos.service'; 
import { FormsModule } from '@angular/forms'; 

declare var bootstrap: any;

/**
 * @fileoverview Este componente `PrestamosComponent` gestiona la visualización,
 * filtrado y registro de devoluciones de préstamos.
 * Interactúa con el `PrestamosService` para obtener y actualizar los datos de los préstamos,
 * y coordina con el `CrearPrestamoComponent` para la creación de nuevos préstamos.
 */
@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, CrearPrestamoComponent, FormsModule], // Añade FormsModule a los imports
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css']
})
export class PrestamosComponent implements OnInit {

  /**
   * @description Propiedad para almacenar la lista completa de préstamos obtenidos del servicio.
   * @type {Loan[]}
   */
  loans: Loan[] = []; 

  /**
   * @description Propiedad para almacenar la lista de préstamos después de aplicar los filtros.
   * Esta es la lista que se muestra en la tabla.
   * @type {Loan[]}
   */
  filteredLoans: Loan[] = []; 

  /**
   * @description Propiedad que modela el texto ingresado por el usuario en el campo de búsqueda.
   * @type {string}
   */
  searchText: string = ''; 

  /**
   * @description Propiedad que modela la opción seleccionada en el filtro por estado.
   * @type {string}
   */
  selectedStatus: string = 'Filtrar por estado...'; 

  /**
   * @description Bandera que indica si la tabla de préstamos está cargando datos.
   * Utilizada para mostrar un indicador de carga.
   * @type {boolean}
   */
  isLoadingTable: boolean = false;

  /**
   * @description Referencia al componente `CrearPrestamoComponent` anidado,
   * permite acceder a sus métodos públicos (ej. `resetForm`).
   * @type {CrearPrestamoComponent}
   */
  @ViewChild(CrearPrestamoComponent) crearPrestamoComponent!: CrearPrestamoComponent;

  /**
   * @description Constructor del componente PrestamosComponent.
   * Inyecta el servicio necesario para la gestión de préstamos.
   * @param {PrestamosService} prestamosService - Servicio para obtener y gestionar préstamos.
   */
  constructor(private prestamosService: PrestamosService) { } // Inyecta PrestamosService

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado.
   * Obtiene la lista inicial de préstamos y configura un listener para el evento de cierre
   * del modal de creación de préstamos.
   * @returns {void}
   */
  ngOnInit(): void {
    this.getLoans(); // Obtiene los préstamos cuando el componente se inicializa
    const crearPrestamoModal = document.getElementById('crearPrestamoModal');
    if (crearPrestamoModal) {
      crearPrestamoModal.addEventListener('hidden.bs.modal', this.onCrearPrestamoModalHidden.bind(this)); 
    }
  }

  /**
   * @description Obtiene la lista de préstamos desde el `PrestamosService`.
   * Actualiza las propiedades `loans` y `filteredLoans` y gestiona el estado de carga.
   * Muestra mensajes en la consola para el éxito o error de la operación.
   * @returns {void}
   */
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
   * @description Aplica los filtros de búsqueda por texto y por estado a la lista de préstamos.
   * Actualiza la propiedad `filteredLoans` que se muestra en la tabla.
   * @returns {void}
   */
  applyFilters(): void {
    let tempLoans = this.loans;

    // Filtro por texto de búsqueda (modelo del recurso o solicitante)
    if (this.searchText && this.searchText.trim() !== '') { 
      const lowerCaseSearchText = this.searchText.toLowerCase().trim(); 
      tempLoans = tempLoans.filter(loan =>
        (loan.resource?.modelo?.toLowerCase().includes(lowerCaseSearchText) ||
         loan.solicitante.toLowerCase().includes(lowerCaseSearchText))
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


  /**
   * @description Devuelve la clase CSS de Bootstrap adecuada para el badge de estado
   * de un préstamo, basándose en el estado proporcionado.
   * @param {string} estado - El estado del préstamo (ej. 'activo', 'devuelto', 'atrasado').
   * @returns {string} La clase CSS de Bootstrap para el badge.
   */
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

  /**
   * @description Formatea una cadena de fecha de 'YYYY-MM-DD' a 'DD/MM/YYYY'.
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} La fecha formateada o la cadena original si el formato no es el esperado.
   */
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
   * @description Cierra el modal de creación de préstamos programáticamente.
   * Utiliza la API de JavaScript de Bootstrap para ocultar el modal y limpiar el DOM
   * de los elementos de fondo del modal.
   * @returns {void}
   */
  closeCrearPrestamoModal(): void {
    const modalElement = document.getElementById('crearPrestamoModal');
    if (modalElement) {
      let modal = bootstrap.Modal.getInstance(modalElement); // Intenta obtener una instancia existente
      if (!modal) { // Si no hay una instancia existente, crea una nueva
        modal = new bootstrap.Modal(modalElement);
      }
      modal.hide(); // Ahora, 'modal' siempre será una instancia válida para llamar a hide()
      
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
   * @description Método que se ejecuta cuando se ha creado un nuevo préstamo desde el componente hijo
   * `CrearPrestamoComponent`.
   * Recarga la lista de préstamos para reflejar el nuevo préstamo y cierra el modal de creación.
   * @returns {void}
   */
  onLoanCreated(): void {
    console.log('Evento loanCreated recibido. Recargando préstamos...');
    this.getLoans(); // Recargar la lista de préstamos
    this.closeCrearPrestamoModal(); // Cerrar el modal
  }

  

  /**
   * @description Registra la devolución de un préstamo.
   * Actualiza el estado del préstamo a 'devuelto' a través del `PrestamosService`.
   * Muestra una confirmación al usuario y alertas de éxito o error.
   * @param {number | undefined} loanId - El ID del préstamo a registrar como devuelto.
   * @returns {void}
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
   * @description Método que se ejecuta cuando el modal de creación de préstamos se cierra.
   * Llama al método `resetForm` del componente hijo `CrearPrestamoComponent` para limpiar
   * el formulario de creación.
   * @returns {void}
   */
  onCrearPrestamoModalHidden(): void {
    if (this.crearPrestamoComponent) {
      this.crearPrestamoComponent.resetForm(); 
    }
  }
}