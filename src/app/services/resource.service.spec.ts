import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResourceService, Recurso, Documento } from './resource.service';

describe('ResourceService', () => {
  let service: ResourceService;
  let httpTestingController: HttpTestingController;
  const baseUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResourceService]
    });
    service = TestBed.inject(ResourceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Después de cada prueba, verifica que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getResources', () => {
    it('should return expected resources', () => {
      const mockResources: Recurso[] = [
        { idRecurso: 1, modelo: 'Laptop', descripcion: 'Dell XPS', numeroSerie: 'SN1', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@example.com', categoria: 'Computadoras' },
        { idRecurso: 2, modelo: 'Proyector', descripcion: 'Epson', numeroSerie: 'SN2', fechaCompra: '2023-02-01', fechaVencimientoGarantia: '2025-02-01', estado: 'Prestado', emailUsuario: 'b@example.com', categoria: 'Oficina' }
      ];

      service.getResources().subscribe(resources => {
        expect(resources).toEqual(mockResources);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/findAll`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResources);
    });

    it('should handle error when fetching all resources', () => {
      const errorMessage = 'Error fetching resources';

      service.getResources().subscribe({
        next: () => fail('should have failed with the 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/findAll`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getResourcesById', () => {
    it('should return expected resource by ID', () => {
      const resourceId = 1;
      const mockResource: Recurso[] = [ // API devuelve array
        { idRecurso: 1, modelo: 'Laptop', descripcion: 'Dell XPS', numeroSerie: 'SN1', fechaCompra: '2023-01-01', fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'a@example.com', categoria: 'Computadoras' }
      ];

      service.getResourcesById(resourceId).subscribe(resource => {
        expect(resource).toEqual(mockResource);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/findById/${resourceId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResource);
    });

    it('should handle error when fetching resource by ID', () => {
      const resourceId = 999;
      const errorMessage = 'Resource not found';

      service.getResourcesById(resourceId).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/findById/${resourceId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateResource', () => {
    it('should update a resource and return the updated resource', () => {
      const resourceId = 1;
      const updatedResource: Recurso = {
        idRecurso: 1,
        modelo: 'Laptop',
        descripcion: 'Dell XPS actualizado',
        numeroSerie: 'SN1',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01',
        estado: 'En Mantenimiento',
        emailUsuario: 'a@example.com',
        categoria: 'Computadoras'
      };

      service.updateResource(resourceId, updatedResource).subscribe(resource => {
        expect(resource).toEqual(updatedResource);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/update/${resourceId}`);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updatedResource);
      req.flush(updatedResource);
    });

    it('should handle error when updating a resource', () => {
      const resourceId = 999;
      const resourceToUpdate: Recurso = {
        idRecurso: 999, modelo: 'Test', descripcion: 'Test', numeroSerie: 'Test', fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01', estado: 'Disponible', emailUsuario: 'test@example.com', categoria: 'Test'
      };
      const errorMessage = 'Resource not found for update';

      service.updateResource(resourceId, resourceToUpdate).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/update/${resourceId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('saveResource', () => {
    it('should save a new resource and return the saved resource', () => {
      const newResource: Recurso = {
        modelo: 'Tablet',
        descripcion: 'iPad Pro',
        numeroSerie: 'SN3',
        fechaCompra: '2024-01-01',
        fechaVencimientoGarantia: '2026-01-01',
        estado: 'Disponible',
        emailUsuario: 'c@example.com',
        categoria: 'Móvil'
      };
      const savedResource: Recurso = { ...newResource, idRecurso: 3 };

      service.saveResource(newResource).subscribe(resource => {
        expect(resource).toEqual(savedResource);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/save`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newResource);
      req.flush(savedResource);
    });

    it('should handle error when saving a resource', () => {
      const newResource: Recurso = {
        modelo: 'Router', descripcion: 'Cisco', numeroSerie: 'SN4', fechaCompra: '2024-01-01',
        fechaVencimientoGarantia: '2026-01-01', estado: 'Disponible', emailUsuario: 'd@example.com', categoria: 'Redes'
      };
      const errorMessage = 'Error saving resource';

      service.saveResource(newResource).subscribe({
        next: () => fail('should have failed with the 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/resource/save`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document and return the saved document', () => {
      const recursoId = 1;
      const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
      const mockDocument: Documento = {
        id: 1, key: 'unique-key', nombreArchivo: 'test.pdf', url: 'http://example.com/test.pdf',
        tipoMime: 'application/pdf', fechaCarga: '2024-07-10', recursoId: 1
      };

      service.uploadDocument(mockFile, recursoId).subscribe(document => {
        expect(document).toEqual(mockDocument);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/document/saveDocument`);
      expect(req.request.method).toEqual('POST');

      // Verify that the request body is FormData and contains the file and recursoId
      expect(req.request.body instanceof FormData).toBeTrue();
      // Note: You cannot easily inspect the exact contents of FormData directly
      // as it's a stream-like object. We primarily test if the request was made correctly.
      // For more granular checks on FormData, you might need a custom matcher or more complex setup.
      // For now, we trust HttpClient to form the FormData correctly if the inputs are correct.

      req.flush(mockDocument);
    });

    it('should handle error when uploading a document', () => {
      const recursoId = 999;
      const mockFile = new File(['error content'], 'error.png', { type: 'image/png' });
      const errorMessage = 'File upload failed';

      service.uploadDocument(mockFile, recursoId).subscribe({
        next: () => fail('should have failed with the 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/document/saveDocument`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getDocumentsByRecursoId', () => {
    it('should return expected documents for a given resource ID', () => {
      const recursoId = 1;
      const mockDocuments: Documento[] = [
        { id: 1, key: 'doc1', nombreArchivo: 'manual.pdf', url: 'url1', tipoMime: 'application/pdf', fechaCarga: '2024-01-01', recursoId: 1 },
        { id: 2, key: 'doc2', nombreArchivo: 'warranty.jpg', url: 'url2', tipoMime: 'image/jpeg', fechaCarga: '2024-01-05', recursoId: 1 }
      ];

      service.getDocumentsByRecursoId(recursoId).subscribe(documents => {
        expect(documents).toEqual(mockDocuments);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/document/by-resource/${recursoId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockDocuments);
    });

    it('should handle error when fetching documents by resource ID', () => {
      const recursoId = 999;
      const errorMessage = 'Documents not found for resource';

      service.getDocumentsByRecursoId(recursoId).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/document/by-resource/${recursoId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should return an empty array if no documents are found for the ID', () => {
      const recursoId = 789;
      const mockEmptyData: Documento[] = [];

      service.getDocumentsByRecursoId(recursoId).subscribe(data => {
        expect(data).toEqual(mockEmptyData);
        expect(data.length).toBe(0);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/document/by-resource/${recursoId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockEmptyData);
    });
  });
});