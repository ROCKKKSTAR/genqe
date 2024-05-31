import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
// import { SpinnerVisibilityService } from 'ng-http-loader';
import { AccountService, AlertService, UserDataService } from '../_services';
import swal from 'sweetalert2';
import { environment } from '../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Appconstants } from '../app.constant';
import { ToastrService } from 'ngx-toastr';
import { IResponse } from '../models/server-data-source.model';
import { AuthenticationService } from '../services/auth.service';
import { WebService } from '../services/web.service';
// import { cognitoObject } from '../shared/enums';
import { utilityService } from '../shared/utility.service';
import { FingerprintService } from 'src/app/services/fingerprint.service';
import { IGlobalSetting } from '../models/globalSetting.interface';
import { CommonServiceService } from '../services/common-service.service';
import { ILanguage } from '../models/language.interface';
import { IUser } from '../models/user.interface';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;
  loadershow = false;
  loaderMessage = '';
  showPassword: boolean = false;
  currentScreen = 'loginWithPassword';
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;
  fingerPrintUser: any;
  languages: IGlobalSetting[];

  public data: ILanguage;
  selectedLanguage: any;
  authenticatedUser: IUser;

  constructor(
    private cs: CommonServiceService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private UserDataService: UserDataService,
    private spinner: NgxSpinnerService,
    private WS: WebService,
    private utilityservice: utilityService,
    private userDataService: UserDataService,
    private toastr: ToastrService,
    public auth: AuthenticationService,
    private fingerprintService: FingerprintService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.route.queryParams.subscribe(params => {
      // Access query parameters using params object
      this.form.value.username = params['username'];
    });
    // check if user already logged in
    const token = this.auth.getUserAuthToken();
    if (token && token !== '') {
      if (this.auth.currentUser.getValue().userType === 1) {
        this.router.navigate(['applications']);
      } else {
        this.router.navigate(['generate-coupon']);
      }
    }
    if (this.utilityservice.getEncodedAccessToken()) {
      this.getUserDetails(
        this.utilityservice.getDecodedAccessToken(
          this.utilityservice.getEncodedAccessToken()
        )
      ); // decode token
    }
    this.getLanguages('LOCALISATION_LANGUAGE')
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  public async translateLanguage(value: any) {
    const matchLang = this.languages.find(
      (l) => l.keyCode == value
    );
    if (matchLang) {
      this.selectedLanguage = matchLang
      this.cs.setLangKeyCOde(value)
      this.cs.setLanguage(matchLang.key2);
      this.data = this.cs.getLanguageData(matchLang.key2);
    }
    // if (this.selectedLanguage) {
    //   if (this.authenticatedUser.language) {
    //     const matchLang = this.languages.find(
    //       (l) => l.key1 === this.authenticatedUser.language
    //     );
    //     if (matchLang) {
    //       setTimeout(() => {
    //         this.selectedLanguage = matchLang.key2;
    //         this.cs.setLanguage(this.selectedLanguage);
    //         this.data = this.cs.getLanguageData(this.selectedLanguage);
    //         this.auth.setCurrentLang(matchLang.key1);
    //       }, 100);
    //     } else {
    //       setTimeout(() => {
    //         this.selectedLanguage = 'English';
    //         this.cs.setLanguage(this.selectedLanguage);
    //         this.data = this.cs.getLanguageData(this.selectedLanguage);
    //         this.auth.setCurrentLang('en');
    //       }, 100);
    //     }
    //   }
    // }
  }

  private getLanguages(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.languages = res.result.values as IGlobalSetting[];

        // if (this.languages.length) {
        // if (this.authenticatedUser.language) {
        //   const matchLang = this.languages.find(
        //     (l) => l.key1 === this.authenticatedUser.language
        //   );
        // if (matchLang) {
        //   setTimeout(() => {
        //     this.selectedLanguage = matchLang.key2;
        //     this.cs.setLanguage(this.selectedLanguage);
        //     this.data = this.cs.getLanguageData(this.selectedLanguage);
        //     this.auth.setCurrentLang(matchLang.key1);
        //   }, 100);
        // } else {
        //   setTimeout(() => {
        //     this.selectedLanguage = 'English';
        //     this.cs.setLanguage(this.selectedLanguage);
        //     this.data = this.cs.getLanguageData(this.selectedLanguage);
        //     this.auth.setCurrentLang('en');
        //   }, 100);
        // }
        // }
        // }
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
      } else {
        // this.toastr.error(res.description);
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    // show the spinner
    //    this.spinner.show();

    // stop here if form is invalid

    if (this.form.invalid) {
      return;
    }
    this.spinner.show();
    this.UserDataService.loginUser(this.form.value).subscribe((res: any) => {
      //////////////
      // HTTP requests performed between show && hide won't have any side effect on the spinner.
      /////////////
      // hide the spinnerconfir
      // this.spinner.hide();

      this.spinner.hide();
      if (
        res.statusCode !== undefined &&
        res.statusCode !== 200 &&
        res.statusCode !== 400
      ) {
        window.location.reload();
        swal({
          position: 'center',
          type: 'error',
          title: res.message,
          html: '',
        });
      }
      if (
        res.statusCode !== undefined &&
        res.statusCode === 400 &&
        res.result.name !== undefined &&
        res.result.name === 'NotAuthorizedException'
      ) {
        // window.location.reload()
        swal({
          position: 'center',
          type: 'error',
          title: 'Incorrect Username or Password.',
          html: '',
        });
        return;
      }
      if (
        res.statusCode !== undefined &&
        res.statusCode === 400 &&
        res.result.name !== undefined &&
        res.result.name === 'UserNotConfirmedException'
      ) {
        window.location.reload();
        swal({
          position: 'center',
          type: 'error',
          title: 'User Is Not Confirmed',
          html: 'Contact GenQe Administrator',
        });
        return;
      }
      if (
        res.statusCode !== undefined &&
        res.statusCode === 400 &&
        res.result.code === 'ENOTFOUND'
      ) {
        // window.location.reload()
        swal({
          position: 'center',
          type: 'error',
          title: 'Invalid Username or Password',
          html: '',
        });
        return;
      }
      // if (res.result.idToken !== undefined && res.result.idToken !== '' && res.result.idToken.payload !== undefined
      //   && res.result.idToken.payload['custom:portlocation'] === 'ind') {
      //   swal({
      //     position: 'center',
      //     type: 'error',
      //     title: 'Contact Lounge Administrator. ',
      //     html: 'No Role(s) / Outlet(s) assigned to the user.'
      //   });
      //   return;
      // }
      // if (res.result.idToken !== undefined && res.result.idToken !== '' && res.result.idToken.payload !== undefined
      //   && res.result.idToken.payload['custom:portlocation'] === undefined) {
      //   swal({
      //     position: 'center',
      //     type: 'error',
      //     title: 'Contact Lounge Administrator.',
      //     html: ' No Role(s) / Outlet(s) assigned to the user.'
      //   });
      //   return;
      // }
      if (res.result.idToken !== undefined && res.result.idToken !== '') {
        this.getUserDetails(
          this.utilityservice.getDecodedAccessToken(res.result.idToken.jwtToken)
        ); // decode token
      }
    });
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleConfirmNewPasswordVisibility() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }
  private getUserDetails(token): void {
    this.loadershow = true;
    this.loaderMessage = 'Logging you in';
    if (token !== undefined && token !== null && token !== '') {
      if (token && token.sub !== '') {
        this.WS.post('api/master/user/authenticate', {
          remoteUserID: token.sub,
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            this.auth.setUserAuthToken(res.result.token, res.result.user);
            this.auth.setAllLounges(res.result.lounges);
            if (this.selectedLanguage) {
              this.auth.currentUser.getValue().userLanguage = this.selectedLanguage.key2
              this.auth.currentUser.getValue().language = this.selectedLanguage.key1
            }
            if (this.auth.currentUser.getValue().userType === 1) {
              this.router.navigate(['applications']);
            } else if (this.auth.currentUser.getValue().userType === 3) {
              this.router.navigate(['users']);
            } else if (this.auth.currentUser.getValue().userType === 2) {
              this.router.navigate(['quota-report']);
            } else if (this.auth.currentUser.getValue().userType === 4) {
              this.router.navigate(['lounge-access-history']);
            } else {
              this.router.navigate(['generate-coupon']);
            }
            this.toastr.success(res.description);
          } else if (res.status === 2) {
            swal({
              position: 'center',
              type: 'error',
              title: res.description,
              html: 'Contact GenQe Administrator',
            });
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        });
      }
    }
    // else if (window.location.href.split('/')[2] === 'localhost:4200') {
    //   this.WS.post('api/master/user/authenticate', { remoteUserID: '853ad842-6cb2-42e3-beb9-a7f72f8754e6' }).subscribe((res: IResponse) => {
    //     if (res.status === 1) {
    //       this.auth.setUserAuthToken(res.result.token);
    //       this.router.navigate(['projects']);
    //       this.toastr.success(res.description);
    //     }
    //     else if (res.status === 2) {
    //       this.toastr.info(res.description);
    //     }
    //     else {
    //       this.toastr.error(res.description);
    //     }
    //   });
    // }
    else {
      this.toastr.info('Could not find token from Cognito');
    }
  }

  Submit() {
    this.UserDataService.loginUserM().subscribe((res: any) => { });
  }
  switchScreen(screenName) {
    this.currentScreen = screenName;
  }

  authenticateBiometric() {
    this.fingerprintService.authenticateFingerprint()
      .then((fingerprintUser: any) => {
        if (fingerprintUser) {
          console.log('Fingerprint', fingerprintUser);
          this.fingerPrintUser = fingerprintUser
          this.WS.post('api/master/user/authenticate', {
            fingerPrintUserID: this.fingerPrintUser.id,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.auth.setUserAuthToken(res.result.token, res.result.user);
              this.auth.setAllLounges(res.result.lounges);
              if (this.auth.currentUser.getValue().userType === 1) {
                this.router.navigate(['applications']);
              } else if (this.auth.currentUser.getValue().userType === 3) {
                this.router.navigate(['users']);
              } else if (this.auth.currentUser.getValue().userType === 2) {
                this.router.navigate(['quota-report']);
              } else if (this.auth.currentUser.getValue().userType === 4) {
                this.router.navigate(['lounge-access-history']);
              } else {
                this.router.navigate(['generate-coupon']);
              }
              this.toastr.success(res.description);
            } else if (res.status === 2) {
              swal({
                position: 'center',
                type: 'error',
                title: res.description,
                html: 'Contact GenQe Administrator',
              });
              this.toastr.info(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        }
      })
      .catch(error => {
        this.fingerPrintUser = null
        console.error('Error registering fingerprint:', error);
      });
    // Optionally, navigate the user to another page or show a success message
  }
}
