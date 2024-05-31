import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatboxLoungeCheckinAssistantComponent } from './chatbox-loungeCheckin-assistant.component';

describe('ChatboxLoungeCheckinAssistantComponent', () => {
  let component: ChatboxLoungeCheckinAssistantComponent;
  let fixture: ComponentFixture<ChatboxLoungeCheckinAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatboxLoungeCheckinAssistantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatboxLoungeCheckinAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
