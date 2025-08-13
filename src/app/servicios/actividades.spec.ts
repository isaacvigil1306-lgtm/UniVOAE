import { TestBed } from '@angular/core/testing';

import { ActividadesService } from './actividades';

describe('Actividades', () => {
  let service: ActividadesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActividadesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
