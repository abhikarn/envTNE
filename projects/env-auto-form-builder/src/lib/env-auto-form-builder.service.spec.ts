import { TestBed } from '@angular/core/testing';

import { EnvAutoFormBuilderService } from './env-auto-form-builder.service';

describe('EnvAutoFormBuilderService', () => {
  let service: EnvAutoFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvAutoFormBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
