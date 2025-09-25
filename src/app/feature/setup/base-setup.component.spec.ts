import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSetupComponent } from './base-setup.component';

describe('BaseSetupComponent', () => {
  let component: BaseSetupComponent;
  let fixture: ComponentFixture<BaseSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
