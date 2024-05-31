import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginFingerprintComponent } from './login-fingerprint.component';

describe('LoginFingerprintComponent', () => {
  let component: LoginFingerprintComponent;
  let fixture: ComponentFixture<LoginFingerprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginFingerprintComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFingerprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
