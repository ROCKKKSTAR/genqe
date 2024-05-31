import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineCodeComponent } from './airline-code.component';

describe('AirlineCodeComponent', () => {
  let component: AirlineCodeComponent;
  let fixture: ComponentFixture<AirlineCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirlineCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirlineCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
