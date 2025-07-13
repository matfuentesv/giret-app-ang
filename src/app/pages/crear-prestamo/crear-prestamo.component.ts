import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Recurso, ResourceService } from '../../services/resource.service';
import { Loan, PrestamosService } from '../../services/prestamos.service';

/**
 * @fileoverview Este componente permite a los usuarios crear nuevos préstamos de recursos.
 * Proporciona un formulario para seleccionar un recurso disponible, especificar las fechas
 * de préstamo y devolución, e ingresar el nombre del solicitante.
 * Realiza validaciones en tiempo real para las fechas y la selección del recurso.
 */
@Component({
  selector: 'app-crear-prestamo',
  imports: [CommonModule,FormsModule],
  templateUrl: './crear-prestamo.component.html',
  styleUrl: './crear-prestamo.component.css'
})
export class CrearPrestamoComponent implements OnInit{

/**
   * @description Almacena la lista de recursos disponibles para ser prestados.
   * Se cargan al inicializar el componente, excluyendo aquellos con estado 'prestado'.
   * @type {Recurso[]}
   */
  recursosDisponibles: Recurso[] = []; // Para almacenar la lista de recursos

  /**
   * @description Modela el texto ingresado por el usuario en el campo de búsqueda de recursos.
   * Utilizado para filtrar sugerencias de recursos.
   * @type {string}
   */
  selectedRecursoText: string = ''; 

  /**
   * @description Bandera que indica si la selección del recurso es inválida (es decir,
   * el usuario escribió algo pero no seleccionó un recurso de la lista de sugerencias).
   * @type {boolean}
   */
  isInvalidRecursoSelection: boolean = false;

   /**
   * @description Almacena la lista de recursos que coinciden con el texto de búsqueda del usuario,
   * utilizada para mostrar sugerencias.
   * @type {Recurso[]}
   */
  filteredRecursos: Recurso[] = []; 

  /**
   * @description Bandera que controla la visibilidad de la lista de sugerencias de recursos.
   * @type {boolean}
   */
  showSuggestions: boolean = false;
  
  /**
   * @description Objeto que representa el nuevo préstamo a crear. Contiene los datos del formulario.
   * Se inicializa con valores por defecto.
   * @type {Loan}
   */
  newLoan: Loan = {
    recursoId: 0, // Se inicializará con el ID del recurso seleccionado
    fechaPrestamo: '',
    fechaDevolucion: '',
    solicitante: '',
    estado: 'activo' // Estado por defecto para nuevos préstamos
  };

  /**
   * @description Emite un evento cuando un préstamo ha sido creado exitosamente.
   * Permite que el componente padre reaccione a la creación de un préstamo (ej. recargar la lista).
   * @type {EventEmitter<void>}
   * @output loanCreated
   */
  @Output() loanCreated = new EventEmitter<void>(); // Evento para notificar al padre que un préstamo fue creado

  /**
   * @description Bandera que indica si las fechas de préstamo y devolución son inválidas
   * (es decir, la fecha de devolución es anterior a la fecha de préstamo).
   * @type {boolean}
   */
  fechasPrestamoInvalidas: boolean = false;

  /**
   * @description Referencia al formulario NgForm en la plantilla, permite resetear el formulario.
   * @type {NgForm | undefined}
   */
  @ViewChild('loanForm') loanForm: NgForm | undefined;

  /**
   * @description Bandera que indica si una operación de guardado de préstamo está en curso,
   * útil para deshabilitar botones y prevenir envíos múltiples.
   * @type {boolean}
   */
  isLoading: boolean = false;

  /**
   * @description Constructor del componente CrearPrestamoComponent.
   * Inyecta los servicios necesarios para interactuar con los recursos y los préstamos.
   * @param {ResourceService} resourceService - Servicio para obtener y gestionar recursos.
   * @param {PrestamosService} prestamosService - Servicio para gestionar los préstamos.
   */
  constructor(
    private resourceService: ResourceService, 
    private prestamosService: PrestamosService 
  ) { }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado. Carga los recursos disponibles.
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadAvailableResources(); // Cargar recursos al iniciar el componente
  }

  /**
   * @description Carga los recursos disponibles desde el `ResourceService`.
   * Solo incluye recursos cuyo estado no es 'prestado'.
   * Actualiza la propiedad `recursosDisponibles`.
   * @returns {void}
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
     * @description Maneja el evento `input` del campo de texto de selección de recurso.
     * Filtra `recursosDisponibles` para poblar `filteredRecursos` basándose en el texto
     * ingresado por el usuario (modelo o número de serie).
     * Controla la visibilidad de las sugerencias y resetea el `recursoId` si no hay coincidencia exacta.
     * @returns {void}
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
   * @description Maneja la selección de un recurso de la lista de sugerencias.
   * Actualiza `selectedRecursoText` y `newLoan.recursoId` con la información del recurso seleccionado.
   * Oculta las sugerencias y resetea la validación de selección.
   * @param {Recurso} recurso - El objeto `Recurso` seleccionado por el usuario.
   * @returns {void}
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
   * @description Maneja el evento `blur` (cuando el input de recurso pierde el foco).
   * Oculta las sugerencias después de un pequeño retardo y valida si se seleccionó un recurso válido.
   * Si hay texto en el input pero `newLoan.recursoId` es 0, marca la selección como inválida.
   * @returns {void}
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


  /**
   * @description Valida las fechas de préstamo y devolución.
   * Establece `fechasPrestamoInvalidas` en `true` si la fecha de devolución es anterior
   * a la fecha de préstamo.
   * @returns {void}
   */
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
   * @description Maneja el envío del formulario para crear un nuevo préstamo.
   * Realiza validaciones finales antes de intentar guardar el préstamo.
   * Si las validaciones son exitosas, llama al `PrestamosService` para guardar el préstamo,
   * emite el evento `loanCreated` y resetea el formulario.
   * Muestra alertas de éxito o error al usuario.
   * @returns {void}
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
    this.isLoading = true; 

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
   * @description Resetea el formulario de creación de préstamo a su estado inicial.
   * Limpia los campos del formulario, las banderas de validación, las sugerencias y
   * recarga los recursos disponibles.
   * @returns {void}
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

    // Reinicia el estado de validación del formulario utilizando NgForm
    if (this.loanForm) {
      this.loanForm.resetForm(this.newLoan); 
    }
    this.loadAvailableResources();
  }

  

}
