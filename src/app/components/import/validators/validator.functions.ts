import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {IColumn, IValidationError} from './abstract-validator.interface';

export type DataValidatorFn = (col: IColumn) => Observable<IValidationError>;
export type TemplateDownloadFn = () => void;

export declare interface CheckExistence {
  doesExist(value: string): Observable<boolean>;
}

export function DataValidatorEMail(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(col.value)) {
      return of({check: 'ValidEmail', status: 1, message: 'valid mail'});
    } else {
      return of({check: 'ValidEmail', status: 0, message: 'Not a valid mail id'});
    }
  };
}

export function DataValidatorNumber(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (!isNaN(col.value) && isFinite(col.value)) {
      return of({check: 'ValidNumber', status: 1, message: 'valid number'});
    } else {
      return of({check: 'ValidNumber', status: 0, message: 'Not a valid number'});
    }
  };
}

export function DataValidatorRequired(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value === '' || col.value === null || col.value === undefined) {
      return of({check: 'ValueRequired', status: 0, message: `${col.key} can not be blank`});
    } else {
      return of({check: 'ValueRequired', status: 1, message: 'pass'});
    }
  };
}

export function DataValidatorForGrades(s?: string[]): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value === '' || col.value === null || col.value === undefined) {
      return of({check: 'ValueRequired', status: 0, message: `${col.key} can not be blank`});
    } else {
      return of({check: 'ValueRequired', status: 1, message: 'pass'});
    }
  };
}

export function DataValidatorRequiredForGender(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (['FEMALE', 'F', 'GIRL', 'MALE', 'M', 'BOY'].includes(col.value.toUpperCase())) {
      return of({check: 'ValueRequired', status: 1, message: 'Valid'});
    } else {
      return of({check: 'ValueRequired', status: 0, message: `${col.key} Invalid`});
    }
  };
}

export function DataValidatorShouldNotExist(check: CheckExistence): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    return check.doesExist(col.value).pipe(map(r => {
      return r ? {check: 'ShouldNotExist', status: 0, message: 'already exists'}
        : {check: 'ShouldNotExist', status: 1, message: 'pass'};
    }));
  };
}

export function DataValidatorShouldExist(check: CheckExistence): DataValidatorFn {
  console.log('Checking validation using http API');
  return (col: IColumn): Observable<IValidationError> => {
    return check.doesExist(col.value).pipe(map(r => {
      return r ? {check: 'ShouldNotExist', status: 1, message: 'pass'}
        : {check: 'ShouldNotExist', status: 0, message: 'Does not Exists'};
    }));
  };
}

export function DataValidatorValueInList(masterValues: string[]): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (masterValues.includes((col.value as string).toLowerCase())) {
      return of({check: 'ValueInList', status: 1, message: 'pass'});
    } else {
      return of({check: 'ValueInList', status: 0, message: `Value not in ${masterValues}`});
    }
  };
}

export function DataValidatorForAbbre(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value === '' || col.value === null || col.value === undefined) {
      return of({check: 'ValueRequired', status: 0, message: `${col.key} can not be blank`});
    }
    if (col.value.length > 3 || col.value.length < 3) {
      return of({check: 'ValueRequired', status: 2, message: 'Abbreviation length should be Max or Min 3 Characters.'});
    }
    if (col.value.length === 3){
      return of({check: 'ValueRequired', status: 1, message: 'Pass'});
    }
  };
}

export function DataValidatorForAssess(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value === '' || col.value === null || col.value === undefined) {
      return of({check: 'ValueRequired', status: 0, message: `${col.key} can not be blank`});
    }
    if (col.value.length > 4 || col.value.length < 4) {
      return of({check: 'ValueRequired', status: 2, message: 'Abbreviation length should be Max or Min 4 Characters.'});
    }
    if (col.value.length === 3){
      return of({check: 'ValueRequired', status: 1, message: 'Pass'});
    }
  };
}
export function DataValidatorInValues(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value) {
      if (col.inValues.findIndex((value) => {
        return value.match === col.value;
      }) >= 0) {
        return of({check: 'ValueInList', status: 1, message: 'Pass'});
      } else {
        return of({check: 'ValueInList', status: 0, message: 'Value should be one from the list'});
      }
    } else {
      return of({check: 'ValueInList', status: 0, message: 'Value can not be blank'});
    }
  };
}
export function DataValidatorDuplicateValues(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    if (col.value) {
      if (col.valueStore.includes(col.value)) {
        return of({check: 'duplicateValues', status: 0, message: 'already exists in column'});
      } else {
        col.valueStore.push(col.value);
        return of({check: 'ValueInList', status: 1, message: 'Pass'});
      }
    } else {
      return of({check: 'duplicateValues', status: 0, message: 'Value is required'});
    }
  };
}

export function DataValidatorDate(): DataValidatorFn {
  return (col: IColumn): Observable<IValidationError> => {
    const date = new Date(col.value);
    if (date instanceof Date && !isNaN(date.valueOf())) {
      return of({check: 'ValidDate', status: 1, message: 'Valid Date'});
    } else {
      return of({check: 'InvalidDate', status: 0, message: `${col.key} is not a valid Date`});
    }
  };
}
