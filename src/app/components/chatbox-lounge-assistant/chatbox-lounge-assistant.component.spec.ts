import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxLoungeAssistantComponent } from './chatbox-lounge-assistant.component';

describe('ChatboxLoungeAssistantComponent', () => {
  let component: ChatboxLoungeAssistantComponent;
  let fixture: ComponentFixture<ChatboxLoungeAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatboxLoungeAssistantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatboxLoungeAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
