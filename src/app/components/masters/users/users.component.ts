import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { IResponse } from '../../../models/server-data-source.model';
import { WebService } from 'src/app/services/web.service';
import { IUser } from 'src/app/models/user.interface';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { Subject, Subscription } from 'rxjs';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { ILanguage } from 'src/app/models/language.interface';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {
  IEntitlement,
  IMaskPattern,
} from 'src/app/models/admission-token.interface';
import { ILounge } from 'src/app/models/lounge.interface';
import { NgSelect2Component, Select2OptionData } from 'ng-select2';
import { UserDataService } from 'src/app/_services/user.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { IPartner } from 'src/app/models/partner.interface';
import { IAdmission } from 'src/app/models/admission.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { SelectionModel } from '@angular/cdk/collections';
import { E } from '@angular/cdk/keycodes';
import { FingerprintService } from 'src/app/services/fingerprint.service';

interface IRole {
  roleName: string;
  name: string;
  description: string;
  _id: string;
  loungeEntitlements: ILoungeEntitlement[];
  createdOn: Date;
  createdBy: number;
  lastModifiedOn: Date;
  lastModifiedBy: number;
}
export class ILoungeEntitlement {
  // tslint:disable-next-line: variable-name
  _id: string;
  maskPatternID: string | IMaskPattern;
  loungeID: ILounge;
  entitlements: IEntitlement[];
}
interface GenerateKey {
  apiKey?: string;
  certifiedID?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: Date;
  status?: string;
  createdBy?: string;
  createdOn?: Date;
}
interface ILoungeAccess {
  displayCategory: string;
  _id: string;
  leID: string;
  loungeID: ILounge;
  name: string;
  country: string;
  brand: string;
  category: string;
  entitlement: IEntitlement;
}
declare var $;
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild('loungeSelect') loungeSelect: NgSelect2Component;
  @ViewChild(MatSort) userSort: MatSort;
  @ViewChild('empTbSort') roleSort: MatSort;
  @ViewChild('OutletSort') OutletSort: MatSort;
  @ViewChild(MatSort) generateKeySort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) rolesSort: MatSort;
  @ViewChild('shareModal', { static: false }) public shareModal: ElementRef;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('actionHistoryPaginator') actionHistoryPaginator: MatPaginator;
  @ViewChild('actionHistorySort') actionHistorySort: MatSort;

  public isSidebarOpen = true;
  public importValidator: UsersValidator;
  public showData: boolean;
  public LoaderShow = false;
  public ResetLoaderShow = false;
  public ExportLoader = false;
  public exportloaderMessage = '';
  public resetloaderMessage = '';
  public loungeList: Array<Select2OptionData>;
  public dataSourceMain: MatTableDataSource<IUser>;
  public displayedColumns: string[] = [
    'name',
    'remoteUserID',
    'mobile',
    'email',
    'status',
    'lastModifiedBy',
    'lastModifiedOn',
    'action',
  ];
  public dataSourceUser: MatTableDataSource<IUser>;
  public dataSourceUserRoles: MatTableDataSource<IRole>;
  public dataSourceGeneratedKey: MatTableDataSource<GenerateKey>;
  public displayedRoles: string[] = ['Select Roles', 'name', 'description'];
  public dataSourceOutlet: MatTableDataSource<ILounge>;
  public displayOutlet: string[] = [
    'name',
    'region',
    'status',
    'brand',
    'displayCategory',
    'action',
  ];
  public displayApikey: string[] = [
    'apikey',
    'certificateID',
    'lastModifiedBy',
    'lastModifiedOn',
    'status',
    'createdBy',
    'createdOn',
    'action',
  ];

  public showImport: boolean;
  public showUserDetails = false;
  public addNewOutlet = false;
  public disableButton: boolean = false;
  public partners: IPartner[] = [];
  public loungeData: ILoungeAccess[] = [];
  public userData: IUser[] = [];
  public outlettable: ILounge[] = [];
  public addNewProperty = false;
  public generateApiKey = false;
  public user: IUser[] = [];
  public lounge: ILounge[] = [];
  public simplesearch = '';
  advancesearchname: any;
  advancesearchUserType: any;
  public userrole: IRole[] = [];
  public userlounge: ILounge[] = [];
  public loungName;
  public userID = '';
  public BusinessUnit: IGlobalSetting[] = [];
  public UserType: IGlobalSetting[] = [];
  public loungeAccess: ILounge[] = [];
  public loungeTable: ILounge[] = [];
  public loungetable: any;
  public selectedBinLounges: string[] = [];
  public LoungeData: any;
  public LoungeDataCategory: ILounge[] = [];
  public selectedStatus = 'Active';
  public defaultOutlet: any;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  advname: IUser[] = [];
  name = '';
  mobile = '';
  email: '';
  remoteUserID: any;
  public dataSourceStatusHistory: MatTableDataSource<any>;
  public displyedActionColumn = [
    'action',
    'remarks',
    'outlet',
    'modifiedOn',
    'modifiedBy',
  ];
  type: any;
  isActive = true;
  public remarkDetails = {
    remarks: '',
    action: '',
  };
  public statusHistory = [];
  businessLine = 1;
  defaultLanguage = '';
  password: '';
  reEnterPassword: '';
  rRepassword: '';
  partnerID: any;
  // tslint:disable-next-line: ban-types
  status: any;
  public remarks = '';
  roles: '';
  lounges: any;
  outlet?: IRole[] = [];
  public loungeName = [];
  public loungesNameForSelect: ILounge[] = [];
  public _id: any;
  public lang = '';
  public changeLang = false;
  loungesid: string[] = [];
  roleId: string[] = [];
  loungeNames: string[] = [];
  public data: ILanguage;
  private languageSubscription: Subscription = null;
  category: any;
  public LoungeCategory: IGlobalSetting[] = [];
  userloungeid: string;
  Lounge: string;
  loungeId: any;
  u: IUser;
  public languages: IGlobalSetting[] = [];
  public partnerGeneratedKey = [];
  public apikey: any;
  partnerid: any;
  partner: { _id: string; name: string };
  pname: string;
  pid: string;
  loungeEntitlement: ILoungeAccess[];
  outletbrand: any;
  outletcategory: any;
  loaderMessage: string;
  public UserSub: any;
  username: any;
  shareModalRef: any;
  public rusername: any;
  public rpassword: any;
  public LoungeBrand: any;
  brand: number;
  form: FormGroup;
  form1: FormGroup;
  public newPassword: string;
  public lowerflag: boolean = false;
  public upperflag: boolean = false;
  public isLoungeIdInArray: boolean = false;
  // public specialflag: boolean = false;
  public numberflag: boolean = false;
  public charactersflag: boolean = false;
  public showflag: boolean = false;
  public showflagPassword: boolean = true;
  public showflagGreen: boolean = false;
  public str: string;
  public lowerflag1: boolean = false;
  public upperflag1: boolean = false;
  // public specialflag1: boolean = false;
  public numberflag1: boolean = false;
  public charactersflag1: boolean = false;
  public showflag1: boolean = false;
  public showflagGreen1: boolean = false;
  public str1: string;
  userType: number;
  public showCase: boolean = false;
  public lowerCase: boolean = false;
  public outletValue;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  usertype: number;
  advanceShow: boolean = false;

  public selection = new SelectionModel<any>(true, []);
  selectedRowId: any;
  fingerPrintUser: any;
  constructor(
    private route: ActivatedRoute,
    private WS: WebService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private alerts: AppAlertComponent,
    private toastr: ToastrService,
    private location: Location,
    private cs: CommonServiceService,
    private userDataService: UserDataService,
    private auth: AuthenticationService,
    private fingerprintService: FingerprintService
  ) {
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
  }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
        this.usertype = user.userType;
      }
    });
    this.changeLang = true;
    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;

    this.lowerflag1 = false;
    this.upperflag1 = false;
    // this.specialflag1 = false;
    this.numberflag1 = false;
    this.charactersflag1 = false;
    this.showflag1 = true;
    this.showflagGreen1 = false;

    this.form = this.formBuilder.group({
      rusername: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(8)]],
    });
    // this.form1=this.formBuilder.group({
    //   name: ['', Validators.required],
    //   newPassword: ['', [Validators.required, Validators.minLength(8)]],
    //   reEnterPassword: ['', [Validators.required, Validators.minLength(8)]],
    //     type:[''],
    //     defaultOutlet:[''],
    //     mobile:[''],
    //     email:[''],
    //     businessLine:[''],
    //     remoteUserID:[''],
    //     isActive:[''],
    //     defaultLanguage:[''],
    //     pname:[''],

    // })

    this.fetchUserData();
    this.fetchALLLoungeNames();
    this.getLanguages('LOCALISATION_LANGUAGE');
    this.fetchUserRole();
    this.fetchLounge();
    this.fetchLoungeCategory('LOUNGE_CATEGORY');
    this.fetchLoungeBrand('LOUNGE_BRAND');
    this.fetchUserType('USER_TYPE');
    this.fetchBusinessUnit('BUSINESS_UNIT');
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new UsersValidator(
      this.WS,
      this.u,
      this.toastr,
      this.userDataService
    );
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showUserDetails = true;
    }
  }

  // Fetching User Type
  private fetchUserType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.UserType = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  // Fetching Lounge  Categories
  private fetchLoungeCategory(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.LoungeData = res.result.values as IGlobalSetting[];
        if (this.LoungeData.length && this.category === 0) {
          this.category = this.LoungeData[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  // Fetching Business Unit
  private fetchBusinessUnit(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.BusinessUnit = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  // start sync user code Bharat
  private updateUser(updateuser): void {
    this.userDataService
      .updateUser('?' + updateuser)
      .subscribe((res: IResponse) => {
        if (res.status === 1) {
        } else {
        }
      });
  }

  UserSync() {
    this.userDataService.getAllUser().subscribe((res: any) => {
      if (res.Status === 200) {
        this.toastr.success(res.message);
      } else {
        this.toastr.error(res.message);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Making User Name Empty
  public emptyUser_Name() {
    this.user = [];
  }

  // Changing Languange
  public changeLanguage(lang): void {
    this.lang = lang;
    this.data = this.cs.getLanguageData(lang);
    if (this.changeLang == true) {
      this.defaultLang(this.lang);
    }
  }

  // Fetching All Partner Names
  public fetchPartnerNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partners = res.result.partners as IPartner[];
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.partners = [];
    }
  }

  // Closing Reset Password Model
  public closeShareModule(): void {
    this.form.patchValue({ rusername: '' });
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

  public getInfoOfDeleteUser(): string {
    return 'Deactivate User';
  }
  public getInfoOfEditUser(): string {
    return 'Edit User';
  }

  public getInfoOfResetPassword(): string {
    return 'Reset Password';
  }

  //Fetching Partners By Using ID
  public getPartnerById(partnerId: string): void {
    this.WS.post('api/master/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.pid = res.result.partners[0]._id;
          this.pname = res.result.partners[0].name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  // Fetching Lounge Brand
  private fetchLoungeBrand(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.LoungeBrand = res.result.values as IGlobalSetting[];
        if (this.LoungeBrand.length && this.brand === 0) {
          this.brand = this.LoungeBrand[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  // Setting Partner Name
  public setTokenPartner(partner: IPartner, type: string): void {
    if (type === 'search') {
      this.pname = partner.name;
      this.partners = [];
    } else {
      this.getPartnerById(partner._id);
      this.partners = [];
    }
  }

  // Fetch User Data
  public fetchUserDataSearch(): void {
    this.LoaderShow = true;
    this.advanceShow = false;
    this.WS.post('api/master/user/fetch/userdata').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.LoaderShow = false;
          this.userData = res.result;
          this.mapGlobalSettingsPType();
          this.dataSourceUser = new MatTableDataSource(this.userData);
          this.dataSourceUser.sort = this.userSort;
          this.dataSourceUser.paginator = this.paginator;
          this.simplesearch = '';
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }

  // Onpress Validation For Password and Reset-Password
  onKeypressEvent1($event: any) {
    this.showflag1 = false;
    this.showflagGreen1 = false;
    this.str1 = $event.target.value;
    this.isAllPresent1(this.str1);
    this.str1 = '';
  }

  // Onpress Validation For Password and Reset-Password
  onKeypressEvent($event: any) {
    this.showflag = false;
    this.showflagGreen = false;
    this.str = $event.target.value;
    this.isAllPresent(this.str);

    this.str = '';
  }

  // Checking Validation for Password and Reset-Password
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

  // Checking Validation for Password and Reset-Password
  isAllPresent1(str1: string) {
    // const pattern = new RegExp(
    //   '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{7,}.+$'
    // );
    //  ;
    // if (pattern.test(str1)) {
    //   this.showflag1 = true;
    //   this.showflagGreen1 = true;
    // }
    // return;

    this.showflag1 = false;
    const hasUppercase = /[A-Z]/;
    const hasLowercase = /[a-z]/;
    const hasDigit = /\d/;
    const hasSpecialChar = /[-+_!@#$%^&*.,?]/;

    if (hasUppercase.test(str1)) {
      this.upperflag1 = true;
    } else {
      this.upperflag1 = false;
    }

    if (hasLowercase.test(str1)) {
      this.lowerflag1 = true;
    } else {
      this.lowerflag1 = false;
    }
    if (hasDigit.test(str1)) {
      this.numberflag1 = true;
    } else {
      this.numberflag1 = false;
    }
    // if (hasSpecialChar.test(str)) {
    //   this.specialflag = true;
    // }else{
    //   this.specialflag = false;
    // }
    if (str1.length > 8) {
      this.charactersflag1 = true;
    } else {
      this.charactersflag1 = false;
    }

    // if(hasUppercase && hasLowercase && hasDigit && str1.length>8){
    //      this.showflag1=true
    // }
    return;
  }
  get f() {
    return this.form.controls;
  }
  chkdomanflag: any = false;

  // Reset Password For Individual user
  public resetPassword(): void {
    this.ResetLoaderShow = true;
    if (this.form.value.password === '') {
      this.toastr.info(`Please Enter Password`);
      this.ResetLoaderShow = false;
      return;
    }
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('USERS')
    );
    // tslint:disable-next-line: no-string-literal
    if (
      this.authenticatedUser._id === this._id ||
      (matchPermission && matchPermission['USERS'].includes('RESET_PASSWORD'))
    ) {
      // this.ResetLoaderShow = true;
      this.resetloaderMessage = 'Reseting Password...';
      if (this.showflagPassword == true) {
        this.ResetLoaderShow = false;
        this.toastr.info(`Please Enter Valid Password`);
        $('#password').focus();
        return;
      }
      if (this.form.value.password !== this.form.value.confirmpassword) {
        this.toastr.info(`Password and Re-enter Password not matched`);
        this.ResetLoaderShow = false;
        $('#password').focus();
        return;
      }
      if (this.authenticatedUser.role.includes('6285d806a45ebf4ab8d49a8b')) {
        if (this.authenticatedUser.userOutlet._id == this.outletValue) {
          this.userDataService
            .ResetPasswordUser({
              userName: this.form.value.rusername,
              password: this.form.value.password,
            })
            .subscribe((res: any) => {
              if (res.statusCode === 200) {
                this.toastr.success(res.message);
                this.ResetLoaderShow = false;
                this.updateUserName();
                this.sendMailOnResetPassword(
                  this.form.value.rusername,
                  this.form.value.password
                );
                this.closeShareModule();
              } else {
                this.ResetLoaderShow = false;
                this.toastr.info(res.message);
              }
            });
        } else {
          this.ResetLoaderShow = false;
          this.mapLoungeNameOnData(this.outletValue);
          this.toastr.info(
            `User is having current access on ${this.loungName} if you have access to this outlet then change the outlet from the header and try again`
          );
        }
      } else {
        this.userDataService
          .ResetPasswordUser({
            userName: this.form.value.rusername,
            password: this.form.value.password,
          })
          .subscribe((res: any) => {
            if (res.statusCode === 200) {
              this.toastr.success(res.message);
              this.ResetLoaderShow = false;
              this.updateUserName();
              this.sendMailOnResetPassword(
                this.form.value.rusername,
                this.form.value.password
              );
              this.closeShareModule();
            } else {
              this.ResetLoaderShow = false;
              this.toastr.info(res.message);
            }
          });
      }
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
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

  // Fetching All Users Data
  public fetchUserData(): void {
    this.loungeName = [];
    this.advanceShow = false;
    this.LoaderShow = true;
    this.WS.post('api/master/user/fetch/userdata').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.LoaderShow = false;
          this.userData = res.result;
          this.userData.map((p) => {
            if (p.name) {
              p.name = p.name;
            }
          });
          this.mapGlobalSettingsPType();
          this.dataSourceUser = new MatTableDataSource(this.userData);
          this.dataSourceUser.sort = this.userSort;
          this.dataSourceUser.paginator = this.paginator;
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }
  // tslint:disable-next-line: typedef
  // Fecting Selected Lounges Data in Add User To Outlet Button In Outlet Acess
  public loungesId() {
    this.selectedBinLounges = [];
    // tslint:disable-next-line: prefer-for-of
    if (this.loungeName.length > 0) {
      for (let i = 0; i < this.loungeAccess.length; i++) {
        this.selectedBinLounges.push(this.loungeAccess[i]._id);
      }
    } else {
      this.selectedBinLounges.push(this.loungeId);
    }
  }
  // tslint:disable-next-line: typedef

  // On Double Click Adding Data In Seleted Lounges tTable In Outlet Access
  public DoubleclickloungesId() {
    this.selectedBinLounges = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.loungetable.length; i++) {
      this.selectedBinLounges.push(this.loungetable[i]._id);
    }
    this.loungeName = this.selectedBinLounges;
  }
  // tslint:disable-next-line: typedef

  // Displaying Outlet Data In Table In Outlet Access
  public outletId() {
    this.loungetable = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.loungeAccess.length; i++) {
      this.loungetable.push(this.loungeAccess[i]);
    }

    // tslint:disable-next-line: prefer-for-of
    // this.dataSourceOutlet = new MatTableDataSource(this.loungetable);
    // this.dataSourceOutlet.sort = this.OutletSort;
    // this.dataSourceOutlet.paginator = this.paginator;
  }

  // Updating Selected Lounges
  public updateSelectedLounges(loungeIDs = []): void {
    this.loungeAccess = [];
    this.loungeAccess = loungeIDs;
    this.loungeName = loungeIDs;
  }

  // Fetching Lounges Data
  public fetchOutlettable(): void {
    this.WS.post('api/master/user/fetch/id', { id: this._id }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.loungeAccess = res.result.user[0].lounges;
          // let names=res.result.user[0].lounges
          this.mapGlobalSettingsOnData();
          this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
          this.dataSourceOutlet.sort = this.OutletSort;
          this.dataSourceOutlet.paginator = this.paginator;
        } else {
          console.log(res.description);
        }
      }
    );
  }

  // Adding New Outlets To User Using For Button Add User To Outlet
  public AddNewOutlet(): void {
    this.addNewProperty = false;

    this.outletId();
    this.saveoutlets();
  }

  // Fetching Roles For User
  public fetchUserRole(): void {
    this.WS.post('api/master/user/fetch/userrole').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.userrole = res.result;
          this.dataSourceUserRoles = new MatTableDataSource(this.userrole);
          this.dataSourceUserRoles.sort = this.roleSort;
        } else {
          console.log(res.description);
        }
      }
    );
  }

  // Fetching Lounge Names
  public fetchLounge(): void {
    this.WS.post('api/master/user/fetch/default/lounge').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.userlounge = res.result;
          this.mapGlobalSettingsOnData();
        } else {
          console.log(res.description);
        }
      }
    );
  }
  public mapLoungeNameOnData(value: any) {
    for (let i = 0; i < this.userlounge.length; i++) {
      if (this.userlounge[i]._id === value) {
        return (this.loungName = this.userlounge[i].name);
      }
    }
  }
  // private mapGlobalSettingsOnDataBrand(): void {
  //   if (this.loungeAccess.length) {
  //     this.loungeAccess.map((token) => {
  //       if (this.LoungeBrand.length) {
  //         const matchCat = this.LoungeBrand.find(
  //           (l) => l.keyCode === token.brand
  //         );
  //         if (matchCat) {
  //           token.displayBrand = matchCat.key1;
  //         }
  //       }

  //     });
  //     this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
  //   }
  // }

  // Fetching Outlet Catgeory and Outlet Brand in Outlet Access
  private mapGlobalSettingsOnData(): void {
    if (this.loungeAccess.length) {
      this.loungeAccess.map((token) => {
        if (this.LoungeData.length) {
          const matchCat = this.LoungeData.find(
            (l) => l.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
        if (this.LoungeBrand.length) {
          const matchCat = this.LoungeBrand.find(
            (l) => l.keyCode === token.brand
          );
          if (matchCat) {
            token.displayBrand = matchCat.key1;
          }
        }
      });
      // this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
    }
  }

  // Fetching Outlet Catgeory  in Outlet Access
  private mapGlobalSettingoutlet(): void {
    if (this.lounge.length > 0) {
      this.lounge.map((token) => {
        if (this.LoungeData.length) {
          const matchCat = this.LoungeData.find(
            (l) => l.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
      });
      // this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
    }
  }

  //   // Fetching Outlet Catgeory  in Outlet Access
  private mapGlobalSettingsOnTable(): void {
    if (this.loungetable.length) {
      this.loungetable.map((token) => {
        if (this.LoungeData.length) {
          const matchCat = this.LoungeData.find(
            (l) => l.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
        if (this.LoungeBrand.length) {
          const matchCat = this.LoungeBrand.find(
            (l) => l.keyCode === token.brand
          );
          if (matchCat) {
            token.displayBrand = matchCat.key1;
          }
        }
      });
      this.dataSourceOutlet = new MatTableDataSource(this.loungetable);
      this.dataSourceOutlet.sort = this.OutletSort;
      this.dataSourceOutlet.paginator = this.paginator;
    }
  }
  private mapGlobalSettingsPType(): void {
    if (this.userData.length) {
      this.userData.map((token) => {
        if (this.UserType.length) {
          const matchCat = this.UserType.find(
            (l) => l.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
      });
    }
  }

  // Simple Search to fetch particular User Data
  public simpleSearchUserData(value): void {
    this.LoaderShow = true;
    this.loaderMessage = 'Fetching Users';
    this.simplesearch = value;
    this.advanceShow = false;
    this.WS.post('api/master/user/simplesearch/userdata', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userData = res.result;
        this.dataSourceUser = new MatTableDataSource(this.userData);
        this.dataSourceUser.sort = this.userSort;
        this.dataSourceUser.paginator = this.paginator;
        this.LoaderShow = false;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.LoaderShow = false;
        this.dataSourceUser = new MatTableDataSource();
        this.toastr.info(res.description);
      } else {
        this.userData = [];
        this.toastr.error(res.description);
        this.mapGlobalSettingsOnData();
      }
    });
  }
  // tslint:disable-next-line: variable-name

  // Updatig Users
  // public updateSelectedUsers(isChecked: boolean, _id: string): void {
  //   if (isChecked) {
  //     this.roleId.push(_id);
  //   } else {
  //     if (this.roleId.includes(_id)) {
  //       this.roleId.splice(this.roleId.indexOf(_id), 1);
  //     }
  //   }
  // }

  public updateCheckboxState(_id: string, shouldCheck: boolean): void {
    if (shouldCheck) {
      this.roleId.push(_id);
    } else {
      if (this.roleId.includes(_id)) {
        this.roleId.splice(this.roleId.indexOf(_id), 1);
      }
    }
  }

  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSourceUserRoles.data.length;
  //   return numSelected === numRows;
  // }

  // toggleAllRows() {
  //   if (this.isAllSelected()) {
  //     this.selection.clear();
  //     return;
  //   }

  //   this.selection.select(...this.dataSourceUserRoles.data);
  // }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row: any): string {
    // if (!row) {
    //   return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    // }
    console.log('selectRow', this.selection);
    // this.selectedRowId =  this.selection?.selected.forEach((item)=>{item._id = this.roleId})
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  // Updatig Users
  public updateSelectedUsers(isChecked: boolean, _id: string): void {
    debugger;
    console.log(this.type, this.selection?.selected);
    console.log(isChecked);
    let shouldCheck = isChecked;
    this.selectedRowId = this.selection?.selected.forEach((item) => {
      item._id;
    });
    // if (isChecked) {
    if (this.type == 2) {
      console.log(this.roleId);
      const alert: IAlert = {
        title: `${''}`,
        message: `${'Are you sure you want to select multiple roles for selected User?'}`,
        labelConfirm: `${this.data ? this.data.master.user.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.user.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.roleId.push(this.selectedRowId._id);
          console.log(this.roleId);
        } else {
          shouldCheck = false;
          this.roleId.push(this.selectedRowId._id);
          setTimeout(() => {
            this.updateCheckboxState(this.selectedRowId._id, shouldCheck);
          });
        }
      });
    }
    // else {
    //   this.roleId.push(_id);
    // }
    else if (this.roleId.includes(this.selectedRowId._id)) {
      this.roleId.splice(this.roleId.indexOf(this.selectedRowId._id), 1);
    }

    // } else {
    //   if (this.roleId.includes(this.selectedRowId._id)) {
    //     this.roleId.splice(this.roleId.indexOf(this.selectedRowId._id), 1);
    //   }
    // }
  }

  // Advance Search To Fetch users
  public advanceUserDataSearch(): void {
    // tslint:disable-next-line: no-
    this.LoaderShow = true;
    this.loaderMessage = 'Fetching Users';
    this.advanceShow = true;
    this.simplesearch = '';
    this.WS.post('api/master/user/advanceUserDataSearch', {
      name: this.advancesearchname,
      status: this.status,
      roles: this.roles,
      type: this.advancesearchUserType,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userData = res.result;
        this.dataSourceUser = new MatTableDataSource(this.userData);
        this.dataSourceUser.sort = this.userSort;
        this.dataSourceUser.paginator = this.paginator;
        this.LoaderShow = false;
        this.toastr.success('User Details Found Successfully');
      } else if (res.status === 2) {
        this.userData = [];
        this.mapGlobalSettingsOnData();
        this.mapGlobalSettingsPType();
        this.LoaderShow = false;
        this.toastr.info('No Such User Exists');
        this.dataSourceUser = new MatTableDataSource();
      } else {
        this.toastr.error('No Such User Exists');
      }
    });
    $('#query1').hide();
  }
  // public getUserByIdforResetPassword(userID: string): void {
  //   this.WS.post('api/master/user/fetch/id', { id: userID }).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       this._id = res.result.user[0]._id;
  //       this.form.patchValue({rusername:res.result.user[0].name})
  //       // this.rusername = res.result.user[0].name;

  //     } else {
  //       this.toastr.info(res.description);
  //     }
  //   }
  //   );
  // }

  // Opening Reset Password Model
  public openSharedModel(
    userID: string,
    userName: string,
    outletValue: string
  ): void {
    (this._id = userID), this.form.patchValue({ rusername: userName });
    this.outletValue = outletValue;
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

  public saveoutlets(): void {
    this.WS.post('api/master/user/create/user/table', {
      _id: this._id,
      lounges: this.loungetable,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.fetchOutlettable();
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      } else {
        this.toastr.info(res.description);
      }
    });
  }

  // Create User
  public userCreate(): void {
    this.userType = parseInt(this.type);
    if (this.userType === 2 && this.pid === undefined) {
      this.toastr.info(`Please Enter Partner Name`);
      $('#partnerName1').focus();
      return;
    }
    if (this._id === '' || this._id === undefined) {
      this.createUserCognito();
    } else {
      this.createUser();
    }
  }

  // Creating User Through Cognito
  public createUserCognito(): void {
    if (!this.name || this.name === ' ') {
      this.toastr.info(
        `${this.data ? this.data.master.user.EnteryourName : 'Enter Your Name'}`
      );
      $('#userName1').focus();
      return;
    }
    if (!this.type || this.type === 0) {
      this.toastr.info(
        `${
          this.data ? this.data.master.user.Selectyourtype : 'Select Your Type'
        }`
      );
      $('#userType1').focus();
      return;
    }
    if (
      !this.defaultOutlet ||
      this.defaultOutlet == '' ||
      this.defaultOutlet == undefined ||
      this.defaultOutlet.length === 0
    ) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.Selectyouroutletaccess
            : 'Select your outlet access'
        }`
      );
      $('#defaultOutlet').focus();
      return;
    }
    if (!this.mobile || this.mobile === ' ') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.SelectMobileNumber
            : 'Select Mobile Number'
        }`
      );
      $('#UserMobile').focus();
      return;
    }
    // tslint:disable-next-line: prefer-const
    let x = 0;
    // tslint:disable-next-line: prefer-const
    let conv = x.toString();
    if (this.mobile < conv) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.InvalidMobileNumber
            : 'Invalid Mobile Number'
        }`
      );
      return;
    }

    if (!this.email || this.email === ' ') {
      if (!this.ValidateEmail(this.email)) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.user.PleaseEnteraValidemail
              : 'Please Enter a Valid email'
          }`
        );
        $('#userEmail').focus();
        return;
      }
    }
    if (!this.businessLine || this.businessLine === null) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.SelectBusinessLine
            : 'Select Business Line'
        }`
      );
      $('#businessUnit').focus();
      return;
    }

    if (!this.defaultLanguage || this.defaultLanguage === null) {
      this.toastr.info(
        `${
          this.data ? this.data.master.user.Selectlanguage : 'Select language'
        }`
      );
      $('#defaultlanguage').focus();
      return;
    }
    if (this.showflagPassword == true) {
      this.toastr.info(`Please Enter Valid Password`);
      $('#newPassword').focus();
      return;
    }
    if (this.reEnterPassword !== this.newPassword) {
      this.toastr.info('Password not matched');
      $('#reEnterPassword').focus();
      return;
    }
    let defaultOutletExists = false;
    for (let lounge of this.loungeNames) {
      if (lounge === this.defaultOutlet) {
        defaultOutletExists = true;
        break;
      }
    }
    if (!defaultOutletExists) {
      this.toastr.info('Outlet does not exist');
      return;
    }

    if (this.type == 2) {
      if (this.pname == '') {
        this.toastr.info(`${'Please Select Partner Name'}`);
        $('#partnerName1').focus();
        return;
      }
    }

    this.userDataService
      .RegisterUser({
        username: this.name,
        password: this.newPassword,
        reEnterPassword: this.reEnterPassword,
        email: this.email,
      })
      .subscribe((res: any) => {
        if (res.status === 1) {
          this.remoteUserID = res.result.UserSub;
          this.createUser();
        } else if (res.statusCode == 400) {
          this.toastr.info(res.result.message);
        }
      });
  }

  // Creating User
  public createUser(): void {
    if (!this.name || this.name === ' ') {
      this.toastr.info(
        `${this.data ? this.data.master.user.EnteryourName : 'Enter Your Name'}`
      );
      $('#userName1').focus();
      return;
    }
    if (!this.type || this.type === 0) {
      this.toastr.info(
        `${
          this.data ? this.data.master.user.Selectyourtype : 'Select Your Type'
        }`
      );
      $('#userType1').focus();
      return;
    }
    if (!this.defaultOutlet || this.defaultOutlet === '') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.Selectyouroutletaccess
            : 'Select your outlet access'
        }`
      );
      $('#defaultOutlet').focus();
      return;
    }
    if (!this.mobile || this.mobile === ' ') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.SelectMobileNumber
            : 'Select Mobile Number'
        }`
      );
      $('#UserMobile').focus();
      return;
    }
    // tslint:disable-next-line: prefer-const
    let x = 0;
    // tslint:disable-next-line: prefer-const
    let conv = x.toString();
    if (this.mobile < conv) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.InvalidMobileNumber
            : 'Invalid Mobile Number'
        }`
      );
      return;
    }

    if (!this.email || this.email === ' ') {
      if (!this.ValidateEmail(this.email)) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.user.PleaseEnteraValidemail
              : 'Please Enter a Valid email'
          }`
        );
        $('#userEmail').focus();
        return;
      }
    }
    if (!this.businessLine || this.businessLine === null) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.user.SelectBusinessLine
            : 'Select Business Line'
        }`
      );
      $('#businessUnit').focus();
      return;
    }

    if (!this.defaultLanguage || this.defaultLanguage === null) {
      this.toastr.info(
        `${
          this.data ? this.data.master.user.Selectlanguage : 'Select language'
        }`
      );
      $('#defaultlanguage').focus();
      return;
    }
    // if (!this.password || this.password === ' ') {
    //   this.toastr.info('Please Enter Password');
    //   $('#Password').focus();
    //   return;
    // }
    // if (!this.reEnterPassword || this.reEnterPassword === ' ') {
    //   this.toastr.info('Please Enter reEnter Password');
    //   $('#reEnterPassword').focus();
    //   return;
    // }
    //
    // if(this.reEnterPassword!==this.newPassword){
    //   this.toastr.info('Password not matched');
    //   $('#reEnterPassword').focus();
    //   return;
    // }
    // if (!this.pname || this.pname === ' ') {
    //   this.toastr.info('Please Select Partner Name');
    //   $('#partnerName1').focus();
    //   return;
    // }

    if (this.type == 2) {
      if (this.roleId.length == 0) {
        this.userrole.map((res) => {
          if (res.roleName == 'Partner') {
            this.roleId.push(res._id);
          }
        });
      }
      console.log(this.roleId);
    }
    // update in cognito user details
    const userdata =
      'username=' +
      this.name +
      '&name=' +
      this.name +
      '&portlocation=' +
      (this.roleId.length === 0 ? 'ind' : this.defaultOutlet) +
      '&emailid=' +
      this.email +
      '&empid=2323&dob=12/12/1089&role=' +
      (this.roleId.length === 0 ? 'ind' : this.roleId.join(',')) +
      '';
    this.updateUser(userdata);
    if (this.loungeName.length > 0) {
      if (this.loungeId != undefined || this.loungeId != null) {
        this.isLoungeIdInArray = this.loungeName.some(
          (item) =>
            item === this.loungeId || (item && item._id === this.loungeId)
        );
      }
      if (this.isLoungeIdInArray) {
        this.loungesNameForSelect = this.loungeName;
      } else {
        if (this.loungeId != undefined || this.loungeId != null) {
          this.loungeName.push(this.loungeId);
        }
        this.loungesNameForSelect = this.loungeName;
      }
    } else {
      this.loungesNameForSelect = this.loungeId;
    }
    this.WS.post('api/master/user/create/user', {
      _id: this._id,
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      pid: this.pid,
      remoteUserID: this.remoteUserID,
      type: this.type,
      isActive: this.isActive,
      status: this.status,
      defaultLanguage: this.defaultLanguage,
      defaultOutlet: this.loungeId,
      businessLine: this.businessLine,
      roles: this.selection?.selected,
      lounges: this.loungesNameForSelect,
      password: this.newPassword,
      reEnterPassword: this.reEnterPassword,
      fingerPrintUserID:this.fingerPrintUser!=undefined ? this.fingerPrintUser.id : ""
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this._id = res.result.user._id;
        this.loungesId();
        this.fetchOutlettable();
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
        this.fetchUserData();
      } else if (res.status === 2) {
        if (res.description === 'Please Select Partner Name') {
          $('#partnerName1').focus();
          this.toastr.info(res.description);
        } else {
          this.toastr.info(res.description);
        }
      } else {
        if (res.description === 'Please Enter a Valid Outlet') {
          $('#defaultOutlet').focus();
        }
        this.toastr.error(res.description);
      }
    });
  }

  // Updating User
  public updateUserName(): void {
    this.WS.post('api/master/user/update/user', {
      _id: this._id,
      name: this.name,
      mobile: this.mobile,
      email: this.email,
      pid: this.pid,
      remoteUserID: this.remoteUserID,
      type: this.type,
      isActive: this.isActive,
      status: this.status,
      defaultLanguage: this.defaultLanguage,
      defaultOutlet: this.loungeId,
      businessLine: this.businessLine,
      roles: this.roleId,
      lounges: this.loungeAccess,
      password: this.newPassword,
      reEnterPassword: this.reEnterPassword,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this._id = res.result.user._id;
        this.fetchUserData();
        this.toastr.success(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  // tslint:disable-next-line: typedef
  saveUser(saveToken: any) {
    const saveUserToken: any = {};
    saveUserToken.name = saveToken.Username;
    saveUserToken.remoteUserID = saveToken.Attributes[0].Value;
    saveUserToken.email = 'abc@gmail.com';
    saveUserToken.mobile = '1234567890';
    saveUserToken.type = '1';
    saveUserToken.businessLine = 'LMS';
    saveUserToken.defaultOutlet = saveToken.Attributes[0].Value;

    this.WS.post('api/master/user/create/user', saveUserToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.toastr.success(res.description);
        } else if (res.status === 0) {
          this.toastr.info(res.description);
        }
      }
    );
  }

  // tslint:disable-next-line: typedef
  // Fetching User By Id
  public getUserById(userId: string): void {
    this.changeLang = false;
    this.partnerGeneratedKey = [];
    this.selection.clear();
    this.apikey = '';
    this.dataSourceGeneratedKey = new MatTableDataSource();
    this.userID = userId;
    this.WS.post('api/master/user/fetch/id', { id: userId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          if (res.result.user[0].type == 1) {
            this.disableButton = true;
            this._id = res.result.user[0]._id;
            this.name = res.result.user[0].name;
            this.mobile = res.result.user[0].mobile;
            this.email = res.result.user[0].email;
            this.type = res.result.user[0].type;
            this.pname = res.result.user[0].partnerID
              ? res.result.user[0].partnerID.name
              : '';
            this.defaultLanguage = res.result.user[0].defaultLanguage;
            this.defaultOutlet = res.result.user[0].defaultOutlet.name;
            this.businessLine = res.result.user[0].businessLine;
            this.remoteUserID = res.result.user[0].remoteUserID;
            this.isActive = res.result.user[0].isActive;
            this.roleId = res.result.user[0].roles;
            this.selection.select(...this.roleId);
            this.loungetable = res.result.user[0].lounges;
            this.lowerflag = false;
            this.upperflag = false;
            // this.specialflag = false;
            this.numberflag = false;
            this.charactersflag = false;
            this.showflag = true;
            this.showflagGreen = false;
            this.DoubleclickloungesId();
            this.fetchOutlettable();
            this.showUserDetails = true;
            this.mapGlobalSettingsOnData();
            this.mapGlobalSettingsPType();
            if (res.result.user[0].defaultOutlet.status === 0) {
              this.toastr.info(
                `defaultOutlet made inActive by ${res.result.user[0].lastModifiedBy.name} please add active outlet`
              );
            }
            if (
              res.result.user[0].statusHistory &&
              res.result.user[0].statusHistory.length > 0
            ) {
              this.mapActionHistory(res.result.user[0].statusHistory);
            } else {
              this.mapActionHistory([]);
            }
          } else if (res.result.user[0].type == 2) {
            this.disableButton = true;
            this._id = res.result.user[0]._id;
            this.name = res.result.user[0].name;
            this.mobile = res.result.user[0].mobile;
            this.pid = res.result.user[0].partnerID
              ? res.result.user[0].partnerID._id
              : '';
            this.email = res.result.user[0].email;
            this.type = res.result.user[0].type;
            this.pname = res.result.user[0].partnerID
              ? res.result.user[0].partnerID.name
              : '';
            this.defaultLanguage = res.result.user[0].defaultLanguage;
            this.defaultOutlet = res.result.user[0].defaultOutlet.name;
            this.businessLine = res.result.user[0].businessLine;
            this.remoteUserID = res.result.user[0].remoteUserID;
            this.isActive = res.result.user[0].isActive;
            this.roleId = res.result.user[0].roles;
            this.selection.select(...this.roleId);
            this.loungetable = res.result.user[0].lounges;
            this.lowerflag = false;
            this.upperflag = false;
            // this.apikey=res.result.user[0].apiKeys.apiKey
            // this.specialflag = false;
            this.numberflag = false;
            this.charactersflag = false;
            this.showflag = true;
            this.showflagGreen = false;
            this.DoubleclickloungesId();
            this.fetchOutlettable();
            this.getGeneratedKeyData();
            this.showUserDetails = true;
            this.mapGlobalSettingsOnData();
            this.mapGlobalSettingsPType();
            // this.toastr.info(res.description);
            if (res.result.user[0].defaultOutlet.status === 0) {
              this.toastr.info(
                `defaultOutlet made inActive by ${res.result.user[0].lastModifiedBy.name} please add active outlet`
              );
            }
            if (
              res.result.user[0].statusHistory &&
              res.result.user[0].statusHistory.length > 0
            ) {
              this.mapActionHistory(res.result.user[0].statusHistory);
            } else {
              this.mapActionHistory([]);
            }
          } else if (res.result.user[0].type == 3) {
            this.disableButton = true;
            this._id = res.result.user[0]._id;
            this.name = res.result.user[0].name;
            this.mobile = res.result.user[0].mobile;
            // this.pid = res.result.user[0].partnerID._id;
            this.email = res.result.user[0].email;
            this.type = res.result.user[0].type;
            this.pname = res.result.user[0].partnerID
              ? res.result.user[0].partnerID.name
              : '';
            this.defaultLanguage = res.result.user[0].defaultLanguage;
            this.defaultOutlet = res.result.user[0].defaultOutlet.name;
            this.businessLine = res.result.user[0].businessLine;
            this.remoteUserID = res.result.user[0].remoteUserID;
            this.isActive = res.result.user[0].isActive;
            this.roleId = res.result.user[0].roles;
            this.selection.select(...this.roleId);
            this.loungetable = res.result.user[0].lounges;
            this.lowerflag = false;
            this.upperflag = false;
            // this.specialflag = false;
            this.numberflag = false;
            this.charactersflag = false;
            this.showflag = true;
            this.showflagGreen = false;
            this.DoubleclickloungesId();
            this.fetchOutlettable();
            this.showUserDetails = true;
            this.mapGlobalSettingsOnData();
            this.mapGlobalSettingsPType();
            // this.toastr.info(res.description);
            if (res.result.user[0].defaultOutlet.status === 0) {
              this.toastr.info(
                `defaultOutlet made inActive by ${res.result.user[0].lastModifiedBy.name} please add active outlet`
              );
            }
            if (
              res.result.user[0].statusHistory &&
              res.result.user[0].statusHistory.length > 0
            ) {
              this.mapActionHistory(res.result.user[0].statusHistory);
            } else {
              this.mapActionHistory([]);
            }
          } else if (res.result.user[0].type === 4) {
            this.disableButton = true;
            this._id = res.result.user[0]._id;
            this.name = res.result.user[0].name;
            this.mobile = res.result.user[0].mobile;
            // this.pid = res.result.user[0].partnerID._id;
            this.email = res.result.user[0].email;
            this.type = res.result.user[0].type;
            this.pname = res.result.user[0].partnerID
              ? res.result.user[0].partnerID.name
              : '';
            this.defaultLanguage = res.result.user[0].defaultLanguage;
            this.defaultOutlet = res.result.user[0].defaultOutlet.name;
            this.businessLine = res.result.user[0].businessLine;
            this.remoteUserID = res.result.user[0].remoteUserID;
            this.isActive = res.result.user[0].isActive;
            this.roleId = res.result.user[0].roles;
            this.selection.select(...this.roleId);
            this.loungetable = res.result.user[0].lounges;
            this.lowerflag = false;
            this.upperflag = false;
            // this.specialflag = false;
            this.numberflag = false;
            this.charactersflag = false;
            this.showflag = true;
            this.showflagGreen = false;
            this.DoubleclickloungesId();
            this.fetchOutlettable();
            this.showUserDetails = true;
            this.mapGlobalSettingsOnData();
            this.mapGlobalSettingsPType();
            // this.toastr.info(res.description);
            if (res.result.user[0].defaultOutlet.status === 0) {
              this.toastr.info(
                `defaultOutlet made inActive by ${res.result.user[0].lastModifiedBy.name} please add active outlet`
              );
            }
            if (
              res.result.user[0].statusHistory &&
              res.result.user[0].statusHistory.length > 0
            ) {
              this.mapActionHistory(res.result.user[0].statusHistory);
            } else {
              this.mapActionHistory([]);
            }
          } else {
            // this.toastr.info(res.description);
          }
        } else if (res.status === 2) {
          this.disableButton = false;
          this.toastr.info(res.description);
        }
      }
    );
  }

  // fetching languages
  public getLanguages(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.languages = res.result.values as IGlobalSetting[];
        // if(this.changeLang==true){
        // if(this.lang == 'English'){
        //   this.defaultLanguage=this.languages[1].key1;
        //  }else if(this.lang == 'Chinese'){
        //    this.defaultLanguage=this.languages[0].key1;
        //  }else if(this.lang == 'Hindi'){
        //    this.defaultLanguage=this.languages[2].key1;
        //  }else if(this.lang == 'Korean'){
        //    this.defaultLanguage=this.languages[3].key1;
        //  }
        // this.defaultLang(this.lang)
        // }
      } else if (res.status === 2) {
      } else {
      }
    });
  }
  public defaultLang(lang) {
    console.log('this.languages', this.languages);
    if (this.languages.length > 0) {
      if (lang == 'English') {
        this.defaultLanguage = this.languages[1].key1;
      } else if (lang == 'Chinese') {
        this.defaultLanguage = this.languages[0].key1;
      } else if (lang == 'Hindi') {
        this.defaultLanguage = this.languages[2].key1;
      } else if (lang == 'Korean') {
        this.defaultLanguage = this.languages[3].key1;
      }
    }
  }
  // No Where Used This Function
  public usersyncCognito(): void {
    this.WS.post('api/master/user/create/user', {
      remoteUserID: this.remoteUserID,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.remoteUserID = res.result.user.remoteUserID;
        this.toastr.success(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  // No Where Used This Function
  public getUserByIdforadv(userId: string): void {
    this.WS.post('api/master/user/fetch/id', { id: userId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.username = res.result.user[0].name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  // tslint:disable-next-line: typedef
  //  // No Where Used This Function
  public getuserClickData(id: string) {
    this.getUserById(id);
  }

  // Fecthing User Names
  public fetchuserNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchUserNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.user = res.result.user as IUser[];
            if (!this.user.length) {
              this.toastr.info('Not found');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else if (keyword.length === 0) {
      this.user = [];
    } else {
      this.user = [];
    }
  }

  // Fecthing All Lounges
  private fetchALLLoungeNames(): void {
    this.WS.post('api/master/lounge/ALLLoungeNames').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          let names = res.result.lounge as ILounge[];
          this.loungeNames = names.map((lounge: any) => lounge.name);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }

  // Fetching Lounge Names
  public fetchLoungeNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.lounge = res.result.lounge as ILounge[];

            this.mapGlobalSettingoutlet();
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.lounge = [];
    }
  }

  // No Where Used This Function
  public setTokenUserAdvanceSearch(user: IUser, type: string): void {
    this.user = [];
    if (type === 'search') {
      this.username = user.name;
      this.user = [];
    } else {
      this.getUserByIdforadv(user._id);
      this.user = [];
    }
  }
  public setTokenUser(user: IUser): void {
    this.getUserById(user._id);
    this.user = [];
  }

  public generateApiKeys(id: string) {
    if (this.apikey !== '') {
      const alert: IAlert = {
        title: `${'ApiKey Exists!'}`,
        message: `${'Are you sure you want to Generate Another ApiKey?'}`,
        labelConfirm: `${this.data ? this.data.master.user.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.user.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/generateApiKey', {
            id,
            username: this.name,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.getGeneratedKeyData();
              this.toastr.success(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        }
      });
    } else {
      this.WS.post('api/master/generateApiKey', {
        id,
        username: this.name,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.getGeneratedKeyData();
          this.toastr.success(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    }
  }

  public getGeneratedKeyData() {
    this.WS.post('api/master/fetch/getGeneratedKeyData', {
      id: this.userID,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerGeneratedKey = res.result.userKeydata.apiKeys;
        if (this.partnerGeneratedKey && this.partnerGeneratedKey.length > 0) {
          this.apikey = res.result.userKeydata.apiKeys[0].apiKey;
        }
        this.dataSourceGeneratedKey = new MatTableDataSource(
          this.partnerGeneratedKey
        );
        this.dataSourceGeneratedKey.sort = this.generateKeySort;
        this.dataSourceGeneratedKey.paginator = this.paginator;
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public deleteGenerateKeyData(id) {
    const alert: IAlert = {
      title: `${'Deactivate Key!'}`,
      message: `${'Are you sure you want to deactivate this Key?'}`,
      labelConfirm: `${this.data ? this.data.master.user.yes : 'Yes'}`,
      labelCancel: `${this.data ? this.data.master.user.no : 'No'}`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
        this.WS.post('api/master/user/deleteGeneratedKey', {
          id: this.userID,
          keyId: id,
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            this.getGeneratedKeyData();
            this.toastr.success(res.description);
          }
        });
      }
    });
  }

  public changeStatus() {
    this.isActive = !this.isActive;
    this.status = this.isActive ? 1 : 2;
  }
  public saveStatusHistory() {
    //console.log('saveHistory',this.remarkDetails.remarks)
    if (this.remarkDetails.remarks.trim() === '') {
      this.remarkDetails.remarks = '';
      this.toastr.info('Please Enter Remarks');
      document.getElementById('svbtn').removeAttribute('data-dismiss');
      return;
    }
    this.remarkDetails.action = this.isActive ? 'Active' : 'Inactive';
    this.statusHistory = [];
    this.statusHistory.push(this.remarkDetails);
    this.WS.post('api/master/user/save/status', {
      status: this.status,
      _id: this.userID,
      remarks: this.remarkDetails.remarks,
      action: this.remarkDetails.action,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.statusHistory = res.result.statusHistory;
        this.mapActionHistory(this.statusHistory);
        this.showUserDetails = false;
        if (this.simplesearch.trim() === '') {
          if (this.advanceShow) {
            this.advanceUserDataSearch();
          } else {
            this.fetchUserData();
          }
        } else {
          this.simpleSearchUserData(this.simplesearch);
        }
        // console.log('stsus hstry--',this.partnerToken.statusHistory)
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
    this.remarkDetails.remarks = '';
    document.getElementById('svbtn').setAttribute('data-dismiss', 'modal');
  }

  public mapActionHistory(data): void {
    this.dataSourceStatusHistory = new MatTableDataSource(data);
    this.dataSourceStatusHistory.sort = this.actionHistorySort;
    this.dataSourceStatusHistory.paginator = this.actionHistoryPaginator;
  }
  // On Select Passing Lounge Id
  public setTokenuserlounge(loungeID): void {
    if (this.loungeAccess.length > 0) {
      if (this.loungeAccess.find((e) => e._id === loungeID._id)) {
        this.getLoungeById(loungeID._id);
        this.lounge = [];
      } else {
        this.getLoungeById(loungeID._id);
        this.loungeAccess.push(loungeID);
        // this.loungeName=this.loungeAccess;
        //  this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
        this.lounge = [];
      }
    } else {
      this.getLoungeById(loungeID._id);
      this.loungeAccess.push(loungeID);
      // this.loungeName=this.loungeAccess;
      // this.dataSourceOutlet = new MatTableDataSource(this.loungeAccess);
      this.lounge = [];
    }
  }

  // Submitting User
  public saveUpsert(): void {
    this.submitUser();
    if (this._id !== '') {
      // this.fetchUserData();
      this.showUserDetails = false;
    }
  }

  // Calling this function from saveUpsert()
  public submitUser(): void {
    this.userCreate();
  }

  // No Where Used This Function
  public submitUserDetails(): void {
    this.showUserDetails = false;
    this.name = '';
    this.password = '';
    this.fetchUserData();
  }

  // Fetching Lounges By ID
  public getLoungeById(loungeId: string): void {
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.loungeId = res.result.lounge._id;
          this.defaultOutlet = res.result.lounge.name;
          this.mapGlobalSettingsOnTable();
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  // Deleting User
  public deleteUserData(userID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('USERS')
    );
    // tslint:disable-next-line: no-string-literal
    if (matchPermission && matchPermission['USERS'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.user.DeleteUserConfirmation
            : 'Deactivate User Confirmation!'
        }`,
        message: `${
          this.data
            ? this.data.master.user.AreyousureyouwanttodeletethisUser
            : 'Are you sure you want to deactivate this User?'
        }`,
        labelConfirm: `${this.data ? this.data.master.user.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.user.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/user/deleteuserdata', {
            id: userID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.user.splice(
                this.user.findIndex((i) => i._id === res.result.deleteId),
                1
              );
              this.fetchUserData();
              this.toastr.success(res.description);
            }
          });
        }
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  // No Where Used This Function
  public ResetOutlet(): void {
    this._id = '';
    this.loungeAccess = [];
  }
  // tslint:disable-next-line: typedef
  // Validating Email
  public ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      return false;
    }
  }

  // Resetting Fields
  public ResetDoubleClick(): void {
    if (this._id !== '') {
      this.getUserById(this._id);
    } else {
      this.roles = '';
      this.name = '';
      this.status = null;
      this.ResetUserTable();
    }
  }

  // Resetting Fields
  public ResetUserTable(): void {
    this.name = '';
    this.type = 1;
    this.mobile = '';
    this.remoteUserID = '';
    this.defaultOutlet = [];
    this.email = '';
    this.roleId = [];
    this.businessLine = 1;
    this._id = '';
    this.pname = '';
    this.loungeAccess = [];
    this.user = [];
    this.newPassword = '';
    this.reEnterPassword = '';

    this.lowerflag = false;
    this.upperflag = false;
    // this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;

    this.lowerflag1 = false;
    this.upperflag1 = false;
    // this.specialflag1 = false;
    this.numberflag1 = false;
    this.charactersflag1 = false;
    this.showflag1 = true;
    this.showflagGreen1 = false;
  }
  public ResetAdvanceSearch(): void {
    this.roles = '';
    this.name = '';
    this.status = null;
    this.advancesearchUserType = '';
  }

  ngAfterViewInit(): void {
    if (this.simplesearch.trim() !== '') {
      $('.search-input input').focus();
    }
    $('#query1').hide();
    // tslint:disable-next-line: typedef
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this).find('~ label, ~ span:nth-of-type(n+3)').addClass('not-empty');
      } else {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .removeClass('not-empty');
      }
    });
    // tslint:disable-next-line: typedef
    // tslint:disable-next-line: only-arrow-functions
    $('.search-input input ~ span:nth-of-type(4)').click(function () {
      $('.search-input input').val('');
      $('.search-input input')
        .find('~ label, ~ span:nth-of-type(n+3)')
        .removeClass('not-empty');
    });

    // tslint:disable-next-line: typedef
    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        // tslint:disable-next-line: max-line-length
        if (
          $(event.target).hasClass('select2-selection_choiceremove').length ||
          $(event.target).parent('.searchSuggestions').length ||
          $(event.target).parent('.select2-selectionchoice_remove').length
        ) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          // $('body').find('.query1').removeClass('visible');
          // $('#query1').hide();
          this.showData = false;
        }
      }
    });
  }

  // tslint:disable-next-line: typedef
  showQueryForm() {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }

  // tslint:disable-next-line: typedef
  hideUserDetails() {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showUserDetails = false;
      this.location.replaceState('/users');
    } else {
      this.showUserDetails = false;
      this.changeLang = false;
    }
    this.user = [];
    if (this.simplesearch.trim() === '') {
      if (this.advanceShow) {
        this.advanceUserDataSearch();
      } else {
        this.fetchUserData();
      }
    } else {
      this.simpleSearchUserData(this.simplesearch);
    }
    this.ResetUserTable();

    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
    }, 50);
  }

  // Add New User
  addNewUser(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('USERS')
    );
    // tslint:disable-next-line: no-string-literal
    if (matchPermission && matchPermission['USERS'].includes('NEW')) {
      this.disableButton = false;
      this.changeLang = isshow;
      // this.getLanguages('LOCALISATION_LANGUAGE');y
      this.defaultLang(this.lang);
      this.showUserDetails = isshow;
      this.ResetUserTable();
      this._id = '';
      this.userID = '';
      this.type = 1;
      this.isActive = true;
      // this.lowerflag=false;
      // this.upperflag=false;
      // this.specialflag=false;
      // this.numberflag=false;
      // this.charactersflag=false;
      // this.showflag=true;
      // this.showflagGreen=true;

      // this.lowerflag1=false;
      // this.upperflag1=false;
      // this.specialflag1=false;
      // this.numberflag1=false;
      // this.charactersflag1=false;
      // this.showflag1=true;
      // this.showflagGreen1=true;
      this.user = [];
      this.loungeName = [];
      // this.changeLanguage(this.lang)
      // this.dataSourceOutlet = new MatTableDataSource();
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  // tslint:disable-next-line: typedef

  // Import user
  showUsersImport() {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('USERS')
    );
    // tslint:disable-next-line: no-string-literal
    if (matchPermission && matchPermission['USERS'].includes('IMPORT')) {
      this.showImport = !this.showImport;
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  // Deleting InActive Outlets
  public deleteInactiveOutlet(outletID) {
    const alert: IAlert = {
      title: `${'InActivate Outlet'}`,
      message: `${'Are you sure you want to Delete Outlet?'}`,
      labelConfirmRed: `${this.data ? this.data.master.user.yes : 'Yes'}`,
      labelCancel: `${this.data ? this.data.master.user.no : 'No'}`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
        this.WS.post('api/master/delete/deleteInactiveOutlet', {
          id: this._id,
          OutletID: outletID,
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            if (res.result.lounges[0].lounges) {
              res.result.lounges[0].lounges.map((token) => {
                if (this.LoungeData.length) {
                  const matchCat = this.LoungeData.find(
                    (l) => l.keyCode === token.category
                  );
                  if (matchCat) {
                    token.displayCategory = matchCat.key1;
                  }
                }
                if (this.LoungeBrand.length) {
                  const matchCat = this.LoungeBrand.find(
                    (l) => l.keyCode === token.brand
                  );
                  if (matchCat) {
                    token.displayBrand = matchCat.key1;
                  }
                }
              });
              this.loungeName = res.result.lounges[0].lounges;
              this.loungetable = res.result.lounges[0].lounges;
              this.dataSourceOutlet = new MatTableDataSource(
                res.result.lounges[0].lounges
              );
              this.dataSourceOutlet.sort = this.OutletSort;
              this.dataSourceOutlet.paginator = this.paginator;
            }
          } else {
            this.toastr.error(res.description);
          }
        });
      }
    });
  }
  // Onclick coming Backing to Users page
  public backToResults(): void {
    this.showImport = false;
    this.fetchUserData();
  }

  // Exporting Data In Excel Sheet
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('USERS')
    );
    if (matchPermission && matchPermission['USERS'].includes('EXPORT')) {
      try {
        this.ExportLoader = true;
        this.exportloaderMessage = 'Exporting data..';

        this.exporter.exportTable('xlsx', { fileName: filename });

        setTimeout(() => {
          this.ExportLoader = false;
        }, 1000);
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.user.length = 0;
    this.lounge.length = 0;
    this.partners.length = 0;
  }

  tokenUserSuggestionIndex = -1;

  onTokenUserInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenUserSuggestionIndex = Math.max(
          this.tokenUserSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenUserSuggestionIndex = Math.min(
          this.tokenUserSuggestionIndex + 1,
          this.user.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenUserSuggestionIndex >= 0) {
          this.setTokenUser(this.user[this.tokenUserSuggestionIndex]);
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenUserLoungeSuggestionIndex = -1;

  onTokenUserLoungeInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenUserLoungeSuggestionIndex = Math.max(
          this.tokenUserLoungeSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenUserLoungeSuggestionIndex = Math.min(
          this.tokenUserLoungeSuggestionIndex + 1,
          this.lounge.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenUserLoungeSuggestionIndex >= 0) {
          this.setTokenuserlounge(
            this.lounge[this.tokenUserLoungeSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenPartnerSuggestionIndex = -1;

  onTokenPartnerInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenPartnerSuggestionIndex = Math.max(
          this.tokenPartnerSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenPartnerSuggestionIndex = Math.min(
          this.tokenPartnerSuggestionIndex + 1,
          this.partners.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenPartnerSuggestionIndex >= 0) {
          this.setTokenPartner(
            this.partners[this.tokenPartnerSuggestionIndex],
            'populate'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
  async registerBiomeric() {
    this.fingerprintService.registerFingerprint(this.authenticatedUser)
    .then((fingerprintUser: any )=> {
      if (fingerprintUser) {
        console.log('Fingerprint', fingerprintUser);
        this.fingerPrintUser=fingerprintUser
      }
    })
    .catch(error => {
      this.fingerPrintUser=null
      console.error('Error registering fingerprint:', error);
    });
  }
}
class UsersValidator extends AbstractValidator<IUser> {
  // tslint:disable-next-line:variable-name
  public eachValue: Subject<IUser>;
  public title = 'Import User';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public success = 0;
  public failure = 0;
  public importType = 'User';
  public templateName = 'User Template';
  public templateURL = env.BASE_URL + 'api/master/template/download/user.xlsx';
  public remoteids: any = [];
  public isValid = false;
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'name',
      {
        column: 'name',
        key: 'name',
        validations: [DataValidatorRequired()],
      },
    ],

    [
      'email',
      {
        column: 'email',
        key: 'email',
        validations: [],
      },
    ],
    [
      'mobile',
      {
        column: 'mobile',
        key: 'mobile',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'UserType',
      {
        column: 'UserType',
        key: 'UserType',
        validations: [DataValidatorRequired()],
      },
    ],

    [
      'businessLine',
      {
        column: 'businessLine',
        key: 'businessLine',
        validations: [],
      },
    ],
    [
      'OutletName',
      {
        column: 'OutletName',
        key: 'OutletName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PartnerName',
      {
        column: 'PartnerName',
        key: 'PartnerName',
        validations: [],
      },
    ],
  ]);
  constructor(
    private WS: WebService,
    u: IUser = null,
    private toastr: ToastrService,
    private userDataService: UserDataService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IUser>();
    this.fileSubject = new Subject<File>();
    this.fileSubject.subscribe((v) => {});
    this.eachValue.subscribe((v) => {
      this.callSaveUser(v);
    });
  }

  // callSaveUser(inputData: any): void {
  //
  //   this.WS.uploadMultipleFile(
  //     'api/master/import/user/save',
  //     inputData.filedata,
  //     {
  //       inputData: inputData.tJSON,
  //       filelength: inputData.filelength,
  //       indexNo: inputData.indexNo,
  //       importId: inputData.importID,
  //     }
  //   ).subscribe((res: any) => {
  //
  //     const response = JSON.parse(res);
  //     if (response.status === 1) {
  //       this.success = this.success + 1;
  //       this.toastr.success('Data Updated Successfully');
  //     } else if (response.status === 0) {
  //       this.toastr.info('Data Already Exists');
  //     } else {
  //       this.failure = this.failure + 1;
  //     }
  //     this.saveResponse.next(JSON.parse(res));
  //     if (inputData.indexNo === inputData.filelength) {
  //       this.WS.post('api/master/fileImportExport/save/import', {
  //         id: inputData.importID,
  //         success: this.success,
  //         failure: this.failure,
  //         tCount: inputData.indexNo,
  //       }).subscribe((r: IResponse) => {
  //         this.failure = 0;
  //         this.success = 0;
  //       });
  //     }
  //   });
  // }

  async callSaveUser(inputData: any): Promise<void> {
    for (let i = 0; i < inputData.length; i++) {
      await this.partnerName(inputData[i]);
      if (this.isValid === true) {
        const res = await this.userDataService
          .RegisterUser({
            username: inputData[i].tJSON.name.trim(),
            password: 'Test@2022',
          })
          .toPromise();
        if (res.status === 1) {
          const remoteids = res.result.UserSub;
          await this.saveUserByImport(inputData[i], remoteids);
        } else if (res.statusCode == 400) {
          await this.saveUserByImport(inputData[i], null);
        }
      }
    }
  }
  async partnerName(inputdata) {
    const res = (await this.WS.post('api/master/import/user/save', {
      data: inputdata,
    }).toPromise()) as ApiResponse;
    const response = res;
    if (response.result == true) {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
    if (this.isValid == false) {
      this.saveResponse.next(response);
    }
  }
  async saveUserByImport(inputData: any, remoteids: any): Promise<void> {
    const res = await this.WS.post('api/master/import/user/save', {
      inputData: inputData,
      remoteId: remoteids,
    }).toPromise();
    const response = res;
    this.saveResponse.next(response);

    this.remoteids = [];
    this.isValid = false;
  }
}
export interface IUserImport {
  name?: string;
  remoteUserID?: string;
  mobile?: string;
  email?: string;
  type?: number;
  UserType?: string;
  roles?: string;
  lounges?: string;
  status?: string;
  OutletName?: string;
  businessLine?: string;
  PartnerName?: string;
}
interface ApiResponse {
  result: boolean;
  tag: string;
}
