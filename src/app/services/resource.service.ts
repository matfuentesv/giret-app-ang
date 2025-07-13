import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @fileoverview Este archivo define las interfaces de datos para los recursos y documentos,
 * y el servicio `ResourceService` que interactúa con una API para gestionar
 * las operaciones relacionadas con los recursos y sus documentos asociados.
 */

/**
 * @description Interfaz que define la estructura de un Recurso.
 * @property {number} [idRecurso] - El ID único del recurso (opcional, ya que puede ser generado por el backend).
 * @property {string} modelo - El modelo del recurso.
 * @property {string} descripcion - Una descripción detallada del recurso.
 * @property {string} numeroSerie - El número de serie único del recurso.
 * @property {string} fechaCompra - La fecha de compra del recurso en formato de cadena (YYYY-MM-DD).
 * @property {string} fechaVencimientoGarantia - La fecha de vencimiento de la garantía en formato de cadena (YYYY-MM-DD).
 * @property {string} estado - El estado actual del recurso (ej. 'En Bodega', 'Prestado', 'Asignado', 'Mantenimiento', 'Eliminado').
 * @property {string} emailUsuario - El email del usuario asociado al recurso.
 * @property {string} categoria - La categoría a la que pertenece el recurso (ej. 'Computacion', 'Mobiliario').
 */
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

/**
 * @description Interfaz que define la estructura de un Documento asociado a un recurso.
 * @property {number} [id] - El ID único del documento (opcional).
 * @property {string} key - La clave de almacenamiento del documento (ej. en un servicio de almacenamiento de objetos).
 * @property {string} nombreArchivo - El nombre original del archivo.
 * @property {string} url - La URL para acceder al documento.
 * @property {string} tipoMime - El tipo MIME del archivo (ej. 'application/pdf', 'image/jpeg').
 * @property {string} fechaCarga - La fecha en que el documento fue cargado en formato de cadena.
 * @property {number} [recursoId] - El ID del recurso al que está asociado este documento (opcional).
 */
export interface Documento {
  id?: number;
  key: string;
  nombreArchivo: string;
  url: string;
  tipoMime: string;
  fechaCarga: string; 
  recursoId?: number;
}

/**
 * @description Servicio `ResourceService` para interactuar con la API de backend
 * y gestionar las operaciones relacionadas con los recursos y sus documentos.
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  /**
   * @description Método placeholder para obtener el historial de un recurso por su ID.
   * Actualmente no implementado y lanza un error.
   * @param {number} recursoId - El ID del recurso cuyo historial se desea obtener.
   * @returns {any}
   * @throws {Error} Siempre lanza un error indicando que el método no está implementado.
   */
  getHistorialByResourceId(recursoId: number) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://52.54.77.191:8085/bff'; // URL base para los recursos
  
  /**
   * @description Constructor del servicio ResourceService.
   * Inyecta el `HttpClient` para realizar solicitudes HTTP al backend.
   * @param {HttpClient} http - Cliente HTTP de Angular.
   */
  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los recursos del backend.
   * @returns Un Observable con un array de recursos.
   */
  getResources(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.baseUrl}/resource/findAll`);
  }

  /**
 * Obtiene un recurso específico del backend por su ID.
 * @param recursoId El ID del recurso que se desea obtener.
 * @returns Un Observable que emite un array de recursos. Aunque el endpoint está diseñado para devolver un solo recurso,
 * la API devuelve un array para consistencia, por lo que el primer elemento del array será el recurso deseado.
 */
  getResourcesById(recursoId: number): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.baseUrl}/resource/findById/${recursoId}`);
  }

  /**
   * Actualiza un recurso existente en el backend.
   * @param recursoId El ID del recurso a actualizar.
   * @param recurso El objeto Recurso con los datos actualizados.
   * @returns Un Observable con el recurso actualizado.
   */
  updateResource(recursoId: number, recurso: Recurso): Observable<Recurso> {
    return this.http.put<Recurso>(`${this.baseUrl}/resource/update/${recursoId}`, recurso);
  }

  /**
   * Guarda un nuevo recurso en el backend.
   * @param recurso El objeto Recurso a guardar.
   * @returns Un Observable con el recurso guardado (que podría incluir el ID generado).
   */
  saveResource(recurso: Recurso): Observable<Recurso> {
    return this.http.post<Recurso>(`${this.baseUrl}/resource/save`, recurso); // POST a /save
  }

    /**
   * Sube un documento al backend asociado a un recurso específico.
   * @param file El archivo a subir (File).
   * @param recursoId El ID del recurso al que se asociará el documento.
   * @returns Un Observable con el Documento guardado.
   */
  uploadDocument(file: File, recursoId: number): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recursoId', recursoId.toString());

    
    return this.http.post<Documento>(`${this.baseUrl}/document/saveDocument`, formData);
  }

  /**
   * Obtiene la lista de documentos asociados a un recurso por su ID.
   * @param recursoId El ID del recurso.
   * @returns Un Observable con un array de Documento.
   */
  getDocumentsByRecursoId(recursoId: number): Observable<Documento[]> {
    return this.http.get<Documento[]>(`${this.baseUrl}/document/by-resource/${recursoId}`);
  }


}