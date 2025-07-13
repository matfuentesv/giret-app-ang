import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @fileoverview Este archivo define las interfaces de datos para los recursos y préstamos,
 * y el servicio `PrestamosService` que interactúa con una API para gestionar
 * las operaciones relacionadas con los préstamos.
 */

/**
 * @description Interfaz que define la estructura de un Recurso.
 * @property {number} [idRecurso] - El ID único del recurso (opcional, ya que puede ser generado por el backend).
 * @property {string} modelo - El modelo del recurso.
 * @property {string} descripcion - Una descripción detallada del recurso.
 * @property {string} numeroSerie - El número de serie único del recurso.
 * @property {string} fechaCompra - La fecha de compra del recurso en formato de cadena (YYYY-MM-DD).
 * @property {string} fechaVencimientoGarantia - La fecha de vencimiento de la garantía en formato de cadena (YYYY-MM-DD).
 * @property {string} emailUsuario - El email del usuario asociado al recurso.
 * @property {string} estado - El estado actual del recurso (ej. 'En Bodega', 'Prestado', 'Asignado', 'Mantenimiento', 'Eliminado').
 * @property {string} categoria - La categoría a la que pertenece el recurso (ej. 'Computacion', 'Mobiliario').
 */
export interface Resource {
  idRecurso?: number; 
  modelo: string;
  descripcion: string;
  numeroSerie: string;
  fechaCompra: string;
  fechaVencimientoGarantia: string;
  emailUsuario: string;
  estado: string;
  categoria: string;
}

/**
 * @description Interfaz que define la estructura de un Préstamo.
 * @property {number} [idPrestamo] - El ID único del préstamo (opcional, ya que puede ser generado por el backend).
 * @property {number} recursoId - El ID del recurso que está siendo prestado.
 * @property {string} fechaPrestamo - La fecha en que se realizó el préstamo en formato de cadena (YYYY-MM-DD).
 * @property {string} fechaDevolucion - La fecha en que se espera la devolución del préstamo en formato de cadena (YYYY-MM-DD).
 * @property {string} solicitante - El nombre o identificación del solicitante del préstamo.
 * @property {string} estado - El estado actual del préstamo (ej. 'activo', 'devuelto', 'atrasado').
 * @property {Resource} [resource] - El objeto `Resource` asociado a este préstamo (opcional, puede ser cargado por el backend).
 */
export interface Loan {
  idPrestamo?: number; 
  recursoId: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  solicitante: string;
  estado: string;
  resource?: Resource; 
}

/**
 * @description Servicio `PrestamosService` para interactuar con la API de backend
 * y gestionar las operaciones relacionadas con los préstamos.
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class PrestamosService {

  /**
   * @description URL base de la API de backend para las operaciones de préstamos.
   * @private
   * @type {string}
   */
  private baseUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com'; 

  /**
   * @description Constructor del servicio PrestamosService.
   * Inyecta el `HttpClient` para realizar solicitudes HTTP al backend.
   * @param {HttpClient} http - Cliente HTTP de Angular.
   */
  constructor(private http: HttpClient) { }

  /**
   * @description Obtiene todos los préstamos del backend.
   * Realiza una solicitud GET al endpoint `/loan/findAll`.
   * @returns {Observable<Loan[]>} Un observable que emite un array de objetos `Loan`.
   */
  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loan/findAll`);
  }

  /**
   * @description Guarda un nuevo préstamo en el backend.
   * Realiza una solicitud POST al endpoint `/loan/saveLoan`.
   * @param {Loan} loan - El objeto `Loan` a guardar.
   * @returns {Observable<Loan>} Un observable que emite el préstamo guardado (que podría incluir el ID generado por el backend).
   */
  saveLoan(loan: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loan/saveLoan`, loan);
  }

  /**
   * @description Actualiza el estado de un préstamo en el backend.
   * Realiza una solicitud PUT al endpoint `/loan/updateLoanByState`.
   * Envía el `prestamoId` y el `recursoId` en el cuerpo de la solicitud.
   * @param {number} loanId - El ID del préstamo a actualizar.
   * @param {number} recursoId - El ID del recurso asociado al préstamo.
   * @param {string} newState - El nuevo estado al que se desea cambiar el préstamo (ej. 'devuelto').
   * @returns {Observable<boolean>} Un observable que emite `true` si la actualización fue exitosa, `false` en caso contrario.
   */
  updateLoanState(loanId: number, recursoId: number, newState: string): Observable<boolean> {
    const body = {
      prestamoId: loanId, 
      recursoId: recursoId 
    };
    // La URL sigue incluyendo {state} e {id} como path variables
    return this.http.put<boolean>(`${this.baseUrl}/loan/updateLoanByState`, body);
  }
}