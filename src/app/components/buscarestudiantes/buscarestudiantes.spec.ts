import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buscarestudiantes } from './buscarestudiantes';

describe('Buscarestudiantes', () => {
  let component: Buscarestudiantes;
  let fixture: ComponentFixture<Buscarestudiantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buscarestudiantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buscarestudiantes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
