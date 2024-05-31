import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';


import { HttpService } from '../shared/httpService';
import { UserRolePermission } from '../shared/apiRoute.constants';
import { CachcingServiceBase } from "./caching.service";


@Injectable({
  providedIn: 'root'
})
export class  UserDataService extends CachcingServiceBase {

  public constructor( private httpservice: HttpService) {
    super();
  }

  getAllUser(): Observable<any> {
    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.GetUsers, {});
  }
  getUserDecode(data): Observable<any> {
    return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.getUserByLogin, data);
  }

  updateUser(data): Observable<any> {
    return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.updateUser, data);
  }

}
