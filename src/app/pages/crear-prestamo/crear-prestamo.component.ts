import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Recurso, ResourceService } from '../../services/resource.service';
import { Loan, PrestamosService } from '../../services/prestamos.service';

@Component({
  selector: 'app-crear-prestamo',
  imports: [CommonModule,FormsModule],
  templateUrl: './crear-prestamo.component.html',
  styleUrl: './crear-prestamo.component.css'
})
export class CrearPrestamoComponent implements OnInit{

   recursosDisponibles: Recurso[] = []; // Para almacenar la lista de recursos
  
  // Objeto para el nuevo préstamo con valores iniciales
  newLoan: Loan = {
    recursoId: 0, // Se inicializará con el ID del recurso seleccionado
    fechaPrestamo: '',
    fechaDevolucion: '',
    solicitante: '',
    estado: 'activo' // Estado por defecto para nuevos préstamos
  };

  @Output() loanCreated = new EventEmitter<void>(); // Evento para notificar al padre que un préstamo fue creado

  fechasPrestamoInvalidas: boolean = false;

  constructor(
    private resourceService: ResourceService, // Inyectar ResourceService
    private prestamosService: PrestamosService // Inyectar PrestamosService
  ) { }

  ngOnInit(): void {
    this.loadAvailableResources(); // Cargar recursos al iniciar el componente
  }

  /**
   * Carga la lista de todos los recursos disponibles para mostrarlos en el select.
   */
  loadAvailableResources(): void {
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.recursosDisponibles = data;
        console.log('Recursos disponibles cargados:', this.recursosDisponibles);
      },
      error: (error) => {
        console.error('Error al cargar los recursos disponibles:', error);
      }
    });
  }

  //Metodo para validar las fechas de préstamo y devolución
  validateLoanDates(): void {
    this.fechasPrestamoInvalidas = false; // Resetear el estado de error

    if (this.newLoan.fechaPrestamo && this.newLoan.fechaDevolucion) {
      const fechaPrestamo = new Date(this.newLoan.fechaPrestamo);
      const fechaDevolucion = new Date(this.newLoan.fechaDevolucion);

      // La fecha de préstamo NO puede ser MAYOR a la fecha de devolución
      // O, lo que es lo mismo, la fecha de devolución NO puede ser MENOR a la fecha de préstamo
      if (fechaDevolucion < fechaPrestamo) {
        this.fechasPrestamoInvalidas = true;
      }
    }
  }

  /**
   * Maneja el envío del formulario para crear un nuevo préstamo.
   */
  createLoan(): void {
    // Validaciones básicas antes de enviar
    if (!this.newLoan.recursoId || !this.newLoan.fechaPrestamo || !this.newLoan.solicitante) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Ejecuta la validación de fechas justo antes de enviar
     this.validateLoanDates();
    if (this.fechasPrestamoInvalidas) {
      alert('La fecha de devolución no puede ser anterior a la fecha de préstamo.');
      return; // Detiene el envío del formulario
    }

    console.log('Intentando crear préstamo:', this.newLoan);

    this.prestamosService.saveLoan(this.newLoan).subscribe({
      next: (response) => {
        console.log('Préstamo creado con éxito:', response);
        alert('Préstamo registrado con éxito!');
        this.loanCreated.emit(); // Notificar al componente padre
        this.resetForm(); // Limpiar el formulario
        this.closeModal(); // Cerrar el modal (asumiendo que es un modal)
      },
      error: (error) => {
        console.error('Error al crear el préstamo:', error);
        alert('Hubo un error al registrar el préstamo. Por favor, intente de nuevo.');
      }
    });
  }

  /**
   * Resetea el formulario a sus valores iniciales.
   */
  resetForm(): void {
    this.newLoan = {
      recursoId: 0,
      fechaPrestamo: '',
      fechaDevolucion: '',
      solicitante: '',
      estado: 'activo'
    };
    this.fechasPrestamoInvalidas = false;
  }

  /**
   * Cierra el modal, emitiendo un evento o interactuando con la API de Bootstrap.
   * Esto requiere que el componente padre escuche este evento o que Bootstrap esté cargado globalmente.
   */
  closeModal(): void {
    // Ejemplo para cerrar un modal de Bootstrap si tienes acceso a la instancia global
    const modalElement = document.getElementById('crearPrestamoModal'); // Asegúrate de que este ID coincida con tu HTML
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

}
