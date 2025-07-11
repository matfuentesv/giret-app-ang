// auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let oidcSecurityService: OidcSecurityService;
  let router: Router;

  const mockActivatedRouteSnapshot: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
  const mockRouterStateSnapshot: RouterStateSnapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: OidcSecurityService,
          useValue: {
            isAuthenticated$: of({ isAuthenticated: true }),
          },
        },
      ],
    });

    oidcSecurityService = TestBed.inject(OidcSecurityService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should allow activation when authenticated', (done) => {
    (oidcSecurityService.isAuthenticated$ as any) = of({ isAuthenticated: true });

    TestBed.runInInjectionContext(() => {
      // Pass the mock arguments to AuthGuard
      const canActivate = AuthGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      if (canActivate instanceof Promise) {
        canActivate.then(result => {
          expect(result).toBeTrue();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      } else {
        (canActivate as any).subscribe((result: boolean) => {
          expect(result).toBeTrue();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        });
      }
    });
  });

  it('should redirect to home and prevent activation when not authenticated', (done) => {
    (oidcSecurityService.isAuthenticated$ as any) = of({ isAuthenticated: false });

    TestBed.runInInjectionContext(() => {
      // Pass the mock arguments to AuthGuard
      const canActivate = AuthGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      if (canActivate instanceof Promise) {
        canActivate.then(result => {
          expect(result).toBeFalse();
          expect(router.navigate).toHaveBeenCalledWith(['/']);
          done();
        });
      } else {
        (canActivate as any).subscribe((result: boolean) => {
          expect(result).toBeFalse();
          expect(router.navigate).toHaveBeenCalledWith(['/']);
          done();
        });
      }
    });
  });
});