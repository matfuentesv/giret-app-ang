import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @fileoverview Este archivo define la interfaz para el historial de recursos
 * y el servicio `HistorialService` que interactúa con una API para obtener
 * el historial de cambios de estado de un recurso específico.
 */

/**
 * @description Interfaz que define la estructura de un registro en el historial de recursos.
 * @property {number} [idHistorial] - El ID único del registro de historial (opcional).
 * @property {number} recursoId - El ID del recurso al que pertenece este registro de historial.
 * @property {string} fechaCambioEstado - La fecha y hora en que ocurrió el cambio de estado en formato de cadena.
 * @property {string} accion - La acción realizada (ej. 'creado', 'actualizado', 'prestado', 'devuelto').
 * @property {string} descripcion - Una descripción detallada del cambio o evento.
 */
export interface HistorialResource {
  idHistorial?: number;
  recursoId: number;
  fechaCambioEstado: string;
  accion: string;
  descripcion: string;
}

/**
 * @description Servicio `HistorialService` para interactuar con la API de backend
 * y obtener el historial de recursos.
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  /**
   * @description URL base de la API de backend para las operaciones del historial de recursos.
   * @private
   * @type {string}
   */
  private historicalResourceUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  /**
   * @description Constructor del servicio HistorialService.
   * Inyecta el `HttpClient` para realizar solicitudes HTTP al backend.
   * @param {HttpClient} http - Cliente HTTP de Angular.
   */
  constructor(private http: HttpClient) { }

  /**
   * @description Obtiene el historial de un recurso específico por su ID.
   * Realiza una solicitud GET al endpoint `/historical-resource/findById/{id}`.
   * @param {number} id - El ID del recurso cuyo historial se desea obtener.
   * @returns {Observable<HistorialResource[]>} Un observable que emite un array de objetos `HistorialResource`.
   */
  getHistoricalByResourceId(id: number): Observable<HistorialResource[]> {
    return this.http.get<HistorialResource[]>(`${this.historicalResourceUrl}/historical-resource/findById/${id}`);
  }
}