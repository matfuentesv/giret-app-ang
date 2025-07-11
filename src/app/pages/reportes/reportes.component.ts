// reportes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService, Loan } from '../../services/prestamos.service';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Observable, forkJoin } from 'rxjs';

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
        console.error('Error al cargar inventario general:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Inventario General.');
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
        this.reportData = data.filter(r => r.estado === 'Bodega');
        this.currentReportTitle = 'Recursos en Bodega';
        this.isLoading = false;
        console.log('Reporte Recursos en Bodega:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar recursos en bodega:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Recursos en Bodega.');
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
        this.reportData = data.filter(r => r.estado === 'asignado');
        this.currentReportTitle = 'Recursos Asignados';
        this.isLoading = false;
        console.log('Reporte Recursos Asignados:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar recursos asignados:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Recursos Asignados.');
      }
    });
  }

  /**
   * Genera el reporte de Recursos en Mantenimiento.
   */
  generateMantenimientoResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(r => r.estado === 'mantenimiento');
        this.currentReportTitle = 'Recursos en Mantenimiento';
        this.isLoading = false;
        console.log('Reporte Recursos en Mantenimiento:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar recursos en mantenimiento:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Recursos en Mantenimiento.');
      }
    });
  }

  /**
   * Genera el reporte de Préstamos Activos.
   */
  generateActiveLoansReport(): void {
    this.isLoading = true;
    this.prestamosService.getLoans().subscribe({
      next: (data: Loan[]) => {
        this.reportData = data.filter(loan => loan.estado === 'activo');
        this.currentReportTitle = 'Préstamos Activos';
        this.isLoading = false;
        console.log('Reporte Préstamos Activos:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar préstamos activos:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Préstamos Activos.');
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
        // Modificación clave: Filtrar directamente por el estado 'atrasado'
        // Se usa toLowerCase() para asegurar que la comparación no sea sensible a mayúsculas y minúsculas.
        this.reportData = data.filter(loan => loan.estado.toLowerCase() === 'atrasado');
        this.currentReportTitle = 'Préstamos Atrasados';
        this.isLoading = false;
        console.log('Reporte Préstamos Atrasados (por estado "Atrasado"):', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar préstamos atrasados:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Préstamos Atrasados.');
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
        this.reportData = data.filter(loan => loan.estado === 'devuelto');
        this.currentReportTitle = 'Préstamos Devueltos';
        this.isLoading = false;
        console.log('Reporte Préstamos Devueltos:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar préstamos devueltos:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Préstamos Devueltos.');
      }
    });
  }

  /**
   * Genera el reporte de Recursos de Computación.
   */
  generateComputacionResourcesReport(): void {
    this.isLoading = true;
    this.resourceService.getResources().subscribe({
      next: (data: Recurso[]) => {
        this.reportData = data.filter(r => r.categoria === 'Computacion');
        this.currentReportTitle = 'Recursos de Computación';
        this.isLoading = false;
        console.log('Reporte Recursos de Computación:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar recursos de computación:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Recursos de Computación.');
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
        const today = new Date();
        this.reportData = data.filter(r =>
          r.fechaVencimientoGarantia && new Date(r.fechaVencimientoGarantia) < today
        );
        this.currentReportTitle = 'Recursos con Garantía Vencida';
        this.isLoading = false;
        console.log('Reporte Recursos con Garantía Vencida:', this.reportData);
      },
      error: (error) => {
        console.error('Error al cargar recursos con garantía vencida:', error);
        this.isLoading = false;
        alert('Error al cargar el reporte de Recursos con Garantía Vencida.');
      }
    });
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
        return 'text-bg-primary';
      case 'eliminado':
        return 'text-bg-dark';
      default:
        return 'text-bg-light text-dark';
    }
  }

  getTitleCase(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // --- Funciones para la descarga de reportes (ya implementadas) ---

  /**
   * Genera el contenido del reporte actual en formato CSV.
   * @returns El contenido CSV como una cadena de texto.
   */
  generateCsvContent(): string {
    if (!this.reportData || this.reportData.length === 0) {
      return '';
    }

    let csv = '';
    const headers: string[] = [];

    if (this.isResourceReport(this.currentReportTitle)) {
      csv += 'ID,Modelo,No. Serie,Categoría,Estado,Email Usuario,Fecha Garantía\n';
      headers.push('idRecurso', 'modelo', 'numeroSerie', 'categoria', 'estado', 'emailUsuario', 'fechaVencimientoGarantia');
    } else if (this.isLoanReport(this.currentReportTitle)) {
      csv += 'Recurso,Solicitante,Fecha Préstamo,Fecha Devolución,Estado\n';
      headers.push('resource', 'solicitante', 'fechaPrestamo', 'fechaDevolucion', 'estado');
    } else {
      const firstItem = this.reportData[0];
      for (const key in firstItem) {
        if (Object.prototype.hasOwnProperty.call(firstItem, key)) {
          csv += `"${key}",`;
          headers.push(key);
        }
      }
      csv = csv.slice(0, -1) + '\n'; // Eliminar la última coma y añadir salto de línea
    }

    // Añadir filas de datos
    this.reportData.forEach(item => {
      const row: string[] = [];
      headers.forEach(header => {
        let value = item[header]; // Obtener el valor crudo

        
        if (header === 'resource') { 
          const resourceInfo = value ? `${value.modelo} (N° Serie: ${value.numeroSerie})` : 'N/A';
          row.push(`"${resourceInfo}"`);
        } else if (header === 'fechaPrestamo' || header === 'fechaDevolucion' || header === 'fechaVencimientoGarantia') {
          row.push(`"${this.formatDate(value || '')}"`);
        } else if (header === 'estado') {
          
          row.push(`"${this.getTitleCase(value || '')}"`);
        } else {
          
          const stringValue = (value === undefined || value === null) ? '' : String(value);
          row.push(`"${stringValue.replace(/"/g, '""')}"`); 
        }
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  }
  /**
   * Descarga el reporte actual como un archivo CSV.
   */
  downloadReport(): void {
    if (this.reportData.length === 0) {
      alert('No hay datos en el reporte para descargar.');
      return;
    }

    const csvContent = this.generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `${this.currentReportTitle.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection for HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    } else {
      // Fallback for older browsers (not typically needed in modern Angular apps)
      window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    }
  }

  /**
   * Limpia los datos del reporte y el título actual.
   */
  clearReport(): void {
    this.reportData = [];
    this.currentReportTitle = '';
    this.isLoading = false; // Asegurarse de que el estado de carga también se resetee
  }
}