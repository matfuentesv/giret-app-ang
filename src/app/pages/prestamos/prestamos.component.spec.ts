import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PrestamosComponent } from './prestamos.component';
import { PrestamosService, Loan } from '../../services/prestamos.service';
import { CrearPrestamoComponent } from '../crear-prestamo/crear-prestamo.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Necesario para PrestamosService

// Mock para PrestamosService
class MockPrestamosService {
  getLoans = jasmine.createSpy('getLoans').and.returnValue(of([]));
  updateLoanState = jasmine.createSpy('updateLoanState').and.returnValue(of(true));
}

// Mock para CrearPrestamoComponent (para ViewChild)
class MockCrearPrestamoComponent {
  resetForm = jasmine.createSpy('resetForm');
  // Si PrestamosComponent accede a otras propiedades o métodos de CrearPrestamoComponent,
  // deberías añadirlos aquí con valores o spies.
}

describe('PrestamosComponent', () => {
  let component: PrestamosComponent;
  let fixture: ComponentFixture<PrestamosComponent>;
  let prestamosService: MockPrestamosService;
  let alertSpy: jasmine.Spy;
  let confirmSpy: jasmine.Spy;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  // Mocks para los elementos del DOM y Bootstrap
  let mockCrearPrestamoModal: HTMLElement;
  let addEventListenerSpy: jasmine.Spy;
  let removeEventListenerSpy: jasmine.Spy;
  let bootstrapModalSpy: jasmine.Spy;
  let bootstrapModalGetInstanceSpy: jasmine.Spy;
  let modalHideSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        PrestamosComponent, // Importar el componente standalone
        HttpClientTestingModule // Necesario para que PrestamosService funcione
      ],
      providers: [
        { provide: PrestamosService, useClass: MockPrestamosService },
        // Proveer el mock de CrearPrestamoComponent para el ViewChild
        { provide: CrearPrestamoComponent, useClass: MockCrearPrestamoComponent }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrestamosComponent);
    component = fixture.componentInstance;
    prestamosService = TestBed.inject(PrestamosService) as unknown as MockPrestamosService;

    alertSpy = spyOn(window, 'alert');
    confirmSpy = spyOn(window, 'confirm');
    consoleLogSpy = spyOn(console, 'log');
    consoleErrorSpy = spyOn(console, 'error');
    consoleWarnSpy = spyOn(console, 'warn');

    // Configurar mocks para los modales de Bootstrap
    mockCrearPrestamoModal = document.createElement('div');
    mockCrearPrestamoModal.id = 'crearPrestamoModal';
    addEventListenerSpy = spyOn(mockCrearPrestamoModal, 'addEventListener');
    removeEventListenerSpy = spyOn(mockCrearPrestamoModal, 'removeEventListener');
    spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (id === 'crearPrestamoModal') return mockCrearPrestamoModal;
      return null;
    });

    // Mockear la instancia de Bootstrap Modal
    modalHideSpy = jasmine.createSpy('hide');
    const mockModalInstance = { hide: modalHideSpy };
    bootstrapModalGetInstanceSpy = jasmine.createSpy('getInstance').and.returnValue(mockModalInstance);
    bootstrapModalSpy = jasmine.createSpy('Modal').and.returnValue(mockModalInstance);
    
    // Adjuntar getInstance directamente al spy de Modal
    (bootstrapModalSpy as any).getInstance = bootstrapModalGetInstanceSpy;

    // Asegurarse de que window.bootstrap exista para las pruebas
    (window as any).bootstrap = {
      Modal: bootstrapModalSpy
    };

    // Inicializar el ViewChild mock
    component.crearPrestamoComponent = new MockCrearPrestamoComponent() as any;

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  afterEach(() => {
    // Limpiar los espías de los eventos para evitar interferencias entre pruebas
    if (mockCrearPrestamoModal) {
      mockCrearPrestamoModal.removeEventListener('hidden.bs.modal', component.onCrearPrestamoModalHidden.bind(component));
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getLoans on initialization', () => {
      spyOn(component, 'getLoans'); // Espía getLoans
      component.ngOnInit(); // Vuelve a llamar ngOnInit
      expect(component.getLoans).toHaveBeenCalled();
    });

    it('should attach an event listener to crearPrestamoModal', () => {
      // El addEventListener ya se llama en el beforeEach principal
      expect(addEventListenerSpy).toHaveBeenCalledWith('hidden.bs.modal', jasmine.any(Function));
    });
  });

  describe('getLoans', () => {
    const mockLoans: Loan[] = [
      { idPrestamo: 1, solicitante: 'User A', fechaPrestamo: '2024-01-01', fechaDevolucion: '2024-01-15', estado: 'Activo', recursoId: 101, resource: { modelo: 'Laptop', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } },
      { idPrestamo: 2, solicitante: 'User B', fechaPrestamo: '2024-01-10', fechaDevolucion: '2024-01-20', estado: 'Atrasado', recursoId: 102, resource: { modelo: 'Proyector', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } }
    ];

    it('should set isLoadingTable to true before fetching and false on success', fakeAsync(() => {
      const loansSubject = new Subject<Loan[]>();
      prestamosService.getLoans.and.returnValue(loansSubject.asObservable());

      component.getLoans();
      expect(component.isLoadingTable).toBeTrue();

      loansSubject.next(mockLoans);
      loansSubject.complete();
      tick();

      expect(component.loans).toEqual(mockLoans);
      expect(component.isLoadingTable).toBeFalse();
    }));

    it('should call prestamosService.getLoans and applyFilters on success', fakeAsync(() => {
      spyOn(component, 'applyFilters');
      prestamosService.getLoans.and.returnValue(of(mockLoans));

      component.getLoans();
      tick();

      expect(prestamosService.getLoans).toHaveBeenCalled();
      expect(component.loans).toEqual(mockLoans);
      expect(component.applyFilters).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('Préstamos obtenidos:', mockLoans);
    }));

    it('should handle error when fetching loans', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      prestamosService.getLoans.and.returnValue(throwError(() => errorResponse));

      component.getLoans();
      tick();

      expect(prestamosService.getLoans).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener préstamos:', errorResponse);
      expect(component.isLoadingTable).toBeFalse();
    }));
  });

  describe('applyFilters', () => {
    const allLoans: Loan[] = [
      { idPrestamo: 1, solicitante: 'Alice', fechaPrestamo: '2024-01-01', fechaDevolucion: '2024-01-15', estado: 'Activo', recursoId: 101, resource: { modelo: 'Laptop HP', descripcion: 'D', numeroSerie: 'SN1', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } },
      { idPrestamo: 2, solicitante: 'Bob', fechaPrestamo: '2024-01-05', fechaDevolucion: '2024-01-20', estado: 'Atrasado', recursoId: 102, resource: { modelo: 'Monitor Dell', descripcion: 'D', numeroSerie: 'SN2', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } },
      { idPrestamo: 3, solicitante: 'Charlie', fechaPrestamo: '2024-01-10', fechaDevolucion: '2024-01-25', estado: 'Devuelto', recursoId: 103, resource: { modelo: 'Teclado Logitech', descripcion: 'D', numeroSerie: 'SN3', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } },
      { idPrestamo: 4, solicitante: 'David', fechaPrestamo: '2024-01-12', fechaDevolucion: '2024-01-28', estado: 'Activo', recursoId: 104, resource: { modelo: 'Mouse Razer', descripcion: 'D', numeroSerie: 'SN4', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } }
    ];

    beforeEach(() => {
      component.loans = [...allLoans];
      component.searchText = '';
      component.selectedStatus = 'Filtrar por estado...';
    });

    it('should filter by searchText (resource model or solicitante)', () => {
      component.searchText = 'laptop';
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(1);
      expect(component.filteredLoans[0].solicitante).toBe('Alice');

      component.searchText = 'bob';
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(1);
      expect(component.filteredLoans[0].solicitante).toBe('Bob');

      component.searchText = 'dell';
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(1);
      expect(component.filteredLoans[0].resource?.modelo).toBe('Monitor Dell');
    });

    it('should filter by selectedStatus (case-insensitive)', () => {
      component.selectedStatus = 'activo';
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(2);
      expect(component.filteredLoans.every(loan => loan.estado.toLowerCase() === 'activo')).toBeTrue();

      component.selectedStatus = 'Devuelto';
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(1);
      expect(component.filteredLoans[0].estado).toBe('Devuelto');
    });

    it('should apply both filters simultaneously', () => {
      component.searchText = 'a'; // Matches Alice, Charlie, David, Laptop, Teclado
      component.selectedStatus = 'activo'; // Matches Alice, David
      component.applyFilters();
      expect(component.filteredLoans.length).toBe(2);
      expect(component.filteredLoans[0].solicitante).toBe('Alice');
      expect(component.filteredLoans[1].solicitante).toBe('David');
    });

    it('should return all loans if no filters are applied', () => {
      component.searchText = '';
      component.selectedStatus = 'Filtrar por estado...';
      component.applyFilters();
      expect(component.filteredLoans).toEqual(allLoans);
    });

    // CAMBIO AQUÍ: Ajuste del test para el comportamiento esperado con searchText con solo espacios
    it('should handle empty search text after trimming (implicitly by using this.searchText)', () => {
      component.searchText = '   '; // Espacios en blanco
      component.applyFilters();
      // Con la corrección en el componente, el filtro de texto se saltará si es solo espacios,
      // por lo que filteredLoans debe ser igual a allLoans.
      expect(component.filteredLoans).toEqual(allLoans);
    });
  });

  describe('getBadgeClass', () => {
    it('should return text-bg-danger for "atrasado"', () => {
      expect(component.getBadgeClass('atrasado')).toBe('text-bg-danger');
      expect(component.getBadgeClass('Atrasado')).toBe('text-bg-danger');
    });

    it('should return text-bg-warning for "activo"', () => {
      expect(component.getBadgeClass('activo')).toBe('text-bg-warning');
      expect(component.getBadgeClass('ACTIVO')).toBe('text-bg-warning');
    });

    it('should return text-bg-secondary for "devuelto"', () => {
      expect(component.getBadgeClass('devuelto')).toBe('text-bg-secondary');
      expect(component.getBadgeClass('Devuelto')).toBe('text-bg-secondary');
    });

    it('should return text-bg-info for other statuses', () => {
      expect(component.getBadgeClass('pendiente')).toBe('text-bg-info');
      expect(component.getBadgeClass('otro')).toBe('text-bg-info');
      expect(component.getBadgeClass('')).toBe('text-bg-info');
    });
  });

  describe('formatDate', () => {
    it('should format YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(component.formatDate('2024-07-11')).toBe('11/07/2024');
      expect(component.formatDate('2023-01-05')).toBe('05/01/2023');
    });

    it('should return empty string for null or empty input', () => {
      expect(component.formatDate('')).toBe('');
      expect(component.formatDate(null as any)).toBe('');
      expect(component.formatDate(undefined as any)).toBe('');
    });

    it('should return original string if not in YYYY-MM-DD format', () => {
      expect(component.formatDate('11/07/2024')).toBe('11/07/2024');
      expect(component.formatDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('closeCrearPrestamoModal', () => {
    it('should hide the modal and clean up if modal element exists and instance found', () => {
      // Simular que el modal está abierto y hay un backdrop
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.classList.add('modal-backdrop');
      document.body.appendChild(backdrop);

      component.closeCrearPrestamoModal();

      expect(document.getElementById).toHaveBeenCalledWith('crearPrestamoModal');
      expect(bootstrapModalGetInstanceSpy).toHaveBeenCalledWith(mockCrearPrestamoModal);
      expect(modalHideSpy).toHaveBeenCalled();
      expect(document.body.classList.contains('modal-open')).toBeFalse();
      expect(document.getElementsByClassName('modal-backdrop').length).toBe(0);
    });

    it('should create new Modal instance if getInstance returns null and then hide it', () => {
      bootstrapModalGetInstanceSpy.and.returnValue(null); // Simular que no hay instancia existente

      // Simular que el modal está abierto y hay un backdrop
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.classList.add('modal-backdrop');
      document.body.appendChild(backdrop);

      component.closeCrearPrestamoModal();

      expect(document.getElementById).toHaveBeenCalledWith('crearPrestamoModal');
      expect(bootstrapModalGetInstanceSpy).toHaveBeenCalledWith(mockCrearPrestamoModal);
      expect(bootstrapModalSpy).toHaveBeenCalledWith(mockCrearPrestamoModal); // Debe crear una nueva instancia
      expect(modalHideSpy).toHaveBeenCalled();
      expect(document.body.classList.contains('modal-open')).toBeFalse();
      expect(document.getElementsByClassName('modal-backdrop').length).toBe(0);
    });

    it('should not throw error if modal element is not found', () => {
      (document.getElementById as jasmine.Spy).and.returnValue(null); // Simular que el elemento no existe
      expect(() => component.closeCrearPrestamoModal()).not.toThrow();
      expect(modalHideSpy).not.toHaveBeenCalled();
    });
  });

  describe('onLoanCreated', () => {
    it('should call getLoans and closeCrearPrestamoModal', () => {
      spyOn(component, 'getLoans');
      spyOn(component, 'closeCrearPrestamoModal');
      consoleLogSpy.calls.reset(); // Resetear spy para este test

      component.onLoanCreated();

      expect(consoleLogSpy).toHaveBeenCalledWith('Evento loanCreated recibido. Recargando préstamos...');
      expect(component.getLoans).toHaveBeenCalled();
      expect(component.closeCrearPrestamoModal).toHaveBeenCalled();
    });
  });

  describe('registerReturn', () => {
    const mockLoan: Loan = { idPrestamo: 1, solicitante: 'User A', fechaPrestamo: '2024-01-01', fechaDevolucion: '2024-01-15', estado: 'Activo', recursoId: 101, resource: { modelo: 'Laptop', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' } };

    beforeEach(() => {
      component.loans = [mockLoan]; // Asegurarse de que el préstamo esté en la lista
      spyOn(component, 'getLoans'); // Espía getLoans para evitar llamadas reales
    });

    it('should not proceed if loanId is undefined', () => {
      component.registerReturn(undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('ID del préstamo no definido para la devolución.');
      expect(alertSpy).toHaveBeenCalledWith('Error: No se pudo registrar la devolución. ID del préstamo no disponible.');
      expect(prestamosService.updateLoanState).not.toHaveBeenCalled();
      expect(component.getLoans).not.toHaveBeenCalled();
    });

    it('should not proceed if loan is not found', () => {
      component.registerReturn(999); // ID que no existe
      expect(consoleErrorSpy).toHaveBeenCalledWith('Préstamo no encontrado en la lista para el ID:', 999);
      expect(alertSpy).toHaveBeenCalledWith('Error: No se encontró el préstamo para registrar la devolución.');
      expect(prestamosService.updateLoanState).not.toHaveBeenCalled();
      expect(component.getLoans).not.toHaveBeenCalled();
    });

    it('should not proceed if user cancels the confirmation', () => {
      confirmSpy.and.returnValue(false); // Usuario cancela
      component.registerReturn(mockLoan.idPrestamo);
      expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que quieres registrar este préstamo como devuelto?');
      expect(prestamosService.updateLoanState).not.toHaveBeenCalled();
      expect(component.getLoans).not.toHaveBeenCalled();
    });

    it('should call updateLoanState and getLoans on successful return (backend returns true)', fakeAsync(() => {
      confirmSpy.and.returnValue(true); // Usuario confirma
      prestamosService.updateLoanState.and.returnValue(of(true)); // Backend devuelve true

      component.registerReturn(mockLoan.idPrestamo);
      tick(); // Procesa el observable

      expect(confirmSpy).toHaveBeenCalled();
      expect(prestamosService.updateLoanState).toHaveBeenCalledWith(mockLoan.idPrestamo, mockLoan.recursoId, 'devuelto');
      expect(consoleLogSpy).toHaveBeenCalledWith('Préstamo actualizado a devuelto con éxito.');
      expect(alertSpy).toHaveBeenCalledWith('Préstamo registrado como devuelto con éxito!');
      expect(component.getLoans).toHaveBeenCalled();
    }));

    it('should alert if updateLoanState returns false', fakeAsync(() => {
      confirmSpy.and.returnValue(true);
      prestamosService.updateLoanState.and.returnValue(of(false)); // Backend devuelve false

      component.registerReturn(mockLoan.idPrestamo);
      tick();

      expect(confirmSpy).toHaveBeenCalled();
      expect(prestamosService.updateLoanState).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('La actualización del préstamo no fue exitosa (el backend devolvió false).');
      expect(alertSpy).toHaveBeenCalledWith('Hubo un problema al registrar la devolución. Intente de nuevo.');
      expect(component.getLoans).not.toHaveBeenCalled(); // No recarga si la actualización no fue exitosa
    }));

    it('should handle error during updateLoanState', fakeAsync(() => {
      confirmSpy.and.returnValue(true);
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      prestamosService.updateLoanState.and.returnValue(throwError(() => errorResponse));

      component.registerReturn(mockLoan.idPrestamo);
      tick();

      expect(confirmSpy).toHaveBeenCalled();
      expect(prestamosService.updateLoanState).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al registrar la devolución del préstamo:', errorResponse);
      expect(alertSpy).toHaveBeenCalledWith('Hubo un error al registrar la devolución. Por favor, revisa la consola.');
      expect(component.getLoans).not.toHaveBeenCalled();
    }));
  });

  describe('onCrearPrestamoModalHidden', () => {
    it('should call resetForm on crearPrestamoComponent if it exists', () => {
      component.crearPrestamoComponent = new MockCrearPrestamoComponent() as any; // Asegurarse de que el mock esté presente y castear
      component.onCrearPrestamoModalHidden();
      expect(component.crearPrestamoComponent.resetForm).toHaveBeenCalled();
    });

    it('should not throw error if crearPrestamoComponent is undefined', () => {
      component.crearPrestamoComponent = undefined as any; // Simular que ViewChild no ha inicializado
      expect(() => component.onCrearPrestamoModalHidden()).not.toThrow();
    });
  });
});