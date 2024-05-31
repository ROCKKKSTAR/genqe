import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppAlertComponent } from '../components/alert-modal/alert.component';
import { Crypto } from './crypto';
// import { cognitoObjectPROD, cognitoObjectDEV } from '../shared/enums';
import { AuthenticationService } from './auth.service';
import { cognitoObjectDEV, cognitoObjectPROD } from '../shared/enums';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(/*private authService: AuthenticationService*/
    private router: Router, private alertConfirm: AppAlertComponent,
    private crypto: Crypto,
    private auth: AuthenticationService) { } // circular dependency error on importing AuthenticationService
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // tslint:disable-next-line: max-line-length
    if (req.url === environment.BASE_URL + 'api/master/user/authenticate' || req.url.includes('.s3.') || req.url.includes('/assets/i18n/')) {
      return next.handle(req);
    }
    if (req.url === environment.BASE_URL + 'api/master/user/forgot_password' || req.url.includes('.s3.') || req.url.includes('/assets/i18n/')) {
      return next.handle(req);
    }
  let token=''
  token = localStorage.getItem('authToken');
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/v1/arrture/link/card'){
      // read token from body
       token=req.body.token
    }
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/v1/save/url'){
      // read token from body
       token=req.body.token
    }  
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/v1/oauth/memberProfile'){
      // read token from body
       token=req.body.token
    }  
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/v1/oauth/memberCardDetails'){
      // read token from body
       token=req.body.token
    }  
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/authToken/getUserDetails'){
      // read token from body
       token=req.body.token
    }    
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/fetch/getUserKeys'){
      // read token from body
       token=req.body.token
    }
    if(req.url === environment.FRONTEND_BASE_URL +'api/fe/v1/arrture/delink/card'){
      // read token from body
       token=req.body.token
    }
    // if (req.url === environment.BASE_URL + 'api/master/member/create/dynamicMemberID') {
    //   // read token from body
    //   token=req.body.token
    // }
    
    if (req.url === environment.BASE_URL + 'api/master/member/fetch/id') {
      // read token from body
      token=req.body.token
    }

    
    if (req.url === environment.BASE_URL + 'api/fe/v1/arrture/encryptCard') {
      // read token from body
      token=req.body.token
    }
    
    const modifiedReq = req.clone({ headers: req.headers.append('Authorization', 'Bearer ' + token) });
    // return next.handle(modifiedReq);
    return next.handle(modifiedReq).pipe(map((event: any) => {
      if (event instanceof HttpResponse && event.body) {
        if (event.body.status === 2 && event.body.description === 'Could not verify authorization') {
          if (this.auth.getUserAuthToken() !== null || this.auth.getUserAuthToken() !== undefined ||
            this.auth.getUserAuthToken() !== '') {
            localStorage.removeItem('authToken');
          }
          this.router.navigate(['login']);
          // if (environment.production) {
          //   window.location.href = cognitoObjectPROD.loginUrl;
          // }
          // else {
          //   window.location.href = cognitoObjectDEV.loginUrl;
          // }
          // this.alertConfirm.alertConfirm(
          //   {
          //     title: 'Login Alert',
          //     message: 'Your application session has been on for too long. Please login again to continue working.',
          //     labelConfirm: 'Ok'
          //   }, '650px');
          return;
        }
      } else if (!event.body) {

        // console.log('event body not found!');
        event.body = {
          status: 0,
          description: `Server error: Please try again later. No response body`
        }


      }

      return event;
    }))
      .catch((err: HttpErrorResponse) => {

        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', err.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(`Backend returned code ${err.status}, body was: ${err.error}`);
          //   console.log(err)
        }

        // ...optionally return a default fallback value so app can continue (pick one)
        // which could be a default value (which has to be a HttpResponse here)
        // return Observable.of(new HttpResponse({body: [{name: "Default value..."}]}));
        // or simply an empty observable
        return of(new HttpResponse({
          body: {
            status: 0,
            description: `Server error: Please try again later! - ${err.statusText}`
          }
        }))
      });
  }
}
