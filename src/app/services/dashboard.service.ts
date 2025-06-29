import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para los datos del dashboard (ya existente)
export interface DashboardData {
  recursosTotales: number;
  recursosPrestados: number;
  recursosMantenimiento: number;
  recursosEliminado: number;
}

// Nueva Interfaz para el conteo por estado
export interface EstadoCount {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

// Nueva Interfaz para el Recurso anidado en LoanDue
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

// NUEVA INTERFAZ para los préstamos por vencer
export interface LoanDue {
  prestamoId: number
  solicitadoPor: string;
  mensajeVencimiento: string;
  fechaDevolucion: string;
  recurso: RecursoDashboard;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://52.54.77.191:8085/bff/dashboard'; // URL base de tu API

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los datos principales del dashboard.
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/findAll`);
  }

  /**
   * Obtiene el conteo de recursos por estado con porcentaje.
   */
  getCountByEstadoConPorcentaje(): Observable<EstadoCount[]> {
    return this.http.get<EstadoCount[]>(`${this.apiUrl}/countByEstadoConPorcentaje`);
  }

  // NUEVO MÉTODO para obtener los préstamos por vencer
  getLoansDue(): Observable<LoanDue[]> {
    return this.http.get<LoanDue[]>(`${this.apiUrl}/findLoanDue`);
  }
}