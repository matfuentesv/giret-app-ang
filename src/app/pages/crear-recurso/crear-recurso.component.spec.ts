import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearRecursoComponent } from './crear-recurso.component';

describe('CrearRecursoComponent', () => {
  let component: CrearRecursoComponent;
  let fixture: ComponentFixture<CrearRecursoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearRecursoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearRecursoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
