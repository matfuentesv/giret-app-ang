import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * @fileoverview Este archivo define las interfaces de datos para el dashboard
 * y el servicio `DashboardService` que interactúa con una API para obtener
 * información relevante sobre recursos y préstamos para el panel de control.
 */

/**
 * @description Interfaz que define la estructura de los datos generales del dashboard.
 * @property {number} recursosTotales - El número total de recursos en el sistema.
 * @property {number} recursosPrestados - El número de recursos que actualmente están prestados.
 * @property {number} recursosMantenimiento - El número de recursos que están en mantenimiento.
 * @property {number} recursosEliminado - El número de recursos que han sido marcados como eliminados.
 */
export interface DashboardData {
  recursosTotales: number;
  recursosPrestados: number;
  recursosMantenimiento: number;
  recursosEliminado: number;
}

/**
 * @description Interfaz que define la estructura del conteo de recursos por estado,
 * incluyendo su porcentaje.
 * @property {string} estado - El nombre del estado del recurso (ej. 'Bodega', 'Prestado').
 * @property {number} cantidad - La cantidad de recursos en ese estado.
 * @property {number} porcentaje - El porcentaje que representa esa cantidad sobre el total de recursos.
 */
export interface EstadoCount {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

/**
 * @description Interfaz que define una versión simplificada de un recurso, utilizada
 * específicamente para mostrar en el dashboard (ej. en la lista de préstamos por vencer).
 * @property {number} [idRecurso] - El ID único del recurso (opcional).
 * @property {string} modelo - El modelo del recurso.
 * @property {string} descripcion - Una breve descripción del recurso.
 * @property {string} numeroSerie - El número de serie único del recurso.
 * @property {string} fechaCompra - La fecha de compra del recurso en formato de cadena.
 * @property {string} fechaVencimientoGarantia - La fecha de vencimiento de la garantía en formato de cadena.
 * @property {string} emailUsuario - El email del usuario asociado al recurso.
 * @property {string} estado - El estado actual del recurso (ej. 'Bodega', 'Prestado', 'Asignado').
 * @property {string} categoria - La categoría a la que pertenece el recurso (ej. 'Computacion').
 */
export interface RecursoDashboard {
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
 * @description Interfaz que define la estructura de un préstamo próximo a vencer,
 * incluyendo información del recurso asociado.
 * @property {number} prestamoId - El ID único del préstamo.
 * @property {string} solicitadoPor - El nombre del solicitante del préstamo.
 * @property {string} mensajeVencimiento - Un mensaje descriptivo sobre el estado de vencimiento.
 * @property {string} fechaDevolucion - La fecha de devolución programada del préstamo en formato de cadena.
 * @property {RecursoDashboard} recurso - El objeto `RecursoDashboard` asociado a este préstamo.
 */
export interface LoanDue {
  prestamoId: number
  solicitadoPor: string;
  mensajeVencimiento: string;
  fechaDevolucion: string;
  recurso: RecursoDashboard;
}

/**
 * @description Servicio `DashboardService` para interactuar con la API de backend
 * y obtener los datos necesarios para el dashboard de la aplicación.
 * @injectable
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  /**
   * @description URL base de la API de backend para las operaciones del dashboard.
   * @private
   * @type {string}
   */
  private apiUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com'; 

  /**
   * @description Constructor del servicio DashboardService.
   * Inyecta el `HttpClient` para realizar solicitudes HTTP al backend.
   * @param {HttpClient} http - Cliente HTTP de Angular.
   */
  constructor(private http: HttpClient) { }

  /**
   * @description Obtiene los datos generales del dashboard.
   * Realiza una solicitud GET al endpoint `/dashboard/findAll`.
   * @returns {Observable<DashboardData>} Un observable que emite un objeto `DashboardData`.
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/findAll`);
  }

  /**
   * @description Obtiene el conteo de recursos por estado, incluyendo el porcentaje.
   * Realiza una solicitud GET al endpoint `/dashboard/countByEstadoConPorcentaje`.
   * @returns {Observable<EstadoCount[]>} Un observable que emite un array de objetos `EstadoCount`.
   */
  getCountByEstadoConPorcentaje(): Observable<EstadoCount[]> {
    return this.http.get<EstadoCount[]>(`${this.apiUrl}/dashboard/countByEstadoConPorcentaje`);
  }

  /**
   * @description Obtiene la lista de préstamos próximos a vencer.
   * Realiza una solicitud GET al endpoint `/dashboard/findLoanDue`.
   * @returns {Observable<LoanDue[]>} Un observable que emite un array de objetos `LoanDue`.
   */
  getLoansDue(): Observable<LoanDue[]> {
    return this.http.get<LoanDue[]>(`${this.apiUrl}/dashboard/findLoanDue`);
  }
}