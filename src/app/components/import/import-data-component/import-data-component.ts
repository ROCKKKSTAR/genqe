import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input, OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { AbstractValidator, ICell, IColumn, IValidationError } from '../validators/abstract-validator.interface';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { ImportDataService } from '../import-data.service';
import { ToastrService } from 'ngx-toastr';
import { first, map, min, take } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { takeWhile } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { IResponse } from 'src/app/models/server-data-source.model';
import { ActivatedRoute, Router } from '@angular/router';
interface IFileReadStatus {
  error: boolean;
  message: string;
}
interface IRows {
  countGood: number;
  countBad: number;
  messages?: string[];
  saved: Subject<boolean>;
  data?: [{
    saveStatus?: number; // 2 unsaved, 1 successfully saved, 0 failed to save
    saveMessage?: string;
    tJSON?: any;
    filedata?: any[];
    filelength?: any;
    indexNo?: any;
    importID?: string;
  }];
}

interface ISummaryError {
  flag: boolean; // true for error, false for good
  message: string;
}

interface ITableCell {
  cell?: ICell;
  fControl?: FormControl;
  errSummary: BehaviorSubject<ISummaryError>;
}

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data-component.html',
  styleUrls: ['./import-data-component.css']
})
export class ImportDataComponent implements OnInit, OnDestroy {
  @ViewChildren(MatSelect) colSelectors: QueryList<MatSelect>;
  @Input() validator: AbstractValidator<any>;
  @Input() close = true;
  @ViewChild('preview', { read: ElementRef }) previewDiv: ElementRef;
  @Output() importClose = new EventEmitter<boolean>();
  public title$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public stepTitle$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public screenName$: String = '';
  public fileSize: number;
  public dataRows;
  public doRead$: Subject<File> = new Subject();
  public doImport$: Subject<File> = new Subject();
  public doneReading: boolean;
  public readError: boolean;
  public partnerCheck: Subject<any> = new Subject();
  public rowsToSave: IRows = {
    countGood: 0,
    countBad: 0,
    messages: [],
    saved: new Subject<boolean>(),
    data: [{ saveStatus: 0, saveMessage: '', tJSON: {} }],


  };
  public doReadHeaders$ = new Subject();
  public headerCheck: IColumn[];
  public columns$: BehaviorSubject<IColumn[]> = new BehaviorSubject<IColumn[]>([]);
  public fileColumns: string[];
  public fileName$: BehaviorSubject<any> = new BehaviorSubject<any>({ name: '', changed: false });
  public head: any; // temp holder for header row.
  public formGrid1: Map<number, ITableCell> = new Map<number, ITableCell>();
  public doneValidation$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public fileChanged = false;
  public hasValidationError = false;
  public inData: AbstractValidator<any>;
  public fileReadStatus$: BehaviorSubject<IFileReadStatus> = new BehaviorSubject<IFileReadStatus>({ error: false, message: '' });
  public rowsReadStatus$: BehaviorSubject<IFileReadStatus> = new BehaviorSubject<IFileReadStatus>({ error: false, message: '' });
  public step = 'step1';
  public fileType = '';
  public uploadSelectedFiles = [];
  public hasInputError: boolean;
  public showError: boolean = false;
  public importerrors: any[] = [];
  @Input() showNavBar = true;
  @Input() showLeftMenu = true;
  arrayBuffer: any;
  headers = [];
  filelist: any[];
  public data: ILanguage;
  public loadershow: boolean;
  public loadingMessage = '';
  public langaugeSubscription: Subscription = null;
  public importID = '';
  public startDate = '';
  public endDate = '';
  public admissionId = '';
  public batchSize = 100;
  constructor(
    private ts: ToastrService,
    private cs: CommonServiceService,
    private WS: WebService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router) {
    this.hasInputError = false;
    this.fileSize = 200;
    this.readError = false;
    this.doneReading = false;
  }

  ngOnInit(): void {
    this.langaugeSubscription = this.cs._language.subscribe(lang => {
      this.changeLanguage(lang);
    });

    if (this.validator) {
      this.inData = this.validator;
      if (this.inData && this.inData.saveResponse) {
        this.title$.next(`${this.inData.title}`);
        this.inData.uploadTitle = this.inData.uploadTitle ?? 'Upload';
        this.inData.saveResponse.pipe(map((r, i) => {

          if (i < this.rowsToSave.data.length) {
            this.rowsToSave.data[i].saveStatus = r.status;
            return r;
          } else {
            return null;
          }
        })).subscribe((res) => {
          res.result.forEach(a => {
            if (a && a.status === 1) {
              if (a.result.tokenId) {
                this.admissionId = a.result.tokenId;
                if (this.startDate === '' && this.endDate === '') {
                  this.startDate = a.result.startDate;
                  this.endDate = a.result.endDate;
                } else {
                  const compStart = this.cs.calculateDayDiff(
                    this.startDate,
                    a.result.startDate
                  );
                  const compEnd = this.cs.calculateDayDiff(
                    this.endDate,
                    a.result.endDate
                  );
                  if (compStart < 0) this.startDate = a.result.startDate;
                  if (compEnd > 0) this.endDate = a.result.endDate;
                }
              }

              if (this.screenName$ !== '') {
                this.rowsToSave.countGood = a.success;
                this.rowsToSave.countBad = a.failure;
              } else {
                this.rowsToSave.countGood++;
              }

            } else if (a) {

              if (this.screenName$ !== '') {
                this.rowsToSave.countGood = a.success;
                this.rowsToSave.countBad = a.failure;
              } else {
                this.rowsToSave.countBad++;
                this.importerrors.push(`Error Importing Row:${a.result.rowNo} in ColumnNo${a.result.columnNo}, ${a.result.columnData}`)
                // this.rowsToSave.messages.push(res.description);
              }

            }
            if (this.rowsToSave.countBad + this.rowsToSave.countGood === this.rowsToSave.data.length) {
              if (this.admissionId !== '') {
                this.WS.post('api/master/admissionToken/import/voucher/log', {
                  admissionId: this.admissionId,
                  startDate: this.startDate,
                  refBIN: a.result.tokenContains,
                  endDate: this.endDate,
                  count: a.result.elasticIds,
                  success: this.rowsToSave.countGood
                }).subscribe((r: IResponse) => {
                  this.startDate = '';
                  this.endDate = '';
                });
              }
              this.WS.post('api/master/fileImportExport/save/import', {
                id: this.importID,
                success: this.rowsToSave.countGood,
                failure: this.rowsToSave.countBad,
                tCount: this.rowsToSave.data.length,
              }).subscribe((r: IResponse) => {
              });

              this.rowsToSave.saved.next(true);
              this.loadershow = false;

            }
          });

        });
      }
    }
    this.doRead$.subscribe((f) => {

      this.doneReading = false;
      delete this.head;
      // this.inData.fileSubject?.next(f);
      const reader = new FileReader();
      if (this.fileType === 'csv') {

        reader.addEventListener('loadend', () => {

          const fileText = reader.result as string;
          this.arrayBuffer = reader.result;
          const data = new Uint8Array(this.arrayBuffer);
          const arr = new Array();
          const regEx = RegExp('[^\\n\\r-ÿ]', 'gm');
          const errorCharacters = regEx.exec(fileText);
          if (errorCharacters && errorCharacters.length) {
            const errorRow = fileText.substr(0, regEx.lastIndex).split('\n').length;
            const message = `Found unreadable character ${errorCharacters[0]} at row number ${errorRow}. Please remove it from file and upload file again`;
            // this.fileReadStatus$.next({error: true, message: 'Your file format is not recognized as CSV, please check'});
            this.fileReadStatus$.next({ error: true, message });
          }
          this.dataRows = fileText.trim().split('\n');
          if (this.dataRows.length === 0) {
            // console.log('read error');
            this.fileReadStatus$.next({ error: true, message: 'No data rows found in the file' });
          } else {
            this.doneReading = true;
            this.doReadHeaders$.next(true);
          }
        });
        reader.addEventListener('error', () => {
          this.readError = true;
          // console.log('error in reading file');
        });
        reader.readAsText(f, 'utf8');
      } else {

        reader.readAsArrayBuffer(f);
        reader.onload = (e) => {

          this.arrayBuffer = reader.result;
          const data = new Uint8Array(this.arrayBuffer);
          const arr = new Array();
          for (let i = 0; i !== data.length; i++) {
            arr[i] = String.fromCharCode(data[i]);
          }
          const bstr = arr.join('');
          const workbook = XLSX.read(bstr, { type: 'binary' });
          let first_sheet_name = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[first_sheet_name];
          //  console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
          const arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          // let arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          let C, R = range.s.r;
          // console.log(worksheet ,arraylist);
          for (C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];


            let hdr = 'UNKNOWN ' + C; // <-- replace with your desired default
            if (cell && cell.t) {
              hdr = XLSX.utils.format_cell(cell);
            }

            this.headers.push(hdr);
          }
          // console.log('headers',this.headers)
          this.dataRows = arraylist;
          if (this.dataRows.length === 0) {
            console.log('read error');
            this.fileReadStatus$.next({ error: true, message: 'No data rows found in the file' });
          } else {
            this.doneReading = true;
            this.doReadHeaders$.next(true);
          }
        };
      }
    });

    this.doReadHeaders$.subscribe(() => {

      if (this.doneReading && this.dataRows) {
        if (this.fileType === 'csv') {
          this.fileColumns = this.dataRows[0].replace(/\s+/g, ' ').trim().split(',');
        } else {
          this.fileColumns = this.headers; // this.dataRows[0].replace(/\s+/g, ' ').trim().split('|');
        }
        const result = this.inData.checkHeaders(this.fileColumns);
        if (result instanceof Array) {

          this.headerCheck = result as Array<IColumn>;
          this.columns$.next(result);
          this.doneValidation$.next(false);
          this.rowsReadStatus$.next({ error: false, message: '' });
        } else {
          const err = result as IValidationError;
          this.fileReadStatus$.next({ error: true, message: err.message });
        }
      }
    });
    this.doImport$.subscribe(() => {
      // this.uploadSelectedFiles.forEach(fi => {
      //   console.log(fi)

      // });

      this.rowsToSave.saved.next(false);
      if (this.inData.allRows) {

        this.inData.allRows.next(this.rowsToSave.data.map((d) => d.tJSON));
        this.inData.allRows.complete();
      }
      if (this.inData.eachValue) {

        if (this.screenName$ !== '') {

          this.rowsToSave.saved.next(false);
          const i = 0;
          this.rowsToSave.data.forEach((r, i) => {
            if (i === 0) {
              r.filedata = this.uploadSelectedFiles;
              r.importID = this.importID;
              this.inData.eachValue.next(r);

            }

          });
        } else if (this.fileType === 'csv') {
          let i = 1;
          this.rowsToSave.data.forEach((r,) => {
            r.filedata = this.uploadSelectedFiles;
            r.importID = this.importID;
            r.indexNo = i;
            // this.inData.eachValue.next(r);
            i = i + 1;
          });
          const chunked = this.createBatchedData(this.rowsToSave.data);
          chunked.forEach((r) => {
            this.inData.eachValue.next(r);
          });
        } else {
          let i = 1;
          this.rowsToSave.data.forEach((r) => {
            r.filedata = this.uploadSelectedFiles;
            r.filelength = this.rowsToSave.data.length;
            r.indexNo = i;
            r.importID = this.importID;
            // if (i === 1) {
            //   this.inData.eachValue.next(r);
            // } else {
            //   this.inData.saveResponse.pipe(take(1)).subscribe(res => {
            //     if (res) {
            //       this.inData.eachValue.next(r);
            //     }
            //   });
            // }
            i = i + 1;
          });
          const chunked = this.createBatchedData(this.rowsToSave.data);
          chunked.forEach((r) => {
            this.inData.eachValue.next(r);
          });
        }
        // this.inData.eachValue.complete();
      }
    });
  }

  private createBatchedData(data): Array<any> {
    const chunked = []
    for (let i = 0; i < data.length; i += this.batchSize) {
      const chunk = data.slice(i, i + this.batchSize);
      chunked.push(chunk)
    }
    return chunked;
  }

  public ngOnDestroy(): void {
    // this.partnerCheck.next();
    console.log('destroy called');
  }

  public checkErrorLogs(): void {
    this.router.navigate(['/file-import-export'], { queryParams: { id: this.importID } });
    // this.onCloseImport();
    // this.ngOnDestroy();
  }

  public showErrors(): void {
    this.showError = true;
  }
  public hideErrors(): void {
    this.showError = false;
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  public moveTo(toStep: string, file: HTMLInputElement = null): void {
    switch (toStep) {
      case 'step1':
        this.stepTitle$.next('Upload Your File');
        break;
      case 'step2':
        this.stepTitle$.next(`Verify Field Mapping`);
        if (this.step === 'step1') {

          const f = this.fileName$.getValue();
          const a = file.files[0].name.split('.');
          this.fileType = a[a.length - 1];
          this.uploadSelectedFiles = [];
          // this.uploadSelectedFiles.push(file.files[0]);
          if (f.name === '') {
            this.ts.info('No file has been selected', 'Import Alert');
            return; // show toaster and return to stay at same page
          }
          if (f.changed) { // file is selected and changed, so let us process it.

            this.fileName$.next({ name: f.name, changed: false });
            this.uploadSelectedFiles.push(file.files[0]);
            this.fileReadStatus$.next({ error: false, message: '' });
            this.doRead$.next(file.files[0]);
          }
        }
        break;
      case 'step3':
        if (this.step === 'step2') {

          const unmatchedCol = this.headerCheck.filter(hc => hc.doInclude).find((c) => c.fileColIndex < 0);
          if (unmatchedCol) {
            this.ts.info('All fields need to be mapped to columns before continuing');
            return;
          }
          this.OnStepValidateRows();
        }
        this.stepTitle$.next(`Preview Import`);
        break;
      case 'step4':
        this.stepTitle$.next(`Importing`);
        this.loadershow = true;
        this.loadingMessage = 'Importing Data.....';
        this.callToCreatePresigned(this.uploadSelectedFiles[0]);
        // this.doDataImport();
        break;
    }
    this.step = toStep;
  }
  public OnStepValidateRows(): void {

    // do this on the step only when we have not done the validations before otherwise just skip since user
    // may be doing back and forth.
    if (!this.doneValidation$.getValue()) {
      if (this.rowsToSave) {

        delete this.rowsToSave.saved;
        delete this.rowsToSave.data;
        delete this.rowsToSave;
        this.rowsToSave = {
          countGood: 0, countBad: 0, messages: [], saved: new Subject<boolean>(),
          data: [{ saveStatus: 0, saveMessage: '', tJSON: {} }]
        };
      }
      if (this.formGrid1) {
        this.formGrid1.clear();
      }
      // calculate min columns required in the row based on col map
      // this should be at least the number of unique cols that will be mapped to data
      // console.log(this.headerCheck);
      const minCols = this.headerCheck.filter((h) => h.doInclude)
        .map((hc) => hc.fileColIndex).reduce((p, c, i) => {
          c = c + 1;
          c > p ? p = c : '';
          return p;
        });
      // first setup the map of column and key. In case user changed it (?? add check if changes are done).
      this.hasValidationError = false;
      if (this.fileType === 'csv') {
        this.head = this.head ? this.head : this.dataRows.shift();
      }

      for (let rI = 0; rI < this.dataRows.length; rI++) {

        this.rowsToSave.data[rI] = { saveStatus: 2, tJSON: {} };
        let values;
        if (this.fileType === 'csv') {
          values = this.dataRows[rI].trim().split(',');
          if (values < minCols) {
            this.rowsReadStatus$.next({ error: true, message: `Row number - ${rI} has missing values, please check` });
            return;
          }
        }
        const includedCols = this.headerCheck.filter((hc) => hc.doInclude);
        for (let cI = 0; cI < includedCols.length; cI++) {
          const cell: ICell = { rowIndex: rI, colIndex: cI };
          const es = new BehaviorSubject<ISummaryError>({ flag: false, message: '' });
          cell.col = Object.assign({}, includedCols[cI]);
          if (this.fileType === 'csv') {
            cell.col.value = values[includedCols[cI].fileColIndex];
          } else {
            cell.col.value = this.dataRows[rI][cell.col.column];
          }

          this.rowsToSave.data[rI].tJSON[cell.col.key] = cell.col.value;
          const mapKey = ((rI + 1) * 1000 + cI);
          const f = new FormControl('');
          if (cell.col.inValues) {
            f.patchValue(cell.col.inValues.find(v => v.match === cell.col.value)?.display);
          } else {
            f.patchValue(cell.col.value);
          }
          this.formGrid1.set(mapKey, { cell, fControl: f, errSummary: es });
          // new FormControl(cell.col.value)
        }
      }
      this.doneValidation$.next(true);
      this.formGrid1.forEach((v, key) => {
        v.cell.col.allErrors = this.inData.validateColumn(v.cell.col);
        this.setColErrors(v.cell.col.allErrors, v.errSummary, key);
      });
    }
  }

  public doDataImport(): void {

    // get the JSON object in array and send to repository for save.
    this.doImport$.next();
  }

  private callToCreatePresigned(file: File): void {
    const nameSplits = file.name.split('.');
    this.WS.post('api/master/s3/presignedURL', {
      type: nameSplits[0],
      extension: nameSplits[nameSplits.length - 1],
      contentType: file.type,
      fileName: nameSplits[0],
    }).subscribe((res: any) => {
      this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
        (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              console.log('Request has been made!');
              break;
            case HttpEventType.ResponseHeader:
              console.log('Response header has been received!');
              break;
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              console.log(event.type);
              this.WS.post('api/master/fileImportExport/save/import', {
                path: res.result.urlInfo.key,
                type: nameSplits[0],
                fileName: file.name,
                activity: 'Import',
                extension: nameSplits[nameSplits.length - 1],
              }).subscribe((re: IResponse) => {
                if (re.status === 1) {
                  this.importID = re.result;
                  this.doDataImport();
                } else if (re.status === 2) {
                  this.toastr.info(res.description);
                } else {
                  this.toastr.error(res.description);
                }
              });
          }
        }
      );
    });
  }

  public onConfirmData(): void {

    // we need to update row.columns.value to the value typed in the formcontrols.
    // build a row again, and send to validateRow function
    this.hasValidationError = false;
    this.formGrid1.forEach((tc, key) => {
      if (tc.fControl.dirty) {
        tc.cell.col.value = tc.fControl.value;
        if (tc.cell.col.inValues) {
          tc.fControl.patchValue(tc.cell.col.inValues.find(v => v.match === tc.cell.col.value)?.display);
        }
        this.rowsToSave.data[tc.cell.rowIndex].tJSON[tc.cell.col.key] = tc.cell.col.value;
        tc.cell.col.allErrors = this.inData.validateColumn(tc.cell.col);
        this.setColErrors(tc.cell.col.allErrors, tc.errSummary, key);
      } else {
        if (tc.errSummary.getValue().flag) {
          this.hasValidationError = true;
        }
      }
    });
  }
  public setColErrors(errors: Observable<IValidationError>[], errSubject: BehaviorSubject<ISummaryError>, key: number = null): void {
    const retStatus: ISummaryError = { flag: false, message: '' };
    errors.forEach((colErr) => {
      colErr.subscribe((v) => {
        if (v.status === 0) {
          retStatus.flag = true;
          retStatus.message = v.message;
          this.hasValidationError = true;
          errSubject.next(retStatus);
        }
      });
    });
    if (!retStatus.flag) {
      errSubject.next(retStatus);
    }
  }
  public onCloseImport(): void {
    this.importClose.emit(true);
  }
  public OnChangeInclude(checked: boolean, index: number): void {
    this.doneValidation$.next(false);
  }
  public OnChangeColMap(e: MatSelectChange, index: number): void {

    // find the key that user has mapped this col to
    // and change the fileColIndex of that column to
    // the value of the selected option.
    this.headerCheck[index].fileColIndex = e.value;
    this.headerCheck[index].column = this.fileColumns[e.value];
    this.doneValidation$.next(false);  // setting this observable to false as this will require rows to be read again.
    this.rowsReadStatus$.next({ error: false, message: '' });
  }
  // tslint:disable-next-line: typedef
  public countObjectKeys(obj) {
    return Object.keys(obj).length;
  }

}
