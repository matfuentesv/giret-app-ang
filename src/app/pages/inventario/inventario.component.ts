import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'; // **Importa ViewChild**
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DetallesPrestamoComponent } from '../detalles-prestamo/detalles-prestamo.component';
import { CrearRecursoComponent } from '../crear-recurso/crear-recurso.component';
import { EditarRecursoComponent } from '../editar-recurso/editar-recurso.component'; 
import { ResourceService, Recurso } from '../../services/resource.service'; 
import { FormsModule } from '@angular/forms';

// Importar Modal de Bootstrap para cerrar el modal programáticamente
declare var bootstrap: any;

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

  userEmail: string | null = null;
  private userAttributesSubscription: Subscription | undefined;
  recursos: Recurso[] = [];
  private recursosSubscription: Subscription | undefined;
  searchTerm: string = '';
  selectedEstado: string = 'Filtrar por estado';
  filteredRecursos: Recurso[] = [];
  selectedRecursoForDetails: Recurso | null = null;
  selectedRecursoForEdit: Recurso | null = null;

  @ViewChild(CrearRecursoComponent) crearRecursoComponent!: CrearRecursoComponent; // **Referencia al componente hijo**
  
  constructor(
    private cognitoService: CognitoService,
    private resourceService: ResourceService 
  ) {}

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

    // **Añadir un listener al evento 'hidden.bs.modal' del modal de crear recurso**
    const crearRecursoModal = document.getElementById('crearRecursoModal');
    if (crearRecursoModal) {
      crearRecursoModal.addEventListener('hidden.bs.modal', () => {
        this.onCrearRecursoModalHidden();
      });
    }
  }

  getResources(): void {
    this.recursosSubscription = this.resourceService.getResources().subscribe(
      (data: Recurso[]) => {
        this.recursos = data;
        this.applyFilters();
      },
      (error) => {
        console.error('Error al cargar los recursos:', error);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userAttributesSubscription) {
      this.userAttributesSubscription.unsubscribe();
    }
    if (this.recursosSubscription) {
      this.recursosSubscription.unsubscribe();
    }

    // Limpiar el listener al destruir el componente
    const crearRecursoModal = document.getElementById('crearRecursoModal');
    if (crearRecursoModal) {
      crearRecursoModal.removeEventListener('hidden.bs.modal', this.onCrearRecursoModalHidden);
    }
  }

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

  viewResourceDetails(recurso: Recurso): void {
    this.selectedRecursoForDetails = recurso;
  }

  editResource(recurso: Recurso): void {
    this.selectedRecursoForEdit = { ...recurso };
  }

  onResourceEdited(updatedRecurso: Recurso): void {
    this.getResources();
    this.closeEditModal();
  }

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
   * Método para llamar al resetForm del componente hijo CrearRecursoComponent
   * cuando el modal de crear recurso se cierra.
   */
  onCrearRecursoModalHidden(): void {
    if (this.crearRecursoComponent) {
      this.crearRecursoComponent.resetForm(); // **Llama al método resetForm del componente hijo**
    }
  }
}