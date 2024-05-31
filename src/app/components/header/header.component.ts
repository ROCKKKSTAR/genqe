import {
  AfterViewInit,
  ElementRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ICountry,
  IGlobalSetting,
} from 'src/app/models/globalSetting.interface';
import { ILanguage } from 'src/app/models/language.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { utilityService } from '../../shared/utility.service'
// import { cognitoObject } from '../../shared/enums'
import { IUser, IRole } from '../../models/user.interface';
import { ILounge } from '../../models/lounge.interface';
import { ToastrService } from 'ngx-toastr';
import { UserDataService } from 'src/app/_services/user.service';
import { environment } from 'src/environments/environment';
import { cognitoObjectDEV, cognitoObjectPROD } from '../../shared/enums';
import { utilityService } from 'src/app/shared/utility.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from '../../../environments/environment';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource } from '@angular/material/table';
import { IprojectDetails } from 'src/app/models/project.interface';
import { MatPaginator } from '@angular/material/paginator';
import { FingerprintService } from 'src/app/services/fingerprint.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('shareModal', { static: false }) public shareModal: ElementRef;
  @ViewChild('changePasswordModal', { static: false })
  public changePasswordModal: ElementRef;

  public notification = false;
  public languages: IGlobalSetting[] = [];
  public userType = 1;
  public country = '';
  public parnterName = '';
  public selectedLanguage: any;
  public userSelectedLanguage = 'English';
  public data: ILanguage;
  public countries: ICountry[] = [];
  form: FormGroup;
  public _id: any;
  public CuserName: any;
  shareModalRef: any;
  changePasswordModalRef: any;
  public lowerflag: boolean = false;
  public upperflag: boolean = false;
  // public specialflag: boolean = false;
  public numberflag: boolean = false;
  public charactersflag: boolean = false;
  public showflag: boolean = false;
  public showflagPassword: boolean = true;
  public showflagGreen: boolean = false;
  public str: string;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  public langaugeSubscription: Subscription = null;
  private languageSubscription: Subscription = null;
  private saveRole: IRole = {
    name: 'GSO',
    description: '',
    _id: '61f791489779fef182d8d569',
  };
  saveUserToken: any = {
    _id: '',
    name: '',
    type: '1',
    //defaultProperty: this.saveLange,
    mobile: '1234567890',
    email: 'abc@gmail.com',
    businessLine: 'LMS',
    remoteUserID: '',
    isActive: true,
    roles: '61f791489779fef182d8d569',
    status: 1,
  };
  public notificationContainer = false;
  public authenticatedUser: IUser;
  public userSub: Subscription;
  public partnerId = '';
  public selectedLounge: ILounge;
  public loadershow = false;
  public loaderMessage = '';
  public baseUrl = env.BASE_URL;
  public dmrEvents = [];
  public eventCount = 0;
  userRoles: IGlobalSetting[];
  userRole: string;
  selectedLang: IGlobalSetting;
  userEmail: any;
  public dataSourceproject: MatTableDataSource<IprojectDetails>;
  public projectDataP: MatPaginator;
  public showData: boolean = false;
  fingerPrintUser: any;
  selectedLangKeyCode: any;
  constructor(
    private cs: CommonServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private WS: WebService,
    private utilityservice: utilityService,
    private toastr: ToastrService,
    private userDataService: UserDataService,
    public auth: AuthenticationService,
    private fingerprintService: FingerprintService
  ) {
    {
      this.cs.bellCount.subscribe(() => {
        this.fetchTodayEventCount();
      });
    }
    // this.getUserDetails(this.utilityservice.getDecodedAccessToken()); // decode token
  }
  userName: any = '';
  ngOnInit(): void {
    // URL rewriting
    this.selectedLangKeyCode = this.cs.getLangKeyCOde();
    this.selectedLanguage = '';
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
        this.fetchUserDetails();
        this.userType = user.userType;
        this.partnerId = this.authenticatedUser.userPartnerID;
        this.country =
          this.authenticatedUser.userOutlet.airport &&
          this.authenticatedUser.userOutlet.airport.airportCountry
            ? this.authenticatedUser.userOutlet.airport.airportCountry.name
            : '';
        if (this.userType === 2) {
          this.fetchPartnerName();
        }
        if (this.userType === 3 || this.userType === 4) {
          this.fetchUserRoles('USER_TYPE');
        }
      }
    });

    this.auth.currentLounge.subscribe((lounge) => {
      if (lounge) {
        this.selectedLounge = lounge;
        this.fetchTodayEventCount();
      }
    });
    this.fetchCountries();
    this.getLanguages('LOCALISATION_LANGUAGE');
    this.form = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }
  fetchUserDetails() {
    this.WS.post('api/master/user/fetch/email', {
      username: this.authenticatedUser.name,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userEmail = res.result.email;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  public outletName: any;
  outletData = [];
  public fetchoutletNames(keyword: string): void {
    if (this.outletName.length >= 3) {
      // this.outletData.filter(res=>res.name.toLowerCase().includes(this.outletName.toLowerCase()))
      this.outletData = this.auth
        .getAllLounges()
        .filter((res) =>
          res.name
            .toLocaleLowerCase()
            .includes(this.outletName.toLocaleLowerCase())
        );
      console.log(this.outletData);
    } else {
      this.outletData = this.auth.getAllLounges();
    }
  }

  public changeCurrentLounge(lounge: ILounge): void {
    this.loadershow = true;
    this.loaderMessage = 'Changing outlet';
    this.WS.post('api/master/user/outlet/change', {
      defaultOutlet: lounge._id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.auth.setUserAuthToken(res.result.token, res.result.user);
        this.auth.setAllLounges(res.result.lounges);
        this.cs.dmrCall();
        this.cs.failedTokensCall();
        this.outletName = ''; // Set outletName to an empty string
        this.outletData = this.auth.getAllLounges(); // Show all outlet data
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  lopoutwithcognito(): void {
    this.WS.post('api/master/user/logout', {}).subscribe((res: IResponse) => {
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }

  async registerBiomeric() {
    this.fingerprintService
      .registerFingerprint(this.authenticatedUser)
      .then((fingerprintUser: any) => {
        if (fingerprintUser) {
          console.log('Fingerprint', fingerprintUser);
          this.fingerPrintUser = fingerprintUser;
          this.WS.post('api/master/user/update/userFingerPrint', {
            userID: this.authenticatedUser._id,
            fingerPrintUserID:
              this.fingerPrintUser != undefined ? this.fingerPrintUser.id : '',
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.toastr.success(res.description);
            } else {
              this.toastr.info(res.description);
            }
          });
        } else {
          this.toastr.info('Something went Wrong');
        }
      })
      .catch((error) => {
        this.fingerPrintUser = null;
        console.error('Error registering fingerprint:', error);
      });
  }
  public openSharedModel(): void {
    (this._id = this.authenticatedUser._id),
      this.form.patchValue({ userName: this.authenticatedUser.name });
    this.shareModalRef = this.modalService.open(this.shareModal, {
      size: 'sm',
      backdrop: 'static',
    });
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
  }
  public openChangePasswordModel(): void {
    (this._id = this.authenticatedUser._id),
      this.form.patchValue({ userName: this.authenticatedUser.name });
    this.changePasswordModalRef = this.modalService.open(
      this.changePasswordModal,
      {
        size: 'sm',
        backdrop: 'static',
      }
    );
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
  }
  public closeShareModule(): void {
    this.form.patchValue({ userName: '' });
    this.form.patchValue({ password: '' });
    this.form.patchValue({ confirmpassword: '' });
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
    this.form.value.password = '';
    this.shareModalRef.close();
  }
  public closeChangePasswordModal(): void {
    this.form.patchValue({ userName: '' });
    this.form.patchValue({ password: '' });
    this.form.patchValue({ confirmpassword: '' });
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
    this.form.value.password = '';
    this.changePasswordModalRef.close();
  }

  onKeypressEvent($event: any) {
    this.showflag = false;
    this.showflagGreen = false;
    this.str = $event.target.value;
    this.isAllPresent(this.str);

    this.str = '';
  }
  isAllPresent(str: string) {
    // const pattern = new RegExp(
    //   '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{7,}.+$'
    // );
    // if (pattern.test(str)) {
    //   this.showflag = true;
    //   this.showflagGreen = true;
    // }

    this.showflag = false;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasDigit = /\d/;
    const hasSpecialChar = /[-+_!@#$%^&*.,?]/;

    if (hasUppercase.test(str)) {
      this.upperflag = true;
    } else {
      this.upperflag = false;
    }

    if (hasLowercase.test(str)) {
      this.lowerflag = true;
    } else {
      this.lowerflag = false;
    }
    if (hasDigit.test(str)) {
      this.numberflag = true;
    } else {
      this.numberflag = false;
    }
    // if (hasSpecialChar.test(str)) {
    //   this.specialflag = true;
    // }else{
    //   this.specialflag = false;
    // }
    if (str.length > 8) {
      this.charactersflag = true;
    } else {
      this.charactersflag = false;
    }

    if (
      hasUppercase.test(str) &&
      hasLowercase.test(str) &&
      hasDigit.test(str) &&
      str.length > 8
    ) {
      this.showflagPassword = false;
    } else {
      this.showflagPassword = true;
    }
    return;
  }

  public resetPassword(): void {
    if (this.form.value.password === '') {
      this.toastr.info(`Please Enter Password`);
      return;
    }
    // tslint:disable-next-line: no-string-literal;
    // this.ResetLoaderShow = true;
    if (this.showflagPassword == true) {
      this.toastr.info(`Please Enter Valid Password`);
      $('#password').focus();
      return;
    }
    if (this.form.value.password !== this.form.value.confirmpassword) {
      this.toastr.info(`Password and Re-enter Password not matched`);
      $('#password').focus();
      return;
    }
    this.userDataService
      .ResetPasswordUser({
        userName: this.form.value.userName,
        password: this.form.value.password,
      })
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success(res.message);
          this.sendMailOnResetPassword(
            this.form.value.userName,
            this.form.value.password
          );
          this.closeShareModule();
        } else {
          this.toastr.info(res.message);
        }
      });
  }

  public sendMailOnResetPassword(name, password) {
    this.WS.post('api/master/user/forgot_password', {
      query: {
        userName: name,
        password: password,
      },
    }).subscribe((res: any) => {
      if (res.code === 200) {
        this.toastr.success('Mail sent Succefully');
        console.log(res);
      }
    });
  }
  public changeLanguage(lang: string, shortCode: string): void {
    this.WS.post('api/master/user/language/change', {
      language: shortCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.auth.setUserAuthToken(res.result.token, res.result.user);
        this.auth.setAllLounges(res.result.lounges);
        setTimeout(() => {
          this.selectedLanguage = lang;
          this.cs.setLanguage(this.selectedLanguage);
          this.data = this.cs.getLanguageData(this.selectedLanguage);
          this.auth.setCurrentLang(shortCode);
        }, 100);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public async translateLanguage(lang: any) {
    const matchLang = this.languages.find((l) => l.keyCode == lang);
    if (matchLang) {
      this.changeLanguage(matchLang.key2, matchLang.key1);
    }
  }

  private getLanguages(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.languages = res.result.values as IGlobalSetting[];

        if (this.languages.length && this.selectedLanguage === '') {
          if (this.authenticatedUser.language) {
            const matchLang = this.languages.find(
              (l) => l.key1 === this.authenticatedUser.language
            );
            if (matchLang) {
              setTimeout(() => {
                this.selectedLanguage = matchLang.key2;
                this.cs.setLanguage(this.selectedLanguage);
                this.data = this.cs.getLanguageData(this.selectedLanguage);
                this.auth.setCurrentLang(matchLang.key1);
              }, 100);
            } else {
              setTimeout(() => {
                this.selectedLanguage = 'English';
                this.cs.setLanguage(this.selectedLanguage);
                this.data = this.cs.getLanguageData(this.selectedLanguage);
                this.auth.setCurrentLang('en');
              }, 100);
            }
          }
        }
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
      } else {
        // this.toastr.error(res.description);
      }
    });
  }

  private fetchCountries(): void {
    this.WS.post('api/master/country/fetch', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.countries = res.result.values as ICountry[];
        if (this.countries.length && this.country === '') {
          this.country = this.countries[0].name;
        }
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  public changeCountry(country: string): void {
    this.country = country;
    // if (country === 'United States of America' || country === 'India') {
    //   this.changeLanguage('English');
    // } else if (country === 'Hong Kong') {
    //   this.changeLanguage('Chinese');
    // } else if (country === 'Korea') {
    //   this.changeLanguage(this.selectedLanguage);
    // }
  }
  public toggleDMREvents() {
    this.dmrEvents = [];
    // this.notificationContainer = !this.notificationContainer;
    // if (this.notificationContainer) {
    this.WS.post('api/master/dmr/today', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dmrEvents = res.result.events;
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
    // }
  }
  showNotification(): void {
    this.notification = true;
    this.toggleDMREvents();
  }
  hideNotification(): void {
    this.notification = false;
  }

  public fetchTodayEventCount() {
    this.WS.post('api/master/dmr/count/today', {}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.eventCount = res.result.count;
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }

  public fetchPartnerName() {
    this.WS.post('api/master/dmr/fetchPartnerName', {
      partnerId: this.partnerId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.parnterName = res.result;
      }
    });
  }

  private fetchUserRoles(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userRoles = res.result.values as IGlobalSetting[];
        if (this.userRoles.length) {
          const matchType = this.userRoles.find(
            (t) => t.keyCode === this.userType
          );
          this.userRole = matchType.key1;
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public navigateToprojects(searchKey: string): void {
    this.router.navigate(['applications'], {
      queryParams: {
        projectData: searchKey,
      },
    });
  }
}
