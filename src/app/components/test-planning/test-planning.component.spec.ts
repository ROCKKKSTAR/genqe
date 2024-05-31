import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestPlanningComponent } from './test-planning.component';

describe('TestPlanningComponent', () => {
  let component: TestPlanningComponent;
  let fixture: ComponentFixture<TestPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestPlanningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
