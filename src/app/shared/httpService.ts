import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse, HttpRequest }
  from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs';
import 'rxjs/add/observable/throw';
import { Appconstants } from '../app.constant';
import { StoreDataService } from './storeData.service';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import Swal from 'sweetalert2';
import { utilityService } from './utility.service';

export interface Config {
  heroesUrl: string;
  textfile: string;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private _httpClient: HttpClient,
    private storeDataService: StoreDataService,
    public router: Router,
    private route: ActivatedRoute, private utilityService: utilityService
  ) {
    if (environment.production) {
      this.baseUrl = Appconstants.ROUTE_API_PROD;
    } else {
      this.baseUrl = Appconstants.ROUTE_API_DEV;
    }

  }

  private baseUrl: string;

  public loading = false;
  headers: any;

  // start header setting with HTTPClient

  getConfig(configUrl: any) {
    return this._httpClient.get(configUrl);
  }

  getConfigResponse(configUrl: any, data: any, headers: any): Observable<HttpResponse<Config>> {

    return this._httpClient.post<Config>(
      configUrl, data, { observe: 'response', headers });
  }

  showConfigResponse(URL: any, data: any, headers: any) {
    const dat = this.getConfigResponse(URL, data, headers.headers)
      .subscribe(resp => {
        // display its headers
        const keys = resp.headers.keys();
        this.headers = keys.map(key =>
          `${key}: ${resp.headers.get(key)}`);
        // access the body directly, which is typed as `Config`.
      }, this.handleError);
    console.log(dat);
  }

  post(apiUrl: any, data: any) {
     
    const url = this.baseUrl + apiUrl;

    const headers = this.getHeaderBaseToken();

    const options = { headers };

    return this._httpClient
      .post(url, data, options);
    // .map((res:any) => {
    //   ;
    //   if(res.status==203)
    //   {
    //     this.loading=false;
    //     Swal({
    //       position: "center",
    //       type: "error",
    //       title: "Server Error...",
    //       html: "User token expire please login again."
    //     });
    //   }
    // return res;
    // })
    // .catch(this.errorHandler);
  }

  postq(apiUrl: any) {

    const url = this.baseUrl + apiUrl;

    const headers = this.getHeaderBaseToken();
    const options = { headers };

    return this._httpClient.post(url, options);
    // .map((res:any) => {
    //   ;
    //   if(res.status==203)
    //   {
    //     this.loading=false;
    //     Swal({
    //       position: "center",
    //       type: "error",
    //       title: "Server Error...",
    //       html: "User token expire please login again."
    //     });
    //   }
    // return res;
    // })
    // .catch(this.errorHandler);
  }

  postq1(apiUrl: any) {
    const url = apiUrl;
    // let headers=this.getHeaderBaseToken();
    //

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    headers = headers.set('Access-Control-Allow-Origin', '*');
    const options = { headers };
    return this._httpClient.post(url, options);
    // .map((res:any) => {
    //   ;
    //   if(res.status==203)
    //   {
    //     this.loading=false;
    //     Swal({
    //       position: "center",
    //       type: "error",
    //       title: "Server Error...",
    //       html: "User token expire please login again."
    //     });
    //   }
    // return res;
    // })
    // .catch(this.errorHandler);
  }

  private handleError(error: HttpErrorResponse) {

    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }  // end header setting with HTTPClient


  postClient(apiUrl: any, data: any) {
    const url = this.baseUrl + apiUrl;
    return this._httpClient.post<any[]>(url, data).catch(this.errorHandler);
  }

  private errorHandler(error: Response | any) {
    if (error.status !== 200 && error.status === 201) {
      this.loading = false;
      Swal({
        position: 'center',
        type: 'error',
        title: 'Server Error...',
        html: error.error.text
      });

    }
    return Observable.throw(error);
  }

  isNullSelected(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      if (control.value === '0' || control.value === 0) {
        resolve({ nullSelected: true });
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  getHeaderBaseToken() {

    let token = null;
    if (this.utilityService.getEncodedAccessToken() != null) {
      token = this.utilityService.getEncodedAccessToken();
    }
    const headerss = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'true',
      'Access-Control-Allow-Credentials': 'X-Requested-With,content-type',
      charset: 'UTF-8',
      Authorization: 'Basic ' + token
    });
    return headerss;
  }

}
