import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptTemplatesComponent } from './prompt-templates.component';

describe('PromptTemplatesComponent', () => {
  let component: PromptTemplatesComponent;
  let fixture: ComponentFixture<PromptTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
