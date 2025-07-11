// cognito.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { OidcSecurityService, UserDataResult, ConfigUserDataResult } from 'angular-auth-oidc-client';
import { of, throwError } from 'rxjs';
import { CognitoService } from './cognito.service';

describe('CognitoService', () => {
  let service: CognitoService;
  let oidcSecurityServiceSpy: jasmine.SpyObj<OidcSecurityService>;

  beforeEach(() => {
    
    oidcSecurityServiceSpy = jasmine.createSpyObj('OidcSecurityService', ['']); 

    TestBed.configureTestingModule({
      providers: [
        CognitoService,
        { provide: OidcSecurityService, useValue: oidcSecurityServiceSpy }
      ]
    });
    service = TestBed.inject(CognitoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserAttributes', () => {
    it('should return user attributes when userData is available', (done) => {
      const actualUserData = {
        sub: '123',
        email: 'test@example.com',
        name: 'Test User'
      };

      const mockConfigUserDataResult: ConfigUserDataResult = {
        configId: 'default',
        userData: actualUserData,
      };

      const mockUserDataResult: UserDataResult = {
        userData: actualUserData,
        allUserData: [mockConfigUserDataResult],
      };

     
      Object.defineProperty(oidcSecurityServiceSpy, 'userData$', { value: of(mockUserDataResult) });

      service.getUserAttributes().subscribe(attributes => {
        expect(attributes).toEqual(actualUserData);
        done();
      });
    });

    it('should return null when userData is not available', (done) => {
      const mockUserDataResult: UserDataResult = {
        userData: null,
        allUserData: [],
      };

    
      Object.defineProperty(oidcSecurityServiceSpy, 'userData$', { value: of(mockUserDataResult) });

      service.getUserAttributes().subscribe(attributes => {
        expect(attributes).toBeNull();
        done();
      });
    });

    it('should return null and log error when userData$ emits an error', (done) => {
      const errorMessage = 'Error fetching user data';

      
      Object.defineProperty(oidcSecurityServiceSpy, 'userData$', { value: throwError(() => new Error(errorMessage)) });
      spyOn(console, 'error'); 

      service.getUserAttributes().subscribe(attributes => {
        expect(attributes).toBeNull();
        expect(console.error).toHaveBeenCalledWith('Error al obtener atributos del usuario desde oidcSecurityService:', jasmine.any(Error));
        done();
      });
    });
  });
});