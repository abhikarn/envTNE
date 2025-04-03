import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateExtensionComponent } from './date-extension.component';

describe('DateExtensionComponent', () => {
  let component: DateExtensionComponent;
  let fixture: ComponentFixture<DateExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateExtensionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
