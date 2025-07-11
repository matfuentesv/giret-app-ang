import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HistorialService, HistorialResource } from './historial.service';

describe('HistorialService', () => {
  let service: HistorialService;
  let httpTestingController: HttpTestingController;
  const historicalResourceUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HistorialService]
    });
    service = TestBed.inject(HistorialService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Después de cada prueba, verifica que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHistoricalByResourceId', () => {
    it('should return expected historical data for a given resource ID', () => {
      const resourceId = 123;
      const mockHistoricalData: HistorialResource[] = [
        { idHistorial: 1, recursoId: resourceId, fechaCambioEstado: '2024-01-01', accion: 'Prestado', descripcion: 'Préstamo inicial' },
        { idHistorial: 2, recursoId: resourceId, fechaCambioEstado: '2024-01-15', accion: 'Devuelto', descripcion: 'Devuelto a inventario' }
      ];

      service.getHistoricalByResourceId(resourceId).subscribe(data => {
        expect(data).toEqual(mockHistoricalData);
      });

      const req = httpTestingController.expectOne(`${historicalResourceUrl}/historical-resource/findById/${resourceId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockHistoricalData); // Proporciona los datos simulados
    });

    it('should handle error when fetching historical data', () => {
      const resourceId = 456;
      const errorMessage = 'Error fetching historical data';

      service.getHistoricalByResourceId(resourceId).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${historicalResourceUrl}/historical-resource/findById/${resourceId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });

    it('should return an empty array if no historical data is found for the ID', () => {
      const resourceId = 789;
      const mockEmptyData: HistorialResource[] = [];

      service.getHistoricalByResourceId(resourceId).subscribe(data => {
        expect(data).toEqual(mockEmptyData);
        expect(data.length).toBe(0);
      });

      const req = httpTestingController.expectOne(`${historicalResourceUrl}/historical-resource/findById/${resourceId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockEmptyData);
    });
  });
});