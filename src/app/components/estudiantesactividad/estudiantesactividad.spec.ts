import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiantesActividad } from './estudiantesactividad';

describe('Estudiantesactividad', () => {
  let component: EstudiantesActividad;
  let fixture: ComponentFixture<EstudiantesActividad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiantesActividad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudiantesActividad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
