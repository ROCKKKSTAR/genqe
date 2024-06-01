import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { environment as env } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { AuthenticationService } from './auth.service';
import { CommonServiceService } from './common-service.service';
import { WebService } from './web.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
class CanActivateURL implements CanActivate {
  public partnerAllowedURL = [
    '/generate-coupon',
    '/admission-token',
    '/orders',
    '/quota-report',
    '/card-history-report',
    '/lounge-eligibility',
    '/lounge-use-summary',
    '/daily-quota-report',
    '/chatbox',
    '/loungeCheckIn-Assistant',
    '/lounge-Assistant',
    '/lounge-details'
  ];
  public PlazaAllowedURL = ['/saveCard', '/card-details'];
  public ccAllowedURL = [
    '/lounge-access-history',
    '/card-bin-lounge-access',
    '/lounge',
  ];

  constructor(private auth: AuthenticationService,
    private cs: CommonServiceService,
    private http: HttpClient,
    private toastr: ToastrService,
    private WS: WebService,
    private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // if (this.auth.sidebarItems.length === 0) {
    //   return this.http.post(env.BASE_URL + 'api/master/globalSetting/fetch/lookupCode', { lookupCode: 'SIDEBAR_MENU_ITEMS' }, { observe: 'body', responseType: 'json' }).toPromise()
    //     .then((res: any) => {
    //       this.auth.sidebarItems = res.result.values;
    //       return this.checkUserAccess(state)
    //     })
    // }
    // else {
    //   return this.checkUserAccess(state)
    // }
    const segments = state.url.split('/');
    const lastSegment = segments[segments.length - 1];
    const lastSegmentWithoutParams = '/' + lastSegment.split('?')[0];
    let loggedInUser = this.auth.currentUser.getValue();
    if (!loggedInUser && lastSegmentWithoutParams !== 'saveCard' && lastSegmentWithoutParams !== 'card-details') {
      this.router.navigate(['login']);
    } else {
      if (
        !loggedInUser &&
        (lastSegmentWithoutParams === 'saveCard' ||
          lastSegmentWithoutParams === 'card-details' ||
          this.PlazaAllowedURL.includes(state.url.split('?')[0]))
      ) {
        return true;
      }
    }

    if (loggedInUser.userType === 1) {
      return true;
    } else if (
      loggedInUser.userType === 2 &&
      this.partnerAllowedURL.includes(state.url)
    ) {
      return true;
    } else if (loggedInUser.userType === 3) {
      return true;
    } else if (loggedInUser.userType === 4) {
      return true;
    }
    this.router.navigate(['generate-coupon']);
  }

  checkUserAccess(state: any): any {
    const segments = state.url.split('/');
    const lastSegment = segments[segments.length - 1];
    const lastSegmentWithoutParams = '/' + lastSegment.split('?')[0];
    let loggedInUser = this.auth.currentUser.getValue();
    let allRoutes = this.auth.sidebarItems.map(item => item.key2)
    if (!loggedInUser && lastSegmentWithoutParams !== 'saveCard' && lastSegmentWithoutParams !== 'card-details') {
      this.router.navigate(['login']);
    } else {
      if (
        !loggedInUser &&
        (lastSegmentWithoutParams === 'saveCard' ||
          lastSegmentWithoutParams === 'card-details' ||
          this.PlazaAllowedURL.includes(state.url.split('?')[0]))
      ) {
        return true;
      }
    }

    if ((loggedInUser.userType === 2 && this.partnerAllowedURL.includes(state.url)) || loggedInUser.userType !== 2) {
      let matchRoute = this.auth.sidebarItems.find(item => item.key2 === lastSegmentWithoutParams);
      if (matchRoute && loggedInUser.permissions) {
        const matchPermission = loggedInUser.permissions.find((l) =>
          Object.keys(l).includes('LEFT_MENU')
        );
        return matchPermission && matchPermission["LEFT_MENU"].includes(matchRoute.key1);
      }
      else {
        this.toastr.info('Access Denied')
        return false;
      }
    }
    
    // if (loggedInUser.userType === 1) {
    //   let matchRoute = this.auth.sidebarItems.find(item => item.key2 === lastSegmentWithoutParams);
    //   if (matchRoute && loggedInUser.permissions) {
    //     const matchPermission = loggedInUser.permissions.find((l) =>
    //       Object.keys(l).includes('LEFT_MENU')
    //     );
    //     return matchPermission && matchPermission["LEFT_MENU"].includes(matchRoute.key1);
    //   }
    //   else {
    //     return false;
    //   }
    // } else if (
    //   loggedInUser.userType === 2 &&
    //   this.partnerAllowedURL.includes(state.url)
    // ) {
    //   return true;
    // } else if (loggedInUser.userType === 3) {
    //   return true;
    // } else if (loggedInUser.userType === 4) {
    //   return true;
    // }
    // this.router.navigate(['generate-coupon']);
  }
}

export default CanActivateURL;
