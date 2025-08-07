import { TestBed } from '@angular/core/testing';

import { FormulaEvaluatorService } from './formula-evaluator.service';

describe('FormulaEvaluatorService', () => {
  let service: FormulaEvaluatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaEvaluatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
