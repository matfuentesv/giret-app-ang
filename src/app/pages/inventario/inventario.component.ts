import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core'; // Añadir AfterViewInit
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DetallesPrestamoComponent } from '../detalles-prestamo/detalles-prestamo.component';
import { CrearRecursoComponent } from '../crear-recurso/crear-recurso.component';
import { EditarRecursoComponent } from '../editar-recurso/editar-recurso.component';
import { ResourceService, Recurso } from '../../services/resource.service';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

/**
 * @fileoverview Este componente `InventarioComponent` gestiona la visualización,
 * filtrado, creación y edición de recursos en el inventario.
 * Interactúa con los servicios de recursos y autenticación, y coordina con
 * los componentes de `CrearRecursoComponent`, `EditarRecursoComponent` y `DetallesPrestamoComponent`.
 */
@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    DetallesPrestamoComponent,
    FormsModule,
    CrearRecursoComponent,
    EditarRecursoComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit, OnDestroy, AfterViewInit { 

  /**
   * @description Almacena el email del usuario logueado, obtenido del `CognitoService`.
   * @type {string | null}
   */
  userEmail: string | null = null;

  /**
   * @description Suscripción a los atributos del usuario, utilizada para gestionar la desuscripción
   * y evitar fugas de memoria.
   * @type {Subscription | undefined}
   */
  private userAttributesSubscription: Subscription | undefined;

  /**
   * @description Almacena la lista completa de recursos obtenidos del servicio.
   * @type {Recurso[]}
   */
  recursos: Recurso[] = [];

  /**
   * @description Suscripción a la lista de recursos, utilizada para gestionar la desuscripción.
   * @type {Subscription | undefined}
   */
  private recursosSubscription: Subscription | undefined;

  /**
   * @description Modela el texto ingresado por el usuario en el campo de búsqueda.
   * @type {string}
   */
  searchTerm: string = '';

  /**
   * @description Modela la opción seleccionada en el filtro por estado.
   * @type {string}
   */
  selectedEstado: string = 'Filtrar por estado';

  /**
   * @description Almacena la lista de recursos después de aplicar los filtros de búsqueda y estado.
   * Esta es la lista que se muestra en la tabla.
   * @type {Recurso[]}
   */
  filteredRecursos: Recurso[] = [];

   /**
   * @description Almacena el recurso seleccionado para mostrar sus detalles en un modal.
   * @type {Recurso | null}
   */
  selectedRecursoForDetails: Recurso | null = null;

  /**
   * @description Almacena el recurso seleccionado para editarlo en un modal.
   * Se crea una copia del recurso para evitar la mutación directa en la tabla principal.
   * @type {Recurso | null}
   */
  selectedRecursoForEdit: Recurso | null = null;

  /**
   * @description Bandera que indica si la tabla de recursos está cargando datos.
   * Utilizada para mostrar un indicador de carga.
   * @type {boolean}
   */
  isLoadingTable: boolean = false; 

  /**
   * @description Referencia al componente `CrearRecursoComponent` anidado.
   * Permite acceder a sus métodos públicos (ej. `resetForm`) después de que se ha creado.
   * @type {CrearRecursoComponent}
   */
  @ViewChild(CrearRecursoComponent) crearRecursoComponent!: CrearRecursoComponent;

  /**
   * @description Propiedad para almacenar la instancia del modal de Bootstrap para el componente de edición.
   * Esto permite un control programático y consistente del modal.
   * @type {any}
   * @private
   */
  private editarRecursoBootstrapModal: any; 

  /**
   * @description Constructor del componente InventarioComponent.
   * Inyecta los servicios necesarios para la autenticación y la gestión de recursos.
   * @param {CognitoService} cognitoService - Servicio para obtener información del usuario.
   * @param {ResourceService} resourceService - Servicio para obtener y gestionar recursos.
   */
  constructor(
    private cognitoService: CognitoService,
    private resourceService: ResourceService
  ) {}

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado.
   * Obtiene los atributos del usuario, carga los recursos y configura un listener
   * para el evento de cierre del modal de creación de recursos.
   * @returns {void}
   */
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

    this.getResources();

    const crearRecursoModal = document.getElementById('crearRecursoModal');
    if (crearRecursoModal) {
      crearRecursoModal.addEventListener('hidden.bs.modal', () => {
        this.onCrearRecursoModalHidden();
      });
    }
  }

   /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que
   * la vista del componente y sus vistas hijas se han inicializado.
   * Es el lugar adecuado para interactuar con elementos del DOM que ya han sido renderizados.
   * Aquí se instancia el modal de Bootstrap de edición y se adjunta su listener de ocultación.
   * @returns {void}
   */
  ngAfterViewInit(): void {
    const editarRecursoModalElement = document.getElementById('editarRecursoModal');
    if (editarRecursoModalElement) {
        // Instanciar el modal de Bootstrap solo una vez
        this.editarRecursoBootstrapModal = new bootstrap.Modal(editarRecursoModalElement);

        // Añadir el listener para el evento de ocultación
        editarRecursoModalElement.addEventListener('hidden.bs.modal', this.onEditarRecursoModalHidden.bind(this));
    }
  }

  /**
   * @description Obtiene la lista de recursos desde el `ResourceService`.
   * Actualiza las propiedades `recursos` y `filteredRecursos` y gestiona el estado de carga.
   * Muestra una alerta si hay un error al cargar los recursos.
   * @returns {void}
   */
  getResources(): void {
    this.isLoadingTable = true; 
    this.recursosSubscription = this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.recursos = data;
        this.applyFilters();
        this.isLoadingTable = false; 
      },
      error: (error) => {
        console.error('Error al cargar los recursos:', error);
        this.isLoadingTable = false; 
        alert('No se pudieron cargar los recursos. Revisa la consola para más detalles.');
      }
    });
  }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta justo antes de que el componente
   * sea destruido.
   * Desuscribe todas las suscripciones para evitar fugas de memoria y remueve los listeners
   * de los modales para prevenir memory leaks.
   * @returns {void}
   */
  ngOnDestroy(): void {
    if (this.userAttributesSubscription) {
      this.userAttributesSubscription.unsubscribe();
    }
    if (this.recursosSubscription) {
      this.recursosSubscription.unsubscribe();
    }

    const crearRecursoModal = document.getElementById('crearRecursoModal');
    if (crearRecursoModal) {
      crearRecursoModal.removeEventListener('hidden.bs.modal', this.onCrearRecursoModalHidden);
    }

    // Remover listener del modal de Editar Recurso
    const editarRecursoModalElement = document.getElementById('editarRecursoModal');
    if (editarRecursoModalElement) {
      editarRecursoModalElement.removeEventListener('hidden.bs.modal', this.onEditarRecursoModalHidden.bind(this));
    }
  }

  /**
   * @description Aplica los filtros de búsqueda por `searchTerm` (modelo o número de serie)
   * y `selectedEstado` (estado del recurso) a la lista de recursos.
   * Actualiza la propiedad `filteredRecursos` que se muestra en la tabla.
   * @returns {void}
   */
  applyFilters(): void {
    let tempRecursos = [...this.recursos];

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();
      tempRecursos = tempRecursos.filter(recurso =>
        recurso.modelo.toLowerCase().includes(lowerCaseSearchTerm) ||
        recurso.numeroSerie.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.selectedEstado && this.selectedEstado !== 'Filtrar por estado') {
      tempRecursos = tempRecursos.filter(recurso =>
        recurso.estado === this.selectedEstado
      );
    }

    this.filteredRecursos = tempRecursos;
  }

  /**
   * @description Establece el recurso seleccionado para mostrar sus detalles en un modal.
   * @param {Recurso} recurso - El recurso que se desea ver en detalle.
   * @returns {void}
   */
  viewResourceDetails(recurso: Recurso): void {
    this.selectedRecursoForDetails = recurso;
  }

  /**
   * @description Establece el recurso seleccionado para editarlo y abre el modal de edición programáticamente.
   * Crea una copia del recurso para que las modificaciones en el formulario no afecten el objeto original
   * en la tabla hasta que se guarden los cambios.
   * @param {Recurso} recurso - El recurso que se desea editar.
   * @returns {void}
   */
  editResource(recurso: Recurso): void {
    this.selectedRecursoForEdit = { ...recurso };
    if (this.editarRecursoBootstrapModal) {
        this.editarRecursoBootstrapModal.show(); 
    } else {
        console.warn("DEBUG: Instancia del modal de edición no disponible para mostrar.");
    }
  }

  /**
   * @description Maneja el evento `resourceUpdated` emitido por el `EditarRecursoComponent`.
   * Recarga la lista de recursos para reflejar los cambios más recientes y cierra el modal de edición.
   * @param {Recurso} updatedRecurso - El recurso que ha sido actualizado.
   * @returns {void}
   */
  onResourceEdited(updatedRecurso: Recurso): void {
    this.getResources();
    this.closeEditModal();
  }

  /**
   * @description Cierra el modal de edición de recursos programáticamente.
   * Utiliza la instancia de Bootstrap del modal almacenada para ocultarlo de forma segura.
   * @returns {void}
   */
  closeEditModal(): void {
    if (this.editarRecursoBootstrapModal) {
        this.editarRecursoBootstrapModal.hide(); // Oculta el modal usando la instancia que ya tenemos
    } else {
        console.warn("DEBUG: Instancia del modal de edición no disponible para ocultar.");
    }
  }

  /**
   * @description Maneja el evento `hidden.bs.modal` del modal de creación de recursos.
   * Se ejecuta cuando el modal de creación se ha ocultado completamente.
   * Llama al método `resetForm` del `CrearRecursoComponent` para limpiar el formulario.
   * @returns {void}
   */
  onCrearRecursoModalHidden(): void {
    if (this.crearRecursoComponent) {
      this.crearRecursoComponent.resetForm();
    }
  }

  /**
   * @description Maneja el evento `hidden.bs.modal` para el modal de edición de recursos.
   * Se ejecuta cuando el modal de edición se ha ocultado completamente.
   * Intenta forzar la eliminación del foco de cualquier elemento dentro del modal
   * para evitar el warning `aria-hidden` y resetea el recurso seleccionado para una limpieza del estado.
   * @returns {void}
   */
  onEditarRecursoModalHidden(): void {
    console.log('Modal de edición completamente cerrado (hidden.bs.modal event fired).');
    const modalElement = document.getElementById('editarRecursoModal');
    if (modalElement) {
      const focusedElement = modalElement.querySelector(':focus');
      if (focusedElement && typeof (focusedElement as HTMLElement).blur === 'function') {
        (focusedElement as HTMLElement).blur();
        console.log('DEBUG: Foco explícitamente eliminado de:', focusedElement);
      }
      // Resetear selectedRecursoForEdit para asegurar que el formulario está limpio para la próxima apertura
      this.selectedRecursoForEdit = null;
      console.log('DEBUG: selectedRecursoForEdit reseteado a null.');
    }
  }
}