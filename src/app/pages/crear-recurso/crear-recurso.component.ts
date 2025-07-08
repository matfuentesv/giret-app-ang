import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  newRecurso: Recurso = {
    modelo: '',
    descripcion: '',
    numeroSerie: '',
    fechaCompra: '',
    fechaVencimientoGarantia: '',
    emailUsuario: '',
    estado: 'En Bodega',
    categoria: ''
  };

  @Output() resourceCreated = new EventEmitter<void>();
  selectedFiles: File[] = [];

  fechaGarantiaInvalida: boolean = false;

  @ViewChild('recursoForm') recursoForm: NgForm | undefined;

  // Añade una propiedad para almacenar el email del usuario una vez que se obtiene
  userEmail: string | null = null;
  private userAttributesSubscription: Subscription | undefined;

  isLoading: boolean = false; // **NUEVA PROPIEDAD: Para controlar el estado de carga/envío**

  constructor(private resourceService: ResourceService, private cognitoService: CognitoService) {}
  
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  onDateChange(): void {
    this.fechaGarantiaInvalida = false;
    if (this.newRecurso.fechaCompra && this.newRecurso.fechaVencimientoGarantia) {
      const fechaCompra = new Date(this.newRecurso.fechaCompra);
      const fechaVencimientoGarantia = new Date(this.newRecurso.fechaVencimientoGarantia);
      if (fechaVencimientoGarantia < fechaCompra) {
        this.fechaGarantiaInvalida = true;
      }
    }
  }

  /**
   * Maneja el envío del formulario.
   */
  onSubmit(): void {
    // Si ya estamos enviando, salimos para evitar envíos duplicados
    if (this.isLoading) {
      return;
    }

    this.onDateChange(); 
    
    if (this.fechaGarantiaInvalida) {
      return;
    }

    // Marca que la operación está en curso
    this.isLoading = true; 

    this.resourceService.saveResource(this.newRecurso).subscribe({
      next: (response) => {
        alert('Recurso agregado correctamente!');
        if (response.idRecurso && this.selectedFiles.length > 0) {
          this.selectedFiles.forEach(file => {
            this.resourceService.uploadDocument(file, response.idRecurso!).subscribe({
              next: (uploadedDoc) => {
                // Lógica si es necesario
              },
              error: (uploadError) => {
                alert(`Error al subir el documento ${file.name}.`);
              }
            });
          });
        } else if (this.selectedFiles.length > 0 && !response.idRecurso) {
            alert('Recurso creado, pero no se pudieron subir los documentos asociados.');
        }
        this.resourceCreated.emit();
        this.resetForm();
        this.selectedFiles = [];
        this.isLoading = false; // Desactivamos el estado de carga al finalizar con éxito
      },
      error: (error) => {
        alert('Hubo un error al agregar el recurso. Por favor, revisa la consola.');
        this.isLoading = false; // Desactivamos el estado de carga también en caso de error
      }
    });
  }

  /**
   * Resetea los valores del formulario y su estado de validación.
   */
  resetForm(): void {
    this.newRecurso = {
      modelo: '',
      descripcion: '',
      numeroSerie: '',
      fechaCompra: '',
      fechaVencimientoGarantia: '',
      emailUsuario: this.userEmail || '',
      estado: 'Bodega',
      categoria: ''
    };
    this.selectedFiles = [];
    this.fechaGarantiaInvalida = false; 

    if (this.recursoForm) {
      this.recursoForm.resetForm(this.newRecurso);
    }
  }
    
  ngOnInit(): void {
    this.userAttributesSubscription = this.cognitoService.getUserAttributes().subscribe(
      attributes => {
        if (attributes) {
          this.userEmail = attributes['email'];
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