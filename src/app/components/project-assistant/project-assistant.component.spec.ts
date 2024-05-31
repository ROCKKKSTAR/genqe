import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAssistantComponent } from './project-assistant.component';

describe('ProjectAssistantComponent', () => {
  let component: ProjectAssistantComponent;
  let fixture: ComponentFixture<ProjectAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectAssistantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
