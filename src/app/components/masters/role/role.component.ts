import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IResponse } from 'src/app/models/server-data-source.model';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { IAction } from '../action/action.component';
import { IModule } from '../module/module.component';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { P } from '@angular/cdk/keycodes';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { IUserLounge } from '../lounge/lounge.component';

// const ELEMENT_DATA: IRole[] = [
//   {
//     roleName: 'my role 1',
//     roleShortName: 'ROLE',
//     roleDescription: 'this is role 1',
//     status: true},
//     {
//       roleName: 'my role 2',
//       roleShortName: 'ROLE2',
//       roleDescription: 'this is role 2',
//       status: true},
//     {
//         roleName: 'my role 3',
//         roleShortName: 'ROLE3',
//         roleDescription: 'this is role 3',
//         status: true},
// ];
declare var $;
@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
})
export class RoleComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) actpaginator: MatPaginator;
  @ViewChild('roleSort') roleSort: MatSort;
  @ViewChild('roleName') roleName: ElementRef;
  @ViewChild('roleShortName') roleShortName: ElementRef;
  @ViewChild('roleDescription') roleDescription: ElementRef;
  @ViewChild('roleUrl') roleUrl: ElementRef;
  @ViewChild('status') status: ElementRef;
  // @ViewChild(MatSort) partnerSort: MatSort;
  @ViewChild('actionSort') actionSort: MatSort;
  @ViewChild('actionSortD') actionSortD: MatSort;
  @ViewChild('actionName') actionName: ElementRef;
  @ViewChild('actionShortName') actionShortName: ElementRef;
  @ViewChild('actionDescription') actionDescription: ElementRef;
  @ViewChild('actionUrl') actionUrl: ElementRef;
  @ViewChild('actionNameD') actionNameD: ElementRef;
  @ViewChild('actionShortNameD') actionShortNameD: ElementRef;
  @ViewChild('actionDescriptionD') actionDescriptionD: ElementRef;
  @ViewChild('actionUrlD') actionUrlD: ElementRef;
  @ViewChild('moduleName') moduleName: ElementRef;
  @ViewChild('moduleNameD') moduleNameD: ElementRef;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public addNewUser = false;
  public isSidebarOpen = true;
  public showRoleDetails = false;
  public showImport: boolean;
  public showData: boolean;
  public addNewAction = false;
  public addNewActionD = false;
  private languageSubscription: Subscription = null;
  public importValidator: RoleValidator;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public ExportLoader = false;
  public exportloaderMessage = '';
  public filterArr: [] = [];
  userData: IUserLounge[] = [];
  public roleToken = {
    _id: '',
    roleName: '',
    roleShortName: '',
    roleDescription: '',
    status: true,
    actionAllow: [],
    actionDeny: [],
  };
  public actionToken = {
    moduleId: '',
    roleId: '',
    _id: [],
    actionName: '',
    actionShortName: '',
    actionDescription: '',
    actionUrl: '',
  };
  public actionTokenD = {
    moduleId: '',
    denyroleId: '',
    _id: '',
    actionName: '',
    actionShortName: '',
    actionDescription: '',
    actionUrl: '',
  };
  public moduleToken = {
    _id: '',
    moduleName: '',
    moduleShortName: '',
    moduleDescription: '',
    helpUrl: '',
    status: true,
    actionToken: [],
  };
  public roleAdvanceSearch = {
    roleName: '',
    roleShortName: '',
    status: true,
  };
  public actions: IAction[] = [];
  public moduleData: IModule[] = [];
  public modules: IModule[] = [];
  public ModuleToken: IAction[] = [];

  // public dataSourceRole: MatTableDataSource<IRole>;
  // public displayedRoleColumn: string[] = ['roleName', 'roleShortcode', 'roleDescription', 'status'];
  public dataSourceRole: MatTableDataSource<IRole>;
  public displayedRoleColumn: string[] = [
    'roleName',
    'roleShortName',
    'roleDescription',
    'status',
  ];
  public dataSourceAction: MatTableDataSource<IAction>;
  public dataSourceActionDeny: MatTableDataSource<IAction>;
  public displayedActionColumn: string[] = [
    'moduleName',
    'actionName',
    'actionShortName',
    'actionDescription',
    'action',
    // 'actionUrl',
    // 'status',
  ];
  public displayedActionColumnD: string[] = [
    'moduleName',
    'actionName',
    'actionShortName',
    'actionDescription',
    'action',
    // 'actionUrl',
    // 'status',
  ];
  public dataSourceUser: MatTableDataSource<IUserLounge>;
  // public displayedUserColumns: string[] = [
  //   'name'
  // ];
  public displayedUserColumns: string[] = [
    'name',
    'role',
    'mobileNo',
    'emailId',
    'status',
  ];
  _id: string;
  finalaction: IAction[] = [];
  arr: IAction[] = [];
  finArr: IAction[] = [];
  public roleData: IRole[] = [];
  public roles: IRole[] = [];
  u: IRole;
  check: any[];
  checkDeny: any[];
  filterModName: string;
  filterModid: string;
  filterActName: string;
  filterActid: string;
  public simpleSearch = '';
  public advanceSearch:boolean=false
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private alerts: AppAlertComponent,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) {
    this.showImport = false;
  }
  ngAfterViewInit(): void {
    this.searchInputFunction();
    $('#query1').hide();
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this).find('~ label, ~ span:nth-of-type(n+3)').addClass('not-empty');
      } else {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .removeClass('not-empty');
      }
    });
    $('.search-input input ~ span:nth-of-type(4)').click(function () {
      $('.search-input input').val('');
      $('.search-input input')
        .find('~ label, ~ span:nth-of-type(n+3)')
        .removeClass('not-empty');
    });

    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection__choice__remove')
            .length ||
          $(event.target).parent('.select2-selection__choice__remove').length ||
          $(event.target).parent('.searchSuggestions').length
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

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new RoleValidator(this.WS, this.u, this.toaster);

    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showRoleDetails = true;
    }
    this.getRole();
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
  }

  // ADD new users
  addNewRole(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ROLE')
    );
    if (matchPermission && matchPermission['ROLE'].includes('NEW')) {
      this.showRoleDetails = isshow;
      this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.role.accessdenied : 'Access denied'}`
      );
    }
  }
  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ROLE')
    );
    if (matchPermission && matchPermission['ROLE'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.role.accessdenied : 'Access denied'}`
      );
    }
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
  hideRoleDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showRoleDetails = false;
    } else {
      this.showRoleDetails = false;
    }
    this.showRoleDetails = false;
    this.resetRole();
    if (this.simpleSearch.trim() === '') {
      // this.getRole();
      if(this.advanceSearch){
        this.advanceRoleSearch()
      }else{
        this.getRole()
      }
    } else {
      this.simpleSearchRoleData(this.simpleSearch)
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInputFunction();
    }, 50);
  }

  public searchInputFunction(): void {
    if (this.simpleSearch.trim() !== '') {
      $('.search-input input').focus();
    }
    $('#query1').hide();
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this).find('~ label, ~ span:nth-of-type(n+3)').addClass('not-empty');
      } else {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .removeClass('not-empty');
      }
    });
    $('.search-input input ~ span:nth-of-type(4)').click(function () {
      $('.search-input input').val('');
      $('.search-input input')
        .find('~ label, ~ span:nth-of-type(n+3)')
        .removeClass('not-empty');
    });
  }

  // This function is get all the users
  public getUserRole(): void {
    let role_id = this.roleToken._id;
    this.WS.post('api/master/role/fetchUserRoleData', {
      role_id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userData = res.result;
        this.dataSourceUser = new MatTableDataSource(this.userData);
        this.dataSourceUser.sort = this.roleSort;
        this.dataSourceUser.paginator = this.paginator;
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  public backToResults(): void {
    this.showImport = false;
    // this.getPincode();
    this.getRole();
  }
  public setTokenRole(role: IRole, type: string): void {
    if (type === 'search') {
      this.roleAdvanceSearch.roleName = role.roleName;
      this.roles = [];
    } else {
      this.getTableClickData(role._id);
      this.roles = [];
    }
  }
  // This is to delete a action
  public deleteAction(ID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ROLE')
    );
    if (matchPermission && matchPermission['ROLE'].includes('DELETE')) {
      // const alert: IAlert = {
      //   title: 'Confirm Delete',
      //   message:
      //     'You are about to delete a Action. \n\nDo you want to continue?',
      //   labelConfirm: 'Yes',
      //   labelCancel: 'No',
      //   textColor: 'red',
      // };
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.action.deleteactionconfirmation
            : 'Delete Action Confirmation!'
        }`,
        message: `${
          this.data
            ? this.data.master.action.areyousureyouwanttodeletethisaction
            : 'Are you sure you want to delete this Action?'
        }`,
        labelConfirm: `${this.data ? this.data.master.action.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.action.no : 'No'}`,
        textColor: 'red',
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.check = this.roleToken.actionAllow.filter((p) => p._id === ID);

          this.WS.post('api/master/role/action/delete', {
            id: this.roleToken._id,
            moduleID: this.check[0].moduleId._id,
            actionID: this.check[0].actionId._id,
            // _id: this.saveUpdateToken._id,
            ID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.roleToken.actionAllow = this.roleToken.actionAllow.filter(
                (p) => p._id !== ID
              );
              this.mapTableAction();

              this.toaster.success(res.description);
            } else if (res.status === 2) {
              this.toaster.info(res.description);
            } else {
              this.toaster.error(res.description);
            }
          });
        }
      });
    } else {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.accessDeniedformoduleROLEactionDELETE
            : 'Access Denied for module ROLE action DELETE'
        }`
      );
    }
  }
  public deleteActionDeny(ID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ROLE')
    );
    if (matchPermission && matchPermission['ROLE'].includes('DELETE')) {
      // const alert: IAlert = {
      //   title: 'Confirm Delete',
      //   message:
      //     'You are about to delete a Action. \n\nDo you want to continue?',
      //   labelConfirm: 'Yes',
      //   labelCancel: 'No',
      //   textColor: 'red',
      // };
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.action.deleteactionconfirmation
            : 'Delete Action Confirmation!'
        }`,
        message: `${
          this.data
            ? this.data.master.action.areyousureyouwanttodeletethisaction
            : 'Are you sure you want to delete this Action?'
        }`,
        labelConfirm: `${this.data ? this.data.master.action.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.action.no : 'No'}`,
        textColor: 'red',
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.checkDeny = this.roleToken.actionDeny.filter(
            (p) => p._id === ID
          );

          this.WS.post('api/master/role/actionDeny/delete', {
            id: this.roleToken._id,
            moduleID: this.checkDeny[0].moduleId._id,
            actionID: this.checkDeny[0].actionId._id,
            // _id: this.saveUpdateToken._id,
            ID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.roleToken.actionDeny = this.roleToken.actionDeny.filter(
                (p) => p._id !== ID
              );
              this.mapTableActionDeny();

              this.toaster.success(res.description);
            } else if (res.status === 2) {
              this.toaster.info(res.description);
            } else {
              this.toaster.error(res.description);
            }
          });
        }
      });
    } else {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.accessDeniedformoduleROLEactionDELETE
            : 'Access Denied for module ROLE action DELETE'
        }`
      );
    }
  }
  public fetchRoleNames(keyword: string): void {
    if (keyword.length > 2) {
       ;
      this.WS.post('api/master/role/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.roles = res.result.roles as IRole[];
            if (!this.roles.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.roles = [];
    }
  }
  public saveRole(): void {
    if (this.roleToken.roleName.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.pleaseenterrolename
            : 'Please Enter Role Name'
        }`
      );
      // $('#vendorName')
      this.roleName.nativeElement.focus();
      return;
    }
    if (this.roleToken.roleShortName === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.pleaseenterroleshortname
            : 'Please enter Role Short Name'
        }`
      );
      // $('#roleType')
      this.roleShortName.nativeElement.focus();
      return;
    }
    if (this.roleToken.roleDescription === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.pleaseenterroledescription
            : 'Please enter Role Description'
        }`
      );
      // $('#category')
      this.roleDescription.nativeElement.focus();
      return;
    }
    this.WS.post('api/master/role/save', this.roleToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.roleToken = {
            // moduleId: res.result.moduleId,
            _id: res.result.role._id,
            roleName: res.result.role.roleName,
            roleShortName: res.result.role.roleShortName,
            roleDescription: res.result.role.roleDescription,
            status: res.result.role.status,
            actionAllow: this.roleToken.actionAllow,
            actionDeny: this.roleToken.actionDeny,
          };
          this.mapTableAction();
          this.mapTableActionDeny();
          this.toaster.success(res.description);
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      }
    );
  }
  public getTableClickData(id: string): void {
    this.getRoleById(id);
  }
  public getRoleById(roleId: string): void {
    this.WS.post('api/master/role/fetch/id', { id: roleId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.resetRole();

          const role: IRole = res.result.roles;
          // this.photos = res.result.vendors[0].photos;

          this.roleToken = {
            // moduleId: role.moduleId,
            _id: role._id,
            roleName: role.roleName,
            roleShortName: role.roleShortName,
            roleDescription: role.roleDescription,
            status: role.status,
            actionAllow: role.allow,
            actionDeny: role.deny,
          };
          this.mapTableAction();
          this.mapTableActionDeny();
          this.showRoleDetails = true;
          // this.getUserRole();
          this.filterSearch();
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  // Simple search for user
  public simpleSearchRoleData(value): void {
    this.advanceSearch=false
    this.WS.post('api/master/role/simpleSearchRoleData', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.roleData = res.result;
        this.mapGlobalSettingsOnData();
        // this.dataSourceRole = new MatTableDataSource(this.roleData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.roleData = [];
        this.mapGlobalSettingsOnData();
        // this.dataSourceRole = new MatTableDataSource(this.roleData);
        // this.dataSourceRole.sort = this.roleSort;
        // this.dataSourceRole.paginator = this.paginator;
        this.toaster.info('No Data Found');
      } else {
        console.log(res.description);
      }
    });
  }

  public cloneRole(): void {
    const alert: IAlert = {
      title: `${
        this.data ? this.data.master.role.confirmClone : 'Confirm Clone'
      }`,
      message: `${
        this.data
          ? this.data.master.role.roleclonemessage
          : 'A new role will be created. \n\nDo you want to continue?'
      }`,
      labelConfirm: `${
        this.data ? this.data.master.admissionToken.yes : 'Yes'
      }`,
      labelCancel: `${this.data ? this.data.master.admissionToken.no : 'No'}`,
      textColor: `${
        this.data ? this.data.master.admissionToken.black : 'black'
      }`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
        this.WS.post('api/master/role/clone', {
          _id: this.roleToken._id,
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            this.getRoleById(res.result.roleID);
            $('#roleName').focus();
            this.toaster.success(res.description);
            // this.hideTokensDetails();
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        });
      }
    });
  }
  public getRole(): void {
    this.simpleSearch='';
    this.advanceSearch=false
    this.WS.post('api/master/role/get').subscribe((res: IResponse) => {
      if (res.status === 1) {

        this.roleData = res.result as IRole[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  private mapGlobalSettingsOnData(): void {
    // if (this.roleData.length)
    // {
    //   this.roleData.map(token => {
    //     if (this.vendorTypes.length) {
    //       const matchType = this.vendorTypes.find(t => t.keyCode === token.type);
    //       if (matchType) {
    //         token.displayType = matchType.key1;
    //       }
    //     }
    //     if (this.vendorCategory.length) {
    //       const matchCat = this.vendorCategory.find(t => t.keyCode === token.category);
    //       if (matchCat) {
    //         token.displayCategory = matchCat.key1;
    //       }
    //     }
    //   });
    // }
    this.dataSourceRole = new MatTableDataSource(this.roleData);
    this.dataSourceRole.sort = this.roleSort;
    this.dataSourceRole.paginator = this.paginator;
  }
  public addAction(): void {
    if (this.roleToken._id === '') {
      this.toaster.warning(
        `${
          this.data
            ? this.data.master.role.pleasefirstcreateroletosaveaction
            : 'Please first create Role to save Action'
        }`
      );
      return;
    }
    if (this.moduleToken._id === '') {
      this.toaster.warning(
        `${
          this.data
            ? this.data.master.module.pleasefirstcreatemoduletosaveaction
            : 'Please first create Module to save Action'
        }`
      );
      this.moduleName.nativeElement.focus();
      return;
    }
    if (this.actionToken.actionName.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionname
            : 'Please Enter Action Name'
        }`
      );
      this.actionName.nativeElement.focus();
      return;
    }
    if (this.actionToken.actionShortName === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionshortname
            : 'Please select Action Short Name'
        }`
      );
      this.actionShortName.nativeElement.focus();
      return;
    }
    if (this.actionToken.actionDescription === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseselectactiondescription
            : 'Please select Action Description'
        }`
      );
      this.actionDescription.nativeElement.focus();
      return;
    }
    if (this.actionToken.actionUrl === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionurl
            : 'Please Enter Action Url'
        }`
      );
      this.actionUrl.nativeElement.focus();
      return;
    }
    this.actionToken.roleId = this.roleToken._id;
    this.actionToken.moduleId = this.moduleToken._id;
    this.WS.post('api/master/role/addAction/save', this.actionToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.roleToken.actionAllow = res.result.roleaction.allow;
          this.filterArr = res.result.roleaction.allow;
          this.mapTableAction();
          this.toaster.success(res.description);
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.info(res.description);
        }
      }
    );
    this.addNewAction = false;
    this.resetActionModule();
  }
  public submitRoleDetails(): void {
    this.saveRole();
    this.showRoleDetails = false;
   // this.getRole();
    this.resetRole();
  }
  public addActionDeny(): void {
    // if (this.roleToken._id === '') {
    //   this.toaster.warning('Please first create Role to save Action');
    //   return;
    // }
    if (this.actionTokenD.moduleId === '') {
      this.toaster.warning(
        `${
          this.data
            ? this.data.master.role.invalidmodulename
            : 'Invalid Module Name'
        }`
      );
      this.moduleNameD.nativeElement.focus();
      return;
    }
    if (this.actionTokenD.actionName.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionname
            : 'Please Enter Action Name'
        }`
      );
      this.actionNameD.nativeElement.focus();
      return;
    }
    if (this.actionTokenD._id.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.role.invalidactionname
            : 'Invlaid Action Name'
        }`
      );
      this.actionNameD.nativeElement.focus();
      return;
    }
    if (this.actionTokenD.actionShortName === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionshortname
            : 'Please select Action Short Name'
        }`
      );
      this.actionShortNameD.nativeElement.focus();
      return;
    }
    if (this.actionTokenD.actionDescription === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseselectactiondescription
            : 'Please select Action Description'
        }`
      );
      this.actionDescriptionD.nativeElement.focus();
      return;
    }
    if (this.actionTokenD.actionUrl === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionurl
            : 'Please Enter Action Url'
        }`
      );
      this.actionUrlD.nativeElement.focus();
      return;
    }
    this.actionTokenD.denyroleId = this.roleToken._id;
    this.WS.post(
      'api/master/role/addActionDeny/save',
      this.actionTokenD
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.roleToken.actionDeny = res.result.denyroleaction.deny;
        this.mapTableActionDeny();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.info(res.description);
      }
    });
    this.addNewActionD = false;
    this.resetActionModuleD();
  }
  public mapTableActionDeny(): void {
    this.dataSourceActionDeny = new MatTableDataSource(
      this.roleToken.actionDeny
    );
    this.dataSourceActionDeny.sort = this.actionSort;
    this.dataSourceActionDeny.paginator = this.paginator;
  }
  public mapTableAction(): void {
    this.dataSourceAction = new MatTableDataSource(this.roleToken.actionAllow);
    this.dataSourceAction.sort = this.actionSort;
    this.dataSourceAction.paginator = this.actpaginator;
  }

  public getActionNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/action/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.actions = res.result.actions as IAction[];
            if (!this.actions.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.actions = [];
    }
  }

  public fetchActionNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/actionallow/names/fetch', {
        keyword,
        moduleId: this.moduleToken._id,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.actions = [];
           ;
          this.finalaction = res.result.finalaction;
          this.arr = res.result.arr;
          console.log(this.finalaction);
          for (let k = 0; k < this.finalaction.length; k++) {
            for (let l = 0; l < this.arr.length; l++) {
              if (this.finalaction[k]._id === this.arr[l]._id) {
                this.actions.push(this.arr[l]);
              }
            }
          }
          // this.actions = this.finArr
          // this.actions = res.result.actions[0].actions as IAction[];
          if (!this.actions.length) {
            this.toaster.info('Not found');
          }
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      });
    } else {
      this.actions = [];
    }
  }
  public editAction(action): void {
    this.actionToken = {
      moduleId: action.moduleId,
      roleId: '',
      _id: action._id,
      actionName: action.actionName,
      actionShortName: action.actionShortName,
      actionDescription: action.actionDescription,
      actionUrl: action.actionUrl,
    };
    this.addNewAction = true;
  }
  public editActionD(action): void {
    this.actionTokenD = {
      denyroleId: '',
      moduleId: '',
      _id: action._id,
      actionName: action.actionName,
      actionShortName: action.actionShortName,
      actionDescription: action.actionDescription,
      actionUrl: action.actionUrl,
    };
    this.addNewActionD = true;
  }
  //   public setTokenActionD(action: IAction, type: string): void {
  //     if (type === 'search') {
  //       ;
  //       this.actionToken.actionName = action.actionName;
  //       this.actions = [];
  //     } else {
  //     this.getActionById(action._id);
  //     // this.editAction(action);
  //     this.actions = [];
  //   }
  // }
  public simpleSearchModuleData(value): void {
    this.WS.post('api/master/role/simplesearch', {}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // this.actionToken = {
          //   moduleId = module._id;
          // }
          this.ModuleToken = res.result;
          this.dataSourceAction = new MatTableDataSource(this.ModuleToken);
          this.dataSourceAction.sort = this.actionSort;
          this.dataSourceAction.paginator = this.paginator;
          this.toaster.success(res.description);
        } else {
          this.moduleData = [];
          this.toaster.error(res.description);
        }
      }
    );
  }
  public setTokenAction(action: IAction, type: string): void {
    if (type === 'search') {
      this.actionToken.actionName = action.actionName;
      this.actions = [];
    } else if (type === 'allow') {
      this.getActionById(action._id);
      this.actions = [];
    } else if (type === 'deny') {
      this.getActionDById(action._id);
      this.actions = [];
    }
  }

  public getTokenAction(action: IAction, type: string): void {
    if (type === 'filter') {
      this.filterActName = action.actionName;
      this.filterActid = action._id;
      this.actions = [];
    }
  }

  public getTableClickActionData(id: string): void {
    this.getActionById(id);
  }
  public getActionById(actionId: string): void {
    this.WS.post('api/master/action/fetch/id', { id: actionId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const action: IAction = res.result.actions;
          this.actionTokenD._id = action._id;
          this.actionToken = {
            moduleId: action.moduleId,
            roleId: action.roleId,
            _id: res.result.actions._id,
            actionName: action.actionName,
            actionShortName: action.actionShortName,
            actionDescription: action.actionDescription,
            actionUrl: action.actionUrl,
          };
          // this.showActionDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public getTableClickActionDData(id: string): void {
    this.getActionDById(id);
  }
  public getActionDById(actionId: string): void {
    this.WS.post('api/master/action/fetch/id', { id: actionId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // this.resetAction();
          const action: IAction = res.result.actions;
          // this.photos = res.result.vendors[0].photos;
          this.actionTokenD = {
            denyroleId: action.denyroleId,
            moduleId: this.actionTokenD.moduleId,
            _id: action._id,
            actionName: action.actionName,
            actionShortName: action.actionShortName,
            actionDescription: action.actionDescription,
            actionUrl: action.actionUrl,
          };
          // this.showActionDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public fetchModuleNames(keyword: string): void {
    if (keyword.length > 2) {
       ;
      this.WS.post('api/master/module/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.modules = res.result.modules as IModule[];
            if (!this.modules.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.modules = [];
    }
  }
  public getTableClickDataModule(id: string): void {
    this.getModuleById(id);
  }
  public getModuleById(moduleId: string): void {
    this.WS.post('api/master/module/fetch/id', { id: moduleId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const module: IModule = res.result.modules[0];
          this.moduleToken = {
            _id: module._id,
            moduleName: module.moduleName,
            moduleShortName: module.moduleShortName,
            moduleDescription: module.moduleDescription,
            helpUrl: module.helpUrl,
            status: module.status,
            actionToken: res.result.action,
          };
          this.mapTableAction();
          // this.showModuleDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public setTokenModule(module: IModule, type: string): void {
    if (type === 'search') {
      this.moduleToken.moduleName = module.moduleName;
      this.modules = [];
    }
    if (type === 'allow') {
      this.moduleToken.moduleName = module.moduleName;
      this.moduleToken._id = module._id;
      this.actionToken.moduleId = module._id;
      this.modules = [];
    }
    if (type === 'deny') {
      this.moduleToken.moduleName = module.moduleName;
      this.moduleToken._id = module._id;
      this.actionTokenD.moduleId = module._id;
      this.modules = [];
    }
    if (type === 'filter') {
      this.filterModName = module.moduleName;
      this.filterModid = module._id;
      this.modules = [];
    }
    // else {
    //   this.getTableClickDataModule(module._id);
    //   // this.editAction(action);
    //   this.modules = [];
    // }
  }

  public filterSearch(): void {
    this.WS.post('api/master/role/filterSearch', {
      roleId: this.roleToken._id,
      moduleId: this.filterModid,
      actionId: this.filterActid,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
         ;
        this.roleToken.actionAllow = [];
        if (!this.filterModName && !this.filterActName) {
          this.roleToken.actionAllow = res.result;
        } else if (this.filterModName || this.filterActName) {
          this.filterArr = res.result;
          let n = this.filterArr.length;
          for (let i = 0; i < n; i++) {
            // let reqMID =  res.result[i].moduleId._id;
            // let reqAID =  res.result[i].actionId._id;
            if (this.filterModid && this.filterActid) {
              if (
                this.filterModid === res.result[i].moduleId._id &&
                this.filterActid === res.result[i].actionId._id
              ) {
                this.roleToken.actionAllow.push(res.result[i]);
              }
            } else {
              if (this.filterModid === res.result[i].moduleId._id) {
                this.roleToken.actionAllow.push(res.result[i]);
              } else if (this.filterActid === res.result[i].actionId._id) {
                this.roleToken.actionAllow.push(res.result[i]);
              }
            }
          }
        }

        this.mapTableAction();
        if (this.roleToken.actionAllow.length === 0) {
          this.toaster.info('No Data Found');
        } else {
          this.toaster.success(res.description);
        }
        // this.mapTableAction();
      } else {
        this.moduleData = [];
        this.toaster.error(res.description);
      }
    });
  }

  // public filterSearch(): void {
  //      ;
  //     if (this.filterArr.length>0) {
  //       let n = this.filterArr.length
  //       // const
  //        ;
  //       for (let i = 0; i<n;i++){
  //         let reqID =  this.filterArr[i];
  //         if(this.filterModid === reqID){
  //           this.roleToken.actionAllow = this.filterArr[i]
  //         }
  //       }
  //       // this.filterArr = res.result.roleaction.allow;
  //       this.mapTableAction();
  //       this.toaster.success("Sucessfully Found Action");
  //       // this.mapTableAction();
  //     } else {
  //       this.moduleData = [];
  //       this.toaster.error("Not Found Action");
  //     }
  //   // });
  // }

  resetFilter(): void {
    this.filterActName = '';
    this.filterActid = '';
    this.filterModName = '';
    this.filterModid = '';
  }

  public resetRole(): void {
    this.roleToken = {
      // moduleId: '',
      _id: '',
      roleName: '',
      roleShortName: '',
      roleDescription: '',
      status: true,
      actionAllow: [],
      actionDeny: [],
    };
  }
  public resetActionModuleD(): void {
    (this.moduleToken.moduleName = ''),
      (this.moduleToken._id = ''),
      (this.actionTokenD = {
        denyroleId: '',
        moduleId: '',
        _id: '',
        actionName: '',
        actionShortName: '',
        actionDescription: '',
        actionUrl: '',
      });
  }
  public resetActionModule(): void {
    (this.moduleToken.moduleName = ''),
      (this.moduleToken._id = ''),
      (this.actionToken = {
        moduleId: '',
        roleId: '',
        _id: [],
        actionName: '',
        actionShortName: '',
        actionDescription: '',
        actionUrl: '',
      });
  }

  //advanced search for user
  public advanceRoleSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true

    this.WS.post(
      'api/master/role/advance/search',
      this.roleAdvanceSearch
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.roleData = res.result as IRole[];
        // this.dataSourceMain = new MatTableDataSource(this.vendorData);
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.roleData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
      this.resetAdvanceSearch();
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }
  public resetAdvanceSearch(): void {
    this.roleAdvanceSearch = {
      roleName: '',
      roleShortName: '',
      status: true,
    };
  }

  // export function on user

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ROLE')
    );
    if (matchPermission && matchPermission['ROLE'].includes('EXPORT')) {
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
      this.toaster.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.roles.length = 0;
    this.modules.length = 0;
    this.actions.length = 0;
  }

  tokenRoleSearchSuggestionIndex = -1;

  onTokenRoleSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenRoleSearchSuggestionIndex = Math.max(
          this.tokenRoleSearchSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenRoleSearchSuggestionIndex = Math.min(
          this.tokenRoleSearchSuggestionIndex + 1,
          this.roles.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenRoleSearchSuggestionIndex >= 0) {
          this.setTokenRole(
            this.roles[this.tokenRoleSearchSuggestionIndex],
            'search'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenRolePopulateSuggestionIndex = -1;

  onTokenRolePopulateInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenRolePopulateSuggestionIndex = Math.max(
          this.tokenRolePopulateSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenRolePopulateSuggestionIndex = Math.min(
          this.tokenRolePopulateSuggestionIndex + 1,
          this.roles.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenRolePopulateSuggestionIndex >= 0) {
          this.setTokenRole(
            this.roles[this.tokenRolePopulateSuggestionIndex],
            'populate'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenModuleFilterSuggestionIndex = -1;

  onTokenModuleFilterInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenModuleFilterSuggestionIndex = Math.max(
          this.tokenModuleFilterSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenModuleFilterSuggestionIndex = Math.min(
          this.tokenModuleFilterSuggestionIndex + 1,
          this.modules.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenModuleFilterSuggestionIndex >= 0) {
          this.setTokenModule(
            this.modules[this.tokenModuleFilterSuggestionIndex],
            'filter'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenModuleAllowSuggestionIndex = -1;

  onTokenModuleAllowInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenModuleAllowSuggestionIndex = Math.max(
          this.tokenModuleAllowSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenModuleAllowSuggestionIndex = Math.min(
          this.tokenModuleAllowSuggestionIndex + 1,
          this.modules.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenModuleAllowSuggestionIndex >= 0) {
          this.setTokenModule(
            this.modules[this.tokenModuleAllowSuggestionIndex],
            'allow'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenModuleDenySuggestionIndex = -1;

  onTokenModuleDenyInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenModuleDenySuggestionIndex = Math.max(
          this.tokenModuleDenySuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenModuleDenySuggestionIndex = Math.min(
          this.tokenModuleDenySuggestionIndex + 1,
          this.modules.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenModuleDenySuggestionIndex >= 0) {
          this.setTokenModule(
            this.modules[this.tokenModuleDenySuggestionIndex],
            'deny'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenActionFilterSuggestionIndex = -1;

  onTokenActionFilterInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionFilterSuggestionIndex = Math.max(
          this.tokenActionFilterSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionFilterSuggestionIndex = Math.min(
          this.tokenActionFilterSuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionFilterSuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionFilterSuggestionIndex],
            'filter'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenActionAllowSuggestionIndex = -1;

  onTokenActionAllowInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionAllowSuggestionIndex = Math.max(
          this.tokenActionAllowSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionAllowSuggestionIndex = Math.min(
          this.tokenActionAllowSuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionAllowSuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionAllowSuggestionIndex],
            'allow'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenActionDenySuggestionIndex = -1;

  onTokenActionDenyInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionDenySuggestionIndex = Math.max(
          this.tokenActionDenySuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionDenySuggestionIndex = Math.min(
          this.tokenActionDenySuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionDenySuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionDenySuggestionIndex],
            'deny'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

class RoleValidator extends AbstractValidator<IRole> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public loadershow = false;
  public eachValue: Subject<IRole>;
  public title = 'Import Role';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Role Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/ImportRole.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Role Name',
      {
        column: 'Role Name',
        key: 'roleName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Role Short Name',
      {
        column: 'Role Short Name',
        key: 'roleShortName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Role Description',
      {
        column: 'Role Description',
        key: 'roleDescription',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IRole = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IRole>();
    this.fileSubject = new Subject<File>();

    this.fileSubject.subscribe((v) => {
      this.callToCreatePresigned(v);
    });
    setTimeout(() => {
      this.eachValue.subscribe((v: any) => {
        setTimeout(() => {
          this.callSaveRoleWebService(v);
        }, 1500);
      });
    }, 2000);
  }

  callToCreatePresigned(file: File): void {
    const nameSplits = file.name.split('.');
    this.WS.post('api/master/s3/presignedURL', {
      type: 'Role',
      extension: nameSplits[nameSplits.length - 1],
      contentType: file.type,
      fileName: nameSplits[0],
    }).subscribe((res: any) => {
      this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
        (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;
            case HttpEventType.ResponseHeader:
              break;
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              this.WS.post('api/fileImportExport/save/import', {
                path: res.result.urlInfo.key,
                type: 'Role',
                fileName: file.name,
                activity: 'Import',
                extension: nameSplits[nameSplits.length - 1],
              }).subscribe((re: IResponse) => {
                if (re.status === 1) {
                  this.importFileId = re.result;
                } else if (re.status === 2) {
                  // this.toaster.info(re.description);
                } else {
                  // this.toastr.error(re.description);
                }
              });
          }
        }
      );
    });
  }

  callSaveRoleWebService(inputData: any): void {
    this.WS.uploadMultipleFile(
      'api/master/role/save/import',
      inputData.filedata,
      {
        inputData: inputData.tJSON,
        filelength: inputData.filelength,
        indexNo: inputData.indexNo,
        importId: this.importFileId,
      }
    ).subscribe((res: any) => {
      const response = JSON.parse(res);
      if (response.status === 1) {
        this.loadershow = true;
        this.success = this.success + 1;
        this.toaster.success('Data Updated Successfully');
      } else if (response.status === 0) {
        this.toaster.info('Data Already Exists');
      } else {
        this.failure = this.failure + 1;
      }

      this.saveResponse.next(JSON.parse(res));
    });
    setTimeout(() => {
      if (inputData.indexNo === inputData.filelength) {
        this.WS.post('api/fileImportExport/save/import', {
          id: this.importFileId,
          success: this.success,
          failure: this.failure,
          tCount: inputData.indexNo,
        }).subscribe((r: IResponse) => {
          this.failure = 0;
          this.success = 0;
        });
      }
    }, 1500);
  }
}
export class IRole {
  // tslint:disable-next-line: variable-name
  _id: string;
  roleName: string;
  roleShortName: string;
  roleDescription: string;
  status: boolean;
  allow?: [
    {
      moduleId: string;
      actionId: string;
    }
  ];
  deny?: [
    {
      moduleId: string;
      actionId: string;
    }
  ];
}
