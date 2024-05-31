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
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';

// const ELEMENT_DATA: IAction[] = [
//   {
//     actionName: 'my action 1',
//     actionShortName: 'ACTION',
//     actionDescription: 'this is action 1',
//     actionUrl: 'https//action1',
//     status: true},
//     {
//       actionName: 'my action 2',
//       actionShortName: 'ACTION2',
//       actionDescription: 'this is action 2',
//       actionUrl: 'https//action3',
//       status: true},
//     {
//         actionName: 'my action 3',
//         actionShortName: 'ACTION3',
//         actionDescription: 'this is action 3',
//         actionUrl: 'https//action3',
//         status: true},
// ];
declare var $;
@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.css'],
})
export class ActionComponent implements OnInit, AfterViewInit {
  @ViewChild('actionName') actionName: ElementRef;
  @ViewChild('actionShortName') actionShortName: ElementRef;
  @ViewChild('actionDescription') actionDescription: ElementRef;
  @ViewChild('actionUrl') actionUrl: ElementRef;
  @ViewChild('status') status: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('actionSort') actionSort: MatSort;
  // @ViewChild(MatSort) partnerSort: MatSort;
  public isSidebarOpen = true;
  public showActionDetails = false;
  public showImport: boolean;
  public showData: boolean;
  private languageSubscription: Subscription = null;
  public importValidator: ActionValidator;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public ExportLoader = false;
  public exportloaderMessage = '';
  // tslint:disable-next-line: variable-name
  _id: string;
  // public dataSourceAction: MatTableDataSource<IAction>;
  // public displayedActionColumn: string[] = ['actionName', 'actionShortcode', 'actionDescription', 'ActionUrl', 'status'];
  public dataSourceAction: MatTableDataSource<IAction>;
  public displayedActionColumn: string[] = [
    'actionName',
    'actionShortName',
    'actionDescription',
    // 'actionUrl',
    'status',
  ];
  public actionToken = {
    _id: '',
    actionName: '',
    actionShortName: '',
    actionDescription: '',
    actionUrl: '',
    status: true,
  };
  public actionAdvanceSearch = {
    actionName: '',
    actionShortName: '',
    status: true,
  };
  public actionData: IAction[] = [];
  public actions: IAction[] = [];
  u: IAction;
  public simpleSearch = '';
  public advanceSearch:boolean=false
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
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
    this.importValidator = new ActionValidator(this.WS, this.u, this.toaster);
    // this.importValidator = new PincodeValidator(this.WS, this.u, this.toaster);

    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {

      this.showActionDetails = true;
    }
    this.getAction();
  }
  //This function is to Change Language
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);

  }

  //This is to ADD new Action for action screen like new , save , add etc
  addNewAction(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ACTION')
    );
    if (matchPermission && matchPermission['ACTION'].includes('NEW')) {
      this.showActionDetails = isshow;
      this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
      );
    }
  }
  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ACTION')
    );
    if (matchPermission && matchPermission['ACTION'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;

    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
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
  hideActionDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showActionDetails = false;
    } else {
      this.showActionDetails = false;
    }
    this.showActionDetails = false;
    this.resetAction();
    if (this.simpleSearch.trim() === '') {
      // this.getAction();
      if(this.advanceSearch){
        this.advanceActionSearch();
      }else{
this.getAction();
      }
    } else {
      this.simpleSearchActionData(this.simpleSearch)
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInputFunction();
    }, 50);
  }

  public backToResults(): void {
    this.showImport = false;
    this.getAction();
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
  public setTokenAction(action: IAction, type: string): void {
    if (type === 'search') {
      this.actionAdvanceSearch.actionName = action.actionName;
      this.actions = [];
    } else {
      this.getTableClickData(action._id);
      this.actions = [];
    }
  }

  //This fetch Action Name function for action screen all action that are created
  public fetchActionNames(keyword: string): void {
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

  //Submit Action function action screen
  public saveAction(): void {
    if (this.actionToken.actionName.trim() === '') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.action.pleaseenteractionname
            : 'Please Enter Action Name'
        }`
      );
      // $('#vendorName')
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
      // $('#actionType')
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
      // $('#category')
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
      // $('#tin')
      this.actionUrl.nativeElement.focus();
      return;
    }
    this.WS.post('api/master/action/save', this.actionToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.actionToken = {
            _id: res.result.action._id,
            actionName: res.result.action.actionName,
            actionShortName: res.result.action.actionShortName,
            actionDescription: res.result.action.actionDescription,
            actionUrl: res.result.action.actionUrl,
            status: res.result.action.status,
          };
          // this.getAction();
          this.resetAction();
          this.showActionDetails = false;
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
    this.getActionById(id);
  }

  // Get Action By Id function for action screen
  public getActionById(actionId: string): void {
    this.WS.post('api/master/action/fetch/id', { id: actionId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.resetAction();
          const action: IAction = res.result.actions;
          // this.photos = res.result.vendors[0].photos;


          this.actionToken = {
            _id: action._id,
            actionName: action.actionName,
            actionShortName: action.actionShortName,
            actionDescription: action.actionDescription,
            actionUrl: action.actionUrl,
            status: action.status,
          };
          // this._id = res.result.Pincode._id;
          // this.pincode = res.result.Pincode.pincode;
          // this.countryName = res.result.Pincode.countryName;
          // this.countryISOCode = res.result.Pincode.countryISOCode;
          // this.stateName = res.result.Pincode.stateName;
          // this.cityName = res.result.Pincode.cityName;
          // this.region = res.result.Pincode.region;
          // this.showPincodeDetails = true;
          this.showActionDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  //Simple search for Action screen
  public simpleSearchActionData(value): void {
    this.advanceSearch=false
    this.WS.post('api/master/action/simpleSearchActionData', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.actionData = res.result;
        this.mapGlobalSettingsOnData();
        // this.dataSourceAction = new MatTableDataSource(this.actionData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.actionData = [];
        this.mapGlobalSettingsOnData();
        // this.dataSourceAction = new MatTableDataSource(this.actionData);
        // this.dataSourceAction.sort = this.actionSort;
        // this.dataSourceAction.paginator = this.paginator;
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }

  //Get Action function for action screen
  public getAction(): void {
    this.simpleSearch='';
    this.advanceSearch=false;
    this.WS.post('api/master/action/get').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.actionData = res.result as IAction[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  private mapGlobalSettingsOnData(): void {
    // if (this.actionData.length)
    // {
    //   this.actionData.map(token => {
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
    this.dataSourceAction = new MatTableDataSource(this.actionData);
    this.dataSourceAction.sort = this.actionSort;
    this.dataSourceAction.paginator = this.paginator;
  }

  //Advance Search
  public advanceActionSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true;
    this.WS.post(
      'api/master/action/advance/search',
      this.actionAdvanceSearch
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.actionData = res.result as IAction[];
        // this.dataSourceMain = new MatTableDataSource(this.vendorData);
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.actionData = [];
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

  // resetAction function is getting called
  public resetAction(): void {
    this.actionToken = {
      _id: '',
      actionName: '',
      actionShortName: '',
      actionDescription: '',
      actionUrl: '',
      status: true,
    };
  }
  //Reset Advance Search function for action screen
  public resetAdvanceSearch(): void {
    this.actionAdvanceSearch = {
      actionName: '',
      actionShortName: '',
      status: true,
    };
  }
// export function on action
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('ACTION')
    );
    if (matchPermission && matchPermission['ACTION'].includes('EXPORT')) {
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
    this.actions.length = 0;
  }
  tokenActionSuggestionIndex = -1;

  onTokenActionInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionSuggestionIndex = Math.max(
          this.tokenActionSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionSuggestionIndex = Math.min(
          this.tokenActionSuggestionIndex + 1,
          this.actions.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenActionSuggestionIndex >= 0) {
          this.setTokenAction(
            this.actions[this.tokenActionSuggestionIndex],
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

class ActionValidator extends AbstractValidator<IAction> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public loadershow = false;
  public eachValue: Subject<IAction>;
  public title = 'Import Action';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Action Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/ImportAction.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Action Name',
      {
        column: 'Action Name',
        key: 'actionName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Action Short Name',
      {
        column: 'Action Short Name',
        key: 'actionShortName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Action Description',
      {
        column: 'Action Description',
        key: 'actionDescription',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Action Url',
      {
        column: 'Action Url',
        key: 'actionUrl',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IAction = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IAction>();
    this.fileSubject = new Subject<File>();

    this.fileSubject.subscribe((v) => {
      this.callToCreatePresigned(v);
    });
    setTimeout(() => {
      this.eachValue.subscribe((v: any) => {
        setTimeout(() => {
          this.callSaveActionWebService(v);
        }, 1500);
      });
    }, 2000);
  }

  callToCreatePresigned(file: File): void {
    const nameSplits = file.name.split('.');
    this.WS.post('api/master/s3/presignedURL', {
      type: 'Action',
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

              this.WS.post('api/master/fileImportExport/save/import', {
                path: res.result.urlInfo.key,
                type: 'Action',
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

  callSaveActionWebService(inputData: any): void {
    this.WS.uploadMultipleFile(
      'api/master/action/save/import',
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
export class IAction {
  // tslint:disable-next-line: variable-name
  moduleId: string;
  _id: string;
  actionName: string;
  actionShortName: string;
  actionDescription: string;
  actionUrl: string;
  status: boolean;
  roleId: string;
  denyroleId: string;
}
