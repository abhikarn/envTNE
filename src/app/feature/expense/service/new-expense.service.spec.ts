import { TestBed } from '@angular/core/testing';

import { NewExpenseService } from './new-expense.service';

describe('NewExpenseService', () => {
  let service: NewExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewExpenseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
