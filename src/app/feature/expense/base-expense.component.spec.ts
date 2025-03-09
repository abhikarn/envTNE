import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseExpenseComponent } from './base-expense.component';

describe('BaseExpenseComponent', () => {
  let component: BaseExpenseComponent;
  let fixture: ComponentFixture<BaseExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
