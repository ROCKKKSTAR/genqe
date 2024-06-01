import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IUser } from '../models/user.interface';
import { ILounge } from '../models/lounge.interface';
import jwt_Decode from 'jwt-decode';
import { WebService } from '../services/web.service';
import { IGlobalSetting } from '../models/globalSetting.interface';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  public currentUser = new BehaviorSubject<IUser | null>(null);
  public currentLounge = new BehaviorSubject<ILounge | null>(null);
  public sidebarItems: IGlobalSetting[] = [];
  // currentLanguage: any;
  public selectedLounge: ILounge | undefined;
  private allLounges: ILounge[] = [];
  public currentLanguage = new BehaviorSubject<string>('en');

  constructor(private router: Router, public jwtHelper: JwtHelperService,private WS: WebService) {
  }

  public get currentUserValue(): any {
    return this.currentUser.value;
  }

  private hasExpiredToken(): void {
    if (this.jwtHelper.isTokenExpired(localStorage.getItem('authToken'))) {
      localStorage.clear();
    }
  }

  public setCurrentUser(user: IUser): void {
    this.currentUser.next(user);
  }

  public setCurrentLounge(lounge: ILounge): void {
    // this.selectedLounge = lounge;
    this.currentLounge.next(lounge);
  }

  public getSelectedLounge(): ILounge {
    return this.currentLounge.value;
    // return this.selectedLounge;
  }

  public setAllLounges(lounges: ILounge[]): void {
    // this.selectedLounge = lounge;
    this.allLounges = lounges;
  }

  public getAllLounges(): ILounge[] {
    return this.allLounges;
    // return this.selectedLounge;
  }

  public setCurrentLang(lang: string): void {
    this.currentLanguage.next(lang);
  }

  public async setUserAuthToken(token: string,userToken:string): Promise<any> {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', userToken);
    const decodeToken = jwt_Decode(token)
    const user: IUser = jwt_Decode(userToken);
    
    this.setCurrentUser(user);
    this.setCurrentLounge(user.userOutlet);
  }

  public getUserAuthToken(): string {
    this.hasExpiredToken();
    let token = null;
    if (localStorage.getItem('authToken') !== undefined && localStorage.getItem('authToken') !== null &&
      localStorage.getItem('authToken') !== '') {
      token = localStorage.getItem('authToken');
    }
    return token;
  }
  public getUserToken(): string {
    this.hasExpiredToken();
    let token = null;
    if (localStorage.getItem('user') !== undefined && localStorage.getItem('user') !== null &&
      localStorage.getItem('user') !== '') {
      token = localStorage.getItem('user');
    }
    return token;
  }

}
