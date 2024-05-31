import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeAndAssignmentsComponent } from './intake-and-assignments.component';

describe('IntakeAndAssignmentsComponent', () => {
  let component: IntakeAndAssignmentsComponent;
  let fixture: ComponentFixture<IntakeAndAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntakeAndAssignmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntakeAndAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
