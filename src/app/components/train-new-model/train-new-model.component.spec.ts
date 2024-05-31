import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainNewModelComponent } from './train-new-model.component';

describe('TrainNewModelComponent', () => {
  let component: TrainNewModelComponent;
  let fixture: ComponentFixture<TrainNewModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainNewModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainNewModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
