// src/app/pages/crear-prestamo/crear-prestamo.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CrearPrestamoComponent } from './crear-prestamo.component';
import { ResourceService, Recurso } from '../../services/resource.service';
import { Loan, PrestamosService } from '../../services/prestamos.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Subject } from 'rxjs'; // <-- Asegúrate de importar Subject aquí

// --- Mocks para los Servicios ---

class MockResourceService {
  getResources() {
    return of([
      { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      { idRecurso: 2, modelo: 'Monitor Dell', numeroSerie: 'SN456', estado: 'bodega', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      { idRecurso: 3, modelo: 'Teclado Logitech', numeroSerie: 'SN789', estado: 'prestado', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      { idRecurso: 4, modelo: 'Mouse Razer', numeroSerie: 'SN101', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
    ]);
  }
}

class MockPrestamosService {
  saveLoan(loan: Loan) {
    return of({ ...loan, idPrestamo: 123 });
  }

  updateLoanState(loanId: number, recursoId: number, newState: string) {
    return of(true);
  }
}

describe('CrearPrestamoComponent', () => {
  let component: CrearPrestamoComponent;
  let fixture: ComponentFixture<CrearPrestamoComponent>;
  let resourceService: ResourceService;
  let prestamosService: PrestamosService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, CrearPrestamoComponent],
      providers: [
        { provide: ResourceService, useClass: MockResourceService },
        { provide: PrestamosService, useClass: MockPrestamosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPrestamoComponent);
    component = fixture.componentInstance;
    resourceService = TestBed.inject(ResourceService);
    prestamosService = TestBed.inject(PrestamosService);
    fixture.detectChanges(); // Detectar cambios iniciales (ej. ngOnInit)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load available resources excluding "prestado" state on init', fakeAsync(() => {
      const getResourcesSpy = spyOn(resourceService, 'getResources').and.callThrough();
      
      component.ngOnInit();
      tick(); // Procesa el observable de getResources
      
      expect(getResourcesSpy).toHaveBeenCalled();
      expect(component.recursosDisponibles.length).toBe(3);
      expect(component.recursosDisponibles.some(r => r.estado === 'prestado')).toBeFalse();
      expect(component.recursosDisponibles.every(r => r.estado !== 'prestado')).toBeTrue();
    }));

    it('should handle error when loading resources', fakeAsync(() => {
      // Añade esta línea para limpiar el estado de recursosDisponibles antes del test de error
      component.recursosDisponibles = []; 
      
      spyOn(resourceService, 'getResources').and.returnValue(throwError(() => new Error('Error al cargar recursos')));
      spyOn(console, 'error');
      
      component.ngOnInit();
      tick(); // Procesa el observable que arroja el error

      expect(console.error).toHaveBeenCalledWith('Error al cargar recursos:', jasmine.any(Error));
      expect(component.recursosDisponibles.length).toBe(0); // Esta expectativa ahora debería pasar
    }));
  });

  describe('onRecursoInput', () => {
    it('should filter available resources based on input text', () => {
      component.recursosDisponibles = [
        { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
        { idRecurso: 2, modelo: 'Monitor Dell', numeroSerie: 'SN456', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      ];
      component.selectedRecursoText = 'laptop';
      component.onRecursoInput();

      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].modelo).toBe('Laptop HP');
      expect(component.showSuggestions).toBeTrue();
    });

    it('should filter by numeroSerie', () => {
      component.recursosDisponibles = [
        { idRecurso: 1, modelo: 'Laptop HP', numeroSerie: 'SN123', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      ];
      component.selectedRecursoText = 'sn123';
      component.onRecursoInput();

      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].numeroSerie).toBe('SN123');
    });

    it('should clear suggestions and reset recursoId if input is empty', () => {
      component.filteredRecursos = [{ idRecurso: 1, modelo: 'Laptop', numeroSerie: 'SN', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' }];
      component.selectedRecursoText = '';
      component.newLoan.recursoId = 1;
      component.onRecursoInput();

      expect(component.filteredRecursos.length).toBe(0);
      expect(component.showSuggestions).toBeFalse();
      expect(component.newLoan.recursoId).toBe(0);
    });

    it('should set recursoId if an exact match is found', () => {
      component.recursosDisponibles = [
        { idRecurso: 10, modelo: 'Laptop Exacta', numeroSerie: 'EXACT', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      ];
      component.selectedRecursoText = 'laptop exacta (n° serie: exact)';
      component.onRecursoInput();

      expect(component.newLoan.recursoId).toBe(10);
      expect(component.isInvalidRecursoSelection).toBeFalse();
    });

    it('should reset recursoId if no exact match is found for existing text', () => {
      component.recursosDisponibles = [
        { idRecurso: 10, modelo: 'Laptop Exacta', numeroSerie: 'EXACT', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' },
      ];
      component.selectedRecursoText = 'laptop parci';
      component.newLoan.recursoId = 10; // Simulate a previous selection
      component.onRecursoInput();

      expect(component.newLoan.recursoId).toBe(0);
    });
  });

  describe('selectRecurso', () => {
    it('should set selectedRecursoText and newLoan.recursoId and hide suggestions', () => {
      const mockRecurso: Recurso = { idRecurso: 5, modelo: 'Projector', numeroSerie: 'PRJ001', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' };
      component.showSuggestions = true;
      component.isInvalidRecursoSelection = true;

      component.selectRecurso(mockRecurso);

      expect(component.selectedRecursoText).toBe('Projector (N° Serie: PRJ001)');
      expect(component.newLoan.recursoId).toBe(5);
      expect(component.showSuggestions).toBeFalse();
      expect(component.isInvalidRecursoSelection).toBeFalse();
    });
  });

  describe('onRecursoBlur', () => {
    beforeEach(fakeAsync(() => {
        // Mock setTimeout to control its execution in fakeAsync
        // Cast window to any to avoid TypeScript error related to setTimeout's signature
        spyOn(window as any, 'setTimeout').and.callFake((fn: TimerHandler) => {
            if (typeof fn === 'function') {
                fn(); // Immediately execute the callback
            }
            return 0; // Return a dummy timeout ID
        });
    }));

    it('should hide suggestions and set isInvalidRecursoSelection if no valid resource selected', () => {
      component.showSuggestions = true;
      component.newLoan.recursoId = 0;
      component.selectedRecursoText = 'some text';
      
      component.onRecursoBlur();
      // No need for tick() because setTimeout is mocked to execute immediately
      
      expect(component.showSuggestions).toBeFalse();
      expect(component.isInvalidRecursoSelection).toBeTrue();
    });

    it('should hide suggestions and not set isInvalidRecursoSelection if a valid resource is selected', () => {
      component.showSuggestions = true;
      component.newLoan.recursoId = 123;
      component.selectedRecursoText = 'valid text';

      component.onRecursoBlur();
      // No need for tick() because setTimeout is mocked to execute immediately

      expect(component.showSuggestions).toBeFalse();
      expect(component.isInvalidRecursoSelection).toBeFalse();
    });

    it('should not set isInvalidRecursoSelection if input text is empty', () => {
      component.showSuggestions = true;
      component.newLoan.recursoId = 0;
      component.selectedRecursoText = '';

      component.onRecursoBlur();
      // No need for tick() because setTimeout is mocked to execute immediately

      expect(component.showSuggestions).toBeFalse();
      expect(component.isInvalidRecursoSelection).toBeFalse();
    });
  });

  describe('validateLoanDates', () => {
    it('should set fechasPrestamoInvalidas to true if fechaDevolucion is before fechaPrestamo', () => {
      component.newLoan.fechaPrestamo = '2025-07-10';
      component.newLoan.fechaDevolucion = '2025-07-09';
      component.validateLoanDates();
      expect(component.fechasPrestamoInvalidas).toBeTrue();
    });

    it('should set fechasPrestamoInvalidas to false if dates are valid', () => {
      component.newLoan.fechaPrestamo = '2025-07-10';
      component.newLoan.fechaDevolucion = '2025-07-11';
      component.validateLoanDates();
      expect(component.fechasPrestamoInvalidas).toBeFalse();
    });

    it('should set fechasPrestamoInvalidas to false if dates are the same', () => {
      component.newLoan.fechaPrestamo = '2025-07-10';
      component.newLoan.fechaDevolucion = '2025-07-10';
      component.validateLoanDates();
      expect(component.fechasPrestamoInvalidas).toBeFalse();
    });

    it('should set fechasPrestamoInvalidas to false if dates are empty', () => {
      component.newLoan.fechaPrestamo = '';
      component.newLoan.fechaDevolucion = '';
      component.validateLoanDates();
      expect(component.fechasPrestamoInvalidas).toBeFalse();
    });
  });

  describe('createLoan', () => {
    let saveLoanSpy: jasmine.Spy;
    let loanCreatedEmitSpy: jasmine.Spy;
    let resetFormSpy: jasmine.Spy;
    let alertSpy: jasmine.Spy;

    beforeEach(() => {
      saveLoanSpy = spyOn(prestamosService, 'saveLoan'); // NO .and.callThrough() aquí para controlar el flujo
      loanCreatedEmitSpy = spyOn(component.loanCreated, 'emit');
      resetFormSpy = spyOn(component, 'resetForm');
      alertSpy = spyOn(window, 'alert');
      // Asegurarse de que las validaciones previas no detengan la ejecución
      component.isInvalidRecursoSelection = false;
      component.fechasPrestamoInvalidas = false;
      // Asegurar que el recursoId sea válido para estas pruebas
      component.newLoan.recursoId = 1;
    });

    it('should set isLoading to true during loan creation and false on complete', fakeAsync(() => {
      const loanSubject = new Subject<Loan>(); // Crea un Subject para controlar el observable
      saveLoanSpy.and.returnValue(loanSubject); // El spy retorna el Subject

      component.createLoan();
      
      // En este punto, isLoading debería ser true, porque createLoan lo activa,
      // pero el Subject aún no ha emitido ni completado.
      expect(component.isLoading).toBeTrue(); // Esta expectativa debería pasar ahora

      // Simula que el servicio responde
      loanSubject.next({ ...component.newLoan, idPrestamo: 123 });
      loanSubject.complete(); // Completa el observable
      
      tick(); // Procesa las microtareas pendientes (como la suscripción del observable)

      expect(component.isLoading).toBeFalse(); // Ahora debería ser false después de la finalización
      expect(saveLoanSpy).toHaveBeenCalledWith(component.newLoan); // Verifica que la función fue llamada
    }));

    it('should call saveLoan and handle success', fakeAsync(() => {
      saveLoanSpy.and.returnValue(of({ ...component.newLoan, idPrestamo: 123 })); // Usa 'of' para este test
      
      component.createLoan();
      tick(); // Procesa el observable de saveLoan

      expect(saveLoanSpy).toHaveBeenCalledWith(component.newLoan);
      expect(alertSpy).toHaveBeenCalledWith('Préstamo registrado con éxito!');
      expect(loanCreatedEmitSpy).toHaveBeenCalled();
      expect(resetFormSpy).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    }));

    it('should handle error during loan creation', fakeAsync(() => {
      saveLoanSpy.and.returnValue(throwError(() => new Error('Error de servidor')));
      spyOn(console, 'error');

      component.createLoan();
      tick(); // Procesa el observable que arroja el error

      expect(saveLoanSpy).toHaveBeenCalledWith(component.newLoan);
      expect(alertSpy).toHaveBeenCalledWith('Hubo un error al registrar el préstamo. Por favor, intente de nuevo.');
      expect(console.error).toHaveBeenCalledWith('Error al crear el préstamo:', jasmine.any(Error));
      expect(component.isLoading).toBeFalse();
    }));

    it('should not create loan if isLoading is already true', () => {
      component.isLoading = true;
      component.createLoan();
      expect(saveLoanSpy).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should not create loan if recurso selection is invalid', () => {
      component.newLoan.recursoId = 0;
      component.selectedRecursoText = 'some text';
      component.isInvalidRecursoSelection = true; // Asegúrate de que esta bandera se establezca según la lógica de tu componente
      component.createLoan();
      expect(saveLoanSpy).not.toHaveBeenCalled();
      // No debería haber un alert para esta validación, ya que se espera que el formulario lo maneje visualmente
    });

    it('should not create loan if dates are invalid', () => {
      component.fechasPrestamoInvalidas = true;
      component.createLoan();
      expect(saveLoanSpy).not.toHaveBeenCalled();
    });
  });

  describe('resetForm', () => {
    let loadAvailableResourcesSpy: jasmine.Spy;

    beforeEach(() => {
      loadAvailableResourcesSpy = spyOn(component, 'loadAvailableResources');
      // Simular un formulario con datos
      component.newLoan = {
        recursoId: 10,
        fechaPrestamo: '2024-01-01',
        fechaDevolucion: '2024-01-02',
        solicitante: 'Test',
        estado: 'inactivo'
      };
      component.fechasPrestamoInvalidas = true;
      component.selectedRecursoText = 'Laptop test (N° Serie: TEST)';
      component.isInvalidRecursoSelection = true;
      component.filteredRecursos = [{ idRecurso: 1, modelo: 'Filtered', numeroSerie: 'FILT', estado: 'disponible', descripcion: '...', fechaCompra: '...', fechaVencimientoGarantia: '...', emailUsuario: '...', categoria: '...' }];
      component.showSuggestions = true;

      // Configurar loanForm para que resetForm(value) funcione
      component.loanForm = {
        resetForm: jasmine.createSpy('resetForm')
      } as unknown as NgForm; // Castear a NgForm para el spy
    });

    it('should reset newLoan to initial values', () => {
      component.resetForm();
      expect(component.newLoan).toEqual({
        recursoId: 0,
        fechaPrestamo: '',
        fechaDevolucion: '',
        solicitante: '',
        estado: 'activo'
      });
    });

    it('should reset all form-related flags', () => {
      component.resetForm();
      expect(component.fechasPrestamoInvalidas).toBeFalse();
      expect(component.selectedRecursoText).toBe('');
      expect(component.isInvalidRecursoSelection).toBeFalse();
      expect(component.filteredRecursos.length).toBe(0);
      expect(component.showSuggestions).toBeFalse();
    });

    it('should call loanForm.resetForm', () => {
      component.resetForm();
      expect(component.loanForm?.resetForm).toHaveBeenCalledWith(component.newLoan);
    });

    it('should call loadAvailableResources', () => {
      component.resetForm();
      expect(loadAvailableResourcesSpy).toHaveBeenCalled();
    });
  });
});