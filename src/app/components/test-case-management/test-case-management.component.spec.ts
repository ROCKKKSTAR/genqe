import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseManagementComponent } from './test-case-management.component';

describe('TestCaseManagementComponent', () => {
  let component: TestCaseManagementComponent;
  let fixture: ComponentFixture<TestCaseManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestCaseManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCaseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
