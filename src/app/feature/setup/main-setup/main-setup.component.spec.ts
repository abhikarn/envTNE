import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSetupComponent } from './main-setup.component';

describe('MainSetupComponent', () => {
  let component: MainSetupComponent;
  let fixture: ComponentFixture<MainSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
