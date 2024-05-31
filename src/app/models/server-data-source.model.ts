import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';
import { Observable, of } from 'rxjs';

export interface IResponse {
  name: any;
  status: number;
  token: string;
  result: any;
  tag: string;
  input: string;
  description: string;
  code?: number;
  message?: string;
}

@Injectable()
export class ServerDataSource {
  constructor(private httpClient: HttpClient) {
  }

  private requestFor(theApi: string, bodyParams: any): Observable<IResponse> {
    // var headers = new HttpHeaders();
    // if(this.ec.getUserToken()){
    //   headers = headers.set('Authorization', 'Bearer ' + this.ec.getUserToken());
    //   console.log('Header set for API')
    // }
    console.log('%c Calling API ' + theApi, 'color: green; font-weight: bold;');
    return (this.httpClient.post<IResponse>(`${env.BASE_URL}${theApi}`, bodyParams,
      { observe: 'body', responseType: 'json' }));
  }
}
