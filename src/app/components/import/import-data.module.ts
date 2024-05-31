import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ImportDataComponent} from './import-data-component/import-data-component';
import {ImportDataService} from './import-data.service';
import {MatSelectModule} from '@angular/material/select';
import {FlexModule} from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SharedModule } from 'src/app/modules/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {ColumnFilterPipe} from './column-filter.pipe';
import {MatCheckboxModule} from '@angular/material/checkbox';



@NgModule({
  declarations: [ImportDataComponent, ColumnFilterPipe],
  imports: [
    CommonModule,
    MatSelectModule,
    FlexModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    FormsModule
  ],
  exports:[ImportDataComponent],
  providers: [ImportDataService]
})
export class ImportDataModule { }
