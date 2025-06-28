import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Recurso {
  idRecurso?: number;
  modelo: string;
  descripcion: string;
  numeroSerie: string;
  fechaCompra: string; 
  fechaVencimientoGarantia: string; 
  estado: string;
  emailUsuario: string;
  categoria: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private baseUrl = 'http://52.54.77.191:8085/bff/resource'; // URL base para los recursos

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los recursos del backend.
   * @returns Un Observable con un array de recursos.
   */
  getResources(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.baseUrl}/findAll`);
  }

  /**
   * Guarda un nuevo recurso en el backend.
   * @param recurso El objeto Recurso a guardar.
   * @returns Un Observable con el recurso guardado (que podría incluir el ID generado).
   */
  saveResource(recurso: Recurso): Observable<Recurso> {
    return this.http.post<Recurso>(`${this.baseUrl}/save`, recurso); // POST a /save
  }

  // Aquí podrías agregar métodos para actualizar, eliminar, etc.
}