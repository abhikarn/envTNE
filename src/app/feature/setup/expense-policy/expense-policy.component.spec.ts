import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePolicyComponent } from './expense-policy.component';

describe('ExpensePolicyComponent', () => {
  let component: ExpensePolicyComponent;
  let fixture: ComponentFixture<ExpensePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensePolicyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpensePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
