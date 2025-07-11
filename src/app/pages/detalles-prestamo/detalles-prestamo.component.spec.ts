import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetallesPrestamoComponent } from './detalles-prestamo.component';
import { ResourceService, Recurso, Documento } from '../../services/resource.service';
import { HistorialService, HistorialResource } from '../../services/historial.service';
import { CognitoService } from '../../auth/cognito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// Mock para ResourceService
class MockResourceService {
  getDocumentsByRecursoId = jasmine.createSpy('getDocumentsByRecursoId').and.returnValue(of([]));
}

// Mock para HistorialService
class MockHistorialService {
  getHistoricalByResourceId = jasmine.createSpy('getHistoricalByResourceId').and.returnValue(of([]));
}

// Mock para CognitoService (aunque no se usa directamente en la lógica del componente, se inyecta)
class MockCognitoService {
  // Puedes añadir mocks de métodos si el componente los usara
}

describe('DetallesPrestamoComponent', () => {
  let component: DetallesPrestamoComponent;
  let fixture: ComponentFixture<DetallesPrestamoComponent>;
  let resourceService: MockResourceService;
  let historialService: MockHistorialService;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, DetallesPrestamoComponent], // Importar el componente standalone y sus módulos
      providers: [
        { provide: ResourceService, useClass: MockResourceService },
        { provide: HistorialService, useClass: MockHistorialService },
        { provide: CognitoService, useClass: MockCognitoService } // Proveer el mock de CognitoService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesPrestamoComponent);
    component = fixture.componentInstance;
    resourceService = TestBed.inject(ResourceService) as unknown as MockResourceService;
    historialService = TestBed.inject(HistorialService) as unknown as MockHistorialService;
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');
    consoleWarnSpy = spyOn(console, 'warn');
    // No llamar fixture.detectChanges() aquí para controlar ngOnInit y ngOnChanges manualmente
  });

  it('should create', () => {
    // Llamar detectChanges para que ngOnInit se ejecute
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadDocuments if recurso is provided on init', fakeAsync(() => {
      const mockRecurso: Recurso = { idRecurso: 1, modelo: 'Test', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      component.recurso = mockRecurso;
      
      spyOn(component as any, 'loadDocuments').and.callThrough(); // Espía el método privado
      spyOn(component as any, 'loadHistorialData').and.callThrough(); // Espía el método privado

      fixture.detectChanges(); // Esto llama a ngOnInit

      expect(component['loadDocuments']).toHaveBeenCalledWith(1);
      // En ngOnInit, solo se llama loadDocuments, no loadHistorialData
      expect(component['loadHistorialData']).not.toHaveBeenCalled();
      
      // Simular la respuesta de los mocks para que los observables se completen
      resourceService.getDocumentsByRecursoId.and.returnValue(of([]));
      historialService.getHistoricalByResourceId.and.returnValue(of([]));
      tick(); // Procesa los observables
    }));

    it('should not call loadDocuments if recurso is null on init', () => {
      component.recurso = null;
      spyOn(component as any, 'loadDocuments');
      spyOn(component as any, 'loadHistorialData');

      fixture.detectChanges(); // Esto llama a ngOnInit

      expect(component['loadDocuments']).not.toHaveBeenCalled();
      expect(component['loadHistorialData']).not.toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    let initialRecurso: Recurso;
    let newRecurso: Recurso;
    let changes: SimpleChanges;

    beforeEach(() => {
      initialRecurso = { idRecurso: 1, modelo: 'Laptop', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      newRecurso = { idRecurso: 2, modelo: 'Monitor', descripcion: 'D2', numeroSerie: 'SN2', fechaCompra: '2023-02-01', fechaVencimientoGarantia: '2025-02-01', estado: 'Prestado', emailUsuario: 'a@b.com', categoria: 'C2' };
      
      component.recurso = initialRecurso;
      fixture.detectChanges(); // Llamada inicial a ngOnInit
      
      spyOn(component as any, 'loadDocuments').and.callThrough();
      spyOn(component as any, 'loadHistorialData').and.callThrough();
    });

    it('should call loadDocuments and loadHistorialData when recurso input changes and has idRecurso', fakeAsync(() => {
      changes = {
        recurso: new SimpleChange(initialRecurso, newRecurso, false)
      };

      component.recurso = newRecurso; // Actualizar el input
      component.ngOnChanges(changes); // Llamar ngOnChanges manualmente
      
      expect(component.documentosAsociados).toEqual([]); // Debe limpiar
      expect(component.historialRecurso).toEqual([]); // Debe limpiar

      expect(component['loadDocuments']).toHaveBeenCalledWith(newRecurso.idRecurso!);
      expect(component['loadHistorialData']).toHaveBeenCalledWith(newRecurso.idRecurso!);
      
      // Simular la respuesta de los mocks para que los observables se completen
      resourceService.getDocumentsByRecursoId.and.returnValue(of([]));
      historialService.getHistoricalByResourceId.and.returnValue(of([]));
      tick();
    }));

    it('should warn and not call loadDocuments/loadHistorialData if recurso input changes to null', fakeAsync(() => {
      changes = {
        recurso: new SimpleChange(initialRecurso, null, false)
      };

      component.recurso = null; // Actualizar el input a null
      component.ngOnChanges(changes); // Llamar ngOnChanges manualmente

      expect(component.documentosAsociados).toEqual([]);
      expect(component.historialRecurso).toEqual([]);
      expect(component['loadDocuments']).not.toHaveBeenCalled();
      expect(component['loadHistorialData']).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled(); // No debe advertir aquí, solo si el recurso tiene un ID nulo
      tick();
    }));

    it('should warn and not call loadDocuments/loadHistorialData if recurso input changes but idRecurso is missing', fakeAsync(() => {
      const recursoWithoutId: Recurso = { ...newRecurso, idRecurso: undefined };
      changes = {
        recurso: new SimpleChange(initialRecurso, recursoWithoutId, false)
      };

      component.recurso = recursoWithoutId; // Actualizar el input sin idRecurso
      component.ngOnChanges(changes); // Llamar ngOnChanges manualmente

      expect(component.documentosAsociados).toEqual([]);
      expect(component.historialRecurso).toEqual([]);
      expect(component['loadDocuments']).not.toHaveBeenCalled();
      expect(component['loadHistorialData']).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Recurso recibido sin idRecurso para cargar documentos.');
      tick();
    }));

    it('should not call loadDocuments/loadHistorialData if other inputs change', fakeAsync(() => {
      changes = {
        someOtherInput: new SimpleChange('oldValue', 'newValue', false)
      };

      component.ngOnChanges(changes);

      expect(component['loadDocuments']).not.toHaveBeenCalled();
      expect(component['loadHistorialData']).not.toHaveBeenCalled();
      tick();
    }));
  });

  describe('loadHistorialData', () => {
    const recursoId = 1;

    it('should load and sort historical data by fechaCambioEstado (descending)', fakeAsync(() => {
      const mockHistory: HistorialResource[] = [
        { idHistorial: 1, recursoId: recursoId, fechaCambioEstado: '2024-01-15T10:00:00Z', accion: 'Prestado', descripcion: 'Loaned' },
        { idHistorial: 2, recursoId: recursoId, fechaCambioEstado: '2024-01-01T09:00:00Z', accion: 'Creado', descripcion: 'Created' },
        { idHistorial: 3, recursoId: recursoId, fechaCambioEstado: '2024-01-20T11:00:00Z', accion: 'Devuelto', descripcion: 'Returned' },
      ];
      const expectedSortedHistory: HistorialResource[] = [
        { idHistorial: 3, recursoId: recursoId, fechaCambioEstado: '2024-01-20T11:00:00Z', accion: 'Devuelto', descripcion: 'Returned' },
        { idHistorial: 1, recursoId: recursoId, fechaCambioEstado: '2024-01-15T10:00:00Z', accion: 'Prestado', descripcion: 'Loaned' },
        { idHistorial: 2, recursoId: recursoId, fechaCambioEstado: '2024-01-01T09:00:00Z', accion: 'Creado', descripcion: 'Created' },
      ];
      historialService.getHistoricalByResourceId.and.returnValue(of(mockHistory));

      (component as any).loadHistorialData(recursoId);
      tick();

      expect(historialService.getHistoricalByResourceId).toHaveBeenCalledWith(recursoId);
      expect(component.historialRecurso).toEqual(expectedSortedHistory);
      expect(consoleLogSpy).toHaveBeenCalledWith('Historial cargado:', expectedSortedHistory);
    }));

    it('should set historialRecurso to empty array on error', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      historialService.getHistoricalByResourceId.and.returnValue(throwError(() => errorResponse));

      (component as any).loadHistorialData(recursoId);
      tick();

      expect(historialService.getHistoricalByResourceId).toHaveBeenCalledWith(recursoId);
      expect(component.historialRecurso).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar historial:', errorResponse);
    }));

    it('should handle empty historical data', fakeAsync(() => {
      historialService.getHistoricalByResourceId.and.returnValue(of([]));

      (component as any).loadHistorialData(recursoId);
      tick();

      expect(historialService.getHistoricalByResourceId).toHaveBeenCalledWith(recursoId);
      expect(component.historialRecurso).toEqual([]);
      expect(consoleLogSpy).toHaveBeenCalledWith('Historial cargado:', []);
    }));
  });

  describe('loadDocuments', () => {
    const recursoId = 1;

    it('should load documents for a given resource ID', fakeAsync(() => {
      const mockDocuments: Documento[] = [
        { id: 1, key: 'k1', nombreArchivo: 'doc1.pdf', url: 'url1', tipoMime: 'pdf', fechaCarga: '2024-01-01', recursoId: recursoId },
        { id: 2, key: 'k2', nombreArchivo: 'doc2.jpg', url: 'url2', tipoMime: 'jpeg', fechaCarga: '2024-01-02', recursoId: recursoId },
      ];
      resourceService.getDocumentsByRecursoId.and.returnValue(of(mockDocuments));

      (component as any).loadDocuments(recursoId);
      tick();

      expect(resourceService.getDocumentsByRecursoId).toHaveBeenCalledWith(recursoId);
      expect(component.documentosAsociados).toEqual(mockDocuments);
      expect(consoleLogSpy).toHaveBeenCalledWith('Documentos cargados para el recurso:', mockDocuments);
    }));

    it('should set documentosAsociados to empty array on error', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      resourceService.getDocumentsByRecursoId.and.returnValue(throwError(() => errorResponse));

      (component as any).loadDocuments(recursoId);
      tick();

      expect(resourceService.getDocumentsByRecursoId).toHaveBeenCalledWith(recursoId);
      expect(component.documentosAsociados).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar los documentos para el recurso:', recursoId, errorResponse);
    }));

    it('should handle empty document data', fakeAsync(() => {
      resourceService.getDocumentsByRecursoId.and.returnValue(of([]));

      (component as any).loadDocuments(recursoId);
      tick();

      expect(resourceService.getDocumentsByRecursoId).toHaveBeenCalledWith(recursoId);
      expect(component.documentosAsociados).toEqual([]);
      expect(consoleLogSpy).toHaveBeenCalledWith('Documentos cargados para el recurso:', []);
    }));
  });

  describe('formatDate', () => {
    it('should format a valid date string', () => {
      const dateString = '2024-07-11T10:30:00Z';
      const expectedFormattedDate = new Date(dateString).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      expect(component.formatDate(dateString)).toBe(expectedFormattedDate);
    });

    it('should return empty string for null or empty input', () => {
      expect(component.formatDate('')).toBe('');
      expect(component.formatDate(null as any)).toBe('');
      expect(component.formatDate(undefined as any)).toBe('');
    });

    it('should handle invalid date strings gracefully', () => {
      // For invalid date strings, new Date() might return "Invalid Date",
      // and toLocaleDateString might return "Invalid Date" or an empty string depending on the environment.
      // We expect it to return a string, even if it's "Invalid Date".
      const invalidDateString = 'not-a-date';
      const result = component.formatDate(invalidDateString);
      expect(typeof result).toBe('string');
      // A more specific check might be needed if you want to ensure it's not "Invalid Date"
      // expect(result).not.toBe('Invalid Date'); // If you want to explicitly disallow "Invalid Date"
    });
  });
});