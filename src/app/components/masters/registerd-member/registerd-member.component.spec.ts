import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterdMemberComponent } from './registerd-member.component';

describe('RegisterdMemberComponent', () => {
  let component: RegisterdMemberComponent;
  let fixture: ComponentFixture<RegisterdMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterdMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterdMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
