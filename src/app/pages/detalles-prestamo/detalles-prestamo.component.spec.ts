import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesPrestamoComponent } from './detalles-prestamo.component';

describe('DetallesPrestamoComponent', () => {
  let component: DetallesPrestamoComponent;
  let fixture: ComponentFixture<DetallesPrestamoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesPrestamoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesPrestamoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
