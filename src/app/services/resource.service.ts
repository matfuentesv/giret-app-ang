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


export interface Documento {
  id?: number;
  key: string;
  nombreArchivo: string;
  url: string;
  tipoMime: string;
  fechaCarga: string; 
  recursoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private baseUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com'; 
  

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