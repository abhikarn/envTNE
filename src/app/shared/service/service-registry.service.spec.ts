import { TestBed } from '@angular/core/testing';

import { ServiceRegistryService } from './service-registry.service';

describe('ServiceRegistryService', () => {
  let service: ServiceRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
