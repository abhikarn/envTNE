import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseFinanceComponent } from './base-finance.component';

describe('BaseFinanceComponent', () => {
  let component: BaseFinanceComponent;
  let fixture: ComponentFixture<BaseFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseFinanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
