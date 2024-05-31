import { Pipe, PipeTransform } from '@angular/core';
import {IColumn} from './validators/abstract-validator.interface';

@Pipe({
  name: 'columnFilter'
})
export class ColumnFilterPipe implements PipeTransform {

  transform(cols: IColumn[]): IColumn[] {
    return cols.filter((c) => c.doInclude);
  }

}
