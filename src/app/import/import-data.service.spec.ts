import { TestBed } from '@angular/core/testing';

import { ImportDataService } from './import-data.service';

describe('ImportDataService', () => {
  let service: ImportDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
