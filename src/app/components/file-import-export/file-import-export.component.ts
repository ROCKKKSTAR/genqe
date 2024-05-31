import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { MatTableExporterDirective } from 'mat-table-exporter';
import {
  IErrorStatus,
  IFileImport,
} from 'src/app/models/fileImportExport.interface';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import {
  IFileImportExport,
  ILanguage,
} from 'src/app/models/language.interface';
import { IPartner } from 'src/app/models/partner.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import {
  AbstractValidator,
  IColumn,
} from '../import/validators/abstract-validator.interface';
import {
  DataValidatorDate,
  DataValidatorRequired,
} from '../import/validators/validator.functions';
import { AdmissionPartnerEntitlementValidator } from '../masters/admission-token/admission-token.component';
import { OutletPartnerValidator } from '../masters/lounge/lounge.component';
import { PartnerValidator } from '../masters/partner/partner.component';
import { ProductPartnerValidator } from '../masters/product/product.component';
import { environment as env } from 'src/environments/environment';
import { Location } from '@angular/common';
declare var $;

export interface FileElement {
  rowNo: number;
  columnNo: number;
  columnName: string;
  columnData: string;
  errorDescription: string;
}
@Component({
  selector: 'app-file-import-export',
  templateUrl: './file-import-export.component.html',
  styleUrls: ['./file-import-export.component.css'],
})
export class FileImportExportComponent implements OnInit, AfterViewInit {
  @ViewChild('sort') sort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('errorSort') errorSort: MatSort;
  @ViewChild('errorpaginator') errorpaginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public importValidator = null;
  public isSidebarOpen = true;
  public showData: boolean;
  public showImport: boolean;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public dataSource: MatTableDataSource<IFileImportExport>;
  public displayedColumn: string[] = [
    '_id',
    'entity',
    'fileName',
    'partnerName',
    'fileFormatType',
    'activity',
    'recordProcessed',
    'recordSuccess',
    'email',
    'lastModifiedOn',
    'status',
    'action',
  ];
  public dataSourceError: MatTableDataSource<IErrorStatus>;
  public displayedErrorColumn: string[] = [
    'columnName',
    'rowNo',
    'columnNo',
    'columnData',
    'createdOn',
  ];
  public fileData: IFileImportExport[] = [];
  public errorData: IErrorStatus[] = [];
  public hideErrorDetail = false;
  public statusMap = {
    1: 'Success',
    2: 'Partial Success',
    3: 'In Process',
    0: 'Failure',
  };
  public searchToken = {
    partner: {
      _id: '',
      name: '',
    },
    fileName: '',
    type: '',
    fromDate: '',
    toDate: '',
    status: '',
  };
  public importfileType = 0;
  public showImportScreen = false;
  public partners: IPartner[] = [];
  public partnerToken: IPartner = {
    _id: '',
    name: '',
  };
  public importFileList: IGlobalSetting[] = [];
  private languageSubscription: Subscription = null;
  public loadershow = false;
  public loaderMessage = '';
  public simpleSearch = '';
  public showadvanceSearch:boolean=false
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private WS: WebService,
    private cs: CommonServiceService,
    private toastr: ToastrService,
    private auth: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.loadershow = true;
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    if (
      this.route.snapshot.queryParams.id &&
      this.route.snapshot.queryParams.id !== ''
    ) {
      this.getErrorImportData(this.route.snapshot.queryParams.id);
      this.location.replaceState('/file-import-export');
      this.hideErrorDetail = true;
      this.loadershow = false;
    } else {
      this.fetchFIleImportExport();
      this.fetchImportFileList('IMPORT_FILES');
    }
  }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  private fetchImportFileList(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.importFileList = res.result.values as IGlobalSetting[];
        if (this.importFileList.length && this.partnerToken.type === 0) {
          this.importfileType = this.importFileList[0].keyCode;
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  ngAfterViewInit(): void {
    this.searchInput();

    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection__choice__remove')
            .length ||
          $(event.target).parent('.searchSuggestions').length ||
          $(event.target).parent('.select2-selection__choice__remove').length
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

  public searchInput(): void {
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

  showQueryForm(): void {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }

  public hideErrorDetails(): void {
    this.hideErrorDetail = false;
    // this.fetchFIleImportExport();
    if(this.simpleSearch.trim()===""){
      if(this.showadvanceSearch){
        this.advanceSearch()
      }else{
        this.fetchFIleImportExport();
      }
    }else{
      this.simpleSearchData(this.simpleSearch);
    }
  }

  public backToResults(): void {
    this.showImport = false;
    this.showImportScreen = false;
    this.importfileType = 0;
    this.importValidator = null;
    this.resetImport();
    this.fetchFIleImportExport();
  }

  hideImportFileDetails(): void {
    this.showImportScreen = false;
    // window.location.reload();
    // this.ngOnInit();


    if(this.simpleSearch.trim()===""){
      if(this.showadvanceSearch){
        this.advanceSearch()
      }else{
        this.fetchFIleImportExport();
      }
    }else{
      this.simpleSearchData(this.simpleSearch);
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInput();
    }, 50);
  }

  public showFilesImport(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('FILE_IMPORT_EXPORT')
    );
    if (
      matchPermission &&
      matchPermission['FILE_IMPORT_EXPORT'].includes('NEW')
    ) {
      this.showImportScreen = true;
    } else {
      this.toastr.info(
        `${
          this.data ? this.data.fileImportExport.accessDenied : 'Access Denied'
        }`
      );
      // this.toastr.info('Access denied');
    }
  }

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

  public setTokenPartner(partner: IPartner): void {
    this.searchToken.partner.name = partner.name;
    this.searchToken.partner._id = partner._id;
    this.partnerToken.name = partner.name;
    this.partnerToken._id = partner._id;
    this.partners = [];
  }

  public fetchFIleImportExport(): void {
    this.loadershow = true;
    this.simpleSearch='';
    this.showadvanceSearch=false;
    this.WS.post('api/master/fileImportExport/fetch', {}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.fileData = res.result.fileImportData as IFileImportExport[];
          this.dataSource = new MatTableDataSource(this.fileData);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.toastr.success(res.description);
          this.loadershow = false;
        } else if (res.status === 2) {
          this.loadershow = false;
          this.toastr.info(res.description);
        } else {
          this.loadershow = false;
          this.toastr.error(res.description);
        }
      }
    );
  }

  public getErrorImportData(fileId: string): void {
    this.WS.post('api/master/fileImportExport/fetch/error/status', {
      id: fileId,
    }).subscribe((res: IResponse) => {
      this.hideErrorDetail = true;
      if (res.status === 1) {
        this.toastr.success(res.description);
        // this.hideErrorDetail = true;
        this.errorData = res.result.errorFileStatus as IErrorStatus[];
        this.dataSourceError = new MatTableDataSource(this.errorData);
        this.dataSourceError.sort = this.errorSort;
        this.dataSourceError.paginator = this.errorpaginator;
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public downloadFile(url: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('FILE_IMPORT_EXPORT')
    );
    if (
      matchPermission &&
      matchPermission['FILE_IMPORT_EXPORT'].includes('DOWNLOAD')
    ) {
      this.WS.post(
        'api/admission/order/awspublicURL',
        { url: url },
        'ADMISSION'
      ).subscribe((res: any) => {
        // const res = r.decrypted;
        if (res.status === 1) {
          window.open(res.result.signedURL, 'blank');
        } else {
          console.log('getting error');
        }
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.role.accessdenied : 'Access denied'}`
      );
    }
  }

  public simpleSearchData(value): void {
    this.loadershow = true;
    this.showadvanceSearch=false;
    this.WS.post('api/master/fileImportExport/search/simple', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      if (res.result !== null) {
        this.fileData = res.result.fileImportData as IFileImportExport[];
      } else {
        this.fileData = [];
      }
      this.dataSource = new MatTableDataSource(this.fileData);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.loadershow = false;
    });
  }

  public advanceSearch(): void {
    this.loadershow = true;
    this.simpleSearch='';
    this.showadvanceSearch=true;
    this.WS.post(
      'api/master/fileImportExport/search/advance',
      this.searchToken
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      if (res.result !== null) {
        this.fileData = res.result.fileImportData as IFileImportExport[];
      } else {
        this.fileData = [];
      }
      this.dataSource = new MatTableDataSource(this.fileData);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.loadershow = false;
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }

  public selectFileToImport(type): void {
    if (!this.partnerToken.name && this.partnerToken.name === '') {
      $('#partnerName1').focus();
      this.toastr.info(
        `${
          this.data ? this.data.fileImportExport.enterPartner : 'Enter Partner'
        }`
      );
      // this.toastr.info('Enter Partner');
      return;
    }
    if (!this.partnerToken._id && this.partnerToken._id === '') {
      $('#partnerName1').focus();
      this.toastr.error(
        `${
          this.data
            ? this.data.fileImportExport.enterValidPartner
            : 'Enter a Valid Partner'
        }`
      );
      //this.toastr.error('Enter a Valid Partner');
      return;
    }
    if (parseInt(type, 10) === 0) {
      $('#fileImport').focus();
      this.toastr.info(
        `${
          this.data
            ? this.data.fileImportExport.selectValidImportType
            : 'Select Valid Import Type'
        }`
      );
      // this.toastr.info('Select Valid Import Type');
      return;
    }
    if (!isNaN(type)) {
      if (parseInt(type, 10) === 1) {
        this.importValidator = new BlackListedValidator(
          this.WS,
          this.partnerToken._id
        );
      }
      if (parseInt(type, 10) === 2) {
        this.importValidator = new WhiteListedValidator(
          this.WS,
          this.partnerToken._id
        );
      }
      if (parseInt(type, 10) === 3) {
        this.importValidator = new ProductPartnerValidator(
          this.WS,
          this.partnerToken._id
        );
      }
      if (parseInt(type, 10) === 4) {
        this.importValidator = new OutletPartnerValidator(
          this.WS,
          this.partnerToken._id
        );
      }
      if (parseInt(type, 10) === 5) {
        this.importValidator = new AdmissionPartnerEntitlementValidator(
          this.WS,
          this.partnerToken._id
        );
      }
      this.showImport = true;
    } else {
      console.log(this.importfileType);
    }
  }

  public resetImport(): void {
    this.partnerToken = {
      _id: '',
      name: '',
    };
    this.importfileType = 0;
  }

  public resetSearch(): void {
    this.searchToken = {
      partner: {
        _id: '',
        name: '',
      },
      fileName: '',
      type: '',
      fromDate: '',
      toDate: '',
      status: '',
    };
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('FILE_IMPORT_EXPORT')
    );
    if (
      matchPermission &&
      matchPermission['FILE_IMPORT_EXPORT'].includes('EXPORT')
    ) {
      try {
        this.loadershow = true;
        this.loaderMessage = 'Exporting data..';

        this.exporter.exportTable('xlsx', { fileName: filename });

        setTimeout(() => {
          this.loadershow = false;
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
    this.partners.length = 0;
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
          this.setTokenPartner(this.partners[this.tokenPartnerSuggestionIndex]);
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

export class BlackListedValidator extends AbstractValidator<IFileImport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public eachValue: Subject<IFileImport>;
  public title = 'BlackListed Token Import';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'BlackListed Token Import';
  public templateName = 'BlackListed Token Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/blacklistingCard.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Token',
      {
        column: 'Token',
        key: 'token',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Start Date',
      {
        column: 'Start Date',
        key: 'startDate',
        validations: [DataValidatorDate()],
      },
    ],
    [
      'End Date',
      {
        column: 'End Date',
        key: 'endDate',
        validations: [DataValidatorDate()],
      },
    ],
    [
      'Token Type',
      {
        column: 'Token Type',
        key: 'tokenType',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private partnerId = null,
    u: IFileImport = null
  ) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IFileImport>();
    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSavePartner(v);
    });
  }

  callSavePartner(inputData: any): void {
    this.WS.post(
      'api/admission/es/blacklisted/new',
      {
        data: inputData,
        // inputData: inputData.tJSON,
        // filelength: inputData.filelength,
        // indexNo: inputData.indexNo,
        // importId: inputData.importID,
        partnerId: this.partnerId,
      },
      'ADMISSION'
    ).subscribe((res: any) => {
      // const response = JSON.parse(res);
      this.saveResponse.next(res);
    });
  }
}

export class WhiteListedValidator extends AbstractValidator<IFileImport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public eachValue: Subject<IFileImport>;
  public title = 'WhiteLited Token Import';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'WhiteLited Token Import';
  public templateName = 'WhiteLited Token Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/whitelistingCard.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Token',
      {
        column: 'Token',
        key: 'token',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Start Date',
      {
        column: 'Start Date',
        key: 'startDate',
        validations: [DataValidatorDate()],
      },
    ],
    [
      'End Date',
      {
        column: 'End Date',
        key: 'endDate',
        validations: [DataValidatorDate()],
      },
    ],
    [
      'Token Type',
      {
        column: 'Token Type',
        key: 'tokenType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Quota',
      {
        column: 'Quota',
        key: 'quota',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private partnerId = null,
    u: IFileImport = null
  ) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IFileImport>();
    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSavePartner(v);
    });
  }

  callSavePartner(inputData: any): void {
    this.WS.post(
      'api/admission/es/whitelisted/new',
      {
        data: inputData,
        // inputData: inputData.tJSON,
        // filelength: inputData.filelength,
        // indexNo: inputData.indexNo,
        // importId: inputData.importID,
        partnerId: this.partnerId,
      },
      'ADMISSION'
    ).subscribe((res: any) => {
      // const response = JSON.parse(res);
      this.saveResponse.next(res);
    });
  }
}
