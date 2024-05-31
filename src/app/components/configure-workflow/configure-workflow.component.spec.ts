import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureWorkflowComponent } from './configure-workflow.component';

describe('ConfigureWorkflowComponent', () => {
  let component: ConfigureWorkflowComponent;
  let fixture: ComponentFixture<ConfigureWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
