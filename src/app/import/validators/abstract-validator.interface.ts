import { Observable, Subject } from 'rxjs';
import { DataValidatorFn, TemplateDownloadFn } from './validator.functions';
import { InjectionToken } from '@angular/core';
import { IResponse } from 'src/app/models/server-data-source.model';

export interface ICell {
  rowIndex: number;
  colIndex: number;
  col?: IColumn;
}
export interface IValidationError {
  status?: number;
  message?: string;
  check?: string;
}

export type ICheckData = (value: any) => IValidationError | null;

export interface IColumn {
  column?: string;
  status?: boolean;
  key?: string;
  value?: any;
  inValues?: Array<{ match: string, display: string, index: string }>;
  canIgnore?: boolean;
  doInclude?: boolean;
  validations?: DataValidatorFn[];
  errors?: Observable<IValidationError>;
  allErrors?: Array<Observable<IValidationError>>;
  color?: string; // for showing color of symbol when results on UI
  messages?: string[]; // for summary of errors in all columns
  fileColIndex?: number;
  checkDuplicates?: boolean;
  valueStore?: string[];
}

export const IMPORT_VALIDATOR = new InjectionToken<AbstractValidator<any>>('Import Validator');


export abstract class AbstractValidator<T> {
  // tslint:disable-next-line:variable-name
  public title: string;
  public closeTitle: string;
  public uploadTitle: string;
  public showTableForKey: string;
  public templateInstruction: string;
  public templateDownLoadFn: TemplateDownloadFn;
  public eachValue: Subject<T>;
  public doRefresh: boolean;
  // tslint:disable-next-line:variable-name
  public _header: Map<string, IColumn>;
  public saveResponse: Subject<IResponse>;
  public templateURL: string;
  public templateName: string;
  public downLoadedName: string;
  public fileSubject: Subject<File>;
  public allRows: Subject<Array<T>>;
  screenName: any;
  importType: string;
  protected constructor(a: T) {
  }
  public validateColumn(c: IColumn): Array<Observable<IValidationError>> {
    return c.validations.map((fn) => fn(c));
  }
  public checkHeaders(cols: Array<string>): Array<IColumn> | IValidationError {
    // cols sent has file columns. and our map has keys with a potential match.
    // so setup the colFileIndex to value that matches the col.name
    // if no match is found in the map, then those cols will be unmapped.
    // if (cols.length < this._header.size) {
    //   return {status: 0, message: 'File does not have all the required columns'};
    // } else if (cols.length > this._header.size) {
    //   return {status: 0, message: 'File has more columns than required for import'};
    // } else {
    this._header.forEach(v => {
      v.fileColIndex = -1;
      if (v.checkDuplicates) {
        v.valueStore = new Array<string>();
      }
      v.doInclude = true;
      // v.doInclude = !v.canIgnore;
    });
    cols.forEach((c, index) => {
      const mapCol = this._header.get(c);
      if (mapCol) {
        mapCol.fileColIndex = index;
        mapCol.doInclude = true;
      }
    });
    const colList = Array.from(this._header.values());
    return colList;
  }

  public getColumns(): Array<IColumn> {
    return Array.from(this._header.values());
  }
  public _colCheck(col: string): IColumn {
    const val = this._header.get(col);
    if (val) {
      val.status = true;
      return val;
    }
    return null;
  }
}

