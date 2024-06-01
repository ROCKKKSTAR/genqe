import jwt_Decode from 'jwt-decode';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
// tslint:disable-next-line: class-name
export class utilityService {
   
  public getDecodedAccessToken(token: string): any {
    if (localStorage.getItem('token') === undefined || localStorage.getItem('token') === null || localStorage.getItem('token') === '') {
      localStorage.setItem('token', token);
    }
    try {
      return jwt_Decode(token,);
    } catch (Error) {
      return null;
    }
  }

  public getEncodedAccessToken(): any {
         
    let token = null;
    if (localStorage.getItem('token') !== undefined && localStorage.getItem('token') !== null && localStorage.getItem('token') !== '') {
      token = localStorage.getItem('token');
    }
    return token;
  }

}
