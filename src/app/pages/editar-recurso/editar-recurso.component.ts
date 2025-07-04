import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Recurso, ResourceService } from '../../services/resource.service';

@Component({
  selector: 'app-editar-recurso',
  imports: [CommonModule,FormsModule],
  templateUrl: './editar-recurso.component.html',
  styleUrl: './editar-recurso.component.css'
})
export class EditarRecursoComponent {

  @Input() recurso: Recurso | null = null; // Recibe el recurso a editar del componente padre
  @Output() resourceUpdated = new EventEmitter<Recurso>(); // Emite el recurso actualizado al padre
  @Output() modalClosed = new EventEmitter<void>(); // Emite cuando el modal se debe cerrar

  editedRecurso: Recurso = { // Inicializar con valores predeterminados o un objeto vacío
    modelo: '',
    descripcion: '',
    numeroSerie: '',
    fechaCompra: '',
    fechaVencimientoGarantia: '',
    estado: '',
    emailUsuario: '',
    categoria: ''
  };

  constructor(private resourceService: ResourceService) { } // Inyectar ResourceService

  ngOnInit(): void {
    // Si el recurso ya está disponible al inicio, inicializa editedRecurso
    if (this.recurso) {
      this.editedRecurso = { ...this.recurso }; // Crear una copia para evitar modificar el input directamente
    }
  }

  // Se ejecuta cuando el Input 'recurso' cambia
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recurso'] && this.recurso) {
      this.editedRecurso = { ...this.recurso }; // Actualizar la copia editable cuando el input cambia
    }
  }

  /**
   * Maneja el envío del formulario para actualizar el recurso.
   */
  saveChanges(): void {
    if (this.editedRecurso.idRecurso) { // Asegurarse de que el recurso tenga un ID para actualizar
      this.resourceService.updateResource(this.editedRecurso.idRecurso, this.editedRecurso).subscribe({
        next: (updatedRecurso) => {
          console.log('Recurso actualizado con éxito:', updatedRecurso);
          this.resourceUpdated.emit(updatedRecurso); // Emitir el evento de que el recurso fue actualizado
          this.closeModal(); // Cerrar el modal después de guardar
        },
        error: (error) => {
          console.error('Error al actualizar el recurso:', error);
          // Aquí puedes añadir lógica para mostrar un mensaje de error al usuario
        }
      });
    } else {
      console.warn('No se puede actualizar el recurso: idRecurso no definido.');
      // Opcional: manejar el caso en que se intente guardar un recurso sin ID (podría ser un nuevo recurso)
    }
  }

  closeModal(): void {
    this.modalClosed.emit(); // Emitir evento para que el componente padre cierre el modal
    
  }

}
