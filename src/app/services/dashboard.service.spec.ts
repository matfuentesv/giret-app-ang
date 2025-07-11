import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService, DashboardData, EstadoCount, LoanDue, RecursoDashboard } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTestingController: HttpTestingController;
  const apiUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService]
    });
    service = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Después de cada prueba, verifica que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDashboardData', () => {
    it('should return expected dashboard data', () => {
      const mockDashboardData: DashboardData = {
        recursosTotales: 100,
        recursosPrestados: 50,
        recursosMantenimiento: 5,
        recursosEliminado: 2
      };

      service.getDashboardData().subscribe(data => {
        expect(data).toEqual(mockDashboardData);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/findAll`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockDashboardData); // Proporciona los datos simulados
    });

    it('should handle error when fetching dashboard data', () => {
      const errorMessage = 'Error fetching dashboard data';

      service.getDashboardData().subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/findAll`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getCountByEstadoConPorcentaje', () => {
    it('should return expected EstadoCount data', () => {
      const mockEstadoCounts: EstadoCount[] = [
        { estado: 'Disponible', cantidad: 80, porcentaje: 80 },
        { estado: 'Prestado', cantidad: 15, porcentaje: 15 },
        { estado: 'Mantenimiento', cantidad: 5, porcentaje: 5 }
      ];

      service.getCountByEstadoConPorcentaje().subscribe(data => {
        expect(data).toEqual(mockEstadoCounts);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/countByEstadoConPorcentaje`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockEstadoCounts);
    });

    it('should handle error when fetching EstadoCount data', () => {
      const errorMessage = 'Error fetching EstadoCount data';

      service.getCountByEstadoConPorcentaje().subscribe({
        next: () => fail('should have failed with the 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/countByEstadoConPorcentaje`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getLoansDue', () => {
    it('should return expected LoanDue data', () => {
      const mockRecurso: RecursoDashboard = {
        idRecurso: 1,
        modelo: 'Laptop',
        descripcion: 'Laptop HP',
        numeroSerie: 'SN12345',
        fechaCompra: '2023-01-01',
        fechaVencimientoGarantia: '2025-01-01',
        emailUsuario: 'user@example.com',
        estado: 'Prestado',
        categoria: 'Electrónica'
      };

      const mockLoansDue: LoanDue[] = [
        {
          prestamoId: 101,
          solicitadoPor: 'Juan Perez',
          mensajeVencimiento: 'Vence en 2 días',
          fechaDevolucion: '2025-07-13',
          recurso: mockRecurso
        }
      ];

      service.getLoansDue().subscribe(data => {
        expect(data).toEqual(mockLoansDue);
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/findLoanDue`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockLoansDue);
    });

    it('should handle error when fetching LoanDue data', () => {
      const errorMessage = 'Error fetching LoanDue data';

      service.getLoansDue().subscribe({
        next: () => fail('should have failed with the 403 error'),
        error: error => {
          expect(error.status).toBe(403);
          expect(error.statusText).toBe('Forbidden');
        }
      });

      const req = httpTestingController.expectOne(`${apiUrl}/dashboard/findLoanDue`);
      req.flush(errorMessage, { status: 403, statusText: 'Forbidden' });
    });
  });
});