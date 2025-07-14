import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrestamosService, Loan } from '../../services/prestamos.service';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Observable, forkJoin } from 'rxjs';

/**
 * @fileoverview Este componente `ReportesComponent` permite a los usuarios generar
 * diversos reportes sobre el inventario de recursos y los préstamos.
 * Proporciona funcionalidades para cargar datos filtrados por diferentes criterios
 * y exportar estos reportes a formato CSV.
 */
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  /**
   * @description Almacena los datos del reporte actual que se va a mostrar en la tabla.
   * Su estructura varía dependiendo del tipo de reporte (recursos o préstamos).
   * @type {any[]}
   */
  reportData: any[] = [];

  /**
   * @description Almacena el título del reporte que se está visualizando actualmente.
   * Se utiliza para la cabecera de la tabla y el nombre del archivo CSV.
   * @type {string}
   */
  currentReportTitle: string = '';

  /**
   * @description Bandera que indica si un reporte está siendo cargado o generado.
   * Utilizada para mostrar un indicador de carga en la interfaz de usuario.
   * @type {boolean}
   */
  isLoading: boolean = false;

  /**
   * @description Constructor del componente ReportesComponent.
   * Inyecta los servicios necesarios para obtener datos de préstamos y recursos.
   * @param {PrestamosService} prestamosService - Servicio para obtener datos de préstamos.
   * @param {ResourceService} resourceService - Servicio para obtener datos de recursos.
   */
  constructor(
    private prestamosService: PrestamosService,
    private resourceService: ResourceService
  ) { }

  /**
   * @description Hook del ciclo de vida de Angular que se ejecuta después de que el componente
   * haya sido inicializado.
   * @returns {void}
   */
  ngOnInit(): void {
    
  }

  /**
   * @description Genera el reporte de Inventario General de Recursos.
   * Obtiene todos los recursos y los asigna a `reportData`.
   * @returns {void}
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
   * @description Genera el reporte de Recursos en Bodega.
   * Obtiene todos los recursos y filtra aquellos con estado 'Bodega'.
   * @returns {void}
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
   * @description Genera el reporte de Recursos Asignados.
   * Obtiene todos los recursos y filtra aquellos con estado 'asignado'.
   * @returns {void}
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
   * @description Genera el reporte de Recursos en Mantenimiento.
   * Obtiene todos los recursos y filtra aquellos con estado 'mantenimiento'.
   * @returns {void}
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
   * @description Genera el reporte de Préstamos Activos.
   * Obtiene todos los préstamos y filtra aquellos con estado 'activo'.
   * @returns {void}
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
   * @description Genera el reporte de Préstamos Atrasados.
   * Obtiene todos los préstamos y filtra aquellos con estado 'atrasado'.
   * @returns {void}
   */
   generateOverdueLoansReport(): void {
    this.isLoading = true;
    this.prestamosService.getLoans().subscribe({
      next: (data: Loan[]) => {
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
   * @description Genera el reporte de Préstamos Devueltos.
   * Obtiene todos los préstamos y filtra aquellos con estado 'devuelto'.
   * @returns {void}
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
   * @description Genera el reporte de Recursos de Computación.
   * Obtiene todos los recursos y filtra aquellos con categoría 'Computacion'.
   * @returns {void}
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
   * @description Genera el reporte de Recursos con Garantía Vencida.
   * Obtiene todos los recursos y filtra aquellos cuya `fechaVencimientoGarantia`
   * es anterior a la fecha actual.
   * @returns {void}
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
   * @description Determina si el reporte actual es de tipo Recurso para mostrar las columnas correctas.
   * @param {string} title - El título del reporte actual.
   * @returns {boolean} `true` si es un reporte de Recurso, `false` en caso contrario.
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
   * @description Determina si el reporte actual es de tipo Préstamo para mostrar las columnas correctas.
   * @param {string} title - El título del reporte actual.
   * @returns {boolean} `true` si es un reporte de Préstamo, `false` en caso contrario.
   */
  isLoanReport(title: string): boolean {
    return [
      'Préstamos Activos',
      'Préstamos Atrasados',
      'Préstamos Devueltos'
    ].includes(title);
  }

  /**
   * @description Formatea una cadena de fecha de 'YYYY-MM-DD' a 'DD/MM/YYYY'.
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} La fecha formateada o la cadena original si el formato no es el esperado.
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }

  /**
   * @description Devuelve la clase CSS de Bootstrap adecuada para el badge de estado
   * de un recurso o préstamo, basándose en el estado proporcionado.
   * @param {string} estado - El estado del recurso o préstamo.
   * @returns {string} La clase CSS de Bootstrap para el badge.
   */
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

  /**
   * @description Convierte una cadena de texto a formato "Title Case" (primera letra en mayúscula, el resto en minúscula).
   * @param {string} text - La cadena de texto a convertir.
   * @returns {string} La cadena de texto en formato "Title Case".
   */
  getTitleCase(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * @description Genera el contenido del reporte actual en formato CSV.
   * Incluye las cabeceras y los datos del reporte, formateando fechas y nombres de recursos según el tipo de reporte.
   * @returns {string} El contenido del reporte en formato CSV.
   */
  generateCsvContent(): string {
    if (!this.reportData || this.reportData.length === 0) {
      return '';
    }

    // BOM para UTF-8: Esto le dice a las aplicaciones (como Excel) que el archivo está en UTF-8.
    // Es crucial para que los caracteres especiales y acentos se muestren correctamente.
    const utf8Bom = '\ufeff'; 

    let csv = utf8Bom; // Inicia el CSV con el BOM
    const headers: string[] = [];
    const columnSeparator = ';'; 

    if (this.isResourceReport(this.currentReportTitle)) {
      csv += `ID${columnSeparator}Modelo${columnSeparator}No. Serie${columnSeparator}Categoría${columnSeparator}Estado${columnSeparator}Email Usuario${columnSeparator}Fecha Garantía\n`;
      headers.push('idRecurso', 'modelo', 'numeroSerie', 'categoria', 'estado', 'emailUsuario', 'fechaVencimientoGarantia');
    } else if (this.isLoanReport(this.currentReportTitle)) {
      csv += `Recurso${columnSeparator}Solicitante${columnSeparator}Fecha Préstamo${columnSeparator}Fecha Devolución${columnSeparator}Estado\n`;
      headers.push('resource', 'solicitante', 'fechaPrestamo', 'fechaDevolucion', 'estado');
    } else {
      const firstItem = this.reportData[0];
      for (const key in firstItem) {
        if (Object.prototype.hasOwnProperty.call(firstItem, key)) {
          csv += `"${key}"${columnSeparator}`;
          headers.push(key);
        }
      }
      csv = csv.slice(0, -1) + '\n'; 
    }

    // Añadir filas de datos
    this.reportData.forEach(item => {
      const row: string[] = [];
      headers.forEach(header => {
        let value = item[header]; 
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
      csv += row.join(columnSeparator) + '\n';
    });

    return csv;
  }

  /**
   * @description Descarga el reporte actual como un archivo CSV.
   * Genera el contenido CSV, crea un Blob y un enlace de descarga para el usuario.
   * @returns {void}
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
      URL.revokeObjectURL(url); 
    } else {
      window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    }
  }

  /**
   * @description Limpia los datos del reporte y el título actual, restableciendo el componente a su estado inicial.
   * También desactiva el indicador de carga.
   * @returns {void}
   */
  clearReport(): void {
    this.reportData = [];
    this.currentReportTitle = '';
    this.isLoading = false; 
  }
}