import {RouterModule, Routes} from '@angular/router';
import {ImportDataComponent} from './import-data-component/import-data-component';
import {NgModule} from '@angular/core';

const routes: Routes = [
  {
    path: 'import',
    component: ImportDataComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
