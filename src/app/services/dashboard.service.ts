import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para los datos del dashboard (ya existente)
export interface DashboardData {
  recursosTotales: number;
  recursosPrestados: number;
  recursosMantenimiento: number;
  recursosAtrasados: number;
}

// ¡NUEVA Interfaz para el conteo por estado!
export interface EstadoCount {
  estado: string;
  cantidad: number;
  porcentaje: number;
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
}