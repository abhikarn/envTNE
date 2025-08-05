import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissingFieldsPopupComponent } from './missing-fields-popup.component';

describe('MissingFieldsPopupComponent', () => {
  let component: MissingFieldsPopupComponent;
  let fixture: ComponentFixture<MissingFieldsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissingFieldsPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissingFieldsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
