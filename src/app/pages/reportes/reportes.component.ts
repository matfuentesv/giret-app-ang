import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService, Loan } from '../../services/prestamos.service';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Observable, forkJoin } from 'rxjs'; // Importa Observable y forkJoin si es necesario para combinar llamadas

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  reportData: any[] = [];
  currentReportTitle: string = '';
  isLoading: boolean = false;

  constructor(
    private prestamosService: PrestamosService,
    private resourceService: ResourceService
  ) { }

  ngOnInit(): void {
    // Puedes cargar un reporte por defecto al inicio si lo deseas
  }

  /**
   * Genera el reporte de Inventario General de Recursos.
   */
  generateInventoryReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data;
        this.currentReportTitle = 'Inventario General de Recursos';
        this.isLoading = false;
        console.log('Reporte Inventario General:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de inventario:', error);
        alert('Hubo un error al generar el reporte de inventario.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos en Bodega.
   */
  generateBodegaResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => recurso.estado.toLowerCase() === 'bodega');
        this.currentReportTitle = 'Recursos en Bodega';
        this.isLoading = false;
        console.log('Reporte Recursos en Bodega:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de recursos en bodega:', error);
        alert('Hubo un error al generar el reporte de recursos en bodega.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos Asignados.
   */
  generateAssignedResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => recurso.estado.toLowerCase() === 'asignado');
        this.currentReportTitle = 'Recursos Asignados';
        this.isLoading = false;
        console.log('Reporte Recursos Asignados:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de recursos asignados:', error);
        alert('Hubo un error al generar el reporte de recursos asignados.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos en Mantenimiento.
   */
  generateMaintenanceResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => recurso.estado.toLowerCase() === 'mantenimiento');
        this.currentReportTitle = 'Recursos en Mantenimiento';
        this.isLoading = false;
        console.log('Reporte Recursos en Mantenimiento:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de recursos en mantenimiento:', error);
        alert('Hubo un error al generar el reporte de recursos en mantenimiento.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos Eliminados.
   */
  generateDeletedResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => recurso.estado.toLowerCase() === 'eliminado');
        this.currentReportTitle = 'Recursos Eliminados';
        this.isLoading = false;
        console.log('Reporte Recursos Eliminados:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de recursos eliminados:', error);
        alert('Hubo un error al generar el reporte de recursos eliminados.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos de Computación (por categoría).
   */
  generateComputacionResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => recurso.categoria.toLowerCase() === 'computacion');
        this.currentReportTitle = 'Recursos de Computación';
        this.isLoading = false;
        console.log('Reporte Recursos de Computación:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de recursos de computación:', error);
        alert('Hubo un error al generar el reporte de recursos de computación.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Recursos con Garantía Vencida.
   */
  generateExpiredWarrantyResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(recurso => this.isWarrantyExpired(recurso.fechaVencimientoGarantia || ''));
        this.currentReportTitle = 'Recursos con Garantía Vencida';
        this.isLoading = false;
        console.log('Reporte Recursos con Garantía Vencida:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de garantías vencidas:', error);
        alert('Hubo un error al generar el reporte de garantías vencidas.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Función de utilidad para verificar si una garantía ha vencido.
   * @param warrantyDateString La fecha de vencimiento de la garantía en formato string.
   * @returns true si la garantía ha vencido, false en caso contrario.
   */
  private isWarrantyExpired(warrantyDateString: string): boolean {
    if (!warrantyDateString) return false;
    const warrantyDate = new Date(warrantyDateString);
    const today = new Date();
    // Normalizar a inicio del día para una comparación precisa
    warrantyDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return warrantyDate < today;
  }

  /**
   * Genera el reporte de Préstamos Activos.
   */
  generateActiveLoansReport(): void {
    this.isLoading = true;
    this.prestamosService.getLoans().subscribe({
      next: (data: Loan[]) => {
        this.reportData = data.filter(loan => loan.estado.toLowerCase() === 'activo');
        this.currentReportTitle = 'Préstamos Activos';
        this.isLoading = false;
        console.log('Reporte Préstamos Activos:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de préstamos activos:', error);
        alert('Hubo un error al generar el reporte de préstamos activos.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Préstamos Atrasados.
   */
  generateOverdueLoansReport(): void {
    this.isLoading = true;
    this.prestamosService.getLoans().subscribe({
      next: (data: Loan[]) => {
        this.reportData = data.filter(loan => loan.estado.toLowerCase() === 'atrasado');
        this.currentReportTitle = 'Préstamos Atrasados';
        this.isLoading = false;
        console.log('Reporte Préstamos Atrasados:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de préstamos atrasados:', error);
        alert('Hubo un error al generar el reporte de préstamos atrasados.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Genera el reporte de Préstamos Devueltos.
   */
  generateReturnedLoansReport(): void {
    this.isLoading = true;
    this.prestamosService.getLoans().subscribe({
      next: (data: Loan[]) => {
        this.reportData = data.filter(loan => loan.estado.toLowerCase() === 'devuelto');
        this.currentReportTitle = 'Préstamos Devueltos';
        this.isLoading = false;
        console.log('Reporte Préstamos Devueltos:', this.reportData);
      },
      error: (error) => {
        console.error('Error al generar reporte de préstamos devueltos:', error);
        alert('Hubo un error al generar el reporte de préstamos devueltos.');
        this.isLoading = false;
      }
    });
  }

  /**
   * Limpia los datos del reporte y el título.
   */
  clearReport(): void {
    this.reportData = [];
    this.currentReportTitle = '';
    this.isLoading = false;
  }

  /**
   * Determina si el reporte actual es de tipo Recurso para mostrar las columnas correctas.
   * @param title El título del reporte actual.
   * @returns true si es un reporte de Recurso, false en caso contrario.
   */
  isResourceReport(title: string): boolean {
    return [
      'Inventario General de Recursos',
      'Recursos en Bodega',
      'Recursos Asignados',
      'Recursos en Mantenimiento',
      'Recursos Eliminados',
      'Recursos de Computación',
      'Recursos con Garantía Vencida'
    ].includes(title);
  }

  /**
   * Determina si el reporte actual es de tipo Préstamo para mostrar las columnas correctas.
   * @param title El título del reporte actual.
   * @returns true si es un reporte de Préstamo, false en caso contrario.
   */
  isLoanReport(title: string): boolean {
    return [
      'Préstamos Activos',
      'Préstamos Atrasados',
      'Préstamos Devueltos'
    ].includes(title);
  }

  // --- Funciones de utilidad para formateo ---

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }

  getBadgeClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'atrasado':
        return 'text-bg-danger';
      case 'activo':
        return 'text-bg-warning';
      case 'devuelto':
        return 'text-bg-secondary';
      case 'bodega':
        return 'text-bg-success';
      case 'asignado':
        return 'text-bg-info';
      case 'mantenimiento':
        return 'text-bg-dark';
      case 'eliminado':
        return 'text-bg-danger';
      default:
        return 'text-bg-primary';
    }
  }

  getTitleCase(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}