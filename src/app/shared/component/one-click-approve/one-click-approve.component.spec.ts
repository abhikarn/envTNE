import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneClickApproveComponent } from './one-click-approve.component';

describe('OneClickApproveComponent', () => {
  let component: OneClickApproveComponent;
  let fixture: ComponentFixture<OneClickApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneClickApproveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneClickApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
