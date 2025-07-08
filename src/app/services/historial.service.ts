import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para el historial de recursos
export interface HistorialResource {
  idHistorial?: number;
  recursoId: number;
  fechaCambioEstado: string;
  accion: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  // Asegúrate de que esta URL base apunte a tu endpoint de historial
  private historicalResourceUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el historial de un recurso por su ID.
   * @param id El ID del recurso.
   * @returns Un Observable con un array de objetos HistoricalResource.
   */
  getHistoricalByResourceId(id: number): Observable<HistorialResource[]> {
    return this.http.get<HistorialResource[]>(`${this.historicalResourceUrl}/historical-resource/findById/${id}`);
  }
}