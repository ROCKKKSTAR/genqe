import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';


import { HttpService } from '../shared/httpService';
import { UserRolePermission } from '../shared/apiRoute.constants';
import { CachcingServiceBase } from './caching.service';


@Injectable({
  providedIn: 'root'
})
export class UserDataService extends CachcingServiceBase {

  public constructor(private httpservice: HttpService) {
    super();
  }



  getAllUser(): Observable<any> {
    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.userSync, {});
  }
  getUserDecode(data: any): Observable<any> {
    return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.getUserByLogin);
  }

  updateUser(data: any): Observable<any> {
    return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.updateUser + data);
  }

  confirmUser(data: any): Observable<any> {
    return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.confirmSignUp + data);
  }
  
  ResetPasswordUser(data: any): Observable<any> {
    const q = '?username=' + data.userName + '&password=' + data.password
    data = {
      userName: data.userName,
      password: data.password,
    };
    // return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.RegisterUser+q);
 
    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.ResetPassword, data);
  }
  RegisterUser(data: any): Observable<any> {
    const q = '?username=' + data.username + '&password=' + data.password + '&name=' + data.name + '';
    data = {
      username: data.username,
      password: data.password,
      email:data.email
      // name: data.name
    };
    // return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.RegisterUser+q);
 
    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.RegisterUser, data);
  }

  loginUser(data: any): Observable<any> {
     
    const q = '?username=' + data.username + '&password=' + data.password + '';
    data = {
      username: data.username,
      password: data.password
    };
    
    // return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.loginUser+q);

    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.loginUser, data);
  }
  forgotPasswordUser(data: any): Observable<any> {
     
    const q = '?username=' + data.username;
    data = {
      username: data.username,
    };
    
    // return this.httpservice.postq(UserRolePermission.RoutePrefix + UserRolePermission.loginUser+q);

    return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.forgotPasswordUser, data);
  }

  loginUserM(): Observable<any> {
    const q = '?client_id=dc-admin-dev&client_secret=tA1KaNC6wocRLlyI2pW8Br0qZGFPYdVehnEmkUij&code=dZvnNlGJZ8pZyf9X8VxOd4q8iOyTuMeALz29utUaCJZNUZTxvMwkxNFCIUgY&grant_type=authorization_code';
    const data = {};
    return this.httpservice.postq1('https://6ffb-52-77-80-140.ngrok.io/v1/auth/token' + q);

    // return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.loginUser,data);
  }

  loginUserMCode(code): Observable<any> {
    const data = {};
    return this.httpservice.postq1('https://devapi-sandbox.arrturethink.com/v1/auth/token?client_id=app-local&client_secret=iBaZ1RkG2Fr5jtS87C9H6MeNbWTwOuoAndJKcYpE&code=' + code + '&grant_type=authorization_code');

    // return this.httpservice.post(UserRolePermission.RoutePrefix + UserRolePermission.loginUser,data);
  }


}
