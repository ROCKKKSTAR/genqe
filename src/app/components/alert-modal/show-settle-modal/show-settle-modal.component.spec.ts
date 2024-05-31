import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowSettleModalComponent } from './show-settle-modal.component';

describe('ShowSettleModalComponent', () => {
  let component: ShowSettleModalComponent;
  let fixture: ComponentFixture<ShowSettleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowSettleModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowSettleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
