import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILounge } from './models/lounge.interface';
import { IResponse } from './models/server-data-source.model';
import { AuthenticationService } from './services/auth.service';
import { UserDataService } from './_services/user.service';
import { WebService } from './services/web.service';
import { utilityService } from './shared/utility.service';
import { cognitoObjectDEV, cognitoObjectPROD } from './shared/enums';
import { environment } from 'src/environments/environment';
// import CanActivateURL from './services/auth.guard';
import { CommonServiceService } from './services/common-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Genqe';
  constructor(
    private WS: WebService,
    private cs: CommonServiceService,
    private utilityservice: utilityService,
    private userDataService: UserDataService,
    private toastr: ToastrService,
    public auth: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute
  ) // private activate: CanActivateURL
  {
    // if (this.utilityservice.getEncodedAccessToken()) {
    //   this.getUserDetails(this.utilityservice.getDecodedAccessToken(this.utilityservice.getEncodedAccessToken())); // decode token
    // }
    // this.cs.fetchSideBarmenu('SIDEBAR_MENU_ITEMS');
  }

  ngOnInit(): void {
    if (this.auth.getUserAuthToken()) {
      this.auth.setUserAuthToken(
        this.auth.getUserAuthToken(),
        this.auth.getUserToken()
      );
      this.fetchUserLounges();
    }
  }

  private fetchUserLounges() {
    this.WS.post('api/master/user/outlet/fetch').subscribe((res: Object) => {
      const response = res as IResponse;
      if (response.status === 1) {
        this.auth.setAllLounges(response.result.lounges);
        // this.toastr.success(res.description);
      } else if (response.status === 2) {
        this.toastr.info(response.description);
      } else {
        this.toastr.error(response.description);
      }
    });
  }

  checkRoleAuth(array: any): boolean {
    let flag = false;
    const role = array;
    if (role.length === 0) {
      this.toastr.info(
        `Currently this user doesn't have any role! Please contact to admin`
      );
      setTimeout(() => {
        flag = true;
        if (flag) {
          localStorage.clear();
          this.router.navigate(['login']);
          return false;
        }
      }, 5000);
    }
    return true;
  }

  loginwithcognito(): void {
    if (
      localStorage.getItem('token') === undefined ||
      localStorage.getItem('token') === null ||
      localStorage.getItem('token') === ''
    ) {
      if (environment.production) {
        window.location.href = cognitoObjectPROD.loginUrl;
      }
      // else {
      //   window.location.href = cognitoObject.loginUrl;
      // }
    } else {
      this.router.navigate(['projects']);
    }
  }
  // private fetchUserOutlets(): void {
  //   this.WS.post('api/master/user/fetch/id', { id: '61efae1b6015051f1988fa92' }).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       if (res.result.user[0]) {
  //         this.auth.setCurrentUser(res.result.user[0]);
  //       }
  //     }
  //     else if (res.status === 2) {
  //       this.toastr.info(res.description);
  //     }
  //     else {
  //       this.toastr.error(res.description);
  //     }
  //   });
  // }
}
