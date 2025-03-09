import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvAutoFormBuilderComponent } from './env-auto-form-builder.component';

describe('EnvAutoFormBuilderComponent', () => {
  let component: EnvAutoFormBuilderComponent;
  let fixture: ComponentFixture<EnvAutoFormBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnvAutoFormBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvAutoFormBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
