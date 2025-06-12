import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileProfileComponent } from './mobile-profile.component';

describe('MobileProfileComponent', () => {
  let component: MobileProfileComponent;
  let fixture: ComponentFixture<MobileProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
