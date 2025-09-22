import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseMasterComponent } from './base-master.component';

describe('BaseMasterComponent', () => {
  let component: BaseMasterComponent;
  let fixture: ComponentFixture<BaseMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
