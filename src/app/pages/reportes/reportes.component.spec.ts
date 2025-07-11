// src/app/pages/reportes/reportes.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReportesComponent } from './reportes.component';
import { PrestamosService, Loan } from '../../services/prestamos.service';
import { ResourceService, Recurso } from '../../services/resource.service';
import { of, throwError, Subject, Observable } from 'rxjs';

// --- Mocks para los Servicios ---

// Mock de ResourceService
class MockResourceService {
  getResources(): Observable<Recurso[]> {
    return of([
      { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'disponible', descripcion: '...', fechaCompra: '2023-01-15', fechaVencimientoGarantia: '2024-01-15', emailUsuario: 'user1@example.com', categoria: 'Computacion' }, // Garantía Vencida
      { idRecurso: 2, modelo: 'Monitor Dell', numeroSerie: 'SN456', estado: 'Bodega', descripcion: '...', fechaCompra: '2023-02-20', fechaVencimientoGarantia: '2026-02-20', emailUsuario: 'user2@example.com', categoria: 'Electronica' },
      { idRecurso: 3, modelo: 'Teclado Logitech', numeroSerie: 'SN789', estado: 'asignado', descripcion: '...', fechaCompra: '2024-03-01', fechaVencimientoGarantia: '2026-03-01', emailUsuario: 'user3@example.com', categoria: 'Computacion' },
      { idRecurso: 4, modelo: 'Mouse Razer', numeroSerie: 'SN101', estado: 'mantenimiento', descripcion: '...', fechaCompra: '2024-04-10', fechaVencimientoGarantia: '2026-04-10', emailUsuario: 'user4@example.com', categoria: 'Electronica' },
      { idRecurso: 5, modelo: 'Impresora Epson', numeroSerie: 'SN202', estado: 'disponible', descripcion: '...', fechaCompra: '2023-05-01', fechaVencimientoGarantia: '2027-05-01', emailUsuario: 'user5@example.com', categoria: 'Oficina' },
      { idRecurso: 6, modelo: 'Servidor Dell', numeroSerie: 'SRV001', estado: 'disponible', descripcion: '...', fechaCompra: '2024-01-01', fechaVencimientoGarantia: '2025-12-31', emailUsuario: 'admin@example.com', categoria: 'Redes' }, // Garantía no vencida
    ]);
  }
}

// Mock de PrestamosService
class MockPrestamosService {
  getLoans(): Observable<Loan[]> {
    return of([
      { idPrestamo: 1, recursoId: 1, fechaPrestamo: '2025-07-01', fechaDevolucion: '2025-07-10', solicitante: 'Alice', estado: 'activo', resource: { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'activo', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
      { idPrestamo: 2, recursoId: 2, fechaPrestamo: '2025-06-25', fechaDevolucion: '2025-07-05', solicitante: 'Bob', estado: 'atrasado', resource: { idRecurso: 2, modelo: 'Monitor Dell', numeroSerie: 'SN456', estado: 'atrasado', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
      { idPrestamo: 3, recursoId: 3, fechaPrestamo: '2025-07-05', fechaDevolucion: '2025-07-08', solicitante: 'Charlie', estado: 'devuelto', resource: { idRecurso: 3, modelo: 'Teclado Logitech', numeroSerie: 'SN789', estado: 'devuelto', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
      { idPrestamo: 4, recursoId: 1, fechaPrestamo: '2025-07-09', fechaDevolucion: '2025-07-15', solicitante: 'David', estado: 'activo', resource: { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'activo', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
      { idPrestamo: 5, recursoId: 4, fechaPrestamo: '2025-06-01', fechaDevolucion: '2025-06-10', solicitante: 'Eve', estado: 'atrasado', resource: { idRecurso: 4, modelo: 'Mouse Razer', numeroSerie: 'SN101', estado: 'atrasado', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
    ]);
  }
}

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let prestamosService: PrestamosService;
  let resourceService: ResourceService;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesComponent], // Standalone component
      providers: [
        { provide: PrestamosService, useClass: MockPrestamosService },
        { provide: ResourceService, useClass: MockResourceService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    prestamosService = TestBed.inject(PrestamosService);
    resourceService = TestBed.inject(ResourceService);
    fixture.detectChanges(); // Initial change detection
    
    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');

    // Mock Date for consistent 'Expired Warranty' testing (assuming current date is 2025-07-11)
    jasmine.clock().install();
    const baseTime = new Date('2025-07-11T12:00:00Z'); // Friday, July 11, 2025
    jasmine.clock().mockDate(baseTime);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should not load any report by default', () => {
      const getResourcesSpy = spyOn(resourceService, 'getResources');
      const getLoansSpy = spyOn(prestamosService, 'getLoans');
      
      component.ngOnInit();
      
      expect(getResourcesSpy).not.toHaveBeenCalled();
      expect(getLoansSpy).not.toHaveBeenCalled();
      expect(component.reportData.length).toBe(0);
      expect(component.currentReportTitle).toBe('');
      expect(component.isLoading).toBeFalse();
    });
  });

  // --- Tests para reportes de Recursos ---
  describe('Resource Reports', () => {
    let getResourcesSpy: jasmine.Spy;

    beforeEach(() => {
      getResourcesSpy = spyOn(resourceService, 'getResources');
    });

    it('generateInventoryReport should populate reportData with all resources', fakeAsync(() => {
      getResourcesSpy.and.callThrough(); // Use the actual mock data
      component.generateInventoryReport();
      tick();
      expect(component.reportData.length).toBe(6); // All resources from mock
      expect(component.currentReportTitle).toBe('Inventario General de Recursos');
      expect(component.isLoading).toBeFalse();
    }));

    it('generateInventoryReport should handle error', fakeAsync(() => {
      getResourcesSpy.and.returnValue(throwError(() => new Error('Error al cargar inventario general')));
      component.generateInventoryReport();
      tick();
      expect(component.reportData.length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar inventario general:', jasmine.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Error al cargar el reporte de Inventario General.');
    }));

    it('generateBodegaResourcesReport should filter resources by "Bodega" status', fakeAsync(() => {
      getResourcesSpy.and.callThrough();
      component.generateBodegaResourcesReport();
      tick();
      expect(component.reportData.length).toBe(1);
      expect(component.reportData[0].modelo).toBe('Monitor Dell');
      expect(component.currentReportTitle).toBe('Recursos en Bodega');
    }));

    it('generateAssignedResourcesReport should filter resources by "asignado" status', fakeAsync(() => {
      getResourcesSpy.and.callThrough();
      component.generateAssignedResourcesReport();
      tick();
      expect(component.reportData.length).toBe(1);
      expect(component.reportData[0].modelo).toBe('Teclado Logitech');
      expect(component.currentReportTitle).toBe('Recursos Asignados');
    }));

    it('generateMantenimientoResourcesReport should filter resources by "mantenimiento" status', fakeAsync(() => {
      getResourcesSpy.and.callThrough();
      component.generateMantenimientoResourcesReport();
      tick();
      expect(component.reportData.length).toBe(1);
      expect(component.reportData[0].modelo).toBe('Mouse Razer');
      expect(component.currentReportTitle).toBe('Recursos en Mantenimiento');
    }));

    it('generateComputacionResourcesReport should filter resources by "Computacion" category', fakeAsync(() => {
      getResourcesSpy.and.callThrough();
      component.generateComputacionResourcesReport();
      tick();
      expect(component.reportData.length).toBe(2); // Laptop HP, Teclado Logitech
      expect(component.reportData.every(r => r.categoria === 'Computacion')).toBeTrue();
      expect(component.currentReportTitle).toBe('Recursos de Computación');
    }));

    it('generateExpiredWarrantyResourcesReport should filter resources with expired warranty', fakeAsync(() => {
      getResourcesSpy.and.callThrough();
      component.generateExpiredWarrantyResourcesReport();
      tick();
      expect(component.reportData.length).toBe(1); // Laptop HP (warranty '2024-01-15' < '2025-07-11')
      expect(component.reportData[0].modelo).toBe('Laptop HP');
      expect(component.currentReportTitle).toBe('Recursos con Garantía Vencida');
    }));

    // Test for isLoading status for a generic resource report
    it('any resource report should set isLoading to true then false', fakeAsync(() => {
      const resourcesSubject = new Subject<Recurso[]>();
      getResourcesSpy.and.returnValue(resourcesSubject);
      component.generateInventoryReport(); // Use any resource report method
      expect(component.isLoading).toBeTrue();
      resourcesSubject.next([]);
      resourcesSubject.complete();
      tick();
      expect(component.isLoading).toBeFalse();
    }));
  });

  // --- Tests para reportes de Préstamos ---
  describe('Loan Reports', () => {
    let getLoansSpy: jasmine.Spy;

    beforeEach(() => {
      getLoansSpy = spyOn(prestamosService, 'getLoans');
    });

    it('generateActiveLoansReport should filter loans by "activo" status', fakeAsync(() => {
      getLoansSpy.and.callThrough();
      component.generateActiveLoansReport();
      tick();
      expect(component.reportData.length).toBe(2); // Alice, David
      expect(component.reportData.every(loan => loan.estado === 'activo')).toBeTrue();
      expect(component.currentReportTitle).toBe('Préstamos Activos');
      expect(component.isLoading).toBeFalse();
    }));

    it('generateOverdueLoansReport should filter loans by "atrasado" status (case-insensitive)', fakeAsync(() => {
      getLoansSpy.and.callThrough();
      component.generateOverdueLoansReport();
      tick();
      expect(component.reportData.length).toBe(2); // Bob, Eve
      expect(component.reportData.every(loan => loan.estado.toLowerCase() === 'atrasado')).toBeTrue();
      expect(component.currentReportTitle).toBe('Préstamos Atrasados');
      expect(component.isLoading).toBeFalse();
    }));

    it('generateReturnedLoansReport should filter loans by "devuelto" status', fakeAsync(() => {
      getLoansSpy.and.callThrough();
      component.generateReturnedLoansReport();
      tick();
      expect(component.reportData.length).toBe(1); // Charlie
      expect(component.reportData[0].solicitante).toBe('Charlie');
      expect(component.currentReportTitle).toBe('Préstamos Devueltos');
      expect(component.isLoading).toBeFalse();
    }));

    // Test for isLoading status for a generic loan report
    it('any loan report should set isLoading to true then false', fakeAsync(() => {
      const loansSubject = new Subject<Loan[]>();
      getLoansSpy.and.returnValue(loansSubject);
      component.generateActiveLoansReport(); // Use any loan report method
      expect(component.isLoading).toBeTrue();
      loansSubject.next([]);
      loansSubject.complete();
      tick();
      expect(component.isLoading).toBeFalse();
    }));

    it('any loan report should handle error', fakeAsync(() => {
      getLoansSpy.and.returnValue(throwError(() => new Error('Error de préstamos')));
      component.generateActiveLoansReport(); // Use any loan report method
      tick();
      expect(component.reportData.length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar préstamos activos:', jasmine.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('Error al cargar el reporte de Préstamos Activos.');
    }));
  });

  describe('isResourceReport & isLoanReport', () => {
    it('isResourceReport should return true for resource report titles', () => {
      expect(component.isResourceReport('Inventario General de Recursos')).toBeTrue();
      expect(component.isResourceReport('Recursos en Bodega')).toBeTrue();
      expect(component.isResourceReport('Recursos Asignados')).toBeTrue();
      expect(component.isResourceReport('Recursos en Mantenimiento')).toBeTrue();
      expect(component.isResourceReport('Recursos de Computación')).toBeTrue();
      expect(component.isResourceReport('Recursos con Garantía Vencida')).toBeTrue();
      expect(component.isResourceReport('Préstamos Activos')).toBeFalse();
    });

    it('isLoanReport should return true for loan report titles', () => {
      expect(component.isLoanReport('Préstamos Activos')).toBeTrue();
      expect(component.isLoanReport('Préstamos Atrasados')).toBeTrue();
      expect(component.isLoanReport('Préstamos Devueltos')).toBeTrue();
      expect(component.isLoanReport('Inventario General de Recursos')).toBeFalse();
    });
  });

  describe('formatDate', () => {
    it('should format YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(component.formatDate('2025-07-11')).toBe('11/07/2025');
    });

    it('should return empty string for empty input', () => {
      expect(component.formatDate('')).toBe('');
      expect(component.formatDate(null as any)).toBe('');
    });

    it('should return original string if not in YYYY-MM-DD format', () => {
      expect(component.formatDate('2025/07/11')).toBe('2025/07/11');
    });
  });

  describe('getBadgeClass', () => {
    it('should return correct class for "atrasado"', () => {
      expect(component.getBadgeClass('atrasado')).toBe('text-bg-danger');
    });
    it('should return correct class for "activo"', () => {
      expect(component.getBadgeClass('activo')).toBe('text-bg-warning');
    });
    it('should return correct class for "devuelto"', () => {
      expect(component.getBadgeClass('devuelto')).toBe('text-bg-secondary');
    });
    it('should return correct class for "bodega"', () => {
      expect(component.getBadgeClass('bodega')).toBe('text-bg-success');
    });
    it('should return correct class for "asignado"', () => {
      expect(component.getBadgeClass('asignado')).toBe('text-bg-info');
    });
    it('should return correct class for "mantenimiento"', () => {
      expect(component.getBadgeClass('mantenimiento')).toBe('text-bg-primary');
    });
    it('should return correct class for "eliminado"', () => {
      expect(component.getBadgeClass('eliminado')).toBe('text-bg-dark');
    });
    it('should return default class for unknown status', () => {
      expect(component.getBadgeClass('unknown')).toBe('text-bg-light text-dark');
    });
  });

  describe('getTitleCase', () => {
    it('should convert to title case', () => {
      expect(component.getTitleCase('activo')).toBe('Activo');
      expect(component.getTitleCase('atrasado')).toBe('Atrasado');
      expect(component.getTitleCase('inventario general')).toBe('Inventario general');
    });
    it('should return empty string for null/empty input', () => {
      expect(component.getTitleCase('')).toBe('');
      expect(component.getTitleCase(null as any)).toBe('');
    });
  });

  describe('generateCsvContent', () => {
    it('should return empty string if reportData is empty', () => {
      component.reportData = [];
      expect(component.generateCsvContent()).toBe('');
    });

    it('should generate correct CSV for Resource Reports', () => {
      component.reportData = [
        { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', categoria: 'Computacion', estado: 'disponible', emailUsuario: 'user@example.com', fechaVencimientoGarantia: '2024-01-15' }
      ];
      component.currentReportTitle = 'Inventario General de Recursos';
      const expectedCsv = 'ID,Modelo,No. Serie,Categoría,Estado,Email Usuario,Fecha Garantía\n"1","Laptop HP","SN123","Computacion","Disponible","user@example.com","15/01/2024"\n';
      expect(component.generateCsvContent()).toBe(expectedCsv);
    });

    it('should generate correct CSV for Loan Reports', () => {
      component.reportData = [
        { idPrestamo: 1, recursoId: 1, fechaPrestamo: '2025-07-01', fechaDevolucion: '2025-07-10', solicitante: 'Alice', estado: 'activo', resource: { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: '', descripcion: '', fechaCompra: '', fechaVencimientoGarantia: '', emailUsuario: '', categoria: '' } },
      ];
      component.currentReportTitle = 'Préstamos Activos';
      const expectedCsv = 'Recurso,Solicitante,Fecha Préstamo,Fecha Devolución,Estado\n"Laptop HP (N° Serie: SN123)","Alice","01/07/2025","10/07/2025","Activo"\n';
      expect(component.generateCsvContent()).toBe(expectedCsv);
    });

    it('should handle special characters and null/undefined values in CSV', () => {
      component.reportData = [
        { idRecurso: 1, modelo: 'Item "Special"', numeroSerie: 'SN,X', categoria: 'Test', estado: 'disponible', emailUsuario: null, fechaVencimientoGarantia: undefined }
      ];
      component.currentReportTitle = 'Inventario General de Recursos';
      const expectedCsv = 'ID,Modelo,No. Serie,Categoría,Estado,Email Usuario,Fecha Garantía\n"1","Item ""Special""","SN,X","Test","Disponible","",""\n';
      expect(component.generateCsvContent()).toBe(expectedCsv);
    });

    it('should generate generic headers for unknown report type', () => {
      component.reportData = [
        { key1: 'value1', key2: 123 },
      ];
      component.currentReportTitle = 'Unknown Report';
      const expectedCsv = '"key1","key2"\n"value1","123"\n';
      expect(component.generateCsvContent()).toBe(expectedCsv);
    });
  });

  describe('downloadReport', () => {
    let generateCsvContentSpy: jasmine.Spy;
    let createObjectURLSpy: jasmine.Spy;
    let revokeObjectURLSpy: jasmine.Spy;
    let createElementSpy: jasmine.Spy;
    let appendChildSpy: jasmine.Spy;
    let removeChildSpy: jasmine.Spy;
    let linkClickSpy: jasmine.Spy;

    beforeEach(() => {
      generateCsvContentSpy = spyOn(component, 'generateCsvContent');
      createObjectURLSpy = spyOn(URL, 'createObjectURL');
      revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
      createElementSpy = spyOn(document, 'createElement');
      appendChildSpy = spyOn(document.body, 'appendChild');
      removeChildSpy = spyOn(document.body, 'removeChild');
      
      const mockLink = {
        download: 'test.csv',
        setAttribute: jasmine.createSpy('setAttribute'),
        click: jasmine.createSpy('click'),
        style: { visibility: '' }
      };
      createElementSpy.and.returnValue(mockLink);
      linkClickSpy = mockLink.click;
    });

    it('should alert if reportData is empty', () => {
      component.reportData = [];
      component.downloadReport();
      expect(alertSpy).toHaveBeenCalledWith('No hay datos en el reporte para descargar.');
      expect(generateCsvContentSpy).not.toHaveBeenCalled();
    });

    it('should trigger download for non-empty reportData', () => {
      component.reportData = [{ id: 1 }];
      component.currentReportTitle = 'Test Report';
      generateCsvContentSpy.and.returnValue('id\n1');
      createObjectURLSpy.and.returnValue('blob:testurl');

      component.downloadReport();

      expect(generateCsvContentSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalledWith(jasmine.any(Blob));
      expect(createElementSpy).toHaveBeenCalledWith('a');
      const link = createElementSpy.calls.first().returnValue;
      expect(link.setAttribute).toHaveBeenCalledWith('href', 'blob:testurl');
      expect(link.setAttribute).toHaveBeenCalledWith('download', jasmine.stringMatching(/^Test_Report_\d{4}-\d{2}-\d{2}\.csv$/));
      expect(appendChildSpy).toHaveBeenCalledWith(link);
      expect(linkClickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(link);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:testurl');
    });
  });

  describe('clearReport', () => {
    it('should clear reportData, currentReportTitle, and isLoading', () => {
      component.reportData = [{ id: 1 }];
      component.currentReportTitle = 'Some Report';
      component.isLoading = true;

      component.clearReport();

      expect(component.reportData).toEqual([]);
      expect(component.currentReportTitle).toBe('');
      expect(component.isLoading).toBeFalse();
    });
  });
});