import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletEventsComponent } from './outlet-events.component';

describe('OutletEventsComponent', () => {
  let component: OutletEventsComponent;
  let fixture: ComponentFixture<OutletEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutletEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
