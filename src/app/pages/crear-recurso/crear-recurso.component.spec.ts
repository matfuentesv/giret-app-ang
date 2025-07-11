import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CrearRecursoComponent } from './crear-recurso.component';
import { ResourceService, Recurso, Documento } from '../../services/resource.service';
import { CognitoService } from '../../auth/cognito.service';
import { FormsModule, NgForm } from '@angular/forms'; // CommonModule ya está importado
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Mock para ResourceService
class MockResourceService {
  saveResource = jasmine.createSpy('saveResource').and.returnValue(of({ idRecurso: 1, modelo: 'Test', descripcion: 'Desc', numeroSerie: 'SN', fechaCompra: '2024-01-01', fechaVencimientoGarantia: '2025-01-01', emailUsuario: 'test@example.com', estado: 'En Bodega', categoria: 'Cat' }));
  uploadDocument = jasmine.createSpy('uploadDocument').and.returnValue(of({ id: 1, key: 'key', nombreArchivo: 'file.pdf', url: 'url', tipoMime: 'pdf', fechaCarga: '2024-01-01', recursoId: 1 }));
}

// Mock para CognitoService
class MockCognitoService {
  getUserAttributes = jasmine.createSpy('getUserAttributes').and.returnValue(of({ email: 'test@example.com', sub: '123' }));
}

describe('CrearRecursoComponent', () => {
  let component: CrearRecursoComponent;
  let fixture: ComponentFixture<CrearRecursoComponent>;
  let resourceService: MockResourceService;
  let cognitoService: MockCognitoService;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, CrearRecursoComponent], // Importar el componente standalone y sus módulos
      providers: [
        { provide: ResourceService, useClass: MockResourceService },
        { provide: CognitoService, useClass: MockCognitoService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearRecursoComponent);
    component = fixture.componentInstance; // CAMBIO AQUÍ: Usar .componentInstance
    resourceService = TestBed.inject(ResourceService) as unknown as MockResourceService;
    cognitoService = TestBed.inject(CognitoService) as unknown as MockCognitoService;
    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');
    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user email and assign it to newRecurso.emailUsuario', fakeAsync(() => {
      const mockAttributes = { email: 'user@example.com', sub: 'abc' };
      cognitoService.getUserAttributes.and.returnValue(of(mockAttributes));

      component.ngOnInit(); // Volver a llamar ngOnInit para que use el nuevo mock
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(component.userEmail).toBe('user@example.com');
      expect(component.newRecurso.emailUsuario).toBe('user@example.com');
    }));

    it('should set user email to null and newRecurso.emailUsuario to empty string if attributes are null', fakeAsync(() => {
      cognitoService.getUserAttributes.and.returnValue(of(null)); // Simular atributos nulos

      component.ngOnInit();
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(component.userEmail).toBeNull();
      expect(component.newRecurso.emailUsuario).toBe('');
    }));

    it('should handle error when fetching user attributes', fakeAsync(() => {
      const errorResponse = new Error('Auth error');
      cognitoService.getUserAttributes.and.returnValue(throwError(() => errorResponse));

      component.ngOnInit();
      tick();

      expect(cognitoService.getUserAttributes).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error al obtener atributos del usuario en el componente:', errorResponse);
      expect(component.userEmail).toBeNull();
      expect(component.newRecurso.emailUsuario).toBe('');
    }));
  });

  describe('onFileSelected', () => {
    it('should set selectedFiles with the selected files', () => {
      const mockFile1 = new File([''], 'file1.txt', { type: 'text/plain' });
      const mockFile2 = new File([''], 'file2.pdf', { type: 'application/pdf' });
      const mockFileList = {
        0: mockFile1,
        1: mockFile2,
        length: 2,
        item: (index: number) => (index === 0 ? mockFile1 : mockFile2)
      };
      const mockEvent = { target: { files: mockFileList } };

      component.onFileSelected(mockEvent);

      expect(component.selectedFiles.length).toBe(2);
      expect(component.selectedFiles[0]).toBe(mockFile1);
      expect(component.selectedFiles[1]).toBe(mockFile2);
    });
  });

  describe('onDateChange', () => {
    it('should set fechaGarantiaInvalida to true if fechaVencimientoGarantia is before fechaCompra', () => {
      component.newRecurso.fechaCompra = '2024-01-10';
      component.newRecurso.fechaVencimientoGarantia = '2024-01-09';
      component.onDateChange();
      expect(component.fechaGarantiaInvalida).toBeTrue();
    });

    it('should set fechaGarantiaInvalida to false if dates are valid', () => {
      component.newRecurso.fechaCompra = '2024-01-10';
      component.newRecurso.fechaVencimientoGarantia = '2024-01-11';
      component.onDateChange();
      expect(component.fechaGarantiaInvalida).toBeFalse();
    });

    it('should set fechaGarantiaInvalida to false if dates are the same', () => {
      component.newRecurso.fechaCompra = '2024-01-10';
      component.newRecurso.fechaVencimientoGarantia = '2024-01-10';
      component.onDateChange();
      expect(component.fechaGarantiaInvalida).toBeFalse();
    });

    it('should set fechaGarantiaInvalida to false if dates are empty', () => {
      component.newRecurso.fechaCompra = '';
      component.newRecurso.fechaVencimientoGarantia = '';
      component.onDateChange();
      expect(component.fechaGarantiaInvalida).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    let resourceCreatedEmitSpy: jasmine.Spy;
    let onDateChangeSpy: jasmine.Spy; // Espía onDateChange

    beforeEach(() => {
      resourceCreatedEmitSpy = spyOn(component.resourceCreated, 'emit');
      onDateChangeSpy = spyOn(component, 'onDateChange').and.callThrough(); // Espía y llama al original
      
      // Asegurarse de que las validaciones de fecha no bloqueen el onSubmit por defecto
      component.fechaGarantiaInvalida = false;
      // Configurar un recurso válido para la prueba
      component.newRecurso = {
        modelo: 'Laptop', descripcion: 'Dell', numeroSerie: 'SN123', fechaCompra: '2024-01-01',
        fechaVencimientoGarantia: '2025-01-01', emailUsuario: 'user@example.com', estado: 'En Bodega', categoria: 'Computadora'
      };
    });

    it('should not submit if isLoading is true', () => {
      component.isLoading = true;
      component.onSubmit();
      expect(resourceService.saveResource).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
      expect(onDateChangeSpy).not.toHaveBeenCalled(); // No debe llamar a onDateChange si isLoading es true
    });

    // CAMBIO AQUÍ: Configura newRecurso para que onDateChange lo marque como inválido
    it('should not submit if fechaGarantiaInvalida is true after onDateChange', () => {
      // Configura fechas inválidas para que onDateChange establezca fechaGarantiaInvalida a true
      component.newRecurso.fechaCompra = '2024-01-10';
      component.newRecurso.fechaVencimientoGarantia = '2024-01-09';
      
      // Asegúrate de que el estado inicial del componente sea false para este test
      component.fechaGarantiaInvalida = false; 

      component.onSubmit();
      
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
      expect(component.fechaGarantiaInvalida).toBeTrue(); // Y debe haber marcado la fecha como inválida
      expect(resourceService.saveResource).not.toHaveBeenCalled();
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should set isLoading to true during submission and false on success', fakeAsync(() => {
      const saveResourceSubject = new Subject<Recurso>();
      resourceService.saveResource.and.returnValue(saveResourceSubject.asObservable());

      component.onSubmit();
      expect(component.isLoading).toBeTrue();

      saveResourceSubject.next({ ...component.newRecurso, idRecurso: 1 });
      saveResourceSubject.complete();
      tick();

      expect(component.isLoading).toBeFalse();
      expect(alertSpy).toHaveBeenCalledWith('Recurso agregado correctamente!');
      expect(resourceCreatedEmitSpy).toHaveBeenCalled();
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
    }));

    it('should call saveResource and reset form on success without files', fakeAsync(() => {
      spyOn(component, 'resetForm'); // Espía resetForm
      component.selectedFiles = []; // Asegurarse de que no hay archivos

      component.onSubmit();
      tick();

      expect(resourceService.saveResource).toHaveBeenCalledWith(component.newRecurso);
      expect(alertSpy).toHaveBeenCalledWith('Recurso agregado correctamente!');
      expect(resourceCreatedEmitSpy).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
      expect(resourceService.uploadDocument).not.toHaveBeenCalled(); // No debe llamar a uploadDocument
      expect(component.selectedFiles.length).toBe(0); // Asegurarse de que los archivos se limpian (aunque ya estaban vacíos)
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
    }));

    it('should call saveResource and upload documents on success with files', fakeAsync(() => {
      spyOn(component, 'resetForm');
      const mockFile1 = new File([''], 'doc1.pdf', { type: 'application/pdf' });
      const mockFile2 = new File([''], 'doc2.jpg', { type: 'image/jpeg' });
      component.selectedFiles = [mockFile1, mockFile2];

      const savedResourceResponse: Recurso = { ...component.newRecurso, idRecurso: 10 };
      resourceService.saveResource.and.returnValue(of(savedResourceResponse));

      const uploadDocSubject1 = new Subject<Documento>();
      const uploadDocSubject2 = new Subject<Documento>();
      resourceService.uploadDocument.and.returnValues(uploadDocSubject1.asObservable(), uploadDocSubject2.asObservable());

      component.onSubmit();
      tick(); // Para que saveResource se complete

      expect(resourceService.saveResource).toHaveBeenCalledWith(component.newRecurso);
      expect(alertSpy).toHaveBeenCalledWith('Recurso agregado correctamente!');
      expect(resourceService.uploadDocument).toHaveBeenCalledTimes(2);
      expect(resourceService.uploadDocument).toHaveBeenCalledWith(mockFile1, 10);
      expect(resourceService.uploadDocument).toHaveBeenCalledWith(mockFile2, 10);
      
      // Simular que las subidas de documentos también se completan
      uploadDocSubject1.next({ id: 1, key: 'k1', nombreArchivo: 'doc1.pdf', url: 'u1', tipoMime: 'pdf', fechaCarga: 'd1', recursoId: 10 });
      uploadDocSubject1.complete();
      uploadDocSubject2.next({ id: 2, key: 'k2', nombreArchivo: 'doc2.jpg', url: 'u2', tipoMime: 'jpeg', fechaCarga: 'd2', recursoId: 10 });
      uploadDocSubject2.complete();
      tick(); // Procesar las subidas

      expect(resourceCreatedEmitSpy).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
      expect(component.selectedFiles.length).toBe(0);
      expect(component.isLoading).toBeFalse();
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
    }));

   
    it('should alert if resource created but document upload fails', fakeAsync(() => {
      spyOn(component, 'resetForm');
      const mockFile1 = new File([''], 'doc1.pdf', { type: 'application/pdf' });
      component.selectedFiles = [mockFile1];

      const savedResourceResponse: Recurso = { ...component.newRecurso, idRecurso: 10 };
      resourceService.saveResource.and.returnValue(of(savedResourceResponse));

      const uploadDocSubject = new Subject<Documento>();
      resourceService.uploadDocument.and.returnValue(uploadDocSubject.asObservable());

      component.onSubmit();
      tick(); // saveResource completes

      // Simular que la subida del documento falla
      const uploadError = new Error('Upload failed');
      uploadDocSubject.error(uploadError);
      tick(); // Process the upload error

      expect(resourceService.saveResource).toHaveBeenCalled();
      expect(resourceService.uploadDocument).toHaveBeenCalledWith(mockFile1, 10);
      expect(alertSpy).toHaveBeenCalledWith('Recurso agregado correctamente!'); // Primer alert de éxito de recurso
      expect(alertSpy).toHaveBeenCalledWith('Error al subir el documento doc1.pdf.'); // Segundo alert de error de subida
      expect(consoleErrorSpy).not.toHaveBeenCalledWith('Error al agregar el recurso:', jasmine.any(Error)); // No debe ser el error de saveResource
      expect(resourceCreatedEmitSpy).toHaveBeenCalled(); // resourceCreated.emit() se llama
      expect(component.resetForm).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
    }));

    it('should alert "Recurso creado, pero no se pudieron subir los documentos asociados." if idRecurso is missing but files are present', fakeAsync(() => {
      spyOn(component, 'resetForm');
      const mockFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
      component.selectedFiles = [mockFile];

      // Simular que saveResource devuelve un recurso sin idRecurso
      const savedResourceResponse: Recurso = { ...component.newRecurso, idRecurso: undefined };
      resourceService.saveResource.and.returnValue(of(savedResourceResponse));

      component.onSubmit();
      tick();

      expect(resourceService.saveResource).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Recurso agregado correctamente!');
      expect(alertSpy).toHaveBeenCalledWith('Recurso creado, pero no se pudieron subir los documentos asociados.');
      expect(resourceService.uploadDocument).not.toHaveBeenCalled(); // No debe intentar subir si no hay idRecurso
      expect(resourceCreatedEmitSpy).toHaveBeenCalled();
      expect(component.resetForm).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(onDateChangeSpy).toHaveBeenCalled(); // onDateChange debe ser llamado
    }));
  });

  describe('resetForm', () => {
    beforeEach(() => {
      // Simular un formulario con datos
      component.newRecurso = {
        idRecurso: 1,
        modelo: 'Old Model',
        descripcion: 'Old Desc',
        numeroSerie: 'OLD123',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2024-01-01',
        emailUsuario: 'old@example.com',
        estado: 'Prestado',
        categoria: 'Old Cat'
      };
      component.selectedFiles = [new File([''], 'old.pdf')];
      component.fechaGarantiaInvalida = true;
      component.isLoading = true; // Simular que estaba cargando

      // Mockear ViewChild recursoForm
      component.recursoForm = {
        resetForm: jasmine.createSpy('resetForm')
      } as unknown as NgForm;
    });

    it('should reset newRecurso to initial values', () => {
      component.resetForm();
      expect(component.newRecurso).toEqual({
        modelo: '',
        descripcion: '',
        numeroSerie: '',
        fechaCompra: '',
        fechaVencimientoGarantia: '',
        emailUsuario: component.userEmail || '', // Debería mantener el userEmail si existe
        estado: 'Bodega',
        categoria: ''
      });
    });

    it('should clear selectedFiles', () => {
      component.resetForm();
      expect(component.selectedFiles.length).toBe(0);
    });

    it('should reset fechaGarantiaInvalida to false', () => {
      component.resetForm();
      expect(component.fechaGarantiaInvalida).toBeFalse();
    });

    it('should call recursoForm.resetForm if it exists', () => {
      component.resetForm();
      expect(component.recursoForm?.resetForm).toHaveBeenCalledWith(component.newRecurso);
    });

    it('should not call recursoForm.resetForm if it does not exist', () => {
      component.recursoForm = undefined;
      component.resetForm();
      // No debe haber error y el test debe pasar
    });

    it('should set isLoading to false', () => {
      component.resetForm();
      expect(component.isLoading).toBeFalse();
    });
  });
});
