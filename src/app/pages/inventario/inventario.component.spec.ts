import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InventarioComponent } from './inventario.component';
import { ResourceService, Recurso } from '../../services/resource.service';
import { CognitoService } from '../../auth/cognito.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Subject, Subscription } from 'rxjs';
import { CrearRecursoComponent } from '../crear-recurso/crear-recurso.component';
import { EditarRecursoComponent } from '../editar-recurso/editar-recurso.component';
import { DetallesPrestamoComponent } from '../detalles-prestamo/detalles-prestamo.component';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { EventEmitter } from '@angular/core'; // Import EventEmitter
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule

// Mock para ResourceService
class MockResourceService {
  getResources = jasmine.createSpy('getResources').and.returnValue(of([]));
}

// Mock para CognitoService
class MockCognitoService {
  getUserAttributes = jasmine.createSpy('getUserAttributes').and.returnValue(of({ email: 'test@example.com', sub: '123' }));
}

// Mock para CrearRecursoComponent para ViewChild
// Se han ajustado las propiedades que eran problemáticas a 'public' en el mock
// y se añade un cast a 'any' al asignar la instancia del mock.
class MockCrearRecursoComponent {
  resetForm = jasmine.createSpy('resetForm');
  // Propiedades añadidas para satisfacer la interfaz de CrearRecursoComponent
  newRecurso = {
    modelo: '', descripcion: '', numeroSerie: '', fechaCompra: '',
    fechaVencimientoGarantia: '', emailUsuario: '', estado: '', categoria: ''
  };
  resourceCreated = new EventEmitter<void>();
  selectedFiles: File[] = [];
  fechaGarantiaInvalida = false;
  userEmail: string | null = null;
  isLoading = false;
  recursoForm: any = null; // Mock para NgForm si es necesario
  onFileSelected = jasmine.createSpy('onFileSelected');
  onDateChange = jasmine.createSpy('onDateChange');
  onSubmit = jasmine.createSpy('onSubmit');
  ngOnInit = jasmine.createSpy('ngOnInit');

  // PROPIEDADES AHORA PÚBLICAS EN EL MOCK PARA EVITAR EL ERROR DE TIPADO
  userAttributesSubscription: Subscription | undefined = undefined;
  resourceService: any = null;
  cognitoService: any = null;
}

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;
  let resourceService: MockResourceService;
  let cognitoService: MockCognitoService;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  // Mocks para los elementos del DOM y Bootstrap
  let mockCrearRecursoModal: HTMLElement;
  let mockEditarRecursoModal: HTMLElement;
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
        InventarioComponent, // Importar el componente standalone
        DetallesPrestamoComponent, // Importar componentes usados en el template
        HttpClientTestingModule // <-- AÑADIDO AQUÍ
      ],
      providers: [
        { provide: ResourceService, useClass: MockResourceService },
        { provide: CognitoService, useClass: MockCognitoService },
        // Proveer el mock de CrearRecursoComponent para el ViewChild
        { provide: CrearRecursoComponent, useClass: MockCrearRecursoComponent }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
    resourceService = TestBed.inject(ResourceService) as unknown as MockResourceService;
    cognitoService = TestBed.inject(CognitoService) as unknown as MockCognitoService;

    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');
    consoleWarnSpy = spyOn(console, 'warn');

    // Configurar mocks para los modales de Bootstrap
    mockCrearRecursoModal = document.createElement('div');
    mockCrearRecursoModal.id = 'crearRecursoModal';
    addEventListenerSpy = spyOn(mockCrearRecursoModal, 'addEventListener');
    removeEventListenerSpy = spyOn(mockCrearRecursoModal, 'removeEventListener');
    spyOn(document, 'getElementById').and.callFake((id: string) => {
      if (id === 'crearRecursoModal') return mockCrearRecursoModal;
      if (id === 'editarRecursoModal') {
        mockEditarRecursoModal = document.createElement('div');
        mockEditarRecursoModal.id = 'editarRecursoModal';
        return mockEditarRecursoModal;
      }
      return null;
    });

    // Mockear la instancia de Bootstrap Modal
    modalHideSpy = jasmine.createSpy('hide');
    const mockModalInstance = { hide: modalHideSpy };
    bootstrapModalGetInstanceSpy = jasmine.createSpy('getInstance').and.returnValue(mockModalInstance);
    bootstrapModalSpy = jasmine.createSpy('Modal').and.returnValue(mockModalInstance);
    
    // CAMBIO CLAVE AQUÍ: Adjuntar getInstance directamente al spy de Modal
    (bootstrapModalSpy as any).getInstance = bootstrapModalGetInstanceSpy;

    // Asegurarse de que window.bootstrap exista para las pruebas
    (window as any).bootstrap = {
      Modal: bootstrapModalSpy // Ahora, Modal es el spy que también tiene el método getInstance
    };

    // Inicializar el ViewChild mock con un cast a 'any'
    component.crearRecursoComponent = new MockCrearRecursoComponent() as any;

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  afterEach(() => {
    // Limpiar los espías de los eventos para evitar interferencias entre pruebas
    if (mockCrearRecursoModal) {
      mockCrearRecursoModal.removeEventListener('hidden.bs.modal', component.onCrearRecursoModalHidden);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user email and assign it', fakeAsync(() => {
      const mockAttributes = { email: 'user@example.com', sub: 'abc' };
      cognitoService.getUserAttributes.and.returnValue(of(mockAttributes));

      component.ngOnInit(); // Volver a llamar ngOnInit para que use el nuevo mock
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(component.userEmail).toBe('user@example.com');
    }));

    it('should set user email to null if attributes are null', fakeAsync(() => {
      cognitoService.getUserAttributes.and.returnValue(of(null));

      component.ngOnInit();
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(component.userEmail).toBeNull();
    }));

    it('should handle error when fetching user attributes', fakeAsync(() => {
      const errorResponse = new Error('Auth error');
      cognitoService.getUserAttributes.and.returnValue(throwError(() => errorResponse));

      component.ngOnInit();
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener atributos del usuario en InventarioComponent:', errorResponse);
      expect(component.userEmail).toBeNull();
    }));

    it('should call getResources', () => {
      spyOn(component, 'getResources'); // Espía getResources
      component.ngOnInit(); // Vuelve a llamar ngOnInit
      expect(component.getResources).toHaveBeenCalled();
    });

    it('should attach an event listener to crearRecursoModal', () => {
      // El addEventListener ya se llama en el beforeEach principal
      expect(addEventListenerSpy).toHaveBeenCalledWith('hidden.bs.modal', jasmine.any(Function));
    });
  });

  describe('getResources', () => {
    const mockRecursos: Recurso[] = [
      { idRecurso: 1, modelo: 'Laptop', descripcion: 'D', numeroSerie: 'SN1', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' },
      { idRecurso: 2, modelo: 'Monitor', descripcion: 'D2', numeroSerie: 'SN2', fechaCompra: '2023-02-01', fechaVencimientoGarantia: '2025-02-01', estado: 'Prestado', emailUsuario: 'a@b.com', categoria: 'C2' }
    ];

    it('should set isLoadingTable to true before fetching and false on success', fakeAsync(() => {
      const resourcesSubject = new Subject<Recurso[]>();
      resourceService.getResources.and.returnValue(resourcesSubject.asObservable());

      component.getResources();
      expect(component.isLoadingTable).toBeTrue();

      resourcesSubject.next(mockRecursos);
      resourcesSubject.complete();
      tick();

      expect(component.recursos).toEqual(mockRecursos);
      expect(component.isLoadingTable).toBeFalse();
    }));

    it('should call resourceService.getResources and applyFilters on success', fakeAsync(() => {
      spyOn(component, 'applyFilters'); // Espía applyFilters
      resourceService.getResources.and.returnValue(of(mockRecursos));

      component.getResources();
      tick();

      expect(resourceService.getResources).toHaveBeenCalled();
      expect(component.recursos).toEqual(mockRecursos);
      expect(component.applyFilters).toHaveBeenCalled();
    }));

    it('should handle error when fetching resources', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      resourceService.getResources.and.returnValue(throwError(() => errorResponse));

      component.getResources();
      tick();

      expect(resourceService.getResources).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al cargar los recursos:', errorResponse);
      expect(component.isLoadingTable).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith('No se pudieron cargar los recursos. Revisa la consola para más detalles.');
    }));
  });

  describe('ngOnDestroy', () => {
    let userAttributesSubscriptionSpy: jasmine.Spy;
    let recursosSubscriptionSpy: jasmine.Spy;

    beforeEach(() => {
      // Crear suscripciones dummy para espiar
      component['userAttributesSubscription'] = new Subscription();
      component['recursosSubscription'] = new Subscription();
      userAttributesSubscriptionSpy = spyOn(component['userAttributesSubscription'], 'unsubscribe');
      recursosSubscriptionSpy = spyOn(component['recursosSubscription'], 'unsubscribe');
    });

    it('should unsubscribe from userAttributesSubscription and recursosSubscription', () => {
      component.ngOnDestroy();
      expect(userAttributesSubscriptionSpy).toHaveBeenCalled();
      expect(recursosSubscriptionSpy).toHaveBeenCalled();
    });

    it('should remove event listener from crearRecursoModal', () => {
      component.ngOnDestroy();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('hidden.bs.modal', component.onCrearRecursoModalHidden);
    });

    it('should not try to unsubscribe if subscriptions are undefined', () => {
      component['userAttributesSubscription'] = undefined;
      component['recursosSubscription'] = undefined;
      component.ngOnDestroy();
      // No debe haber errores y los spies no deben haber sido llamados
      expect(userAttributesSubscriptionSpy).not.toHaveBeenCalled(); // Si ya no existe, el spy no se crea
      expect(recursosSubscriptionSpy).not.toHaveBeenCalled(); // Si ya no existe, el spy no se crea
    });
  });

  describe('applyFilters', () => {
    const allRecursos: Recurso[] = [
      { idRecurso: 1, modelo: 'Laptop HP', descripcion: 'D', numeroSerie: 'SN123', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' },
      { idRecurso: 2, modelo: 'Monitor Dell', descripcion: 'D2', numeroSerie: 'SN456', fechaCompra: '2023-02-01', fechaVencimientoGarantia: '2025-02-01', estado: 'Prestado', emailUsuario: 'a@b.com', categoria: 'C2' },
      { idRecurso: 3, modelo: 'Teclado Logitech', descripcion: 'D3', numeroSerie: 'SN789', fechaCompra: '2023-03-01', fechaVencimientoGarantia: '2025-03-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' },
      { idRecurso: 4, modelo: 'Mouse Razer', descripcion: 'D4', numeroSerie: 'SN012', fechaCompra: '2023-04-01', fechaVencimientoGarantia: '2025-04-01', estado: 'Mantenimiento', emailUsuario: 'a@b.com', categoria: 'C3' }
    ];

    beforeEach(() => {
      component.recursos = [...allRecursos]; // Clonar para no modificar el original
      component.searchTerm = '';
      component.selectedEstado = 'Filtrar por estado';
    });

    it('should filter by searchTerm (case-insensitive, model and serial number)', () => {
      component.searchTerm = 'laptop';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].modelo).toBe('Laptop HP');

      component.searchTerm = 'sn456';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].numeroSerie).toBe('SN456');

      component.searchTerm = 'logi';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].modelo).toBe('Teclado Logitech');
    });

    it('should filter by selectedEstado', () => {
      component.selectedEstado = 'Disponible';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(2);
      expect(component.filteredRecursos.every(r => r.estado === 'Disponible')).toBeTrue();

      component.selectedEstado = 'Prestado';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].estado).toBe('Prestado');
    });

    it('should apply both filters simultaneously', () => {
      component.searchTerm = 'hp';
      component.selectedEstado = 'Disponible';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].modelo).toBe('Laptop HP');

      component.searchTerm = 'dell';
      component.selectedEstado = 'Prestado';
      component.applyFilters();
      expect(component.filteredRecursos.length).toBe(1);
      expect(component.filteredRecursos[0].modelo).toBe('Monitor Dell');
    });

    it('should return all resources if no filters are applied', () => {
      component.searchTerm = '';
      component.selectedEstado = 'Filtrar por estado';
      component.applyFilters();
      expect(component.filteredRecursos).toEqual(allRecursos);
    });

    it('should handle empty search term after trimming', () => {
      component.searchTerm = '   ';
      component.selectedEstado = 'Filtrar por estado';
      component.applyFilters();
      expect(component.filteredRecursos).toEqual(allRecursos);
    });
  });

  describe('viewResourceDetails', () => {
    it('should set selectedRecursoForDetails', () => {
      const mockRecurso: Recurso = { idRecurso: 1, modelo: 'Test', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      component.viewResourceDetails(mockRecurso);
      expect(component.selectedRecursoForDetails).toEqual(mockRecurso);
    });
  });

  describe('editResource', () => {
    it('should set selectedRecursoForEdit as a copy of the resource', () => {
      const mockRecurso: Recurso = { idRecurso: 1, modelo: 'Test', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      component.editResource(mockRecurso);
      expect(component.selectedRecursoForEdit).toEqual(mockRecurso);
      expect(component.selectedRecursoForEdit).not.toBe(mockRecurso); // Debe ser una copia
    });
  });

  describe('onResourceEdited', () => {
    it('should call getResources and closeEditModal', () => {
      spyOn(component, 'getResources');
      spyOn(component, 'closeEditModal');
      const updatedRecurso: Recurso = { idRecurso: 1, modelo: 'Updated', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      
      component.onResourceEdited(updatedRecurso);
      
      expect(component.getResources).toHaveBeenCalled();
      expect(component.closeEditModal).toHaveBeenCalled();
    });
  });

  describe('closeEditModal', () => {
    it('should hide the modal and clean up if modal element exists', () => {
      component.selectedRecursoForEdit = { idRecurso: 1, modelo: 'Test', descripcion: 'D', numeroSerie: 'SN', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@b.com', categoria: 'C' };
      
      // Simular que el modal está abierto y hay un backdrop
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.classList.add('modal-backdrop');
      document.body.appendChild(backdrop);

      component.closeEditModal();

      expect(document.getElementById).toHaveBeenCalledWith('editarRecursoModal');
      expect(bootstrapModalGetInstanceSpy).toHaveBeenCalledWith(mockEditarRecursoModal);
      expect(bootstrapModalSpy).not.toHaveBeenCalledWith(mockEditarRecursoModal); // getInstance debe encontrarlo primero
      expect(modalHideSpy).toHaveBeenCalled();
      expect(document.body.classList.contains('modal-open')).toBeFalse();
      expect(document.getElementsByClassName('modal-backdrop').length).toBe(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create new Modal instance if getInstance returns null and then hide it', () => {
      bootstrapModalGetInstanceSpy.and.returnValue(null); // Simular que no hay instancia existente

      // Simular que el modal está abierto y hay un backdrop
      document.body.classList.add('modal-open');
      const backdrop = document.createElement('div');
      backdrop.classList.add('modal-backdrop');
      document.body.appendChild(backdrop);

      component.closeEditModal();

      expect(document.getElementById).toHaveBeenCalledWith('editarRecursoModal');
      expect(bootstrapModalGetInstanceSpy).toHaveBeenCalledWith(mockEditarRecursoModal);
      expect(bootstrapModalSpy).toHaveBeenCalledWith(mockEditarRecursoModal); // Debe crear una nueva instancia
      expect(modalHideSpy).toHaveBeenCalled();
      expect(document.body.classList.contains('modal-open')).toBeFalse();
      expect(document.getElementsByClassName('modal-backdrop').length).toBe(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn if modal element is not found', () => {
      (document.getElementById as jasmine.Spy).and.returnValue(null); // Simular que el elemento no existe

      component.closeEditModal();

      expect(document.getElementById).toHaveBeenCalledWith('editarRecursoModal');
      expect(consoleWarnSpy).toHaveBeenCalledWith("Elemento 'editarRecursoModal' no encontrado para cerrar el modal.");
      expect(modalHideSpy).not.toHaveBeenCalled();
    });
  });

  describe('onCrearRecursoModalHidden', () => {
    it('should call resetForm on crearRecursoComponent if it exists', () => {
      component.crearRecursoComponent = new MockCrearRecursoComponent() as any; // Asegurarse de que el mock esté presente y castear
      component.onCrearRecursoModalHidden();
      expect(component.crearRecursoComponent.resetForm).toHaveBeenCalled();
    });

    it('should not throw error if crearRecursoComponent is undefined', () => {
      component.crearRecursoComponent = undefined as any; // Simular que ViewChild no ha inicializado
      expect(() => component.onCrearRecursoModalHidden()).not.toThrow();
    });
  });
});