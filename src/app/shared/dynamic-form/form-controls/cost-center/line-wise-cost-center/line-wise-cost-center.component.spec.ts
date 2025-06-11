import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineWiseCostCenterComponent } from './line-wise-cost-center.component';

describe('LineWiseCostCenterComponent', () => {
  let component: LineWiseCostCenterComponent;
  let fixture: ComponentFixture<LineWiseCostCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineWiseCostCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineWiseCostCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
