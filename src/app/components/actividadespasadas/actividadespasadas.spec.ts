import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Actividadespasadas } from './actividadespasadas';

describe('Actividadespasadas', () => {
  let component: Actividadespasadas;
  let fixture: ComponentFixture<Actividadespasadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Actividadespasadas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Actividadespasadas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
