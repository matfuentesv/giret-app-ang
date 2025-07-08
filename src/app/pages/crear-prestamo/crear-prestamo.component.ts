import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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

  selectedRecursoText: string = ''; 
  isInvalidRecursoSelection: boolean = false;

  filteredRecursos: Recurso[] = []; 
  showSuggestions: boolean = false;
  
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

   @ViewChild('loanForm') loanForm: NgForm | undefined;

   isLoading: boolean = false;

  constructor(
    private resourceService: ResourceService, // Inyectar ResourceService
    private prestamosService: PrestamosService // Inyectar PrestamosService
  ) { }

  ngOnInit(): void {
    this.loadAvailableResources(); // Cargar recursos al iniciar el componente
  }

  /**
   * Carga los recursos disponibles (con cualquier estado menos 'prestado') desde el servicio.
   */
  loadAvailableResources(): void {
    this.resourceService.getResources().subscribe(
      (data) => {
        // Filtrar recursos para incluir cualquier estado menos 'prestado'
        this.recursosDisponibles = data.filter(resource => resource.estado.toLowerCase() !== 'prestado');
        console.log('Recursos disponibles (excluyendo "prestado"):', this.recursosDisponibles);
      },
      (error) => {
        console.error('Error al cargar recursos:', error);
      }
    );
  }

/**
   * Maneja el evento 'input' del campo de texto del recurso asociado.
   * Filtra los recursos disponibles basándose en lo que el usuario escribe.
   */
  onRecursoInput(): void {
    this.isInvalidRecursoSelection = false; // Resetear la bandera de validación
    const searchText = this.selectedRecursoText.toLowerCase().trim();

    if (searchText.length > 0) {
      // Filtrar los recursos que contengan el texto de búsqueda en su modelo o número de serie
      this.filteredRecursos = this.recursosDisponibles.filter(recurso =>
        recurso.modelo.toLowerCase().includes(searchText) ||
        recurso.numeroSerie.toLowerCase().includes(searchText)
      );
      this.showSuggestions = this.filteredRecursos.length > 0; // Mostrar sugerencias si hay resultados
    } else {
      this.filteredRecursos = []; // Limpiar sugerencias si el campo está vacío
      this.showSuggestions = false; // Ocultar sugerencias
      this.newLoan.recursoId = 0; // Resetear el ID del recurso si el input se vacía
    }

    // Si el usuario escribe exactamente el nombre completo de un recurso, lo seleccionamos
    // Esto es útil si el usuario no hace clic en la sugerencia
    const exactMatch = this.recursosDisponibles.find(recurso =>
      `${recurso.modelo} (N° Serie: ${recurso.numeroSerie})`.toLowerCase() === searchText
    );

    if (exactMatch) {
      this.newLoan.recursoId = exactMatch.idRecurso || 0;
    } else {
      // Si no hay una coincidencia exacta con el texto actual, resetear el ID
      // Esto evita que se envíe un préstamo con un ID asociado a un texto parcial o no válido
      this.newLoan.recursoId = 0;
    }
  }

  /**
   * Maneja la selección de un recurso de la lista de sugerencias.
   * @param recurso El recurso seleccionado.
   */
  selectRecurso(recurso: Recurso): void {
    // Establecer el texto del input con el nombre completo del recurso
    this.selectedRecursoText = `${recurso.modelo} (N° Serie: ${recurso.numeroSerie})`;
    // Asignar el ID del recurso seleccionado al nuevo préstamo
    this.newLoan.recursoId = recurso.idRecurso || 0;
    this.showSuggestions = false; // Ocultar las sugerencias
    this.isInvalidRecursoSelection = false; // Resetear la validación
    console.log('Recurso seleccionado:', recurso);
  }

  /**
   * Maneja el evento 'blur' (cuando el input pierde el foco).
   * Oculta las sugerencias y valida la selección si no se ha elegido un recurso válido.
   */
  onRecursoBlur(): void {
    // Usar un pequeño retardo para permitir que el evento click en la sugerencia se dispare
    // antes de que el blur oculte las sugerencias y potencialmente impida el click.
    setTimeout(() => {
      this.showSuggestions = false; // Ocultar sugerencias
      // Si el ID del recurso no ha sido establecido (o es 0) y hay texto en el input,
      // significa que no se seleccionó un recurso válido de la lista.
      if (!this.newLoan.recursoId && this.selectedRecursoText.trim().length > 0) {
        this.isInvalidRecursoSelection = true;
      }
    }, 100);
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
    
    if (this.isLoading) {
      return;
    }

    if (this.newLoan.recursoId === 0 && this.selectedRecursoText.length > 0) {
      this.isInvalidRecursoSelection = true;
      return;
    }

    if (this.fechasPrestamoInvalidas) {
      return;
    }

    // Marca que la operación está en curso
    this.isLoading = true; // **Activamos el estado de carga**

    this.prestamosService.saveLoan(this.newLoan).subscribe({
      next: (response) => {
        console.log('Préstamo creado con éxito:', response);
        alert('Préstamo registrado con éxito!');
        this.loanCreated.emit(); // Notificar al componente padre
        this.resetForm(); // Limpiar el formulario
        this.isLoading = false; 
      },
      error: (error) => {
        console.error('Error al crear el préstamo:', error);
        alert('Hubo un error al registrar el préstamo. Por favor, intente de nuevo.');
        this.isLoading = false;
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
    this.selectedRecursoText = ''; 
    this.isInvalidRecursoSelection = false; 
    this.filteredRecursos = []; // Limpiar las sugerencias filtradas
    this.showSuggestions = false; // Ocultar las sugerencias

    // **Reinicia el estado de validación del formulario utilizando NgForm**
    if (this.loanForm) {
      this.loanForm.resetForm(this.newLoan); // **Esta línea es crucial**
    }
    this.loadAvailableResources();
  }

  

}
