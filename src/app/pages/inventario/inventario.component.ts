import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CognitoService } from '../../auth/cognito.service';
import { Subscription } from 'rxjs';
import { DetallesPrestamoComponent } from '../detalles-prestamo/detalles-prestamo.component';
import { CrearRecursoComponent } from '../crear-recurso/crear-recurso.component';
import { EditarRecursoComponent } from '../editar-recurso/editar-recurso.component'; 
import { ResourceService, Recurso } from '../../services/resource.service'; 
import { FormsModule } from '@angular/forms';


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
  recursos: Recurso[] = []; // ¡Aquí se declara la propiedad 'recursos'!
  private recursosSubscription: Subscription | undefined; // Para desuscribirse de la carga de recursos
  searchTerm: string = ''; // Término de búsqueda para el input
  selectedEstado: string = 'Filtrar por estado'; // Estado seleccionado en el dropdown, inicializado con el texto de la opción
  filteredRecursos: Recurso[] = []; // Almacena los recursos que se muestran en la tabla (después de filtrar/buscar)

  constructor(
    private cognitoService: CognitoService,
    private resourceService: ResourceService 
  ) {}

  ngOnInit(): void {
    // Suscripción para obtener el email del usuario 
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

    // Llama al método para cargar los recursos desde el backend
    this.getResources();
  }

  /**
   * Obtiene la lista de recursos del backend usando el ResourceService.
   */
  getResources(): void {
    this.recursosSubscription = this.resourceService.getResources().subscribe(
      (data: Recurso[]) => {
        this.recursos = data; // Asigna los datos obtenidos a la propiedad 'recursos'
        this.applyFilters();
        console.log('Recursos cargados:', this.recursos); // Para depuracion
      },
      (error) => {
        console.error('Error al cargar los recursos:', error);
      }
    );
  }

  ngOnDestroy(): void {
    //desuscribirse de los Observables para evitar fugas de memoria
    if (this.userAttributesSubscription) {
      this.userAttributesSubscription.unsubscribe();
    }
    if (this.recursosSubscription) {
      this.recursosSubscription.unsubscribe();
    }
  }

/**
   * Aplica los filtros de búsqueda y estado a la lista de recursos.
   */
  applyFilters(): void {
    let tempRecursos = [...this.recursos]; // Crea una copia para no modificar el array original

    // Filtrar por término de búsqueda (modelo o número de serie)
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();
      tempRecursos = tempRecursos.filter(recurso =>
        recurso.modelo.toLowerCase().includes(lowerCaseSearchTerm) ||
        recurso.numeroSerie.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filtrar por estado seleccionado
    if (this.selectedEstado && this.selectedEstado !== 'Filtrar por estado') {
      tempRecursos = tempRecursos.filter(recurso =>
        recurso.estado === this.selectedEstado
      );
    }

    this.filteredRecursos = tempRecursos; // Actualiza la lista que se muestra en la tabla
  }
}