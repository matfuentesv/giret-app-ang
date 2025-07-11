// dashboard.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, Subscription, Subject } from 'rxjs'; // Import Subject
import { DashboardComponent } from './dashboard.component'; //
import { CognitoService } from '../../auth/cognito.service'; //
import { DashboardService, DashboardData, EstadoCount, LoanDue, RecursoDashboard } from '../../services/dashboard.service'; //,
import { CommonModule } from '@angular/common'; //
import { BaseChartDirective } from 'ng2-charts'; //
import { Chart } from 'chart.js'; //

// Mock CognitoService
class MockCognitoService {
  getUserAttributes() {
    return of({ email: 'test@example.com', sub: '123' });
  }
}

// Mock DashboardService con Subjects para control asíncrono
class MockDashboardService {
  public dashboardDataSubject = new Subject<DashboardData>();
  public estadoCountsSubject = new Subject<EstadoCount[]>();
  public loansDueSubject = new Subject<LoanDue[]>();

  getDashboardData() {
    return this.dashboardDataSubject.asObservable();
  }

  getCountByEstadoConPorcentaje() {
    return this.estadoCountsSubject.asObservable();
  }

  getLoansDue() {
    return this.loansDueSubject.asObservable();
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let cognitoService: CognitoService;
  let dashboardService: MockDashboardService; // Referencia al mock con Subjects
  let chartRegisterSpy: jasmine.Spy;

  beforeEach(async () => {
    chartRegisterSpy = spyOn(Chart, 'register'); //

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, //
        BaseChartDirective //
      ],
      providers: [
        { provide: CognitoService, useClass: MockCognitoService }, //
        { provide: DashboardService, useClass: MockDashboardService } // Usamos el nuevo mock con Subjects
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    cognitoService = TestBed.inject(CognitoService);
    // Corregido: Doble aserción de tipo para acceder a las propiedades del mock
    dashboardService = TestBed.inject(DashboardService) as unknown as MockDashboardService; // Castear para acceder a los Subjects

    expect(chartRegisterSpy).toHaveBeenCalled(); //
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let getUserAttributesSpy: jasmine.Spy;
    let prepareChartDataSpy: jasmine.Spy;

    // Preparamos los valores de mock que los Subjects emitirán
    const mockDashboardData: DashboardData = {
      recursosTotales: 100,
      recursosPrestados: 50,
      recursosMantenimiento: 20,
      recursosEliminado: 30
    };
    const mockEstadoCounts: EstadoCount[] = [
      { estado: 'asignado', cantidad: 30, porcentaje: 30 },
      { estado: 'prestado', cantidad: 20, porcentaje: 20 },
      { estado: 'bodega', cantidad: 50, porcentaje: 50 },
    ];
    const mockLoansDue: LoanDue[] = [
      {
        prestamoId: 1,
        solicitadoPor: 'Usuario A',
        mensajeVencimiento: 'El préstamo de Laptop A vence el 15/07/2025.',
        fechaDevolucion: '2025-07-15',
        recurso: {
          idRecurso: 101,
          modelo: 'Laptop A',
          descripcion: 'Laptop para desarrollo',
          numeroSerie: 'SN-LAP001',
          fechaCompra: '2023-01-01',
          fechaVencimientoGarantia: '2026-01-01',
          emailUsuario: 'userA@example.com',
          estado: 'prestado',
          categoria: 'portatil'
        }
      },
      {
        prestamoId: 2,
        solicitadoPor: 'Usuario B',
        mensajeVencimiento: 'El préstamo de Monitor B vence el 20/07/2025.',
        fechaDevolucion: '2025-07-20',
        recurso: {
          idRecurso: 102,
          modelo: 'Monitor B',
          descripcion: 'Monitor de 24 pulgadas',
          numeroSerie: 'SN-MON002',
          fechaCompra: '2023-03-01',
          fechaVencimientoGarantia: '2026-03-01',
          emailUsuario: 'userB@example.com',
          estado: 'prestado',
          categoria: 'monitor'
        }
      },
    ];

    beforeEach(() => {
      getUserAttributesSpy = spyOn(cognitoService, 'getUserAttributes').and.callThrough(); //
      prepareChartDataSpy = spyOn(component as any, 'prepareChartData'); //
    });

    it('should set isLoading to true initially and false on complete', fakeAsync(() => { //
      component.ngOnInit(); // Esto suscribe el componente a los Subjects

      expect(component.isLoading).toBeTrue(); //

      // Emitir valores y completar los Subjects para simular la respuesta de la API
      dashboardService.dashboardDataSubject.next(mockDashboardData);
      dashboardService.estadoCountsSubject.next(mockEstadoCounts);
      dashboardService.loansDueSubject.next(mockLoansDue);

      dashboardService.dashboardDataSubject.complete();
      dashboardService.estadoCountsSubject.complete();
      dashboardService.loansDueSubject.complete();

      tick(); // Avanzar el tiempo para que se procesen las microtareas (incluido finalize)
      expect(component.isLoading).toBeFalse(); //
    }));

    it('should load user attributes on init', fakeAsync(() => { //
      component.ngOnInit();
      tick();
      expect(getUserAttributesSpy).toHaveBeenCalled();
      expect(component.userEmail).toBe('test@example.com'); //
    }));

    it('should set userEmail to null if getUserAttributes errors', fakeAsync(() => { //
      getUserAttributesSpy.and.returnValue(throwError(() => new Error('Auth error'))); //
      spyOn(console, 'error');

      component.ngOnInit();
      tick();
      expect(console.error).toHaveBeenCalledWith('Error al obtener atributos del usuario en DashboardComponent:', jasmine.any(Error)); //
      expect(component.userEmail).toBeNull(); //
    }));

    it('should load dashboard data, estado counts, and loans due using forkJoin', fakeAsync(() => { //
      component.ngOnInit();

      // Emitir valores y completar los Subjects para simular la respuesta de la API
      dashboardService.dashboardDataSubject.next(mockDashboardData);
      dashboardService.estadoCountsSubject.next(mockEstadoCounts);
      dashboardService.loansDueSubject.next(mockLoansDue);

      dashboardService.dashboardDataSubject.complete();
      dashboardService.estadoCountsSubject.complete();
      dashboardService.loansDueSubject.complete();

      tick();

      expect(component.dashboardData).toEqual(mockDashboardData);
      expect(component.estadoCounts).toEqual(mockEstadoCounts);
      expect(component.loansDue).toEqual(mockLoansDue);
      expect(prepareChartDataSpy).toHaveBeenCalled(); //
    }));

    it('should handle errors during forkJoin and set isLoading to false', fakeAsync(() => { //
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.ngOnInit(); // Suscribirse primero

      // Simular el error *después* de la suscripción
      dashboardService.dashboardDataSubject.error(new Error('Dashboard data error')); //

      tick(); // Procesar el error y finalize

      expect(console.error).toHaveBeenCalledWith('Error al cargar uno o más datos del dashboard:', jasmine.any(Error)); //
      expect(window.alert).toHaveBeenCalledWith('Ocurrió un error al cargar algunos datos del dashboard. Revisa la consola para más detalles.'); //
      expect(component.isLoading).toBeFalse(); //
    }));
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from userAttributesSubscription', () => { //
      component.ngOnInit();
      const userAttributesSub = (component as any).userAttributesSubscription as Subscription;
      spyOn(userAttributesSub, 'unsubscribe'); //

      component.ngOnDestroy(); //
      expect(userAttributesSub.unsubscribe).toHaveBeenCalled(); //
    });
  });

  describe('prepareChartData', () => {
    it('should populate pieChartData correctly when estadoCounts has data', () => { //
      component.estadoCounts = [ //
        { estado: 'asignado', cantidad: 30, porcentaje: 30 },
        { estado: 'prestado', cantidad: 20, porcentaje: 20 },
        { estado: 'bodega', cantidad: 50, porcentaje: 50 },
      ];
      (component as any).prepareChartData(); //

      expect(component.pieChartData.labels).toEqual(['Asignado', 'Prestado', 'Bodega']); //
      expect(component.pieChartData.datasets![0].data).toEqual([30, 20, 50]); //
      
      expect((component.pieChartData.datasets![0].backgroundColor as string[]).length).toBe(3); //
      expect((component.pieChartData.datasets![0].borderColor as string[]).length).toBe(3); //

      expect((component.pieChartData.datasets![0].backgroundColor as string[])[0]).toBe('rgba(40, 167, 69, 0.7)'); // Asignado
      expect((component.pieChartData.datasets![0].backgroundColor as string[])[1]).toBe('rgba(255, 193, 7, 0.7)'); // Prestado
      expect((component.pieChartData.datasets![0].backgroundColor as string[])[2]).toBe('rgba(0, 123, 255, 0.7)'); // Bodega
    });

    it('should use default color for unknown states', () => { //
      component.estadoCounts = [
        { estado: 'desconocido', cantidad: 10, porcentaje: 10 },
      ];
      spyOn(console, 'warn');
      (component as any).prepareChartData(); //

      expect(component.pieChartData.labels).toEqual(['Desconocido']); //
      expect(component.pieChartData.datasets![0].data).toEqual([10]); //
      expect((component.pieChartData.datasets![0].backgroundColor as string[])[0]).toBe('rgba(200, 200, 200, 0.7)'); // Default color
      expect(console.warn).toHaveBeenCalledWith('Color no definido para el estado: desconocido. Usando color por defecto.'); //
    });

    it('should reset pieChartData when estadoCounts is empty', () => { //
      component.estadoCounts = []; //
      component.pieChartData.labels = ['Old Label'];
      if (!component.pieChartData.datasets[0].data) {
        component.pieChartData.datasets[0].data = [];
      }
      component.pieChartData.datasets[0].data.push(100);

      (component as any).prepareChartData(); //

      expect(component.pieChartData.labels).toEqual([]); //
      expect(component.pieChartData.datasets[0].data).toEqual([]); //
      expect(component.pieChartData.datasets[0].backgroundColor).toEqual([]); //
      expect(component.pieChartData.datasets[0].borderColor).toEqual([]); //
    });
  });

  describe('formatDate', () => {
    it('should format a valid date string from YYYY-MM-DD to DD/MM/YYYY', () => { //
      expect(component.formatDate('2025-06-29')).toBe('29/06/2025'); //
    });

    it('should return an empty string for null or empty input', () => { //
      expect(component.formatDate('')).toBe(''); //
      expect(component.formatDate(null as any)).toBe(''); //
    });

    it('should handle single-digit day and month correctly', () => { //
      expect(component.formatDate('2023-01-05')).toBe('05/01/2023'); //
    });
  });
});