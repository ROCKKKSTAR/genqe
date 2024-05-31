import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatassistantLoungeComponent } from './chatassistant-lounge.component';

describe('ChatassistantLoungeComponent', () => {
  let component: ChatassistantLoungeComponent;
  let fixture: ComponentFixture<ChatassistantLoungeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatassistantLoungeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatassistantLoungeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
