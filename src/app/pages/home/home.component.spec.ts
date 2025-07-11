import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, of, Subject } from 'rxjs';
import { NgIf } from '@angular/common';

// DEFINICIONES DE INTERFACES SIMPLIFICADAS PARA EL MOCK
interface OpenIdConfiguration {
  configId: string;
}

interface UserData {
  sub?: string;
  name?: string;
}

interface LogoffResponse {
  url: string;
  is: boolean;
}

// Mock OidcSecurityService
class MockOidcSecurityService {
  // Mantén el Subject para que puedas emitir valores de prueba
  private _configurationSubject = new Subject<OpenIdConfiguration>();
  public userData$ = new Subject<UserData>();

  // Implementa el método getConfiguration()
  // Retorna el observable del Subject para que el componente pueda suscribirse
  getConfiguration(): Observable<OpenIdConfiguration> {
    return this._configurationSubject.asObservable();
  }

  // Método para controlar las emisiones de configuración en las pruebas
  // Usarás esto en tus tests para enviar datos al observable configuration$
  emitConfiguration(config: OpenIdConfiguration) {
    this._configurationSubject.next(config);
  }


  authorize = jasmine.createSpy('authorize');
  logoff = jasmine.createSpy('logoff').and.returnValue(of({ url: 'logged_out_url', is: true } as LogoffResponse));

  checkAuth() {
    return of({ isAuthenticated: false, configId: 'default', userData: null, idToken: null, accessToken: null, decodedIdToken: null });
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let oidcSecurityService: MockOidcSecurityService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, NgIf],
      providers: [
        { provide: OidcSecurityService, useClass: MockOidcSecurityService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    oidcSecurityService = TestBed.inject(OidcSecurityService) as unknown as MockOidcSecurityService;
    fixture.detectChanges(); // Esto llamará a ngOnInit y asignará configuration$
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize configuration$ and userData$ observables', () => {
    expect(component.configuration$).toBeTruthy();
    expect(component.userData$).toBeTruthy();

    const mockConfig: OpenIdConfiguration = { configId: 'test-config' };
    const mockUserData: UserData = { sub: '123', name: 'Test User' };

    // Ahora usas el método emitConfiguration de tu mock
    oidcSecurityService.emitConfiguration(mockConfig);
    oidcSecurityService.userData$.next(mockUserData);

    // Puedes agregar una aserción para verificar que el observable en el componente recibió el valor
    component.configuration$.subscribe(config => {
        expect(config).toEqual(mockConfig);
    });
  });

  describe('login', () => {
    it('should call oidcSecurityService.authorize when login is called', () => {
      component.login();
      expect(oidcSecurityService.authorize).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call oidcSecurityService.logoff when logout is called', () => {
      const mockLogoffResult: LogoffResponse = { url: 'http://localhost/loggedout', is: true };
      oidcSecurityService.logoff.and.returnValue(of(mockLogoffResult));
      spyOn(console, 'log');

      component.logout();
      expect(oidcSecurityService.logoff).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Logged out', mockLogoffResult);
    });
  });
});