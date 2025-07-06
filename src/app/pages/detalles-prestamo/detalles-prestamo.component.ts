import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Documento, Recurso, ResourceService } from '../../services/resource.service';
import { CognitoService } from '../../auth/cognito.service';
import { HistorialResource, HistorialService } from '../../services/historial.service';

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

   selectedRecursoForDetails: Recurso | null = null;

  constructor(
    private cognitoService: CognitoService,
    private resourceService: ResourceService,
    private historialService: HistorialService
  ) {}
  
  @Input() recurso: Recurso | null = null;
   documentosAsociados: Documento[] = [];
   historialRecurso: HistorialResource[] = [];

   ngOnInit(): void {
     if (this.recurso) {
      this.loadDocuments(this.recurso.idRecurso!);
    }
  }

  // Este método se ejecuta cada vez que el Input 'recurso' cambia
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

  // 👈 NUEVO MÉTODO para cargar el historial del recurso
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

  // Método para cargar los documentos del recurso
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

  // Helper para formatear fechas si lo necesitas para mostrar
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-CL', options); // Ajusta 'es-CL' a tu local
  }

}
