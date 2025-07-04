import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define las interfaces para la seguridad de tipos, coincidiendo con la respuesta de tu API
export interface Resource {
  idRecurso?: number; // Opcional ya que podría no estar presente al crear un nuevo préstamo
  modelo: string;
  descripcion: string;
  numeroSerie: string;
  fechaCompra: string;
  fechaVencimientoGarantia: string;
  emailUsuario: string;
  estado: string;
  categoria: string;
}

export interface Loan {
  idPrestamo?: number; // Opcional ya que será generado por el backend para nuevos préstamos
  recursoId: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  solicitante: string;
  estado: string;
  resource?: Resource; // Opcional ya que no siempre podría estar anidado o ser necesario para todas las operaciones
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private baseUrl = 'http://52.54.77.191:8085/bff/loan'; // URL base para los préstamos

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los préstamos del backend.
   * @returns Un Observable con un array de objetos Loan.
   */
  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/findAll`);
  }

  /**
   * Guarda un nuevo préstamo en el backend.
   * @param loan El objeto Loan a guardar.
   * @returns Un Observable con el préstamo guardado (que podría incluir el ID generado).
   */
  saveLoan(loan: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/saveLoan`, loan);
  }
}