import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PrestamosService, Loan, Resource } from './prestamos.service';

describe('PrestamosService', () => {
  let service: PrestamosService;
  let httpTestingController: HttpTestingController;
  const baseUrl = 'https://f21t3uora4.execute-api.us-east-1.amazonaws.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PrestamosService]
    });
    service = TestBed.inject(PrestamosService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Después de cada prueba, verifica que no haya solicitudes HTTP pendientes
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLoans', () => {
    it('should return expected loans', () => {
      const mockResource: Resource = {
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

      const mockLoans: Loan[] = [
        {
          idPrestamo: 1,
          recursoId: 1,
          fechaPrestamo: '2024-07-01',
          fechaDevolucion: '2024-07-15',
          solicitante: 'Alice',
          estado: 'activo',
          resource: mockResource
        },
        {
          idPrestamo: 2,
          recursoId: 2,
          fechaPrestamo: '2024-06-20',
          fechaDevolucion: '2024-07-10',
          solicitante: 'Bob',
          estado: 'devuelto'
        }
      ];

      service.getLoans().subscribe(loans => {
        expect(loans).toEqual(mockLoans);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/findAll`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockLoans);
    });

    it('should handle error when fetching loans', () => {
      const errorMessage = 'Error fetching loans';

      service.getLoans().subscribe({
        next: () => fail('should have failed with the 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/findAll`);
      req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('saveLoan', () => {
    it('should save a new loan and return it', () => {
      const newLoan: Loan = {
        recursoId: 3,
        fechaPrestamo: '2024-07-10',
        fechaDevolucion: '2024-07-20',
        solicitante: 'Charlie',
        estado: 'activo'
      };
      const savedLoan: Loan = { ...newLoan, idPrestamo: 3 };

      service.saveLoan(newLoan).subscribe(loan => {
        expect(loan).toEqual(savedLoan);
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/saveLoan`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(newLoan);
      req.flush(savedLoan);
    });

    it('should handle error when saving a loan', () => {
      const newLoan: Loan = {
        recursoId: 4,
        fechaPrestamo: '2024-07-11',
        fechaDevolucion: '2024-07-21',
        solicitante: 'David',
        estado: 'activo'
      };
      const errorMessage = 'Error saving loan';

      service.saveLoan(newLoan).subscribe({
        next: () => fail('should have failed with the 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/saveLoan`);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateLoanState', () => {
    it('should update loan state and return true on success', () => {
      const loanId = 1;
      const recursoId = 10;
      const newState = 'devuelto';
      const expectedResponse = true;

      service.updateLoanState(loanId, recursoId, newState).subscribe(success => {
        expect(success).toBeTrue();
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/updateLoanByState`);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual({ prestamoId: loanId, recursoId: recursoId });
      req.flush(expectedResponse);
    });

    it('should handle error when updating loan state', () => {
      const loanId = 2;
      const recursoId = 20;
      const newState = 'cancelado';
      const errorMessage = 'Error updating loan state';

      service.updateLoanState(loanId, recursoId, newState).subscribe({
        next: () => fail('should have failed with the 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpTestingController.expectOne(`${baseUrl}/loan/updateLoanByState`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });
});