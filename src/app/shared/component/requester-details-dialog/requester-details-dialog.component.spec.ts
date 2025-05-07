import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesterDetailsDialogComponent } from './requester-details-dialog.component';

describe('RequesterDetailsDialogComponent', () => {
  let component: RequesterDetailsDialogComponent;
  let fixture: ComponentFixture<RequesterDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesterDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesterDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
