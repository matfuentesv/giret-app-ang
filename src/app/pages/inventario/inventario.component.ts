import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DetallesPrestamoComponent } from '../detalles-prestamo/detalles-prestamo.component';
import { CrearRecursoComponent } from '../crear-recurso/crear-recurso.component';
import { EditarRecursoComponent } from '../editar-recurso/editar-recurso.component';
import { ResourceService, Recurso } from '../../services/resource.service';
import { FormsModule } from '@angular/forms';

// Importar Modal de Bootstrap para cerrar el modal programáticamente
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
export class InventarioComponent implements OnInit, OnDestroy {

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
   * Se crea una copia del recurso para evitar la mutación directa.
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
   * @description Referencia al componente `CrearRecursoComponent` anidado,
   * permite acceder a sus métodos públicos (ej. `resetForm`).
   * @type {CrearRecursoComponent}
   */
  @ViewChild(CrearRecursoComponent) crearRecursoComponent!: CrearRecursoComponent;

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
   * Desuscribe todas las suscripciones para evitar fugas de memoria y remueve el listener
   * del modal.
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
  }

  /**
   * @description Aplica los filtros de búsqueda y estado a la lista de recursos.
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
   * @description Establece el recurso seleccionado para editarlo en un modal.
   * Crea una copia del recurso para que las modificaciones no afecten el objeto original
   * hasta que se guarden los cambios.
   * @param {Recurso} recurso - El recurso que se desea editar.
   * @returns {void}
   */
  editResource(recurso: Recurso): void {
    this.selectedRecursoForEdit = { ...recurso };
  }

  /**
   * @description Maneja el evento `resourceUpdated` emitido por el `EditarRecursoComponent`.
   * Recarga la lista de recursos para reflejar los cambios y cierra el modal de edición.
   * @param {Recurso} updatedRecurso - El recurso que ha sido actualizado.
   * @returns {void}
   */
  onResourceEdited(updatedRecurso: Recurso): void {
    this.getResources();
    this.closeEditModal();
  }

  /**
   * @description Cierra el modal de edición de recursos programáticamente.
   * Utiliza la API de JavaScript de Bootstrap para ocultar el modal y limpiar el DOM
   * de los elementos de fondo del modal.
   * @returns {void}
   */
  closeEditModal(): void {
    const modalElement = document.getElementById('editarRecursoModal');
    if (modalElement) {
      let modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new (window as any).bootstrap.Modal(modalElement);
      }
      modalInstance.hide();
      const body = document.body;
      if (body.classList.contains('modal-open')) {
          body.classList.remove('modal-open');
      }
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while (backdrops.length > 0) {
          backdrops[0].parentNode?.removeChild(backdrops[0]);
      }
    } else {
      console.warn("Elemento 'editarRecursoModal' no encontrado para cerrar el modal.");
    }
  }

  /**
   * @description Maneja el evento `hidden.bs.modal` del modal de creación de recursos.
   * Llama al método `resetForm` del `CrearRecursoComponent` para limpiar el formulario
   * una vez que el modal se ha cerrado completamente.
   * @returns {void}
   */
  onCrearRecursoModalHidden(): void {
    if (this.crearRecursoComponent) {
      this.crearRecursoComponent.resetForm();
    }
  }
}