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
import { IAction } from '../action/action.component';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';

// const ELEMENT_DATA: IModule[] = [
//   {
//     moduleName: 'my module 1',
//     moduleShortName: 'MOD',
//     moduleDescription: 'this is module 1',
//     helpUrl: 'https//module1',
//     status: true},
//     {
//       moduleName: 'my module 2',
//       moduleShortName: 'MOD2',
//       moduleDescription: 'this is module 2',
//       helpUrl: 'https//module3',
//       status: true},
//     {
//         moduleName: 'my module 3',
//         moduleShortName: 'MOD3',
//         moduleDescription: 'this is module 3',
//         helpUrl: 'https//module3',
//         status: true},
// ];
declare var $;
@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css'],
})
export class ModuleComponent implements OnInit, AfterViewInit {
  @ViewChild('moduleName') moduleName: ElementRef;
  @ViewChild('moduleShortName') moduleShortName: ElementRef;
  @ViewChild('moduleDescription') moduleDescription: ElementRef;
  @ViewChild('helpUrl') helpUrl: ElementRef;
  @ViewChild('status') status: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('moduleSort') moduleSort: MatSort;
  // @ViewChild(MatSort) partnerSort: MatSort;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('actionSort') actionSort: MatSort;
  @ViewChild('actionName') actionName: ElementRef;
  @ViewChild('actionShortName') actionShortName: ElementRef;
  @ViewChild('actionDescription') actionDescription: ElementRef;
  @ViewChild('actionUrl') actionUrl: ElementRef;
  public isSidebarOpen = true;
  public showModuleDetails = false;
  public showImport: boolean;
  public showData: boolean;
  public addNewAction = false;
  private languageSubscription: Subscription = null;
  public importValidator: ModuleValidator;
  public data: ILanguage;
  public ExportLoader = false;
  public exportloaderMessage = '';
  public authenticatedUser: IUser;
  private userSub: Subscription;
  // tslint:disable-next-line: variable-name
  _id: string;
  public mod = [];
  public dataSourceModule: MatTableDataSource<IModule>;
  // public displayedModuleColumn: string[] = ['moduleName', 'moduleShortName', 'moduleDescription', 'helpUrl', 'status'];
  public displayedModuleColumn: string[] = [
    'moduleName',
    'moduleShortName',
    'moduleDescription',
    'status',
    'action',
  ];
  public dataSourceAction: MatTableDataSource<IAction>;
  public displayedActionColumn: string[] = [
    'actionName',
    'actionShortName',
    'actionDescription',
    'action',
    // 'actionUrl',
    // 'status',
  ];
  public moduleToken = {
    _id: '',
    moduleName: '',
    moduleShortName: '',
    moduleDescription: '',
    helpUrl: '',
    status: true,
    actionToken: [],
  };
  public actionToken = {
    moduleId: '',
    _id: '',
    actionName: '',
    actionShortName: '',
    actionDescription: '',
    actionUrl: '',
  };
  public moduleAdvanceSearch = {
    moduleName: '',
    moduleShortName: '',
    status: true,
  };
  public actions: IAction[] = [];
  public moduleData: IModule[] = [];
  public modules: IModule[] = [];
  u: IModule;
  check: any;
  public simpleSearch = '';
  public advanceSearch:boolean=false
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private alerts: AppAlertComponent,
    private toaster: ToastrService,
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
    this.importValidator = new ModuleValidator(this.WS, this.u, this.toaster);
    // console.log(this.route.snapshot.queryParams.n);
    // console.log(this.route.snapshot.queryParams.n);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showModuleDetails = true;
    }
    this.getModule();
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
  }
  // This functionality is to Add New Module function for Module Screen
  addNewModule(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('MODULE')
    );
    if (matchPermission && matchPermission['MODULE'].includes('NEW')) {
      this.showModuleDetails = isshow;
      this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.module.accessdenied : 'Access denied'}`
      );
    }
  }
  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('MODULE')
    );
    if (matchPermission && matchPermission['MODULE'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.module.accessdenied : 'Access denied'}`
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
  // This is to Hide Module Details Function for Module Screen
  hideModuleDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showModuleDetails = false;
    } else {
      this.showModuleDetails = false;
    }
    this.showModuleDetails = false;
    // this.resetModule();
    this.moduleToken = {
      _id: '',
      moduleName: '',
      moduleShortName: '',
      moduleDescription: '',
      helpUrl: '',
      status: true,
      actionToken: [],
    };
    if (this.simpleSearch.trim() === '') {
      // this.getModule();
      if(this.advanceSearch){
        this.advanceModuleSearch();
      }
     this.getModule();

    } else {
      this.simpleSearchModuleData(this.simpleSearch)
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInputFunction();
    }, 50);
  }
  // Input Search Function for module screen
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

  //Delete Module Function For Module Screen

  public deleteModule(moduleID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('MODULE')
    );
    if (matchPermission && matchPermission['MODULE'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.module.deletemoduleconfirmation
            : 'Delete Module Confirmation!'
        }`,
        message: `${
          this.data
            ? this.data.master.module.areyousureyouwanttodeletethismodule
            : 'Are you sure you want to delete this Module?'
        }`,
        labelConfirm: `${this.data ? this.data.master.module.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.module.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/module/delete', { id: moduleID }).subscribe(
            (res: IResponse) => {
              if (res.status === 1) {
                this.moduleData.splice(
                  this.moduleData.findIndex(
                    (i) => i._id === res.result.deleteId
                  ),
                  1
                );
                this.mapGlobalSettingsOnData();
                this.toaster.success(res.description);
              } else {
                console.log(res.description);
              }
            }
          );
        } else {
          console.log('Dont delete entry yet');
        }
      });
    } else {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.module.accessDeniedformoduleMODULEactionDELETE
            : 'Access Denied for module MODULE action DELETE'
        }`
      );
    }
  }
  //Delete Action Function For Module Screen
  public deleteAction(ID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('MODULE')
    );
    if (matchPermission && matchPermission['MODULE'].includes('DELETE')) {
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
          // console.log('slkoe', ID);

          // this.check = this.moduleToken.actionToken.filter((p) => p._id === ID);
          // console.log("fgfhgfhg", this.check);
          this.WS.post('api/master/module/action/delete', {
            id: this.moduleToken._id,
            // moduleID: this.check[0].moduleId._id,
            // actionID: this.check[0].actionId._id,
            // _id: this.saveUpdateToken._id,
            ID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.moduleToken.actionToken =
                this.moduleToken.actionToken.filter((p) => p._id !== ID);
              this.mapTableAction();
              // console.log("sddsdds", this.moduleToken.actionToken);
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
            ? this.data.master.module.accessDeniedformoduleMODULEactionDELETE
            : 'Access Denied for module MODULE action DELETE'
        }`
      );
    }
  }
  public getTableClickActionData(id: string): void {
    this.getActionById(id);
  }
  //Get Action by ID for Module Screen
  public getActionById(actionId: string): void {
    this.WS.post('api/master/action/fetch/id', { id: actionId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // this.resetAction();
          const action: IAction = res.result.actions;
          // this.photos = res.result.vendors[0].photos;
          // console.log("cccoOOMMM", this.photos);
          this.actionToken = {
            moduleId: action.moduleId,
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

  public backToResults(): void {
    this.showImport = false;
    this.getModule();
  }
  public mapTableAction(): void {
    this.dataSourceAction = new MatTableDataSource(
      this.moduleToken.actionToken
    );
    this.dataSourceAction.sort = this.actionSort;
    this.dataSourceAction.paginator = this.paginator;
  }

  //Set Token Action For module Screen
  public setTokenAction(action: IAction, type: string): void {
    if (type === 'search') {
      // console.log('9898', action);
      this.actionToken.actionName = action.actionName;
      this.actionToken._id = action._id;
      this.actions = [];
    } else {
      this.getActionById(action._id);
      // this.editAction(action);
      this.actions = [];
    }
  }
  //Set Token  module Function For module screen
  public setTokenModule(module: IModule, type: string): void {
    if (type === 'search') {
      // console.log('9898', module);
      this.moduleAdvanceSearch.moduleName = module.moduleName;
      this.modules = [];
    } else {
      this.getTableClickData(module._id);
      // this.editAction(action);
      this.modules = [];
    }
  }

  //Search Action Function for module Screen
  public filterActionSearch(): void {
    this.WS.post('api/master/module/filter/search', {
      id: this.moduleToken._id,
      keyword: this.actionToken.actionName,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.moduleToken.actionToken = [];
        this.moduleToken.actionToken = res.result;
        this.mapTableAction();
        this.toaster.success(res.description);
      } else if (res.status === 0) {
        this.moduleToken.actionToken = [];
        this.mapTableAction();
        this.toaster.info(res.description);
      } else if (res.status === 2) {
        this.moduleToken.actionToken = [];
        this.mapTableAction();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }

  //Fetch Modules function for module Screen
  public fetchModuleNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/module/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            // console.log('MOdule', res.result.modules);
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

  //Fetch Action Names function for module screen
  public fetchActionNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/action/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            // console.log('2225', res.result.actions);
            this.actions = res.result.actions as IAction[];
            // this.actionToken.actionName = res.result.actions[0].actionName;
            // this.actionToken.actionShortName = res.result.actions[0].actionShortName;
            // this.actionToken.actionDescription = res.result.actions[0].actionDescription;
            // this.actionToken.actionUrl = res.result.actions[0].actionUrl;
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

  private mapGlobalSettingsOnData(): void {
    // if (this.moduleData.length)
    // {
    //   this.moduleData.map(token => {
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
    this.dataSourceModule = new MatTableDataSource(this.moduleData);
    this.dataSourceModule.sort = this.moduleSort;
    this.dataSourceModule.paginator = this.paginator;
  }
  public getTableClickData(id: string): void {
    this.getModuleById(id);
  }
  //Get Module By ID function for module screen
  public getModuleById(moduleId: string): void {
    this.WS.post('api/master/module/fetch/id', { id: moduleId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.resetModule();
          const module: IModule = res.result.modules[0];
          // this.photos = res.result.vendors[0].photos;
          // console.log("cccoOOMMM", this.photos);
          this.moduleToken = {
            _id: module._id,
            moduleName: module.moduleName,
            moduleShortName: module.moduleShortName,
            moduleDescription: module.moduleDescription,
            helpUrl: module.helpUrl,
            status: module.status,
            actionToken: res.result.modules[0].actions,
          };
          this.mapTableAction();
          this.showModuleDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

   // This is Simple Search function for module screen
  public simpleSearchModuleData(value): void {
    this.advanceSearch=false
    // console.log(value);
    this.WS.post('api/master/module/simpleSearchModuleData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.moduleData = res.result;
        this.mapGlobalSettingsOnData();
        // this.dataSourceModule = new MatTableDataSource(this.moduleData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.moduleData = [];
        this.mapGlobalSettingsOnData();
        // this.dataSourceModule = new MatTableDataSource(this.moduleData);
        // this.dataSourceModule.sort = this.moduleSort;
        // this.dataSourceModule.paginator = this.paginator;
        this.toaster.info('No Data Found');
      } else {
        console.log(res.description);
      }
    });
  }

  //Submit Module function for submit details
  public submitModuleDetails(): void {
    this.saveModule();
    this.showModuleDetails = false;
   // this.getModule();
    this.resetModule();
  }
  //Get Mdoules function for module screen
  public getModule(): void {
    this.simpleSearch='';
    this.advanceSearch=false
    this.WS.post('api/master/module/get').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.moduleData = res.result as IModule[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  // Add function on module screen

  public addAction(): void {
    if (this.moduleToken._id === '') {
      this.toaster.warning(
        `${
          this.data
            ? this.data.master.module.pleasefirstcreatemoduletosaveaction
            : 'Please first create Module to save Action'
        }`
      );
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
    this.actionToken.moduleId = this.moduleToken._id;
    this.WS.post(
      'api/master/module/addAction/save',
      this.actionToken
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toaster.success(res.description);
        // this.moduleToken.actionToken.splice(this.moduleToken.actionToken.findIndex((i) =>
        // i._id === res.result.modaction._id), 1);
        this.moduleToken.actionToken = res.result.modaction.actions;
        this.mapTableAction();
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.info(res.description);
      }
    });
    this.addNewAction = false;
    this.resetActionMoudule();
  }

  //Save Module function for module screen
  public saveModule(): void {
    if (this.moduleToken.moduleName.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.module.pleaseentermodulename
            : 'Please Enter Module Name'
        }`
      );
      // $('#vendorName')
      this.moduleName.nativeElement.focus();
      return;
    }
    if (this.moduleToken.moduleShortName === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.module.pleaseentermoduleshortname
            : 'Please Enter Module Short Name'
        }`
      );
      // $('#moduleType')
      this.moduleShortName.nativeElement.focus();
      return;
    }
    if (this.moduleToken.moduleDescription === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.module.pleaseentermoduledescription
            : 'Please Enter Module Description'
        }`
      );
      // $('#category')
      this.moduleDescription.nativeElement.focus();
      return;
    }
    if (this.moduleToken.helpUrl === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.module.pleaseenterhelpurl
            : 'Please Enter Help Url'
        }`
      );
      // $('#tin')
      this.helpUrl.nativeElement.focus();
      return;
    }
    this.WS.post('api/master/module/save', this.moduleToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.moduleToken = {
            _id: res.result.module._id,
            moduleName: res.result.module.moduleName,
            moduleShortName: res.result.module.moduleShortName,
            moduleDescription: res.result.module.moduleDescription,
            helpUrl: res.result.module.helpUrl,
            status: res.result.module.status,
            actionToken: this.moduleToken.actionToken,
          };
          this.mapTableAction();
          this.mapGlobalSettingsOnData();
          this.toaster.success(res.description);
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      }
    );
  }

  //Reset Module function for module screen
  public resetModule(): void {
    this.moduleToken = {
      _id: '',
      moduleName: '',
      moduleShortName: '',
      moduleDescription: '',
      helpUrl: '',
      status: true,
      actionToken: [],
    };
    this.resetActionMoudule();
  }

  //Reset Action Modules for module screen
  public resetActionMoudule(): void {
    this.actionToken = {
      moduleId: '',
      _id: '',
      actionName: '',
      actionShortName: '',
      actionDescription: '',
      actionUrl: '',
    };
  }
  //Edit Action Function for module screen
  public editAction(actions): void {
    this.actionToken = {
      moduleId: '',
      _id: actions._id,
      actionName: actions.actionName,
      actionShortName: actions.actionShortName,
      actionDescription: actions.actionDescription,
      actionUrl: actions.actionUrl,
    };
    this.addNewAction = true;
  }
  // advance search function for module screen
  public advanceModuleSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true;
    this.WS.post(
      'api/master/module/advance/search',
      this.moduleAdvanceSearch
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.moduleData = res.result as IModule[];
        // this.dataSourceMain = new MatTableDataSource(this.vendorData);
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.moduleData = [];
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
    this.moduleAdvanceSearch = {
      moduleName: '',
      moduleShortName: '',
      status: true,
    };
  }

  // Export Report Functio From module screen
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('MODULE')
    );
    if (matchPermission && matchPermission['MODULE'].includes('EXPORT')) {
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
    this.modules.length = 0;
    this.actions.length = 0;
  }

  tokenModuleSearchSuggestionIndex = -1;

  onTokenModuleSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenModuleSearchSuggestionIndex = Math.max(
          this.tokenModuleSearchSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenModuleSearchSuggestionIndex = Math.min(
          this.tokenModuleSearchSuggestionIndex + 1,
          this.modules.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenModuleSearchSuggestionIndex >= 0) {
          this.setTokenModule(
            this.modules[this.tokenModuleSearchSuggestionIndex],
            'search'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenModulePopulateSuggestionIndex = -1;

  onTokenModulePopulateInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenModulePopulateSuggestionIndex = Math.max(
          this.tokenModulePopulateSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenModulePopulateSuggestionIndex = Math.min(
          this.tokenModulePopulateSuggestionIndex + 1,
          this.modules.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenModulePopulateSuggestionIndex >= 0) {
          this.setTokenModule(
            this.modules[this.tokenModulePopulateSuggestionIndex],
            'populate'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenActionSearchSuggestionIndex = -1;

  onTokenActionSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionSearchSuggestionIndex = Math.max(
          this.tokenActionSearchSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionSearchSuggestionIndex = Math.min(
          this.tokenActionSearchSuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionSearchSuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionSearchSuggestionIndex],
            'search'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenActionPopulateSuggestionIndex = -1;

  onTokenActionPopulateInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionPopulateSuggestionIndex = Math.max(
          this.tokenActionPopulateSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionPopulateSuggestionIndex = Math.min(
          this.tokenActionPopulateSuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionPopulateSuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionPopulateSuggestionIndex],
            ''
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

class ModuleValidator extends AbstractValidator<IModule> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public loadershow = false;
  public eachValue: Subject<IModule>;
  public title = 'Import Module';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Module Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/Import_Module.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Module Name',
      {
        column: 'Module Name',
        key: 'moduleName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Module Short Name',
      {
        column: 'Module Short Name',
        key: 'moduleShortName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Module Description',
      {
        column: 'Module Description',
        key: 'moduleDescription',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Help Url',
      {
        column: 'Help Url',
        key: 'helpUrl',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IModule = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IModule>();
    this.fileSubject = new Subject<File>();

    this.fileSubject.subscribe((v) => {
      // console.log('received value from fileSubject - ', v);
      this.callToCreatePresigned(v);
    });
    setTimeout(() => {
      this.eachValue.subscribe((v: any) => {
        setTimeout(() => {
          // console.log('received value from import - ', v);
          this.callSaveModuleWebService(v);
        }, 1500);
      });
    }, 2000);
  }

  callToCreatePresigned(file: File): void {
    const nameSplits = file.name.split('.');
    this.WS.post('api/master/s3/presignedURL', {
      type: 'Module',
      extension: nameSplits[nameSplits.length - 1],
      contentType: file.type,
      fileName: nameSplits[0],
    }).subscribe((res: any) => {
      // console.log(res);
      this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
        (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              // console.log('Request has been made!');
              break;
            case HttpEventType.ResponseHeader:
              // console.log('Response header has been received!');
              break;
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              // console.log(event.type);
              this.WS.post('api/master/fileImportExport/save/import', {
                path: res.result.urlInfo.key,
                type: 'Module',
                fileName: file.name,
                activity: 'Import',
                extension: nameSplits[nameSplits.length - 1],
              }).subscribe((re: IResponse) => {
                // console.log(re.result);
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

  callSaveModuleWebService(inputData: any): void {
    this.WS.uploadMultipleFile(
      'api/master/module/save/import',
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
      // console.log(inputData.indexNo);
      // console.log(res);
      this.saveResponse.next(JSON.parse(res));
    });
    setTimeout(() => {
      if (inputData.indexNo === inputData.filelength) {
        // console.log(inputData.indexNo, inputData.filelength);
        // console.log(this.success, this.failure);
        // console.log(this.importFileId);
        this.WS.post('api/master/fileImportExport/save/import', {
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
export class IModule {
  // tslint:disable-next-line: variable-name
  _id: string;
  moduleName: string;
  moduleShortName: string;
  moduleDescription: string;
  helpUrl: string;
  status: boolean;
}
