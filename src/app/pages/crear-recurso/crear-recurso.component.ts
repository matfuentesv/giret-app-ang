import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceService, Recurso } from '../../services/resource.service';

@Component({
  selector: 'app-crear-recurso',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-recurso.component.html',
  styleUrl: './crear-recurso.component.css'
})
export class CrearRecursoComponent {
// Objeto que se vinculará al formulario para capturar los datos del nuevo recurso
  newRecurso: Recurso = {
    modelo: '',
    descripcion: '',
    numeroSerie: '',
    fechaCompra: '',
    fechaVencimientoGarantia: '',
    emailUsuario: '',
    estado: 'En Bodega', // Valor por defecto
    categoria: '' // Valor por defecto
  };

  // Evento que se emitirá cuando se cree un recurso exitosamente
  @Output() resourceCreated = new EventEmitter<void>();

  constructor(private resourceService: ResourceService) {} // Inyecta el ResourceService

  /**
   * Maneja el envío del formulario.
   */
  onSubmit(): void {
    console.log('Datos a enviar:', this.newRecurso); // Para depuración

    this.resourceService.saveResource(this.newRecurso).subscribe({
      next: (response) => {
        console.log('Recurso guardado con éxito:', response);
        alert('Recurso agregado correctamente!'); // Mensaje de éxito al usuario

        // Emite el evento para que el componente padre (InventarioComponent) recargue la lista
        this.resourceCreated.emit();

        // Opcional: Limpia el formulario después de un guardado exitoso
        this.resetForm();

        // Opcional: Cierra el modal (asegúrate de que bootstrap sea accesible si lo usas así)
        // const modalElement = document.getElementById('crearRecursoModal');
        // if (modalElement) {
        //   const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        //   modal?.hide();
        // }
      },
      error: (error) => {
        console.error('Error al guardar el recurso:', error);
        alert('Hubo un error al agregar el recurso. Por favor, revisa la consola.'); // Mensaje de error
      }
    });
  }

  /**
   * Resetea los valores del formulario.
   */
  resetForm(): void {
    this.newRecurso = {
      modelo: '',
      descripcion: '',
      numeroSerie: '',
      fechaCompra: '',
      fechaVencimientoGarantia: '',
      emailUsuario: '',
      estado: 'bodega',
      categoria: ''
    };
  }
}
