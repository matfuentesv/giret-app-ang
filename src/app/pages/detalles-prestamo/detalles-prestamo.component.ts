import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Documento, Recurso, ResourceService } from '../../services/resource.service';
import { CognitoService } from '../../auth/cognito.service';

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
    private resourceService: ResourceService
  ) {}
  
  @Input() recurso: Recurso | null = null;
   documentosAsociados: Documento[] = [];

  //Método para establecer el recurso a mostrar en el modal de detalles
  viewResourceDetails(recurso: Recurso): void {
    this.selectedRecursoForDetails = recurso;
    console.log('Recurso seleccionado para detalles:', this.selectedRecursoForDetails);
  }

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
      if (this.recurso.idRecurso) {
        this.loadDocuments(this.recurso.idRecurso);
      } else {
        console.warn('Recurso recibido sin idRecurso para cargar documentos.');
      }
    }
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

}
