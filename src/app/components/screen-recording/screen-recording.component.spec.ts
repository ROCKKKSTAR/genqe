import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenRecordingComponent } from './screen-recording.component';

describe('ScreenRecordingComponent', () => {
  let component: ScreenRecordingComponent;
  let fixture: ComponentFixture<ScreenRecordingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScreenRecordingComponent]
    });
    fixture = TestBed.createComponent(ScreenRecordingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
