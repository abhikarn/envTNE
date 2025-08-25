import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkApproveModalComponent } from './bulk-approve-modal.component';

describe('BulkApproveModalComponent', () => {
  let component: BulkApproveModalComponent;
  let fixture: ComponentFixture<BulkApproveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkApproveModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkApproveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
