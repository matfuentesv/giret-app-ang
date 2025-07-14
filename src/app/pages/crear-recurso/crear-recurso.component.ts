import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Subscription } from 'rxjs';
import { CognitoService } from '../../auth/cognito.service';

/**
 * @fileoverview Este componente permite a los usuarios crear nuevos recursos.
 * Proporciona un formulario para ingresar los detalles del recurso, como modelo,
 * descripción, número de serie, fechas de compra y garantía, y categoría.
 * También permite adjuntar documentos y asocia el recurso con el email del usuario.
 */
@Component({
  selector: 'app-crear-recurso',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-recurso.component.html',
  styleUrl: './crear-recurso.component.css'
})
export class CrearRecursoComponent implements OnInit{

  /**
   * @description Objeto que representa el nuevo recurso a crear. Contiene los datos del formulario.
   * Se inicializa con valores por defecto.
   * @type {Recurso}
   */
  newRecurso: Recurso = {
    modelo: '',
    descripcion: '',
    numeroSerie: '',
    fechaCompra: '',
    fechaVencimientoGarantia: '',
    emailUsuario: '',
    estado: 'Bodega',
    categoria: ''
  };

  /**
   * @description Emite un evento cuando un recurso ha sido creado exitosamente.
   * Permite que el componente padre reaccione a la creación de un recurso (ej. recargar la lista).
   * @type {EventEmitter<void>}
   * @output resourceCreated
   */
  @Output() resourceCreated = new EventEmitter<void>();

  /**
   * @description Almacena los archivos seleccionados por el usuario para ser adjuntados al recurso.
   * @type {File[]}
   */
  selectedFiles: File[] = [];

  /**
   * @description Bandera que indica si la fecha de vencimiento de la garantía es inválida
   * (es decir, anterior a la fecha de compra).
   * @type {boolean}
   */
  fechaGarantiaInvalida: boolean = false;

  /**
   * @description Referencia al formulario NgForm en la plantilla, permite resetear el formulario.
   * @type {NgForm | undefined}
   */
  @ViewChild('recursoForm') recursoForm: NgForm | undefined;

  /**
   * @description Almacena el email del usuario logueado, obtenido del `CognitoService`.
   * Se utiliza para pre-llenar el campo `emailUsuario` del nuevo recurso.
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
   * @description Bandera que controla el estado de carga/envío del formulario,
   * útil para deshabilitar botones y prevenir envíos duplicados.
   * @type {boolean}
   */
  isLoading: boolean = false; 

  /**
   * @description Constructor del componente CrearRecursoComponent.
   * Inyecta los servicios necesarios para interactuar con los recursos y la autenticación.
   * @param {ResourceService} resourceService - Servicio para guardar recursos y subir documentos.
   * @param {CognitoService} cognitoService - Servicio para obtener información del usuario autenticado.
   */
  constructor(private resourceService: ResourceService, private cognitoService: CognitoService) {}
  
  /**
   * @description Maneja el evento de selección de archivos.
   * Almacena los archivos seleccionados por el usuario en la propiedad `selectedFiles`.
   * @param {any} event - El objeto de evento del input de tipo 'file'.
   * @returns {void}
   */
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  /**
   * @description Valida las fechas de compra y vencimiento de garantía.
   * Establece `fechaGarantiaInvalida` en `true` si la fecha de vencimiento de la garantía
   * es anterior a la fecha de compra.
   * @returns {void}
   */
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
   * @description Maneja el envío del formulario para crear un nuevo recurso.
   * Realiza validaciones finales antes de intentar guardar el recurso.
   * Si las validaciones son exitosas, llama al `ResourceService` para guardar el recurso
   * y, si hay archivos seleccionados, para subirlos.
   * Emite el evento `resourceCreated` y resetea el formulario.
   * Muestra alertas de éxito o error al usuario.
   * @returns {void}
   */
  onSubmit(): void {
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
        this.isLoading = false; 
      },
      error: (error) => {
        alert('Hubo un error al agregar el recurso. Por favor, revisa la consola.');
        this.isLoading = false; 
      }
    });
  }

  /**
   * @description Resetea el formulario de creación de recurso a su estado inicial.
   * Limpia los campos del formulario, las banderas de validación y los archivos seleccionados.
   * Mantiene el `emailUsuario` si ya se obtuvo.
   * @returns {void}
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
     this.isLoading = false;
  }
  
  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado. Suscribe al servicio Cognito para obtener el email del usuario
   * autenticado y asignarlo al nuevo recurso.
   * @returns {void}
   */
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