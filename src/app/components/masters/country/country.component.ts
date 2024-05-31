import {
  AfterViewInit,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { WebService } from 'src/app/services/web.service';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { IResponse } from '../../../models/server-data-source.model';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { ILanguage } from 'src/app/models/language.interface';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import {
  ICountry,
  IGlobalSetting,
} from 'src/app/models/globalSetting.interface';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { environment as env } from 'src/environments/environment';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';

declare var $;
@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css'],
})
export class CountryComponent implements OnInit, AfterViewInit {
  public partnerToken = {
    _id: '',
    name: '',
    type: 0,
    category: 0,
    erpNo: '',
    status: 1,
    tin: '',
    partnerSC: '',
    country: '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    state: '',
    city: '',
    region: 0,
    role: {
      _id: '',
      name: '',
    },
    alliancePartner: 0,
    logoURL: '',
    logoKey: '',
    entity: [],
    supportContacts: [],
    settings: [],
  };
  @ViewChild(MatSort) partnerSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public isSidebarOpen = true;
  public showCountryDetails = false;
  public showImport: boolean;
  public showData: boolean;
  public country: ICountry[] = [];
  public importValidator: CountryValidator;
  private languageSubscription: Subscription = null;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public countryLoaderShow = false;
  public partnerRegions: IGlobalSetting[] = [];

  public ExportLoader = false;
  public exportloaderMessage = '';
  public data: ILanguage;
  public dataSourceCountry: MatTableDataSource<ICountry>;
  public displayedColumns: string[] = [
    'name',
    'region',
    'language',
    'currency',
    'countryCode',
    'orders',
    'status',
  ];
  countryData: any;
  name: any;
  partnerRegion: any;
  language: any;
  currency: any;
  u: ICountry;
  _id: string;
  countryCount: any;
  isActive = true;
  // here
  Region: any;
  countryCode: any;
  countryName: any;
  public simpleSearch = '';
  orders: any;
  public advanceSearch:boolean=false
  public showDocumentTab:boolean
  dataSourceDocuments: MatTableDataSource<any>;
  public showFiles: boolean = true
  public filleTypes: any
  shareAS: number;
    tokenRowid: any;
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cs: CommonServiceService,
    private auth: AuthenticationService,
    private toastr: ToastrService,
    private alerts: AppAlertComponent,
  ) {
    this.showImport = false;
  }

  ngAfterViewInit(): void {
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
    this.importValidator = new CountryValidator(this.WS, this.u, this.toaster);
    // console.log(this.route.snapshot.queryParams.n);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showCountryDetails = true;
    }
    this.fetchPartnerRegion('PARTNER_REGION');
    this.getCountry();
    this.fetchFilleTypes('COUNTRY_DOCUMENT_FILE_TYPE');
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
  }

  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('COUNTRY')
    );
    if (matchPermission && matchPermission['COUNTRY'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
    } else {
      this.toaster.info('Access denied');
    }
  }

  hideCountryDetails(): void {
    this.showCountryDetails = false;
    this.resetCountryData();
    // this.getCountry();
    if (this.simpleSearch === '') {
      // this.getCountry();
      if(this.advanceSearch){
this.advanceCountryDataSearch()
      }else{
        this.getCountrySearch()
      }
    }
    else{
      this.simpleSearchCountryData(this.simpleSearch)
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
  private fetchPartnerRegion(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerRegions = res.result.values as IGlobalSetting[];
        if (this.partnerRegions.length && this.partnerToken.type === 0) {
          this.partnerToken.region = this.partnerRegions[0].keyCode;
        }
        // this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public mapPartnerContractTable(): void {
    this.dataSourceCountry = new MatTableDataSource(this.countryData);
    this.dataSourceCountry.sort = this.partnerSort;
    this.dataSourceCountry.paginator = this.paginator;
  }
  public getCountry(): void {
    this.countryLoaderShow = true;
    this.WS.post('api/master/country/fetchCountryData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.countryLoaderShow = false;
          this.countryData = res.result;
          this.countryCount = res.result.length;
          this.mapGlobalSettingsOnData();
          console.log('data',this.countryData);
          this.toaster.success(`${this.countryCount} ${res.description}`);
        } else {
          this.toaster.error(res.description);
          // console.log(res.description);
        }
        this.mapGlobalSettingsOnData();
      }
    );
  }

  private mapGlobalSettingsOnData(): void {
    if (this.countryData.length) {
      this.countryData.map((token, index) => {
        if (this.partnerRegions.length > 0) {
          const matchType = this.partnerRegions.find(
            (t) => t.keyCode === token.region
          );
          if (matchType) {
            token.region = matchType.key1;
          }
        }
      });
      this.mapPartnerContractTable();
    } else {
      this.mapPartnerContractTable();
    }
  }

  public getCountrySearch(): void {
    this.countryLoaderShow = true;
    this.advanceSearch=false
    this.WS.post('api/master/country/fetchCountryData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.countryLoaderShow = false;
          this.countryData = res.result;
          this.countryCount = res.result.length;
          this.dataSourceCountry = new MatTableDataSource(this.countryData);
          this.dataSourceCountry.sort = this.partnerSort;
          this.dataSourceCountry.paginator = this.paginator;
          this.simpleSearch = '';
          this.toaster.success(`${this.countryCount} ${res.description}`);
        } else {
          this.toaster.error(res.description);
          // console.log(res.description);
        }
        this.mapGlobalSettingsOnData();
      }
    );
  }

  public simpleSearchCountryData(value): void {
    this.advanceSearch=false;
    // console.log("submit", value)
    this.simpleSearch = value;
    // console.log(value);
    this.WS.post('api/master/country/simpleSearchCountryData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.countryData = res.result;
        this.dataSourceCountry = new MatTableDataSource(this.countryData);
        this.dataSourceCountry.sort = this.partnerSort;
        this.dataSourceCountry.paginator = this.paginator;
        this.toaster.success(res.description);
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.countryData = [];
        this.dataSourceCountry = new MatTableDataSource(this.countryData);
        this.dataSourceCountry.sort = this.partnerSort;
        this.dataSourceCountry.paginator = this.paginator;
        this.toaster.info(res.description);
      } else {
        // console.log(res.description);
      }
    });
  }

  public advanceCountryDataSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true;
    this.WS.post('api/master/country/advanceCountryDataSearch', {
      name: this.countryName,
      language: this.language,
      currency: this.currency,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.countryData = res.result;
        this.dataSourceCountry = new MatTableDataSource(this.countryData);
        this.dataSourceCountry.sort = this.partnerSort;
        this.dataSourceCountry.paginator = this.paginator;
        this.toaster.success('Successfully Found Data');
      } else {
        this.countryData = [];
        this.dataSourceCountry = new MatTableDataSource(this.countryData);
        this.dataSourceCountry.sort = this.partnerSort;
        this.dataSourceCountry.paginator = this.paginator;
        this.toaster.info('No Data Found');
        // console.log(res.description);
      }
      // this.resetCountryData();
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.mapGlobalSettingsOnData();
    });
  }

  public getCountryById(countryId: string): void {
    this.tokenRowid = countryId
    this.WS.post('api/master/country/fetch/id', { id: countryId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.Country._id;
          this.name = res.result.Country.name;
          this.currency = res.result.Country.currency;
          this.language = res.result.Country.language;
          this.countryCode = res.result.Country.countryCode;
          this.isActive = res.result.Country.status;
          this.orders = res.result.Country.orders;
          // here
          this.Region = res.result.Country.region;
          // console.log(this.Region);
          this.showCountryDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public getAdvancedCountryById(countryId: string): void {
    this.WS.post('api/master/country/fetch/id', { id: countryId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.Country._id;
          this.countryName = res.result.Country.name;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  browseFile(data) {
    this.ExportLoader = true;
    this.exportloaderMessage = 'Uploading File';
    let file = data.file
    let slectedType = data.fileType
    let fileExtension = file.name.split('.').pop();
    this.WS.post('api/master/get/preSignedAWSUrl', {
      type: `uploadedDocs/country/${slectedType}`,
      contentType: file.type,
      extension: fileExtension,
      fileName:file.name
    }).subscribe((re: IResponse) => {
      if (re.status === 1) {
        this.WS.put(re.result.urlInfo.url, file, file.type).subscribe(
          (event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.Sent:
                break;
              case HttpEventType.ResponseHeader:
                break;
              case HttpEventType.UploadProgress:
                break;
              case HttpEventType.Response:
                this.ExportLoader = false;
                this.WS.post('api/master/document/savetoDB',
                  {
                    awsdata: re.result, docType: slectedType, fileName: file.name, metadata: '',urlInfo:re.result.urlInfo,
                    associatedEntityType: 'country', associatedEntityId: this.tokenRowid
                  }).subscribe((res: IResponse) => {
                    if (res.status === 1) {
                      this.ExportLoader = false;
                      this.fetchAIDocuments(this.tokenRowid)
                    }
                    else {
                      this.toaster.error(res.description)
                      this.ExportLoader = false;
                    }
                  });
            }
          })

      }
    })

  }
  fetchAIDocuments(tokenRowid: any) {
    this.WS.post('api/master/fetch/documentss', { tokenId: tokenRowid }).subscribe((re: IResponse) => {
      if (re.status == 1) {
        this.toaster.success(re.description)
        this.dataSourceDocuments = new MatTableDataSource(re.result)
        this.cs.sendEvent(this.dataSourceDocuments)
      }
    })
  }

  changeDocumentStatus(data){
    const alert: IAlert = {
      title: `${this.data
        ? this.data.master.admissionToken.titleDel
        : 'Confirm Delete'
        }`,
      message: `${this.data
        ? this.data.master.admissionToken.docmsg
        : 'You are about to delete a Document. \n\nDo you want to continue?'
        }`,
      labelConfirm: `${this.data ? this.data.master.admissionToken.yes : 'Yes'
        }`,
      labelCancel: `${this.data ? this.data.master.admissionToken.no : 'no'}`,
      textColor: `${this.data ? this.data.master.admissionToken.txtColor : 'red'
        }`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
    this.ExportLoader=true
    this.exportloaderMessage='Deleting Document'
    this.WS.post('api/master/delete/documentss', {id:data.id}).subscribe((re: IResponse) => {
      if(re.status==1){
        this.toaster.success(re.description)
        this.ExportLoader=false
        this.fetchAIDocuments(this.tokenRowid)
      }
      else{
        this.ExportLoader=false
        this.toaster.info(re.description)
      }
  })}})
  }

  private fetchFilleTypes(lookupCode): void {
    debugger
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      if (res.status === 1) {
        this.filleTypes = res.result.values as IGlobalSetting[];
        if (this.filleTypes.length) {
          this.shareAS = this.filleTypes[0].keyCode;
        }

      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  public fetchCountryNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/country/fetchCountryNames', {
        keyword,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.country = res.result.Country as ICountry[];
          if (!this.country.length) {
            this.toaster.info('Not found');
          }
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
        // console.log('223', res.result.Country);
      });
    } else {
      this.country = [];
    }
  }

  public setTokenCountry(country: ICountry): void {
    // console.log(country, '240');
    this.getCountryById(country._id);
    this.country = [];
  }

  public setTokenAdvancedCountry(country: ICountry): void {
    // console.log(country, '240');
    this.getAdvancedCountryById(country._id);
    this.country = [];
  }

  public backToResults(): void {
    this.showImport = false;
  }

  addNewCountry(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('COUNTRY')
    );
    if (matchPermission && matchPermission['COUNTRY'].includes('NEW')) {
      this.showCountryDetails = isshow;
    } else {
      this.toaster.info('Access denied');
    }
  }

  public resetCountryData(): void {
    this._id = '';
    this.name = '';
    this.language = '';
    this.currency = '';
    this.countryCode = '';
    this.orders = '';
  }

  public upsertCountryDetails(): void {
    if (this.name === ' ' || !this.name) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.country.pleaseenteracountryname
            : 'Please enter a Country Name'
        }`
      );
      $('#countryName').focus();
      return;
    }
    if (this.language === ' ' || !this.language) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.country.pleaseenteralanguage
            : 'Please enter a Language'
        }`
      );
      $('#language').focus();
      return;
    }
    if (!this.currency || this.currency === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.country.pleaseenteracurrency
            : 'Please enter a Currency'
        }`
      );
      $('#currency').focus();
      return;
    }
    if (!this.countryCode || this.countryCode === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.country.pleaseenteracountrycode
            : 'Please enter a Country Code'
        }`
      );
      $('#countryCode').focus();
      return;
    }
    if (!this.Region || this.Region === ' ') {
      this.toaster.info(
        `${
          this.data ? this.data.master.country.region : 'Please enter a region'
        }`
      );
      $('#region').focus();
      return;
    }
    this.WS.post('api/master/country/upsertCountryDetails', {
      _id: this._id,
      name: this.name,
      language: this.language,
      region: this.Region,
      currency: this.currency,
      countryCode: this.countryCode,
      isActive: this.isActive,
      // here
      // Region: this.Region,
    }).subscribe((res: IResponse) => {
      // console.log('259', res);
      if (res.status === 1) {
        this.hideCountryDetails();
        this.toaster.success(res.description);
        if (this.simpleSearch != '') {
          this.simpleSearchCountryData(this.simpleSearch);
        }
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('COUNTRY')
    );
    if (matchPermission && matchPermission['COUNTRY'].includes('EXPORT')) {
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
    this.country.length = 0;
  }

  tokenAdvancedCountrySuggestionIndex = -1;

  onTokenAdvancedCountryInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenAdvancedCountrySuggestionIndex = Math.max(
          this.tokenAdvancedCountrySuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenAdvancedCountrySuggestionIndex = Math.min(
          this.tokenAdvancedCountrySuggestionIndex + 1,
          this.country.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenAdvancedCountrySuggestionIndex >= 0) {
          this.setTokenAdvancedCountry(
            this.country[this.tokenAdvancedCountrySuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

class CountryValidator extends AbstractValidator<ICountry> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  // public importFileId = '';
  public importType = 'Country';
  public eachValue: Subject<ICountry>;
  public title = 'Import Country';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Country Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/country.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Name*',
      {
        column: 'Name*',
        key: 'name',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Language*',
      {
        column: 'Language*',
        key: 'language',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Currency*',
      {
        column: 'Currency*',
        key: 'currency',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Country Code*',
      {
        column: 'Country Code*',
        key: 'countryCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'IsActive',
      {
        column: 'IsActive',
        key: 'isActive',
        validations: [DataValidatorRequired()],
      },
    ],
    // here
    [
      'Region*',
      {
        column: 'Region*',
        key: 'region',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: ICountry = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<ICountry>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSaveCountryWebService(v);
    });
  }

  callSaveCountryWebService(inputData: any): void {
    this.WS.post('api/master/country/save/import', {
      inputData: inputData,
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID,
    }).subscribe((res: any) => {
      const response = res;
      this.saveResponse.next(response);
    });
  }
}

export interface IAirport {
  name: string;
  language: string;
  currency: string;
  // status: number;
}
