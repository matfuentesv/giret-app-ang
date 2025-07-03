import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Subscription } from 'rxjs';
import { CognitoService } from '../../auth/cognito.service';

@Component({
  selector: 'app-crear-recurso',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-recurso.component.html',
  styleUrl: './crear-recurso.component.css'
})
export class CrearRecursoComponent implements OnInit{
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
  selectedFiles: File[] = [];

  constructor(private resourceService: ResourceService,private cognitoService: CognitoService) {} // Inyecta el ResourceService
  
  // ¡NUEVO! Método para manejar la selección de archivos
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
    console.log('Archivos seleccionados:', this.selectedFiles); // Para depuración
  }

  /**
   * Maneja el envío del formulario.
   */
  onSubmit(): void {
    console.log('Datos del recurso a enviar:', this.newRecurso);

    this.resourceService.saveResource(this.newRecurso).subscribe({
      next: (response) => {
        console.log('Recurso guardado con éxito:', response);
        alert('Recurso agregado correctamente!');

        // ¡NUEVO! Lógica para subir documentos DESPUÉS de guardar el recurso
        if (response.idRecurso && this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.resourceService.uploadDocument(file, response.idRecurso!).subscribe({
              next: (uploadedDoc) => {
                console.log('Documento subido con éxito:', uploadedDoc);
                // Si necesitas hacer algo con el documento subido (ej. añadirlo a la lista del recurso en el frontend)
              },
              error: (uploadError) => {
                console.error('Error al subir documento:', uploadError);
                alert(`Error al subir el documento ${file.name}.`); // Notifica al usuario
              }
            });
          });
        } else if (this.selectedFiles.length > 0 && !response.idRecurso) {
            console.warn('Recurso creado, pero no se obtuvo idRecurso para asociar documentos.');
            alert('Recurso creado, pero no se pudieron subir los documentos asociados.');
        }


        this.resourceCreated.emit();
        this.resetForm();
        this.selectedFiles = []; // Limpia también los archivos seleccionados
      },
      error: (error) => {
        console.error('Error al guardar el recurso:', error);
        alert('Hubo un error al agregar el recurso. Por favor, revisa la consola.');
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
    this.selectedFiles = [];
  }

    userEmail: string | null = null;
    private userAttributesSubscription: Subscription | undefined;
  
    
  
  ngOnInit(): void {
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        if (attributes) {
          this.userEmail = attributes['email'];

          // ✅ Aquí haces que el email quede dentro del objeto del formulario
          this.newRecurso.emailUsuario = this.userEmail;

        } else {
          this.userEmail = null;
          this.newRecurso.emailUsuario = '';
        }
      },
      error => {
        console.error('Error al obtener atributos del usuario en el componente:', error);
        this.userEmail = null;
        this.newRecurso.emailUsuario = '';
      }
    );
  }
}
