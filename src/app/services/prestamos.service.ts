import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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

export interface Loan {
  idPrestamo?: number; 
  recursoId: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  solicitante: string;
  estado: string;
  resource?: Resource; 
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private baseUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com'; // URL base para los préstamos

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los préstamos del backend.
   * @returns Un Observable con un array de objetos Loan.
   */
  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loan/findAll`);
  }

  /**
   * Guarda un nuevo préstamo en el backend.
   * @param loan El objeto Loan a guardar.
   * @returns Un Observable con el préstamo guardado (que podría incluir el ID generado).
   */
  saveLoan(loan: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loan/saveLoan`, loan);
  }

  updateLoanState(loanId: number, recursoId: number, newState: string): Observable<boolean> {
    const body = {
      prestamoId: loanId, 
      recursoId: recursoId 
    };
    // La URL sigue incluyendo {state} e {id} como path variables
    return this.http.put<boolean>(`${this.baseUrl}/loan/updateLoanByState`, body);
  }
}