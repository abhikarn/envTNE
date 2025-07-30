import { TestBed } from '@angular/core/testing';

import { DistanceFinderService } from './distance-finder.service';

describe('DistanceFinderService', () => {
  let service: DistanceFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DistanceFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
