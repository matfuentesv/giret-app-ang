import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Documento, Recurso, ResourceService } from '../../services/resource.service';
import { CognitoService } from '../../auth/cognito.service';
import { HistorialResource, HistorialService } from '../../services/historial.service';

/**
 * @fileoverview Este componente `DetallesPrestamoComponent` muestra los detalles de un recurso específico.
 * Incluye información del recurso, documentos asociados y un historial de cambios de estado del recurso.
 * Se actualiza automáticamente cuando el recurso de entrada cambia.
 */
@Component({
  selector: 'app-detalles-prestamo',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './detalles-prestamo.component.html',
  styleUrl: './detalles-prestamo.component.css'
})
export class DetallesPrestamoComponent implements OnInit{

  /**
   * @description Almacena el recurso seleccionado para mostrar sus detalles.
   * Actualmente, este componente recibe el recurso a través de un `@Input`.
   * @type {Recurso | null}
   */
   selectedRecursoForDetails: Recurso | null = null;

  /**
   * @description Constructor del componente DetallesPrestamoComponent.
   * Inyecta los servicios necesarios para interactuar con la autenticación, recursos e historial.
   * @param {CognitoService} cognitoService - Servicio para obtener información del usuario (aunque no se usa directamente en este componente, se mantiene si es necesario para futuras extensiones).
   * @param {ResourceService} resourceService - Servicio para obtener documentos asociados a un recurso.
   * @param {HistorialService} historialService - Servicio para obtener el historial de un recurso.
   */
  constructor(
    private cognitoService: CognitoService,
    private resourceService: ResourceService,
    private historialService: HistorialService
  ) {}
  
  /**
   * @description El recurso cuyos detalles se van a mostrar. Este es un valor de entrada
   * que el componente padre pasa a este componente.
   * @type {Recurso | null}
   * @input recurso
   */
  @Input() recurso: Recurso | null = null;

  /**
   * @description Almacena la lista de documentos asociados al recurso actual.
   * @type {Documento[]}
   */
  documentosAsociados: Documento[] = [];

  /**
   * @description Almacena el historial de cambios de estado del recurso actual.
   * Los elementos se ordenan por fecha de cambio de estado (más reciente primero).
   * @type {HistorialResource[]}
   */
  historialRecurso: HistorialResource[] = [];

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado. Carga los documentos asociados si un recurso ya está disponible.
   * @returns {void}
   */
  ngOnInit(): void {
     if (this.recurso) {
      this.loadDocuments(this.recurso.idRecurso!);
    }
  }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta cada vez que los valores
   * de los `@Input` del componente cambian.
   * Este método es crucial para recargar los documentos y el historial cuando se selecciona
   * un nuevo recurso.
   * @param {SimpleChanges} changes - Un objeto que contiene los cambios de las propiedades de entrada.
   * @returns {void}
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recurso'] && this.recurso) {
      // Limpia los documentos anteriores si se cambia a un nuevo recurso
      this.documentosAsociados = [];
      this.historialRecurso = [];
      if (this.recurso.idRecurso) {
        this.loadDocuments(this.recurso.idRecurso);
        this.loadHistorialData(this.recurso.idRecurso);
      } else {
        console.warn('Recurso recibido sin idRecurso para cargar documentos.');
      }
    }
  }

  /**
   * @description Carga el historial de cambios de estado para un recurso específico
   * desde el `HistorialService`.
   * Los datos cargados se ordenan por `fechaCambioEstado` de más reciente a más antiguo.
   * @private
   * @param {number} recursoId - El ID del recurso cuyo historial se desea cargar.
   * @returns {void}
   */
  private loadHistorialData(recursoId: number): void {
    this.historialService.getHistoricalByResourceId(recursoId).subscribe({
      next: (history) => {
        // Ordenar el historial por fechaCambioEstado de más reciente a más antiguo
        this.historialRecurso = history.sort((a, b) => {
          return new Date(b.fechaCambioEstado).getTime() - new Date(a.fechaCambioEstado).getTime();
        });
        console.log('Historial cargado:', this.historialRecurso);
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.historialRecurso = []; // Limpiar en caso de error
      }
    });
  }

  /**
   * @description Carga los documentos asociados a un recurso específico
   * desde el `ResourceService`.
   * @private
   * @param {number} recursoId - El ID del recurso cuyos documentos se desean cargar.
   * @returns {void}
   */
  private loadDocuments(recursoId: number): void {
    this.resourceService.getDocumentsByRecursoId(recursoId).subscribe({
      next: (docs) => {
        this.documentosAsociados = docs;
        console.log('Documentos cargados para el recurso:', this.documentosAsociados);
      },
      error: (error) => {
        console.error('Error al cargar los documentos para el recurso:', recursoId, error);
        this.documentosAsociados = []; // Limpia si hay error
      }
    });
  }

  /**
   * @description Formatea una cadena de fecha a un formato legible por el usuario (ej. "1 de enero de 2023, 10:30").
   * Utiliza `toLocaleDateString` para una localización adecuada.
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} La fecha formateada o una cadena vacía si la entrada es nula o vacía.
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    // Formatea la fecha usando el locale 'es-CL' (español de Chile)
    return new Date(dateString).toLocaleDateString('es-CL', options); 
  }

}
