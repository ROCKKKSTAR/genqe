import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileImportExportComponent } from './file-import-export.component';

describe('FileImportExportComponent', () => {
  let component: FileImportExportComponent;
  let fixture: ComponentFixture<FileImportExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileImportExportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileImportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
