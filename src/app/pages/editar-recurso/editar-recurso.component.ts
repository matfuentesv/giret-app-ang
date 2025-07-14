import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Recurso, ResourceService } from '../../services/resource.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

/**
 * @fileoverview Este componente `EditarRecursoComponent` permite a los usuarios editar
 * los detalles de un recurso existente. Proporciona un formulario pre-llenado con la
 * información del recurso y permite guardar los cambios.
 * Emite eventos para notificar al componente padre sobre la actualización del recurso
 * y el cierre del modal de edición.
 */
@Component({
  selector: 'app-editar-recurso',
  imports: [CommonModule,FormsModule],
  templateUrl: './editar-recurso.component.html',
  styleUrl: './editar-recurso.component.css'
})
export class EditarRecursoComponent {

  /**
   * @description El recurso que se va a editar. Este es un valor de entrada
   * que el componente padre pasa a este componente.
   * @type {Recurso | null}
   * @input recurso
   */
  @Input() recurso: Recurso | null = null; 

  /**
   * @description Emite el recurso actualizado una vez que los cambios han sido guardados exitosamente.
   * Permite que el componente padre reaccione a la actualización del recurso.
   * @type {EventEmitter<Recurso>}
   * @output resourceUpdated
   */
  @Output() resourceUpdated = new EventEmitter<Recurso>(); 

  /**
   * @description Emite un evento cuando se solicita cerrar el modal de edición.
   * Permite que el componente padre gestione la visibilidad del modal.
   * @type {EventEmitter<void>}
   * @output modalClosed
   */
  @Output() modalClosed = new EventEmitter<void>(); 

  /**
   * @description Una copia editable del recurso que se está modificando.
   * Se inicializa con los datos del `@Input` `recurso` para evitar modificar
   * directamente el objeto original.
   * @type {Recurso}
   */
  editedRecurso: Recurso = { 
    modelo: '',
    descripcion: '',
    numeroSerie: '',
    fechaCompra: '',
    fechaVencimientoGarantia: '',
    estado: '',
    emailUsuario: '',
    categoria: ''
  };

  /**
   * @description Constructor del componente EditarRecursoComponent.
   * Inyecta el servicio necesario para interactuar con los recursos.
   * @param {ResourceService} resourceService - Servicio para actualizar recursos.
   */
  constructor(private resourceService: ResourceService) { } 

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado. Inicializa `editedRecurso` con los datos del `recurso` de entrada.
   * @returns {void}
   */
  ngOnInit(): void {
    if (this.recurso) {
      this.editedRecurso = { ...this.recurso }; 
    }
  }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta cada vez que los valores
   * de los `@Input` del componente cambian.
   * Este método es crucial para actualizar la copia editable (`editedRecurso`)
   * si el `recurso` de entrada cambia mientras el componente está activo.
   * @param {SimpleChanges} changes - Un objeto que contiene los cambios de las propiedades de entrada.
   * @returns {void}
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recurso'] && this.recurso) {
      this.editedRecurso = { ...this.recurso }; // Actualizar la copia editable cuando el input cambia
    }
  }

  /**
   * @description Maneja el envío del formulario para actualizar el recurso.
   * Llama al `ResourceService` para guardar los cambios en el recurso si tiene un ID.
   * En caso de éxito, emite el evento `resourceUpdated` y cierra el modal.
   * Muestra mensajes en la consola para el éxito o error de la operación.
   * @returns {void}
   */
  saveChanges(): void {
    if (this.editedRecurso.idRecurso) { 
      this.resourceService.updateResource(this.editedRecurso.idRecurso, this.editedRecurso).subscribe({
        next: (updatedRecurso) => {
          Swal.fire({ 
            icon: 'success',
            title: '¡Éxito!',
            text: 'El recurso ha sido actualizado correctamente.',
            confirmButtonText: 'Aceptar'
          });
          this.resourceUpdated.emit(updatedRecurso); // Emitir el evento de que el recurso fue actualizado
          this.closeModal(); // Cerrar el modal después de guardar
        },
        error: (error) => {
          Swal.fire({ 
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al actualizar el recurso. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Aceptar'
          });
          console.error('Error al actualizar el recurso:', error);
           this.closeModal()
        }
      });
    } else {
      Swal.fire({ 
        icon: 'warning',
        title: 'Advertencia',
        text: 'No se puede actualizar el recurso: ID de recurso no definido.',
        confirmButtonText: 'Aceptar'
      });
      console.warn('No se puede actualizar el recurso: idRecurso no definido.');
       this.closeModal()
    }
  }

  /**
   * @description Emite el evento `modalClosed` para notificar al componente padre
   * que se debe cerrar el modal de edición.
   * @returns {void}
   */
  closeModal(): void {
    this.modalClosed.emit(); // Emitir evento para que el componente padre cierre el modal
    
  }

}
