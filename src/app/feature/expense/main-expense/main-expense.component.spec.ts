import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainExpenseComponent } from './main-expense.component';

describe('MainExpenseComponent', () => {
  let component: MainExpenseComponent;
  let fixture: ComponentFixture<MainExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainExpenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
