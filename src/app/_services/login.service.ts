import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { CachcingServiceBase } from "./caching.service";
import 'rxjs/add/operator/map';


let count = 0;

@Injectable({ providedIn: 'root' })
export class LoginService extends CachcingServiceBase {
   
    public constructor() {
        super();
        //localStorage.clear();
        //localStorage.clear();
    }

    // public getLogin(userName:any,userPassword:any): Observable<any[]> {

    //     return this.http.get("./assets/user.json")
    //             .map((item:any) => { 
                         
    //                 // ;
    //                     return JSON.parse(item._body).filter((logdata:any)=>logdata.userName.toUpperCase() === userName.toUpperCase() && logdata.password.toUpperCase() === userPassword.toUpperCase());
    //                 });

    // }
    // public getRoleBypermissitiontLogin(role:any): Observable<any[]> {

    //     return this.http.get("./assets/rolepermission.json")
    //             .map((item:any) => { 
                                       
    //                     return JSON.parse(item._body).filter((logdata:any)=>logdata.rolestype.toUpperCase() === role.toUpperCase());
    //                 });

    // }

       
    // public getAllLocations(): Observable<any[]> {

    //     return this.http .get("./assets/locations.json")
    //             .map((item:any) => { 
                                       
    //                     return item.json();
    //                 });
    // }
   
}
