import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditarRecursoComponent } from './editar-recurso.component';
import { ResourceService, Recurso } from '../../services/resource.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// Mock para ResourceService
class MockResourceService {
  updateResource = jasmine.createSpy('updateResource').and.returnValue(of({ idRecurso: 1, modelo: 'Updated', descripcion: 'Updated Desc', numeroSerie: 'SN1', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'test@example.com', categoria: 'Computadoras' }));
}

describe('EditarRecursoComponent', () => {
  let component: EditarRecursoComponent;
  let fixture: ComponentFixture<EditarRecursoComponent>;
  let resourceService: MockResourceService;
  let consoleLogSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, EditarRecursoComponent], // Importar el componente standalone y sus módulos
      providers: [
        { provide: ResourceService, useClass: MockResourceService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarRecursoComponent);
    component = fixture.componentInstance;
    resourceService = TestBed.inject(ResourceService) as unknown as MockResourceService;
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
    it('should initialize editedRecurso if recurso input is provided on init', () => {
      const initialRecurso: Recurso = {
        idRecurso: 1,
        modelo: 'Laptop',
        descripcion: 'Dell XPS',
        numeroSerie: 'SN1',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01',
        estado: 'Disponible',
        emailUsuario: 'user@example.com',
        categoria: 'Computadoras'
      };
      component.recurso = initialRecurso;
      fixture.detectChanges(); // Esto llama a ngOnInit

      expect(component.editedRecurso).toEqual(initialRecurso);
      // Asegurarse de que sea una copia, no la misma referencia
      expect(component.editedRecurso).not.toBe(initialRecurso);
    });

    it('should initialize editedRecurso with default empty values if recurso input is null on init', () => {
      component.recurso = null;
      fixture.detectChanges(); // Esto llama a ngOnInit

      expect(component.editedRecurso).toEqual({
        modelo: '',
        descripcion: '',
        numeroSerie: '',
        fechaCompra: '',
        fechaVencimientoGarantia: '',
        estado: '',
        emailUsuario: '',
        categoria: ''
      });
    });
  });

  describe('ngOnChanges', () => {
    let initialRecurso: Recurso;
    let changes: SimpleChanges;

    beforeEach(() => {
      initialRecurso = {
        idRecurso: 1,
        modelo: 'Laptop',
        descripcion: 'Dell XPS',
        numeroSerie: 'SN1',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01',
        estado: 'Disponible',
        emailUsuario: 'user@example.com',
        categoria: 'Computadoras'
      };
      component.recurso = initialRecurso;
      fixture.detectChanges(); // Llamada inicial a ngOnInit
    });

    it('should update editedRecurso when recurso input changes', () => {
      const newRecurso: Recurso = {
        idRecurso: 2,
        modelo: 'Monitor',
        descripcion: 'HP Z24f',
        numeroSerie: 'SN2',
        fechaCompra: '2023-03-01',
        fechaVencimientoGarantia: '2025-03-01',
        estado: 'En Mantenimiento',
        emailUsuario: 'admin@example.com',
        categoria: 'Monitores'
      };

      changes = {
        recurso: new SimpleChange(initialRecurso, newRecurso, false)
      };

      component.recurso = newRecurso; // Actualizar el input
      component.ngOnChanges(changes); // Llamar ngOnChanges manualmente

      expect(component.editedRecurso).toEqual(newRecurso);
      expect(component.editedRecurso).not.toBe(newRecurso); // Debe ser una copia
    });

    it('should not update editedRecurso if recurso input is null', () => {
      const currentEditedRecurso = { ...component.editedRecurso }; // Guardar el estado actual

      changes = {
        recurso: new SimpleChange(initialRecurso, null, false)
      };

      component.recurso = null; // Actualizar el input a null
      component.ngOnChanges(changes); // Llamar ngOnChanges manualmente

      expect(component.editedRecurso).toEqual(currentEditedRecurso); // No debe haber cambiado
    });

    it('should not update editedRecurso if other inputs change', () => {
      const currentEditedRecurso = { ...component.editedRecurso };

      changes = {
        someOtherInput: new SimpleChange('oldValue', 'newValue', false)
      };

      component.ngOnChanges(changes);

      expect(component.editedRecurso).toEqual(currentEditedRecurso); // No debe haber cambiado
    });
  });

  describe('saveChanges', () => {
    let resourceUpdatedEmitSpy: jasmine.Spy;
    let modalClosedEmitSpy: jasmine.Spy;

    beforeEach(() => {
      resourceUpdatedEmitSpy = spyOn(component.resourceUpdated, 'emit');
      modalClosedEmitSpy = spyOn(component.modalClosed, 'emit');
      // Asegurarse de que el recurso tenga un ID para las pruebas de guardado exitoso/fallido
      component.recurso = {
        idRecurso: 1,
        modelo: 'Laptop',
        descripcion: 'Dell XPS',
        numeroSerie: 'SN1',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01',
        estado: 'Disponible',
        emailUsuario: 'user@example.com',
        categoria: 'Computadoras'
      };
      // Inicializar editedRecurso para que coincida con recurso
      component.editedRecurso = { ...component.recurso };
    });

    it('should call updateResource, emit resourceUpdated, and close modal on success', fakeAsync(() => {
      const updatedRecurso: Recurso = { ...component.editedRecurso, estado: 'En Mantenimiento' };
      resourceService.updateResource.and.returnValue(of(updatedRecurso));

      component.saveChanges();
      tick(); // Procesa el observable

      expect(resourceService.updateResource).toHaveBeenCalledWith(component.editedRecurso.idRecurso!, component.editedRecurso);
      expect(consoleLogSpy).toHaveBeenCalledWith('Recurso actualizado con éxito:', updatedRecurso);
      expect(resourceUpdatedEmitSpy).toHaveBeenCalledWith(updatedRecurso);
      expect(modalClosedEmitSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    }));

    it('should handle error during updateResource', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({
        error: 'Update failed',
        status: 500,
        statusText: 'Internal Server Error'
      });
      resourceService.updateResource.and.returnValue(throwError(() => errorResponse));

      component.saveChanges();
      tick(); // Procesa el observable

      expect(resourceService.updateResource).toHaveBeenCalledWith(component.editedRecurso.idRecurso!, component.editedRecurso);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al actualizar el recurso:', errorResponse);
      expect(resourceUpdatedEmitSpy).not.toHaveBeenCalled(); // No debe emitir en caso de error
      expect(modalClosedEmitSpy).not.toHaveBeenCalled(); // No debe cerrar el modal en caso de error
      expect(consoleLogSpy).not.toHaveBeenCalled();
    }));

    it('should warn and not call updateResource if idRecurso is null', () => {
      component.editedRecurso.idRecurso = undefined; // Simular idRecurso nulo

      component.saveChanges();

      expect(resourceService.updateResource).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('No se puede actualizar el recurso: idRecurso no definido.');
      expect(resourceUpdatedEmitSpy).not.toHaveBeenCalled();
      expect(modalClosedEmitSpy).not.toHaveBeenCalled();
    });

    it('should warn and not call updateResource if idRecurso is 0', () => {
      component.editedRecurso.idRecurso = 0; // Simular idRecurso 0
      
      component.saveChanges();

      expect(resourceService.updateResource).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('No se puede actualizar el recurso: idRecurso no definido.');
      expect(resourceUpdatedEmitSpy).not.toHaveBeenCalled();
      expect(modalClosedEmitSpy).not.toHaveBeenCalled();
    });
  });

  describe('closeModal', () => {
    it('should emit modalClosed event', () => {
      const modalClosedEmitSpy = spyOn(component.modalClosed, 'emit');
      component.closeModal();
      expect(modalClosedEmitSpy).toHaveBeenCalled();
    });
  });
});