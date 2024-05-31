import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import {
  ILounge,
  ILoungePartnerLinkImport,
  IOutletSettings,
} from 'src/app/models/lounge.interface';
import { IPartner } from 'src/app/models/partner.interface';
import { IVendor } from 'src/app/models/vendor.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import {
  ICountry,
  IGlobalSetting,
  INearestAirport,
} from 'src/app/models/globalSetting.interface';
import { ToastrService } from 'ngx-toastr';
import { WebService } from 'src/app/services/web.service';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import {
  DataValidatorDate,
  DataValidatorRequired,
} from '../../import/validators/validator.functions';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { IAirport } from '../airport/airport.component';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IRole, IUser } from 'src/app/models/user.interface';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { InvoiceData } from '../../invoice/invoice.component';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { Options } from 'select2';
import { ISize } from 'selenium-webdriver';
import { map, take } from 'rxjs/operators';
import { image } from 'html2canvas/dist/types/css/types/image';
import { ILoungePriceImport } from 'src/app/models/partnerContract.interface';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

declare var $;

export interface ILoungeTimimg {
  day?: number;
  displayDay?: string;
  isClosed?: boolean;
  intervals?: { openingTime: string; closingTime: string }[];
  displayInterval?: string;
}

export interface ILoungeShifts {
  _id: any;
  shiftName?: string;
  openingTime?: string;
  closingTime?: string;
  deskCount?:number;
  queueManagement?:boolean;
  firstShift?:boolean;
}

export interface ICurrentUseStatus {
  currentUseStatus?: string;
  createdBy?: string;
  createdOn?: string
}
export interface IUserLounge {
  _id?: string;
  userName?: string;
  role?: string;
  mobileNo?: number;
  emailId?: string;
}

export interface IProductLounge {
  productID?: {};
  loungeID?: {};
  _id?: string;
  productSKU?: string;
  name?: string;
  type?: number;
  currency?: string;
  price?: number;
  displayType?: string;
}

export interface PeriodicElement {
  name: string;
}
export interface ILoungeFeatures {
  name: string;
  imgUrl: string;
  isActive: boolean;
}

@Component({
  selector: 'app-lounge',
  templateUrl: './lounge.component.html',
  styleUrls: ['./lounge.component.css'],
})
export class LoungeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) loungeSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('outletSettingSort') outletSettingSort: MatSort;
  @ViewChild('outletSettingPagination') outletSettingPagination: MatPaginator;
  @ViewChild('productPagination') productPagination: MatPaginator;
  showData: boolean;
  showLoungeDetails = false;
  public importValidator: LoungeValidator;
  public addNewLoungePhotos = false;
  showImport: boolean;
  public loungeData: ILounge[] = [];
  public parentOutletsData: ILounge[] = [];
  userLoungeData: IUserLounge[] = [];
  productLoungeData: IProductLounge[] = [];
  getInfoData: string;
  public simplesearch = '';

  timings: [];
  timingsList: any = {
    sun: [],
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
  };

  public statusMap = {
    0: 'Draft',
    1: 'Approved',
    2: 'Approval Pending',
    '-10': 'Rejected',
  };
  public tokenDocuments: IGlobalSetting[] = [];
  private tokenCategories: IGlobalSetting[] = [];
  public tokenIdentifiedBy: IGlobalSetting[] = [];
  public tokenTypes: IGlobalSetting[] = [];
  public applicableTo: IGlobalSetting[] = [];
  public allTokenIdentifiers: IGlobalSetting[] = [];
  private entitlementWithin: IGlobalSetting[] = [];
  public productTypes: IGlobalSetting[] = [];
  public loadershow = false;
  public loaderMessage = 'Loading outlets...';
  public outletLoaderShow = false;
  isSidebarOpen = true;
  public addNewUser = false;
  public currencies: ICountry[] = [];
  public roles: IRole[] = [];
  public LoungeType: IGlobalSetting[] = [];
  public LoungeCategory: IGlobalSetting[] = [];
  public ShardKey: IGlobalSetting[] = [];
  public LoungeCountry: IGlobalSetting[] = [];
  public LoungeBrand: IGlobalSetting[] = [];
  public BusinessLine: IGlobalSetting[] = [];
  public OutletOwnedDefault: IGlobalSetting[] = [];
  public OutletOperatedDefault: IGlobalSetting[] = [];
  public OutletReceiptDefault: IGlobalSetting[] = [];
  public partners: IPartner[] = [];
  public airport: IAirport[] = [];
  public SecuredBy: IGlobalSetting[] = [];
  public lounge: ILounge[] = [];
  public user: IUser[] = [];
  public vendors: IVendor[] = [];
  private lang = '';
  public dataSourceLounge: MatTableDataSource<ILounge>;
  public dataSourceSubOutlets: MatTableDataSource<ILounge>;

  public displayLoungeFeatures: ILoungeFeatures[] = [];
  public LoungeFeatures: ILounge[] = [];
  public displayedColumns: string[] = [
    'name',
    'displayZone',
    'area',
    'port',
    'country',
    'capacity',
    'status',
  ];
  public displayedSubOutletsColumns: string[] = [
    'name',
    'displayCategory',
    'displayZone',
    'area',
    'port',
    'country',
    'capacity',
    'status',
  ];
  public dataSourceTimings: MatTableDataSource<ILoungeTimimg>;
  public dataSourceShifts: MatTableDataSource<ILoungeShifts>;
  public displayedColumnsTimings: string[] = ['days', 'closed', 'timings'];
  public displayedColumnsShifts: string[] = [
    'shifts',
    'openingTime',
    'closingTime',
    'firstShift',
    'desk',
    'queue'
  ];
  public dataSourceUserLounge: MatTableDataSource<IUserLounge>;
  public displayedUserLoungeColumns: string[] = [
    'name',
    'role',
    'mobileNo',
    'emailId',
    'status',
  ];
  public dataSourceLocalisation: MatTableDataSource<string>;
  public displayedColumnsLocalisation: string[] = ['attribute'];
  public dataPartnerLink: MatTableDataSource<any>;
  public displayedPartnerColumns: string[] = [
    'name',
    'loungeId',
    'modifiedOn',
    'modifiedBy',
  ];
  public dataSourceProductLounge: MatTableDataSource<IProductLounge>;
  public displayedProductLoungeColumns: string[] = [
    'productSKU',
    'name',
    'type',
    'currency',
    'price',
  ];
  public dataSourceStatusHistory: MatTableDataSource<any>;
  public displyedActionColumn = [
    'action',
    'remarks',
    'outlet',
    'modifiedOn',
    'modifiedBy',
  ];
  public remarkDetails = {
    remarks: '',
    action: ''
  }
  public loungeUseStatusHistory = []
  public dataSourceLoungeUseHistory: MatTableDataSource<ICurrentUseStatus>;
  public displayedLoungeUseHistoryColumns: string[] = [
    'currentUseStatus',
    'createdBy',
    'createdOn'
  ]

  _id = '';
  type = 1;
  name: any;
  displayName: string = "";
  category: any;
  shard: string = 'SINGAPORE';
  addressLine1: any;
  addressLine2: any;
  country: string;
  brand: number;
  parentLounge: string;
  businessLine = 1;
  defaultOutletOwned = 1;
  defaultOutletOperated = 1;
  defaultOutletReceipt = 1;
  capacity: number;
  securedBy = 4;
  loungeDescription: string;
  isActive = true;
  isSecured = true;
  public statusHistory = [];
  // private languageSubscription: Subscription = null;
  languageSubscription: any;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  security: any;
  port: string;
  Country: ICountry[] = [];
  public addNewTiming = false;
  public addNewShifts = false;
  JourneyType: IGlobalSetting[];
  TravelDirection: IGlobalSetting[];
  Zone: IGlobalSetting[];
  CurrentUseStatus: IGlobalSetting[];
  PortType: IGlobalSetting[];
  OutletPhotos: IGlobalSetting[];
  BaseCurrency: IGlobalSetting[];
  AirportType: IGlobalSetting[];
  photos: string[] = [];
  code: any;
  terminalCode: string;
  subTerminal: any;
  dateOfOpening: Date;
  phoneNo: any;
  email: string;
  loungeArea: number;
  journeyType: any;
  travelDirection: any;
  baseCurrency: any;
  zone = 0;
  currentUseStatus = 0;
  currency: any;
  samples: string[];
  localisation: {
    name: {},
  }
  public saveLoungeData: ILounge = {
    localisation: {
      name: {},
    },
    loungeFeatures: [],
    _id: '',
    name: '',
  };
  public partnerToken = {
    _id: '',
    name: '',
  };
  public matchType: IGlobalSetting[] = [];
  public importPriceValidator:LoungePriceValidator
  public weekdays: IGlobalSetting[] = [];
  public loungeTimings: any = null;
  public loungeFeatures: any = null;
  public loungeShifts: any = null;
  public displayLoungeTime: ILoungeTimimg[] = [];
  public displayLoungeShiftTime: ILoungeShifts[] = [];
  public localisedAttributes: string[] = ['name'];
  public userid: any;
  role: string;
  mobileNo: any;
  emailId: any;
  userName: any;
  userId: any;
  newParentLounge: ILounge[];
  parentLoungeId: any;
  outletOwnedId: any;
  outletOwnedBy: string;
  outletOperatedId: string;
  outletOperatedBy: string;
  defaultOutletName: string;
  defaultOutletOperatedName: string;
  defaultOutletReceiptName: string;
  defaultOutletId: string;
  defaultOutletOperatedId: string;
  defaultReceiptId: string;
  airportId: any;
  airportName: any;
  u: ILoungeImport;
  loungeCount: any;
  public addNewPartnerLoungeLink = false;
  public addNewProducts = false;
  public partnersLink: IPartner[] = [];
  public partner = { _id: '', name: '' };
  public foreignLoungeId = '';
  public loungeProductData = [];
  public loungePartnerId = '';
  public availLanguages: IGlobalSetting[] = [];
  outletReciept: any;
  public invoices: InvoiceData[] = [];
  outletRecieptId: string;
  status: any;
  airportData: any;
  loungeName: any;
  loungeCode: any;
  public outSettings: IOutletSettings[] = [];
  public editOutletSettings = false;
  public outletSettings: IOutletSettings = {
    _id: '',
    lkCode: '',
    keyCode: 0,
    key1: '',
    key2: '',
    key3: '',
    key4: '',
  };
  public dayShift1 = 'Shift-AM';
  public dayShift2 = 'Shift-PM';
  public dayShift3 = 'Shift-Night';
  public openingTime1 = '06:00';
  public closingTime1 = '14:00';
  public openingTime2 = '14:00';
  public closingTime2 = '22:00';
  public openingTime3 = '22:00';
  public closingTime3 = '06:00';
  public dataSourceSetting: MatTableDataSource<any>;
  public displyedSettingColumn: string[] = [
    'name',
    'key1',
    'key2',
    'key3',
    'key4',
  ];

  portCode: any;
  public toggleCloneEntitlement = false;
  public cloneFrom = {
    _id: '',
    name: '',
  };
  public cloneSourceLounge: ILounge[] = [];
  public options: Options;
  public tokenPartner = [];
  public selectedPartners = [];
  pointLocation: any;
  public advanceSearch: boolean = false
  displayLounge: ILounge[];
  binLoungeId: any;
  tokenRowid: any;
  dataSourceDocuments: MatTableDataSource<any>;
  public showFiles: boolean = true
  public filleTypes: any
  shareAS: number;
  deskCount: number=2;
  queueId: any=[];
  loungeDatta: any;
  isFromCC = false;
  contractPriceTemplateName: string;
  showPriceImport: boolean;
  loungePriceTemplateName: any;

  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private location: Location,
    private cs: CommonServiceService,
    private toastr: ToastrService,
    private alerts: AppAlertComponent,
    private auth: AuthenticationService,
    private common: CommonServiceService,
    private clipboardid: ClipboardModule
  ) {
    this.showImport = false;
  }

  ngOnInit(): void {
    this.options = {
      multiple: true,
      closeOnSelect: false,
      width: '100%',
      tags: true,
    };
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
        if (this.route.snapshot.queryParams.loungeId) {
          this.binLoungeId = this.route.snapshot.queryParams.loungeId
          this.getLoungeById(this.binLoungeId);
        }
        if(this.route.snapshot.queryParams.fromContactCentre === 'y') {
          this.isFromCC = true;
        }
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
        // this.getLounge();
      });
    }, 100);

    this.importValidator = new LoungeValidator(this.WS, this.u, this.toastr);
    this.importPriceValidator = new LoungePriceValidator(this.WS);
    this.auth.currentLounge.subscribe((lounge) => {
      if (lounge) {
        this.loungePriceTemplateName=`Lounge_Price_contract_${(this.authenticatedUser.userOutlet._id).toString()}_${this.authenticatedUser.userOutlet.name}`
        this.importPriceValidator.updateTemplateURL(this.loungePriceTemplateName)
      }})
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showLoungeDetails = true;
    }

    this.newParentLounge = [];
    // this.countryCode()
    // this.removePath();
    this.fetchWeekdays('LOUNGE_WEEKDAY');
    this.getLounge();
    this.fetchCountries();
    this.fetchUserRoles();
    this.fetchZone('ZONE');
    this.fetchCurrentUseStatus('CURRENT_USE_STATUS')
    this.fetchOutletPhotos('OUTLET_PHOTOS');
    this.fetchPortTypes('PORT_TYPE');
    this.fetchTravelDirection('TRAVEL_DIRECTION');
    this.fetchJourneyType('JOURNEY_TYPE');
    this.fetchLoungeType('LOUNGE_TYPE');
    this.fetchLoungeCategory('LOUNGE_CATEGORY');
    this.fetchLoungeBrand('LOUNGE_BRAND');
    this.fetchBusinessLine('BUSINESS_LINE');
    this.fetchOutletOperatedByDefaultValues('OUTLET_OPERATED_BY');
    this.fetchOutletReceiptDefaultValues('OUTLET_RECEIPT');
    this.fetchSecuredBy('SECURED_BY');
    this.localLanguage();
    /* for generate AI */
    this.fetchTokenDocuments('TOKEN_DOCUMENT');
    this.fetchApplicableTo('ENTITLEMENT_APPLICABLE_TO');
    this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
    this.fetchAdmissionCategory('ADMISSION_TOKEN_CATEGORY');
    this.fetchTokenIdentifiedBy('TOKEN_IDENTIFIED_BY');
    this.fetchEntitlementWithin('ENTITLEMENT_WITHIN');
    this.fetchProductTypes('PRODUCT_TYPE');
    this.fetchFilleTypes('LOUNGE_DOCUMENT_FILE_TYPE');
    this.dataSourceLocalisation = new MatTableDataSource(
      this.localisedAttributes
    );
  }

  addHours(index: number): void {
    this.displayLoungeTime[index].intervals.push({
      openingTime: '',
      closingTime: '',
    });
  }

  public localLanguage(): void {
    this.common.fetchLocalisationLanguages().subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.availLanguages = res.result.values as IGlobalSetting[];
        this.displayedColumnsLocalisation = ['attribute'];
        this.availLanguages.map((l) =>
          this.displayedColumnsLocalisation.push(l.key2)
        );
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  removeHours(dayIndex, intervalIndex): void {
    this.displayLoungeTime[dayIndex].intervals.splice(intervalIndex, 1);
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  public removePath(): void {
    this.WS.post('api/master/lounge/photos/remove', {}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // console.log('path deleted ');
        }
      }
    );
  }

  reloadCurrentPage(): void {
    window.location.reload();
  }
  public getLoungeSearch(): void {
    this.outletLoaderShow = true;
    this.advanceSearch = false;
    this.WS.post('api/master/lounge/fetchLoungeData', {
      Inactive: true,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeData = res.result as ILounge[];
        this.loungeCount = res.result;
        this.outletLoaderShow = false;
        this.simplesearch = '';
        this.mapGlobalSettingsOnData();
        this.updateLocalisation();
        this.toastr.success(`${this.loungeCount.length} ${res.description}`);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public getLounge(): void {
    this.outletLoaderShow = true;
    this.WS.post('api/master/lounge/fetchLoungeData', {
      Inactive: true,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        //console.log("the lounge: ", res.result[78].currentUseStatus) //to delete
        this.loungeData = res.result as ILounge[];
        // console.log('lounge data', this.loungeData);
        this.loungeCount = res.result;
        this.outletLoaderShow = false;
        this.mapGlobalSettingsOnData();
        this.updateLocalisation();
        this.toastr.success(`${this.loungeCount.length} ${res.description}`);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public getUserLounge(): void {
    let lounge_id = this._id;
    this.WS.post('api/master/lounge/fetchUserLoungeData', {
      lounge_id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userLoungeData = res.result;
        this.dataSourceUserLounge = new MatTableDataSource(this.userLoungeData);
        this.dataSourceUserLounge.sort = this.loungeSort;
        this.dataSourceUserLounge.paginator = this.paginator;
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public formatCustomDate(inputDateString) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const date = new Date(inputDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  }

  public filterUserRoles(keyword: string): void {
    if (keyword.length) {
      const regex = new RegExp(keyword, 'i');
      const filteredUserRoles = this.userLoungeData.filter((user: any) => {
        return user.roles.some((role) => regex.test(role.roleName));
      });
      this.dataSourceUserLounge = new MatTableDataSource(filteredUserRoles)
    }
    else {
      this.dataSourceUserLounge = new MatTableDataSource(this.userLoungeData)
    }
  }

  public getLoungeUseStatusHistory(id): void {
    this.WS.post('api/master/lounge/fetch/useStatusHistory', {
      id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeUseStatusHistory = res.result;
        // console.log("current Use history: ", res.result)
        this.loungeUseStatusHistory.forEach(creationTime => {
          if (creationTime.createdOn) {
            creationTime.createdOn = this.formatCustomDate(creationTime.createdOn)
          }
        })
        this.loungeUseStatusHistory.map(user => {
          user.createdBy = user.createdBy ? user.createdBy.name : '';
          return user;
        });
        // console.log("first value: ", this.loungeUseStatusHistory[0])
        this.dataSourceLoungeUseHistory = new MatTableDataSource(this.loungeUseStatusHistory);
        const totalItems = this.loungeUseStatusHistory.length;
        // this.dataSourceLoungeUseHistory.paginator = this.paginator
        // this.dataSourceLoungeUseHistory.sort = this.loungeSort
        // console.log("use history for table: ", this.dataSourceLoungeUseHistory)
        // this.dataSourceUserLounge.sort = this.loungeSort;
        // this.dataSourceUserLounge.paginator = this.paginator;
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  getBadgeClass(currentUseStatus: string): string {
    if (currentUseStatus) {
      if (currentUseStatus === "Ready") {
        return 'badge badge-success'; // Green
      } else if (currentUseStatus === 'In Use') {
        return 'badge badge-danger'; // Red
      } else if (currentUseStatus === 'Housekeeping In Progress') {
        return 'badge lighter-warning'; // Yellow
      }
    }
    return 'badge'; // Default class if conditions don't match or showerRoomName is undefined
  }

  public getProductLounge(): void {
    let lounge_id = this._id;
    this.WS.post('api/master/lounge/fetchProductLoungeData', {
      lounge_id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.productLoungeData = res.result;
        if (this.productLoungeData.length) {
          this.productLoungeData.map((token) => {
            if (this.productTypes.length) {
              const matchType = this.productTypes.find(
                (t) => t.keyCode === token.productID['type']
              );
              if (matchType) {
                token.displayType = matchType.key1;
              }
            }
          });
        }
        this.dataSourceProductLounge = new MatTableDataSource(
          this.productLoungeData
        );
        this.dataSourceProductLounge.sort = this.loungeSort;
        this.dataSourceProductLounge.paginator = this.productPagination;
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public getLoungeByShifts(): void {
    this.addNewShifts = true;
  }

  public getLoungeByTimings(): void {
    this.addNewTiming = true;
  }

  public openGoogleMaps(): void {
    if (this.pointLocation !== '') {
      // const longitude = this.location[1];
      // const latitude = this.location[0];
      // const url = `https://www.google.com/maps/search/?api=1&query=${longitude},${latitude}`
      const url = `https://www.google.com/maps/search/?api=1&query=${this.port}`
      window.open(url.toString(), '_blank');
      // console.log(url);
      // console.log(this.port);
      // console.log(this.pointLocation);
    } else {
      this.toastr.info('No Location Found');
    }
  }

  public getParentOutletsData(): void {
    let parent_id = this._id;
    this.WS.post('api/master/lounge/parentLounge', {
      parent_id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.parentOutletsData = res.result;
        if (this.parentOutletsData.length) {
          this.parentOutletsData.map((token) => {
            if (this.LoungeCategory.length) {
              const matchCat = this.LoungeCategory.find(
                (l) => l.keyCode === token.category
              );
              if (matchCat) {
                token.displayCategory = matchCat.key1;
              }
            }
            if (this.Zone.length) {
              const matchZone = this.Zone.find((l) => l.keyCode === token.zone);
              if (matchZone) {
                token.displayZone = matchZone.key1;
              }
            }
          });
        }
        this.dataSourceSubOutlets = new MatTableDataSource(
          this.parentOutletsData
        );
        this.dataSourceSubOutlets.sort = this.loungeSort;
        this.dataSourceSubOutlets.paginator = this.paginator;
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public simpleSearchLoungeData(value): void {
    this.simplesearch = value;
    this.advanceSearch = false;
    this.WS.post('api/master/lounge/simpleSearchLoungeData', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeData = res.result;
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      } else if (res.status === 3) {
        this.loungeData = [];
        this.mapGlobalSettingsOnData();
        this.toastr.info(res.description);
      } else {
      }
    });
  }

  public advanceLoungeDataSearch(type: number, category: number): void {
    this.simplesearch = '';
    this.advanceSearch = true;
    this.WS.post('api/master/lounge/advanceLoungeDataSearch', {
      name: this.loungeName,
      code: this.loungeCode,
      type,
      category,
      country: this.name,
      portCode: this.portCode,
      status: this.status,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeData = res.result;
        this.toastr.success('Successfully found the Outlet Data');
        this.dataSourceLounge = new MatTableDataSource(this.loungeData);
        this.mapGlobalSettingsOnData();
      } else if (res.status === 3) {
        this.loungeData = [];
        this.mapGlobalSettingsOnData();
        this.toastr.info('No Such Outlet Exists');
      } else {
      }
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }

  public resetLoungeData(): void {
    this._id = '';
    this.name = '';
    this.displayName = '';
    this.category = '';
    this.code = '';
    this.type = 1;
    this.brand = null;
    this.outletOwnedBy = '';
    this.outletOperatedBy = this.defaultOutletOperatedName;
    this.outletReciept = this.defaultOutletReceiptName;
    this.parentLounge = '';
    this.businessLine = 1;
    this.addressLine1 = '';
    this.addressLine2 = '';
    this.port = '';
    this.journeyType = '';
    this.travelDirection = '';
    this.terminalCode = '';
    this.subTerminal = '';
    this.isActive = true;
    this.isSecured = true;
    this.capacity = null;
    this.securedBy = 4;
    this.currency = '';
    this.dateOfOpening = null;
    this.phoneNo = null;
    this.email = '';
    this.loungeArea = null;
    this.loungeDescription = '';
    this.lounge = [];
    this.partners = [];
    this.vendors = [];
    this.invoices = [];
    this.clipboardid = '';
  }

  public resetUserLoungeData(): void {
    this.userName = '';
    this.role = '';
    this.mobileNo = '';
    this.emailId = '';
    this.addNewUser = false;
  }

  public resetOutletDetails(): void {
    if (this._id !== '') {
      this.getLoungeById(this._id);
    } else {
      this.resetLoungeData();
    }
  }

  onRadioChange(data, column,event) {
    if (data.queueManagement == true) {
      // console.log(data, this.dataSourceShifts)
      this.dataSourceShifts?.filteredData.forEach(item => {
        if (item._id == data._id) {
          const firstShiftValue = item.firstShift as boolean;
          const deskValue = item.deskCount !== undefined ? item.deskCount : 0;
          const queueValue = item.queueManagement == undefined ? false : item.queueManagement as boolean;
          if (deskValue > 100) {
            this.toastr.info('Desk Count should not be greater than 100')
            item.deskCount = 100
          }
          else {
            this.WS.post('api/master/lounge/upadteFirstShift', {
              _id: this.tokenRowid, data: this.loungeDatta, firstShift: firstShiftValue,
              deskCount: deskValue, queueManagement: queueValue, shiftId: data._id
            }).subscribe((re: IResponse) => {
              if (re.status == 1) {
                this.toastr.success(re.description)
              }
              else {
                this.toastr.info(re.description)
                switch (column) {
                  case 'queueManagement':
                    item[column] = false
                    break;
                  case 'firstShift':
                    item[column] = false
                    break;
                  case 'deskCount':
                    item[column] = 2
                    break;
                }
              }
            })
          }
        }
      })
    }
    else {
      this.dataSourceShifts?.filteredData.forEach(item => {
        if (item._id == data._id) {
          switch (column) {
            case 'queueManagement':
              item[column] = false
              break;
            case 'firstShift':
              item[column] = false
              break;
            case 'deskCount':
              item[column] = 2
              break;
          }
        }
      })
      event.preventDefault();
      this.toastr.info("Check QueueManger to update Shift Data")
    }
  }
  browseFile(data) {
    this.outletLoaderShow = true;
    this.loaderMessage = 'Uploading File';
    let file = data.file
    let slectedType = data.fileType
    let fileExtension = file.name.split('.').pop();
    this.WS.post('api/master/get/preSignedAWSUrl', {
      type: `uploadedDocs/lounges/${slectedType}`,
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
                this.outletLoaderShow = false;
                this.WS.post('api/master/document/savetoDB',
                  {
                    awsdata: re.result, docType: slectedType, fileName: file.name, metadata: '',urlInfo:re.result.urlInfo,
                    associatedEntityType: 'lounges', associatedEntityId: this.tokenRowid
                  }).subscribe((res: IResponse) => {
                    if (res.status === 1) {
                      this.outletLoaderShow = false;
                      this.fetchAIDocuments(this.tokenRowid)
                    }
                    else {
                      this.toastr.error(res.description)
                      this.outletLoaderShow = false;
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
        this.toastr.success(re.description)
        this.dataSourceDocuments = new MatTableDataSource(re.result)
        this.common.sendEvent(this.dataSourceDocuments)
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
    this.outletLoaderShow=true
    this.loaderMessage='Deleting Document'
    this.WS.post('api/master/delete/documentss', {id:data.id}).subscribe((re: IResponse) => {
      if(re.status==1){
        this.toastr.success(re.description)
        this.outletLoaderShow=false
        this.fetchAIDocuments(this.tokenRowid)
      }
      else{
        this.outletLoaderShow=false
        this.toastr.info(re.description)
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
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }


  private fetchCountries(): void {
    this.WS.post('api/master/country/fetch', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        const removeDuplicate = res.result.values as ICountry[];
        let newArray = [];
        for (let d of removeDuplicate) {
          newArray.push(d.currency[0]);
        }
        const set = new Set(newArray);
        for (const s of set.values()) {
          this.currencies.push(s);
        }
        if (this.currencies.length && this.currency === '') {
          this.currency = this.currencies[0];
        }
      }
      if (res.status === 2) {
      } else {
      }
    });
  }
  private fetchUserRoles(): void {
    this.WS.post('api/master/globalSettings/fetchUserRoles', {}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.roles = res.result.values as IRole[];
        }
        if (res.status === 2) {
        } else {
        }
      }
    );
  }

  private fetchLoungeType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.LoungeType = res.result.values as IGlobalSetting[];
        if (this.LoungeType.length && this.type === 0) {
          this.type = this.LoungeType[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchLoungeCategory(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.LoungeCategory = res.result.values as IGlobalSetting[];
        if (this.LoungeCategory.length && this.category === 0) {
          this.category = this.LoungeCategory[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchShardKey(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.ShardKey = res.result.values as IGlobalSetting[];
        // console.log('781', this.ShardKey);
        if (this.ShardKey.length && this.shard === '') {
          this.shard = this.ShardKey[0].key1;
        }

        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

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

  private fetchOutletOperatedByDefaultValues(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.OutletOperatedDefault = res.result.values as IGlobalSetting[];
        if (this.OutletOperatedDefault.length) {
          this.defaultOutletOperated = this.OutletOperatedDefault[0].keyCode;
          this.defaultOutletOperatedName = this.OutletOperatedDefault[0].key2;
          this.defaultOutletOperatedId = this.OutletOperatedDefault[0].key1;
          this.outletOperatedBy = this.defaultOutletOperatedName;
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchOutletReceiptDefaultValues(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.OutletReceiptDefault = res.result.values as IGlobalSetting[];
        if (this.OutletReceiptDefault.length) {
          this.defaultOutletReceipt = this.OutletReceiptDefault[0].keyCode;
          this.defaultOutletReceiptName = this.OutletReceiptDefault[0].key2;
          this.defaultReceiptId = this.OutletReceiptDefault[0].key1;
          this.outletReciept = this.defaultOutletReceiptName;
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchBusinessLine(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.BusinessLine = res.result.values as IGlobalSetting[];
        if (this.BusinessLine.length && this.businessLine === 0) {
          this.businessLine = this.BusinessLine[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchSecuredBy(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.SecuredBy = res.result.values as IGlobalSetting[];
        if (this.SecuredBy.length && this.securedBy === 0) {
          this.securedBy = this.SecuredBy[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchWeekdays(lookupCode: string): void {
    this.WS.post('api/master/lounge/fetchTimingsFromLookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.weekdays = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public countryCode(): void {
    this.WS.post('api/master/lounge/addcountryCode', {
      Inactive: false,
      sorting: 'alphabet',
      selection: true,
    }).subscribe((res: IResponse) => {
    });
  }

  private fetchJourneyType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.JourneyType = res.result.values as IGlobalSetting[];
        if (this.JourneyType.length && this.journeyType === 0) {
          this.journeyType = this.JourneyType[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchTravelDirection(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.TravelDirection = res.result.values as IGlobalSetting[];
        if (this.TravelDirection.length && this.travelDirection === 0) {
          this.travelDirection = this.TravelDirection[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchZone(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.Zone = res.result.values as IGlobalSetting[];
        if (this.Zone.length && this.zone === 0) {
          this.zone = this.Zone[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchCurrentUseStatus(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.CurrentUseStatus = res.result.values as IGlobalSetting[];
        //console.log("Current Use Status: ", this.CurrentUseStatus)
        if (this.CurrentUseStatus.length && this.currentUseStatus === 0) {
          this.currentUseStatus = this.CurrentUseStatus[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
        //console.log("Use Status")
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchPortTypes(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.PortType = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchOutletPhotos(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.OutletPhotos = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchProductTypes(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.productTypes = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        // console.log(res.description);
      } else {
        // console.log(res.description);
      }
    });
  }

  public ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      return false;
    }
  }

  public saveLoungeDetails(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('SAVE')) {
      // if (!this.name || this.name.trim() === '') {
      //   this.toastr.info(
      //     `${
      //       this.data
      //         ? this.data.master.lounge.PleaseenteranOutletName
      //         : 'Please enter an Outlet Name'
      //     }`
      //   );
      //   $('#loungeName1').focus();
      //   return;
      // }
      if (this.name.trim() === '') {
        $('#name').focus();
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletName
            : 'Please enter an Outlet Name'
          }`
        );
        return;
      }
      if (this.displayName.trim() === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseEnteranOutletDisplayName
            : 'Please enter an Outlet Display Name'
          }`
        );
        return;
      }


      if (!this.category || this.category === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectanOutletCategory
            : 'Please select an Outlet Category'
          }`
        );
        $('#loungeCategory1').focus();
        return;
      }
      if (!this.code || this.code.trim() === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletCode
            : 'Please enter an Outlet Code'
          }`
        );
        $('#loungeCode').focus();
        return;
      }
      if (!this.type || this.type === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletType
            : 'Please enter an Outlet Type'
          }`
        );
        $('#loungeType1').focus();
        return;
      }
      if (!this.brand || this.brand === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletBrand
            : 'Please enter an Outlet Brand'
          }`
        );
        $('#loungeCode1').focus();
        return;
      }
      if (!this.outletOwnedBy || this.outletOwnedBy === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletOwnedBy
            : 'Please enter an Outlet Owned By (Partner)'
          }`
        );
        $('#outletOwnedBy').focus();
        return;
      }
      if (!this.outletOperatedBy || this.outletOperatedBy === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranOutletOperatedBy
            : 'Please enter an Outlet Operated By (Vendor)'
          }`
        );
        $('#outletOperatedBy').focus();
        return;
      }
      if (!this.businessLine || this.businessLine === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectaBusinessLine
            : 'Please select a Business Line'
          }`
        );
        $('#businessLine').focus();
        return;
      }
      if (!this.outletReciept || this.outletReciept === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.Pleaseenteranoutletreciept
            : 'Please enter an Use Receipt Template'
          }`
        );
        $('#outletReciept').focus();
        return;
      }
      if (!this.addressLine1 || this.addressLine1.trim() === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteranAddressLine1
            : 'Please enter an Address Line 1'
          }`
        );
        $('#address1').focus();
        return;
      }
      if (!this.port || this.port === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.Pleaseselectaport
            : 'Please select a port'
          }`
        );
        $('#port').focus();
        return;
      }
      if (!this.journeyType || this.journeyType === '') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectaJourneyType
            : 'Please select a Journey Type'
          }`
        );
        $('#journeyType').focus();
        return;
      }

      if (!this.terminalCode || this.terminalCode.trim() === ' ') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenteraTerminalCode
            : 'Please enter a Terminal Code'
          }`
        );
        $('#terminalCode').focus();
        return;
      }
      if (!this.zone || this.zone === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectaZone
            : 'Please select a Zone'
          }`
        );
        $('#zone').focus();
        return;
      }
      if (!this.loungeArea || this.loungeArea === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.Pleaseenterarea
            : 'Please enter an Area'
          }`
        );
        $('#loungeArea').focus();
        return;
      }
      if (!this.capacity || this.capacity === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenterCapacity
            : 'Please enter  Capacity'
          }`
        );
        $('#capacity').focus();
        return;
      }
      if (!this.securedBy || this.securedBy === null) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectSecuredBy
            : 'Please select Secured By'
          }`
        );
        $('#securedBy').focus();
        return;
      }
      if (!this.currency || this.currency === ' ') {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectaBaseCurrency
            : 'Please select a Base Currency'
          }`
        );
        $('#currency').focus();
        return;
      }
      if (!this.dateOfOpening) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleasechooseaDateOfOpening
            : 'Please choose a Date Of Opening'
          }`
        );
        $('#openingDate').focus();
        return;
      }
      if (!this.currentUseStatus) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseselectLoungeStatus
            : 'Please select Lounge Use Status'
          }`
        );
        $('#currentUseStatus').focus();
        return;
      }
      if (!this.phoneNo) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.PleaseenterPhoneNo
            : 'Please enter Phone No'
          }`
        );
        $('#phoneNo').focus();
        return;
      }
      const y = 0;
      const cap = y;
      // tslint:disable-next-line: no-unused-expression
      this.capacity === cap;
      if (Number.isInteger(this.capacity) === false) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.InvalidCapacityNo
            : 'Invalid Capacity No'
          }`
        );
        $('#capacity').focus();
        return;
      } else if (this.capacity < 0) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.CapacityCannotbeNegative
            : 'Capacity Cannot be Negative'
          }`
        );
        $('#capacity').focus();
        return;
      }
      // const z = 0;
      // const area = z;
      // tslint:disable-next-line: no-unused-expression
      // this.loungeArea === area;
      // if (Number.isInteger(this.loungeArea) === false) {
      //   this.toastr.info(
      //     `${
      //       this.data ? this.data.master.lounge.InvalidLoungeArea : 'Invalid Area'
      //     }`
      //   );
      //   $('#loungeArea').focus();
      //   return;
      // } else if (this.loungeArea < 0) {
      //   this.toastr.info(
      //     `${
      //       this.data
      //         ? this.data.master.lounge.AreaCannotbeNegative
      //         : 'Area Cannot be Negative'
      //     }`
      //   );
      //   $('#loungeArea').focus();
      //   return;
      // }

      if (this.loungeArea < 0) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.AreaCannotbeNegative
            : 'Area Cannot be Negative'
          }`
        );
        $('#loungeArea').focus();
        return;
      }

      const x = 0;
      const phone = x.toString();
      if (this.phoneNo < phone) {
        this.toastr.info(
          `${this.data
            ? this.data.master.lounge.InvalidPhoneNo
            : 'Invalid Phone No.'
          }`
        );
        $('#phoneNo').focus();
        return;
      }

      if (this.email === '') {
        this.toastr.info('Please Enter Email');
        $('#email').focus();
        return;
      }

      if (this.email !== '') {
        const emailIds = this.email.split(',')
        if (!this.ValidateEmail(emailIds)) {
          this.toastr.info(
            `${this.data
              ? this.data.master.lounge.enterValidEmail
              : 'Please Enter a Valid email'
            }`
          );
          $('#email').focus();
          return;
        }
      }
      // this.loadershow = true;
      this.loaderMessage = 'Saving Outlet';
      this.WS.post('api/master/lounge/saveLoungeDetails', {
        _id: this._id,
        name: this.name,
        displayName: this.displayName,
        category: this.category,
        code: this.code,
        type: this.type,
        brand: this.brand,
        outletOwnedBy: this.outletOwnedId,
        outletOperatedBy: this.outletOperatedId
          ? this.outletOperatedId
          : this.defaultOutletOperatedId,
        outletReciept: this.outletRecieptId
          ? this.outletRecieptId
          : this.defaultReceiptId,
        parentLounge: this.parentLoungeId,
        businessLine: this.businessLine,
        addressLine1: this.addressLine1,
        addressLine2: this.addressLine2,
        shard: this.shard,
        airport: this.airportId,
        journeyType: this.journeyType,
        travelDirection: this.travelDirection,
        terminalCode: this.terminalCode,
        subTerminal: this.subTerminal,
        zone: this.zone,
        currentUseStatus: this.currentUseStatus,
        capacity: this.capacity,
        securedBy: this.securedBy,
        description: this.loungeDescription,
        isActive: this.isActive,
        isSecured: this.isSecured,
        baseCurrency: this.currency,
        dateOfOpening: this.dateOfOpening,
        phoneNo: this.phoneNo,
        email: this.email,
        area: this.loungeArea,
        localisation: this.localisation,
        statusHistory: this.statusHistory
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.lounge._id;
          this.name = res.result.lounge.name;
          this.displayName = res.result.lounge.displayName;
          this.localisation = res.result.lounge.localisation;
          this.loungeShifts = res.result.lounge.outletShifts;
          this.statusHistory = res.result.lounge.statusHistory;
          // this.loungeData = this.name;
          this.toastr.success(res.description);
          this.showLoungeDetails = true;
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          if (res.description === 'Please Enter a Valid Outlet Owned By Value') {
            $('#outletOwnedBy').focus();
          } else if (
            res.description === 'Please Enter a Valid Outlet Operated By Value'
          ) {
            $('#outletOperatedBy').focus();
          } else if (res.description === 'Please Enter a Valid Port') {
            $('#airport').focus();
          } else if (res.description === 'Outlet Code Must Be Unique') {
            $('#loungeCode').focus();
          } else if (
            res.description === 'Please Enter a Valid Outlet Reciept Value'
          ) {
            $('#outletReciept').focus();
          }
          this.toastr.info(res.description);
        }
      });
    }
    else {
      this.toastr.info(
        `${this.data ? this.data.master.role.accessdenied : 'Access denied'}`
      );
    }
  }

  public changeStatus() {
    this.isActive = !this.isActive;

  }
  public saveStatusHistory() {
    if (this.remarkDetails.remarks.trim() === '') {
      this.remarkDetails.remarks = ''
      this.toastr.info("Please Enter Remarks");
      document.getElementById("svbtn").removeAttribute('data-dismiss');
      return;
    }
    this.remarkDetails.action = this.isActive ? 'Active' : 'Inactive';
    this.statusHistory = [];
    this.statusHistory.push(this.remarkDetails);
    this.WS.post('api/master/lounge/save/status', {
      _id: this._id,
      isActive: this.isActive,
      status: this.isActive ? 1 : 0,
      statusHistory: this.statusHistory
    }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {

          this.statusHistory = res.result.statusHistory;
          this.mapActionHistory(this.statusHistory);
          // console.log('stsus hstry--',this.partnerToken.statusHistory)
          this.toastr.success(res.description);
        }
        else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      })
    this.remarkDetails.remarks = ''
    document.getElementById("svbtn").setAttribute('data-dismiss', 'modal');
  }
  public mapActionHistory(data): void {
    this.dataSourceStatusHistory = new MatTableDataSource(data);
    // this.dataSourceStatusHistory.sort = this.partnerSort;
    this.dataSourceStatusHistory.paginator = this.paginator;
  }
  public submitOutletDetails(): void {
    if (!this.name || this.name.trim() === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletName
          : 'Please enter an Outlet Name'
        }`
      );
      $('#loungeName1').focus();
      return;
    }
    if (!this.displayName || this.displayName.trim() === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseEnteranOutletDisplayName
          : 'Please enter an Outlet Display Name'
        }`
      );
      $('#displayName1').focus();
      return;
    }

    if (!this.category || this.category === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectanOutletCategory
          : 'Please select an Outlet Category'
        }`
      );
      $('#loungeCategory1').focus();
      return;
    }
    if (!this.code || this.code.trim() === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletCode
          : 'Please enter an Outlet Code'
        }`
      );
      $('#loungeCode').focus();
      return;
    }
    if (!this.type || this.type === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletType
          : 'Please enter an Outlet Type'
        }`
      );
      $('#loungeType1').focus();
      return;
    }
    if (!this.brand || this.brand === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletBrand
          : 'Please enter an Outlet Brand'
        }`
      );
      $('#loungeCode1').focus();
      return;
    }
    if (!this.outletOwnedBy || this.outletOwnedBy === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletOwnedBy
          : 'Please enter an Outlet Owned By (Partner)'
        }`
      );
      $('#outletOwnedBy').focus();
      return;
    }
    if (!this.outletOperatedBy || this.outletOperatedBy === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranOutletOperatedBy
          : 'Please enter an Outlet Operated By (Vendor)'
        }`
      );
      $('#outletOperatedBy').focus();
      return;
    }
    if (!this.businessLine || this.businessLine === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectaBusinessLine
          : 'Please select a Business Line'
        }`
      );
      $('#businessLine').focus();
      return;
    }
    if (!this.outletReciept || this.outletReciept === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.Pleaseenteranoutletreciept
          : 'Please enter an Use Receipt Template'
        }`
      );
      $('#outletReciept').focus();
      return;
    }
    if (!this.addressLine1 || this.addressLine1.trim() === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteranAddressLine1
          : 'Please enter an Address Line 1'
        }`
      );
      $('#address1').focus();
      return;
    }
    if (!this.port || this.port === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.Pleaseselectaport
          : 'Please select a port'
        }`
      );
      $('#port').focus();
      return;
    }
    if (!this.journeyType || this.journeyType === '') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectaJourneyType
          : 'Please select a Journey Type'
        }`
      );
      $('#journeyType').focus();
      return;
    }

    if (!this.terminalCode || this.terminalCode.trim() === ' ') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenteraTerminalCode
          : 'Please enter a Terminal Code'
        }`
      );
      $('#terminalCode').focus();
      return;
    }
    if (!this.zone || this.zone === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectaZone
          : 'Please select a Zone'
        }`
      );
      $('#zone').focus();
      return;
    }
    if (!this.loungeArea || this.loungeArea === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.Pleaseenterarea
          : 'Please enter an Area'
        }`
      );
      $('#loungeArea').focus();
      return;
    }
    if (!this.capacity || this.capacity === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenterCapacity
          : 'Please enter  Capacity'
        }`
      );
      $('#capacity').focus();
      return;
    }
    if (!this.securedBy || this.securedBy === null) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectSecuredBy
          : 'Please select Secured By'
        }`
      );
      $('#securedBy').focus();
      return;
    }
    if (!this.currency || this.currency === ' ') {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectaBaseCurrency
          : 'Please select a Base Currency'
        }`
      );
      $('#currency').focus();
      return;
    }
    if (!this.dateOfOpening) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleasechooseaDateOfOpening
          : 'Please choose a Date Of Opening'
        }`
      );
      $('#openingDate').focus();
      return;
    }
    if (!this.currentUseStatus) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseselectLoungeStatus
          : 'Please select Lounge Use Status'
        }`
      );
      $('#currentUseStatus').focus();
      return;
    }
    if (!this.phoneNo) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.PleaseenterPhoneNo
          : 'Please enter Phone No'
        }`
      );
      $('#phoneNo').focus();
      return;
    }
    const y = 0;
    const cap = y;
    // tslint:disable-next-line: no-unused-expression
    this.capacity === cap;
    if (Number.isInteger(this.capacity) === false) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.InvalidCapacityNo
          : 'Invalid Capacity No'
        }`
      );
      $('#capacity').focus();
      return;
    } else if (this.capacity < 0) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.CapacityCannotbeNegative
          : 'Capacity Cannot be Negative'
        }`
      );
      $('#capacity').focus();
      return;
    }
    // const z = 0;
    // const area = z;
    // // tslint:disable-next-line: no-unused-expression
    // this.loungeArea === area;
    // if (Number.isInteger(this.loungeArea) === false) {
    //   this.toastr.info(
    //     `${
    //       this.data ? this.data.master.lounge.InvalidLoungeArea : 'Invalid Area'
    //     }`
    //   );
    //   $('#loungeArea').focus();
    //   return;
    // }
    if (this.loungeArea < 0) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.AreaCannotbeNegative
          : 'Area Cannot be Negative'
        }`
      );
      $('#loungeArea').focus();
      return;
    }

    const x = 0;
    const phone = x.toString();
    if (this.phoneNo < phone) {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.InvalidPhoneNo
          : 'Invalid Phone No.'
        }`
      );
      $('#phoneNo').focus();
      return;
    }

    if (this.email === '') {
      this.toastr.info('Please Enter Email');
      $('#email').focus();
      return;
    }

    if (this.email !== '') {
      const emailIds = this.email.split(',')
      for(let email of emailIds){
        if (!this.ValidateEmail(email)) {
          this.toastr.info(
            `${this.data
              ? this.data.master.lounge.enterValidEmail
              : 'Please Enter a Valid email'
            }`
          );
          $('#email').focus();
          return;
        }
      }
    }
    this.loaderMessage = 'Submit Outlet';

    this.WS.post('api/master/lounge/saveLoungeDetails', {
      _id: this._id,
      name: this.name,
      displayName: this.displayName,
      category: this.category,
      code: this.code,
      type: this.type,
      brand: this.brand,
      outletOwnedBy: this.outletOwnedId,
      outletOperatedBy: this.outletOperatedId
        ? this.outletOperatedId
        : this.defaultOutletOperatedId,
      outletReciept: this.outletRecieptId
        ? this.outletRecieptId
        : this.defaultReceiptId,
      parentLounge: this.parentLoungeId,
      businessLine: this.businessLine,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
      airport: this.airportId,
      journeyType: this.journeyType,
      travelDirection: this.travelDirection,
      terminalCode: this.terminalCode,
      subTerminal: this.subTerminal,
      zone: this.zone,
      currentUseStatus: this.currentUseStatus,
      capacity: this.capacity,
      securedBy: this.securedBy,
      description: this.loungeDescription,
      isActive: this.isActive,
      isSecured: this.isSecured,
      baseCurrency: this.currency,
      dateOfOpening: this.dateOfOpening,
      phoneNo: this.phoneNo,
      email: this.email,
      area: this.loungeArea,
      localisation: this.localisation,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this._id = res.result.lounge._id;
        this.name = res.result.lounge.name;
        this.displayName = res.result.lounge.displayName;
        this.localisation = res.result.lounge.localisation;
        this.loungeShifts = res.result.lounge.outletShifts;
        // this.loungeData = this.name;
        this.toastr.success(res.description);
        this.getLounge();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        if (res.description === 'Please Enter a Valid Outlet Owned By Value') {
          $('#outletOwnedBy').focus();
        } else if (
          res.description === 'Please Enter a Valid Outlet Operated By Value'
        ) {
          $('#outletOperatedBy').focus();
        } else if (res.description === 'Please Enter a Valid Port') {
          $('#airport').focus();
        } else if (res.description === 'Outlet Code Must Be Unique') {
          $('#loungeCode').focus();
        } else if (
          res.description === 'Please Enter a Valid Outlet Reciept Value'
        ) {
          $('#outletReciept').focus();
        }
        this.toastr.info(res.description);
      }
    });
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('SUBMIT')) {
      this.showLoungeDetails = false;
      this.getLounge();
      this.resetLoungeData();
    } else {
      this.saveLoungeDetails();
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  public updateLoungeLocalisation(): void {
    this.loadershow = false;
    this.loaderMessage = 'Saving Outlet local names';
    this.WS.post(
      'api/master/lounge/localisation/update', {
      _id: this._id,
      localNames: this.localisation
    }
    ).subscribe((res: IResponse) => {
      // console.log("this is id ", this._id);
      // console.log("this is localname: ", this.localNames)
      if (res.status === 1) {

        this.localisation = res.result.token.localisation;
        this.name = res.result.token.localisation.name[this.lang];
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public fetchReceiptNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchOutletReceiptNames', {
        keyword,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.invoices = res.result.receipts as InvoiceData[];
          if (!this.invoices.length) {
            this.toastr.info('Not found');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.invoices = [];
    }
  }

  public fetchLoungeNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.lounge = res.result.lounge as ILounge[];
            if (!this.lounge.length) {
              this.toastr.info('Not found');
            }
            this.newParentLounge = [];
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

  public fetchLoungeDisplayNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.displayLounge = res.result.lounge as ILounge[];
            if (!this.lounge.length) {
              this.toastr.info('Not found');
            }
            this.newParentLounge = [];
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



  public fetchLoungeNamesClone(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.cloneSourceLounge = res.result.lounge as ILounge[];
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

  public setTokenSearchLounge(lounge: ILounge): void {
    this.getAdvanceSearchLoungeById(lounge._id);
    this.lounge = [];
  }

  public setCloneFromLounge(l: ILounge): void {
    this.cloneFrom = {
      _id: l._id,
      name: l.name,
    };
    this.cloneSourceLounge = [];
    this.fetchOutletTokens(this.cloneFrom._id);
  }

  public fetchOutletTokens(outletID: string): void {
    this.WS.post('api/master/admissionToken/advanced/fetch', {
      outlet: outletID,
      isFetchAll: true,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.tokenPartner = [];
        let uniquePartner = [];
        this.selectedPartners = [];
        for (const token of res.result.tokens) {
          if (!uniquePartner.includes(token.partnerID._id)) {
            this.tokenPartner.push({
              id: token.partnerID._id,
              text: token.partnerID.name,
            });
            uniquePartner.push(token.partnerID._id);
          }
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public getAdvanceSearchLoungeById(loungeId: string): void {
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // tslint:disable-next-line: no-
          this._id = res.result.lounge._id;
          this.loungeName = res.result.lounge.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public setTokenReceipt(invoice: InvoiceData): void {
    this.getReceiptById(invoice._id);
    this.invoices = [];
  }

  public getReceiptById(invoiceId: string): void {
    this.WS.post('api/master/receipt/fetch/id', { id: invoiceId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const receipt: InvoiceData = res.result.receipts[0];
          this.outletRecieptId = res.result.receipts._id;
          this.outletReciept = res.result.receipts.tname;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public fetchOutletOwnedNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partners = res.result.partners as IPartner[];
            if (!this.partners.length) {
              this.toastr.info('Not found');
            }
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

  public setTokenOutletOwned(partner: IPartner): void {
    this.getPartnerById(partner._id);
    this.partners = [];
  }

  public getPartnerById(partnerId: string): void {
    this.WS.post('api/master/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const partner: IPartner = res.result.partners[0];
          this.outletOwnedId = partner._id;
          this.outletOwnedBy = partner.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public fetchOutletOperatedNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/vendor/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.vendors = res.result.vendors as IVendor[];
            if (!this.vendors.length) {
              this.toastr.info('Not found');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.vendors = [];
    }
  }

  public setTokenVendor(vendor: IVendor): void {
    this.getVendorById(vendor._id);
    this.vendors = [];
  }

  public getVendorById(vendorId: string): void {
    this.WS.post('api/master/vendor/fetch/id', { id: vendorId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const vendor: IVendor = res.result.vendors[0];
          this.outletOperatedId = vendor._id;
          this.outletOperatedBy = vendor.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public fetchParentLoungeNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.newParentLounge = res.result.lounge as ILounge[];
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.newParentLounge = [];
    }
  }

  public fetchUserLoungeNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchUserLoungeNames', {
        keyword,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.user = res.result.user as IUser[];
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.user = [];
    }
  }

  public fetchPortNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchPortNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.airport = res.result.airport as IAirport[];
            if (!this.airport.length) {
              this.toastr.info('Not found');
            }
            if (this.airport.length) {
              this.airport.map((token) => {
                if (this.PortType.length) {
                  const matchType = this.PortType.find(
                    (l) => l.keyCode === token.airportType
                  );
                  if (matchType) {
                    token.displayAirportType = matchType.key1;
                  }
                }
              });
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.airport = [];
    }
  }
  public fetchCountryNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/country/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.Country = res.result.values as ICountry[];
            if (!this.Country.length) {
              this.toastr.info('Not found');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.Country = [];
    }
  }

  public setTokenLounge(lounge: ILounge): void {
    this.getLoungeById(lounge._id);
    this.lounge = [];
  }

  public setTokenParentLounge(newParentLounge: ILounge): void {
    this.getParentLoungeById(newParentLounge._id);
    this.newParentLounge = [];
  }

  public setTokenPort(airport: IAirport): void {
    const typedPort = [];
    typedPort.push(airport);

    if (typedPort.length) {
      typedPort.map((token) => {
        if (this.PortType.length) {
          const matchType = this.PortType.find(
            (l) => l.keyCode === token.airportType
          );
          if (matchType) {
            token.displayAirportType = matchType.key1;
          }
        }
      });
    }
    this.getInfoData =
      'City : ' +
      airport.airportCity +
      '\nState : ' +
      airport.airportState +
      '\nRegion : ' +
      airport.airportRegion +
      '\nTime Zone : ' +
      airport.airportTimezone +
      // '\nContinent : ' +
      // airport.airportContinent;
      '\nPort Type : ' +
      airport.displayAirportType;
    this.airportId = airport._id;
    this.port = airport.airportCode + '-' + airport.airportName;
    this.airport = [];
  }

  public setTokenAdvancePort(airport: IAirport): void {
    this.getAdvanceSearchPortById(airport._id);
    this.airport = [];
  }

  public setTokenAdvanceCountry(Country: ICountry): void {
    this.getAdvanceSearchCountryById(Country._id);
    this.Country = [];
  }

  public getAdvanceSearchCountryById(countryId: string): void {
    this.WS.post('api/master/country/fetch/id', { id: countryId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.Country._id;
          this.name = res.result.Country.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public getAdvanceSearchPortById(airportId: string): void {
    this.WS.post('api/master/airport/fetch/id', { id: airportId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.airport._id;
          this.portCode = res.result.airport.airportName;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public getOID(oid: String): void {
    this.clipboardid = oid;
    // console.log('2165', oid);
  }
  public copiedMessage() {
    this.toastr.info(
      `${this.data
        ? this.data.master.partner.cbcopymsg
        : 'ID Copied to Clipboard'
      }`
    );
  }

  public saveNewLoungePhotos(files: File[]): void {
    for (const file of files) {
      const fileName = file.name.split('.');
      this.WS.post('api/master/s3/presignedURL', {
        type: 'lounge-photos',
        contentType: file.type,
        fileSize: file.size,
        extension: fileName[fileName.length - 1],
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
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
                  this.WS.post('api/master/lounge/photos/save', {
                    _id: this._id,
                    path: res.result.urlInfo.key,
                    fileSize: file.size,
                  }).subscribe((r: any) => {
                    if (r.status === 1) {
                      this.photos.push(r.result.url);
                      this.addNewLoungePhotos = false;
                      this.toastr.success(r.description);
                    } else if (r.status === 2) {
                      this.toastr.info(r.description);
                    } else {
                      this.toastr.error(r.description);
                    }
                  });
              }
            }
          );
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    }
  }

  public deleteSample(path: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${this.data
            ? this.data.master.lounge.deleteoutletphotoconfirmation
            : 'Delete Outlet Photo Confirmation!'
          }`,
        message: `${this.data
            ? this.data.master.lounge.areyousureyouwanttodeletethisoutletphoto
            : 'Are you sure you want to delete this Outlet Photo?'
          }`,
        labelConfirm: `${this.data ? this.data.master.lounge.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.lounge.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/lounge/photos/delete', {
            _id: this._id,
            path,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.photos.splice(this.photos.indexOf(path), 1);
              this.toastr.success(res.description);
            } else if (res.status === 2) {
              this.toastr.info(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        }
      });
    } else {
      this.toastr.info(
        `${this.data
          ? this.data.master.lounge.AccessDeniedformoduleUSERSactionDELETE
          : 'Access Denied for module OUTLET action DELETE'
        }`
      );
    }
  }

  public getLoungeById(loungeId: string): void {
    this.tokenRowid = loungeId
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.loungeDatta=res.result.lounge
          this.loungeProductData = res.result.loungePartnerLink;
          this.dataPartnerLink = new MatTableDataSource(this.loungeProductData);
          this._id = res.result.lounge._id;
          this.name = res.result.lounge.name;
          this.displayName = res.result.lounge.displayName === undefined ? res.result.lounge.name : res.result.lounge.displayName;
          this.code = res.result.lounge.code;
          this.category = res.result.lounge.category;
          this.type = res.result.lounge.type;
          this.brand = res.result.lounge.brand;
          this.parentLounge = res.result.lounge.parentLounge;
          this.outletOwnedBy = res.result.lounge.outletOwnedBy.displayName;
          this.outletOperatedBy =
            res.result.lounge.outletOperatedBy.displayName;
          this.outletReciept = res.result.lounge.outletReciept.tname;
          this.outletRecieptId = res.result.lounge.outletReciept._id;
          this.businessLine = res.result.lounge.businessLine;
          this.addressLine1 = res.result.lounge.addressLine1;
          this.addressLine2 = res.result.lounge.addressLine2;
          this.shard = res.result.lounge.shardKey;
          this.port = res.result.lounge.airport.airportName;
          this.capacity = res.result.lounge.capacity;
          this.loungeArea = res.result.lounge.area;
          this.journeyType = res.result.lounge.journeyType;
          this.travelDirection = res.result.lounge.travelDirection;
          this.terminalCode = res.result.lounge.terminalCode;
          this.subTerminal = res.result.lounge.subTerminal;
          this.zone = res.result.lounge.zone;
          this.currentUseStatus = res.result.lounge.currentUseStatus;
          this.securedBy = res.result.lounge.securedBy;
          this.currency = res.result.lounge.baseCurrency;
          this.dateOfOpening = res.result.lounge.dateOfOpening;
          this.isActive = res.result.lounge.isActive;
          this.isSecured = res.result.lounge.isSecured;
          this.statusHistory = res.result.lounge.statusHistory
          this.phoneNo = res.result.lounge.phoneNo;
          this.email = res.result.lounge.email;
          this.loungeDescription = res.result.lounge.description;
          this.pointLocation = res.result.lounge.pointLocation ? res.result.lounge.pointLocation.coordinates : '';
          this.getOID(res.result.lounge._id);
          this.getParentOutletsData();
          this.localisation = res.result.lounge.localisation;
          this.photos = res.result.lounge.photos;
          this.showLoungeDetails = true;
          this.loungeTimings = res.result.lounge.timings;
          this.loungeShifts = res.result.lounge.outletShifts;
          this.outSettings = res.result.outletSettings;
          this.getProductLounge();
          this.mapTableSetting();
          this.getUserLounge();
          this.mapWeekdaysOnTiming();
          this.fetchLoungeFeatures();
          this.getLoungeUseStatusHistory(loungeId);
          this.fetchAIDocuments(loungeId)
          this.mapGlobalSettingsOnData();
          this.setTokenPort(res.result.lounge.airport);
          this.updateLocalisation();
          if (res.result.lounge.statusHistory && res.result.lounge.statusHistory.length > 0) {
            this.mapActionHistory(this.statusHistory);
          } else {
            this.mapActionHistory([]);
          }
          this.dayShift1 = res.result.lounge.outletShifts[0].shiftName
            ? res.result.lounge.outletShifts[0].shiftName
            : 'Shift-AM';
          // console.log(this.dayShift1);
          // console.log('loungeShifts', this.loungeShifts);
          this.dayShift2 = res.result.lounge.outletShifts[1].shiftName
            ? res.result.lounge.outletShifts[1].shiftName
            : 'Shift-PM';
          // console.log(this.dayShift2);
          this.dayShift3 = res.result.lounge.outletShifts[2].shiftName
            ? res.result.lounge.outletShifts[2].shiftName
            : 'Shift-Night';
          this.openingTime1 = res.result.lounge.outletShifts[0].openingTime
            ? res.result.lounge.outletShifts[0].openingTime
            : '06:00';
          this.openingTime2 = res.result.lounge.outletShifts[1].openingTime
            ? res.result.lounge.outletShifts[1].openingTime
            : '14:00';
          this.openingTime3 = res.result.lounge.outletShifts[2].openingTime
            ? res.result.lounge.outletShifts[2].openingTime
            : '22:00';
          this.closingTime1 = res.result.lounge.outletShifts[0].closingTime
            ? res.result.lounge.outletShifts[0].closingTime
            : '14:00';
          this.closingTime2 = res.result.lounge.outletShifts[1].closingTime
            ? res.result.lounge.outletShifts[1].closingTime
            : '22:00';
          this.closingTime3 = res.result.lounge.outletShifts[2].closingTime
            ? res.result.lounge.outletShifts[2].closingTime
            : '06:00';
          this.dataSourceShifts = new MatTableDataSource(this.loungeShifts);
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public getParentLoungeById(loungeId: string): void {
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.parentLounge = res.result.lounge.name;
          this.category = res.result.lounge.category;
          this.brand = res.result.lounge.brand;
          this.businessLine = res.result.lounge.businessLine;
          this.parentLoungeId = res.result.lounge._id;
          this.port = res.result.lounge.airport.airportName;
          this.airportId = res.result.lounge.airport._id;
          this.journeyType = res.result.lounge.journeyType;
          this.travelDirection = res.result.lounge.travelDirection;
          this.terminalCode = res.result.lounge.terminalCode;
          this.subTerminal = res.result.lounge.subTerminal;
          this.zone = res.result.lounge.zone;
          this.securedBy = res.result.lounge.securedBy;
          this.addressLine1 = res.result.lounge.addressLine1;
          this.addressLine2 = res.result.lounge.addressLine2;
          this.phoneNo = res.result.lounge.phoneNo;
          this.currency = res.result.lounge.baseCurrency;
          this.dateOfOpening = res.result.lounge.dateOfOpening;
          this.email = res.result.lounge.email;
          this.loungeDescription = res.result.lounge.description;
          this.setTokenPort(res.result.lounge.airport);
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public getAirportById(loungeId: string): void {
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const airport: IAirport = res.result.airport;
          this.airportId = airport._id;
          this.port = airport.airportName;
          this.code = airport.airportCode;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  private mapWeekdaysOnTiming(): void {
    if (this._id !== '') {
      this.displayLoungeTime = [];
      for (const day of this.weekdays) {
        const matchLoungeTime = this.loungeTimings.find(
          (lt) => lt.day === day.keyCode
        );
        if (matchLoungeTime) {
          const displayInterval = [];
          for (const time of matchLoungeTime.intervals) {
            displayInterval.push(`${time.openingTime} - ${time.closingTime}`);
          }
          this.displayLoungeTime.push({
            day: matchLoungeTime.day,
            displayDay: day.key1,
            isClosed: matchLoungeTime.closed,
            intervals: matchLoungeTime.intervals,
            displayInterval: displayInterval.join(', '),
          });
        } else {
          this.displayLoungeTime.push({
            day: day.keyCode,
            displayDay: day.key1,
            isClosed: true,
            intervals: [
              {
                openingTime: '09:00',
                closingTime: '22:00',
              },
            ],
            displayInterval: '',
          });
        }
      }
      this.dataSourceTimings = new MatTableDataSource(this.displayLoungeTime);
    }
  }

  public toggleClosed(dayIndex): void {
    this.displayLoungeTime[dayIndex].isClosed =
      !this.displayLoungeTime[dayIndex].isClosed;
  }

  public saveLoungeTimings(): void {
    // validate that all timings are present
    const loungeTiming = [];
    for (const time of this.displayLoungeTime) {
      for (const interval of time.intervals) {
        if (interval.openingTime === '') {
          this.toastr.info(
            'Opening Time cannot be empty for day - ' + time.displayDay
          );
          return;
        }
        if (interval.closingTime === '') {
          this.toastr.info(
            'Closing Time cannot be empty for day - ' + time.displayDay
          );
          return;
        }
      }
      // validate if times overlap
      const times = time.intervals.map((t) => [t.openingTime, t.closingTime]);
      if (this.isTimeOverlap(times)) {
        this.toastr.info(
          'Timings are overlapping for day - ' + time.displayDay
        );
        return;
      }
      loungeTiming.push({
        closed: time.isClosed,
        day: time.day,
        intervals: time.intervals,
      });
    }
    this.WS.post('api/master/lounge/saveLoungeTimings', {
      _id: this._id,
      loungeTiming,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeTimings = res.result.lounge.timings;
        this.mapWeekdaysOnTiming();
        this.addNewTiming = false;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public saveLoungeShifts(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('ADD_SHIFTS')) {
      // validate that all timings are present
      if (!this.dayShift1 && this.dayShift1 === '') {
        this.toastr.info('Shift-AM cannot be empty');
      }
      if (!this.openingTime1 && this.openingTime1 === '') {
        this.toastr.info('opening time of shift-AM cannot be empty');
      }
      if (!this.closingTime1 && this.closingTime1 === '') {
        this.toastr.info('closing time of shift-AM cannot be empty');
      }
      if (!this.dayShift2 && this.dayShift2 === '') {
        this.toastr.info('Shift-PM cannot be empty');
      }
      if (!this.openingTime2 && this.openingTime2 === '') {
        this.toastr.info('opening time of shift-PM cannot be empty');
      }
      if (!this.closingTime2 && this.closingTime2 === '') {
        this.toastr.info('closing time of shift-PM cannot be empty');
      }
      if (!this.dayShift3 && this.dayShift3 === '') {
        this.toastr.info('Shift-Night cannot be empty');
      }
      if (!this.openingTime3 && this.openingTime3 === '') {
        this.toastr.info('opening time of Shift-Night cannot be empty');
      }
      if (!this.closingTime3 && this.closingTime3 === '') {
        this.toastr.info('closing time of Shift-Night cannot be empty');
      }

      const loungeShifts = [
        {
          shiftName: this.dayShift1,
          openingTime: this.openingTime1,
          closingTime: this.closingTime1,
          firstShift:true,
          queueManagement:false,
          deskCount:2
        },
        {
          shiftName: this.dayShift2,
          openingTime: this.openingTime2,
          closingTime: this.closingTime2,
          firstShift:false,
          queueManagement:false,
          deskCount:2
        },
        {
          shiftName: this.dayShift3,
          openingTime: this.openingTime3,
          closingTime: this.closingTime3,
          firstShift:false,
          queueManagement:false,
          deskCount:2
        },
      ];

      const overlapping = (a, b) => {
        const getMinutes = (s) => {
          const p = s.split(':').map(Number);
          return p[0] * 60 + p[1];
        };
        return (
          getMinutes(a.closingTime) > getMinutes(b.openingTime) &&
          getMinutes(b.closingTime) > getMinutes(a.openingTime)
        );
      };
      const isOverlapping = (loungeShifts) => {
        let i, j;
        for (i = 0; i < loungeShifts.length - 1; i++) {
          for (j = i + 1; j < loungeShifts.length; j++) {
            if (overlapping(loungeShifts[i], loungeShifts[j])) {
              return true;
            }
          }
        }
        return false;
      };

      // console.log(isOverlapping(loungeShifts));

      if (isOverlapping(loungeShifts) === true) {
        this.toastr.info('Please Select the Valid Shifts Time!');
        $('#openingTime2').focus();
        return;
      }

      this.WS.post('api/master/lounge/saveLoungeShifts', {
        _id: this._id,
        loungeShifts,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.loungeShifts = res.result.lounge.outletShifts;
          this.dataSourceShifts = new MatTableDataSource(this.loungeShifts);
          this.addNewShifts = false;
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  private isTimeOverlap(intervals): boolean {
    if (intervals.length === 1) {
      return false;
    }

    intervals.sort((timeSegment1, timeSegment2) =>
      timeSegment1[0].localeCompare(timeSegment2[0])
    );

    for (let i = 0; i < intervals.length - 1; i++) {
      const currentEndTime = intervals[i][1];
      const nextStartTime = intervals[i + 1][0];

      if (currentEndTime > nextStartTime) {
        return true;
      }
    }

    return false;
  }

  private fetchLoungeFeatures(): void {
    this.WS.post('api/master/lounge/fetchLoungeFeatures', {
      _id: this._id,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.displayLoungeFeatures = res.result.loungeFeatures;
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public toggleFeature(featureIndex): void {
    this.displayLoungeFeatures[featureIndex].isActive =
      !this.displayLoungeFeatures[featureIndex].isActive;
    this.saveLoungeFeatures();
  }
  public activateAllFeatures(): void {
    const isActive = true;
    this.displayLoungeFeatures.forEach((feature) => {
      feature.isActive = isActive;
    });
    this.saveLoungeFeatures();
  }
  public saveLoungeFeatures(): void {
    this.WS.post('api/master/loungeFeatures/save', {
      _id: this._id,
      loungeFeatures: this.displayLoungeFeatures,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loungeFeatures = res.result.lounge.loungeFeatures;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private mapGlobalSettingsOnData(): void {
    if (this.loungeData.length) {
      this.loungeData.map((token) => {
        if (this.LoungeType.length) {
          const matchType = this.LoungeType.find(
            (l) => l.keyCode === token.type
          );
          if (matchType) {
            token.displayType = matchType.key1;
          }
        }
        if (this.LoungeCategory.length) {
          const matchCat = this.LoungeCategory.find(
            (l) => l.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }

        if (this.JourneyType.length) {
          const matchJourney = this.JourneyType.find(
            (l) => l.keyCode === token.journeyType
          );
          if (matchJourney) {
            token.displayJourney = matchJourney.key1;
          }
        }
        if (this.TravelDirection.length) {
          const matchDirection = this.TravelDirection.find(
            (l) => l.keyCode === token.travelDirection
          );
          if (matchDirection) {
            token.displayDirection = matchDirection.key1;
          }
        }
        if (this.Zone.length) {
          const matchZone = this.Zone.find((l) => l.keyCode === token.zone);
          if (matchZone) {
            token.displayZone = matchZone.key1;
          }
        }
        if (this.CurrentUseStatus.length) {
          const matchCurrentUseStatus = this.CurrentUseStatus.find((l) => l.keyCode === token.currentUseStatus);
          if (matchCurrentUseStatus) {
            token.displayCurrentUseStatus = matchCurrentUseStatus.key1;
          }
        }
        if (this.SecuredBy.length) {
          const matchSecured = this.SecuredBy.find(
            (l) => l.keyCode === token.securedBy
          );
          if (matchSecured) {
            token.displaySecured = matchSecured.key1;
          }
        }
        if (this.BusinessLine.length) {
          const matchBusiness = this.BusinessLine.find(
            (l) => l.keyCode === token.businessLine
          );
          if (matchBusiness) {
            token.displayBusiness = matchBusiness.key1;
          }
        }
      });
    }
    if (this.airport.length) {
      this.airport.map((token) => {
        if (this.PortType.length) {
          const matchType = this.PortType.find(
            (l) => l.keyCode === token.airportType
          );
          if (matchType) {
            token.displayAirportType = matchType.key1;
          }
        }
      });
    }
    this.dataSourceLounge = new MatTableDataSource(this.loungeData);
    this.dataSourceLounge.sort = this.loungeSort;
    this.dataSourceLounge.paginator = this.paginator;
  }

  public saveUserDetails(): void {
    if (!this.userName || this.userName === '') {
      this.toastr.info('Please enter a User Name');
      $('#userName').focus();
      return;
    }
    if (!this.role || this.role === '') {
      this.toastr.info('Please select a User Role');
      $('#"userRole"').focus();
      return;
    }
    if (!this.mobileNo || this.mobileNo === '') {
      this.toastr.info('Please enter a Mobile No.');
      $('#contactNo').focus();
      return;
    }
    if (!this.emailId || this.emailId === '') {
      this.toastr.info('Please enter a Email Id');
      $('#contactEmail').focus();
      return;
    }
    this.WS.post('api/master/lounge/saveUserDetails', {
      lounge_Id: this._id,
      _id: this.userid,
      userName: this.userName,
      role: this.role,
      mobileNo: this.mobileNo,
      emailId: this.emailId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addNewUser = false;
        this.getUserLounge();
        this.resetUserLoungeData();
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public updateUserDetails(): void {
    if (!this.userName || this.userName === '') {
      this.toastr.info('Please enter a User Name');
      $('#userName').focus();
      return;
    }
    if (!this.role || this.role === '') {
      this.toastr.info('Please select a User Role');
      $('#"userRole"').focus();
      return;
    }
    if (!this.mobileNo || this.mobileNo === '') {
      this.toastr.info('Please enter a Mobile No.');
      $('#contactNo').focus();
      return;
    }
    if (!this.emailId || this.emailId === '') {
      this.toastr.info('Please enter a Email Id');
      $('#contactEmail').focus();
      return;
    }

    this.WS.post('api/master/lounge/saveUserDetails', {
      _id: this._id,
      userName: this.userName,
      role: this.role,
      mobileNo: this.mobileNo,
      emailId: this.emailId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addNewUser = false;
        this.getUserLounge();
        this.resetUserLoungeData();
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('IMPORT')) {
      this.showImport = !this.showImport;
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  showContractPriceImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('OUTLET_CONTRACT_PRICING_IMPORT')) {
      this.showPriceImport = !this.showPriceImport;
      this.WS.post('api/master/lounge/write/loungePriceTemplate',{fileName:this.loungePriceTemplateName}).subscribe((res:IResponse)=>{
        try{
          if(res.status==1){
            this.importPriceValidator.updateTemplateURL(res.result.url)
        }
      else{
        this.toastr.info(res.description)
      }}
        catch(err){

        }
    })
  } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  public backToResults(): void {
    this.showImport = false;
    this.getLounge();
  }
  public backToLoungeResults(): void {
    this.showPriceImport = false;
    this.getLounge();
  }

  public fetchPartnerNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partnersLink = res.result.partners as IPartner[];
            if (this.partnersLink.length === 0) {
              this.toastr.info('No Partner Found!');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.partnersLink = [];
    }
  }

  public setTokenPartner(partner: IPartner): void {
    this.partner = { _id: partner._id, name: partner.name };
    this.partnersLink = [];
  }

  public newLoungePartner(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (
      matchPermission &&
      matchPermission['OUTLET'].includes('OUTLET_PARTNER_LINK')
    ) {
      if (this.partner._id === '') {
        this.toastr.error('Enter Valid Partner');
        $('#partnerName').focus();
        return;
      }
      if (this.foreignLoungeId === '') {
        this.toastr.info('Please Enter Foreign Lounge Id');
        $('#foreignLoungeId').focus();
        return;
      }
      this.WS.post('api/master/lounge/loungePartnerLink/upsert', {
        _id: this.loungePartnerId,
        loungeId: this._id,
        partnerId: this.partner._id,
        foreignId: this.foreignLoungeId,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          const linkData = res.result.loungePartnerLink;
          if (this.loungeProductData.some((i) => i._id === linkData._id)) {
            this.loungeProductData.splice(
              this.loungeProductData.findIndex((i) => i._id === linkData._id),
              1
            );
          }
          this.loungeProductData.unshift(linkData);
          this.dataPartnerLink = new MatTableDataSource(this.loungeProductData);
          this.resetLoungePartner();
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  public editLoungePartner(data): void {
    this.loungePartnerId = data._id;
    this.partner._id = data.partnerID._id;
    this.partner.name = data.partnerID.name;
    this.foreignLoungeId = data.partnerLoungeID;
    this.addNewPartnerLoungeLink = true;
  }

  public resetLoungePartner(): void {
    this.loungePartnerId = '';
    this.partner._id = '';
    this.partner.name = '';
    this.foreignLoungeId = '';
    this.addNewPartnerLoungeLink = false;
  }

  public resetOutletSettings(): void {
    this.outletSettings = {
      _id: '',
      lkCode: '',
      keyCode: 0,
      key1: '',
      key2: '',
      key3: '',
      key4: '',
    };
  }

  public editOutletSetting(data): void {
    this.editOutletSettings = true;
    this.outletSettings = {
      _id: data._id,
      lkCode: data.lkCode,
      keyCode: data.keyCode,
      key1: data.key1,
      key2: data.key2,
      key3: data.key3,
      key4: data.key4,
    };
  }

  public hideEditOutletSetting(): void {
    this.editOutletSettings = false;
    setTimeout(() => {
      this.mapTableSetting();
    }, 0);
  }

  public outletSettingUpsert(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (
      matchPermission &&
      matchPermission['OUTLET'].includes('OUTLET_SETTING')
    ) {
      if (this.outletSettings.lkCode === '') {
        this.toastr.info('Look Up code cannot be empty');
        $('#lkCode').focus();
        return;
      }
      if (
        this.outletSettings.keyCode === 0 ||
        this.outletSettings.keyCode < 0
      ) {
        this.toastr.info('Key Code cannot be 0');
        $('#keyCode').focus();
        return;
      }
      if (this.outletSettings.key1 === '') {
        this.toastr.info('Key 1 cannot be empty');
        $('#setting1').focus();
        return;
      }
      this.outletLoaderShow = true;
      this.loaderMessage = 'Saving Outlet Settings';
      this.WS.post('api/master/outlet/settings/upsert', {
        _id: this._id,
        settings: this.outletSettings,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.outSettings = res.result.outletSetting;
          this.mapTableSetting();
          this.editOutletSettings = false;
          this.resetOutletSettings();
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
        this.outletLoaderShow = false;
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  public mapTableSetting(): void {
    this.dataSourceSetting = new MatTableDataSource(this.outSettings);
    this.dataSourceSetting.sort = this.outletSettingSort;
    this.dataSourceSetting.paginator = this.outletSettingPagination;
  }

  ngAfterViewInit(): void {
    if (this.simplesearch.trim() !== '') {
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
          $(event.target).hasClass('select2-selection__choice__remove') ||
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
    this.auth.currentLanguage.subscribe((l) => {
      this.lang = l;
      this.updateLocalisation();
    });
  }

  public cloneEntitlemets(type: number): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('CLONE_OUTLET')) {
      const alert: IAlert = {
        title: `${this.data
            ? this.data.master.admissionToken.confirmClone
            : 'Confirm Clone'
          }`,
        message: `${this.data
            ? this.data.master.admissionToken.confirmCloneEntOutlet
            : 'Data from source outlet will be cloned on this outlet. \n\nDo you want to continue?'
          }`,
        labelConfirm: `${this.data ? this.data.master.admissionToken.yes : 'Yes'
          }`,
        labelCancel: `${this.data ? this.data.master.admissionToken.no : 'No'}`,
        textColor: `${this.data ? this.data.master.admissionToken.black : 'black'
          }`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          if (type === 1) {
            // check if any partner outlet link is missing
            this.WS.post('api/master/outlet/partner/link', {
              _id: [this._id],
              sourceID: this.cloneFrom._id,
              partnerID: this.selectedPartners,
            }).subscribe((re: IResponse) => {
              if (re.status === 1) {
                if (re.result.missingLinks.length) {
                  const popup: IAlert = {
                    title: 'Missing Outlet Partner Links',
                    message:
                      '<p style="text-align: left">Outlet partner link(s) has not been configured for following partner(s):<p>',
                    labelCancel: 'Okay',
                    textColor: 'black',
                  };
                  re.result.missingLinks.forEach((partner, index) => {
                    popup.message += `<p style="text-align: left;">${index + 1
                      }. ${partner.name}</p>`;
                  });
                  this.alerts.alertConfirm(popup).subscribe((r) => {
                    if (r === ALERT_RESPONSE.CONFIRM) {
                    }
                  });
                } else {
                  this.cloneEntitlementActually(type);
                }
              } else if (re.status === 2) {
                this.toastr.info(re.description);
              } else {
                this.toastr.error(re.description);
              }
            });
          } else {
            this.cloneEntitlementActually(type);
          }
        }
      });
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  private cloneEntitlementActually(type: number): void {
    this.loaderMessage = 'Cloning entitlements, please wait...';
    this.outletLoaderShow = true;
    if (this.cloneFrom._id === '') {
      this.toastr.info('Could not find source outlet');
      this.outletLoaderShow = false;
      return;
    }
    $(':button').prop('disabled', true);
    this.WS.post('api/master/lounge/entitlements/clone', {
      _id: [this._id],
      sourceID: this.cloneFrom._id,
      partners: this.selectedPartners,
      type,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.cloneFrom = {
          _id: '',
          name: '',
        };
        this.tokenPartner = [];
        this.selectedPartners = [];
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.outletLoaderShow = false;
      $(':button').prop('disabled', false);
    });
  }

  public selectAllTokenPartners(isChecked: boolean): void {
    if (isChecked) {
      this.selectedPartners = this.tokenPartner.map((p) => p.id);
    } else {
      this.selectedPartners = [];
    }
  }

  private updateLocalisation(): void {
    this.loungeData.map((token) => {
      for (const att of this.localisedAttributes) {
        if (token.localisation) {
          if (token.localisation[att]) {
            token.name =
              token.localisation[att] && token.localisation[att][this.lang]
                ? token.localisation[att][this.lang]
                : '';
          }
        }
      }
    });
    if (this._id !== '') {
      for (const att of this.localisedAttributes) {

        if (this.localisation) {
          //console.log('Localisation-',this.localisation)
          this.name =
            this.localisation[att] &&
              this.localisation[att][this.lang]
              ? this.localisation[att][this.lang]
              : '';

        }
      }
    }
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

  hideLoungeDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showLoungeDetails = false;
      this.location.replaceState('/lounge');
    } else {
      this.showLoungeDetails = false;
    }

    this.resetLoungeData();
    if (this.simplesearch == "") {
      if (this.advanceSearch) {
        this.advanceLoungeDataSearch(this.type, this.category)
      } else {
        this.getLoungeSearch()
      }
    } else {
      this.simpleSearchLoungeData(this.simplesearch);
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
    }, 50);
  }

  addNewLounge(isshow): void {
    this.clipboardid = '';
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('NEW')) {
      this.showLoungeDetails = isshow;

      // for (const att of this.localisedAttributes) {
      //   this.localisation[att] = {};
      // }

      if (isshow) {
        this.localLanguage();
      }
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  public getInfo(): string {
    if (this.getInfoData === undefined) {
      return 'No Info Available';
    } else {
      return this.getInfoData;
    }
  }

  public getInfoOfOutletOwnedBy(): string {
    return 'Choose the partner who owns this outlet';
  }

  public getInfoOfOutletOperatedBy(): string {
    return 'Choose the vendor who operates this outlet';
  }

  public getInfoOfBusinessLine(): string {
    return 'Choose what type of business this outlet do';
  }

  public getInfoOfReceipt(): string {
    return 'Choose a Receipt Template for this particular Outlet';
  }

  public downloadOutletToken(_id: string, OutletName: string): void {
    try {
      this.loadershow = true;
      this.WS.post('api/master/lounge/fetch/fetchTokenByOutlet', {
        lougngeId: _id,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          var todaydates = new Date();
          var curetndatetime = todaydates.toISOString();
          var gettodaydate = this.cs.formatDateTime(new Date(curetndatetime));

          let docDefinition = {
            pageMargins: [40, 60, 40, 60],
            pageSize: 'A4',

            header(currentPage, pageCount) {
              return {
                margin: [30, 30, 30, 30],
                columns: [
                  // tslint:disable-next-line: max-line-length
                  {
                    text: 'PLAZA PREMIUM LOUNGE',
                    fontSize: 10,
                    margin: [10, 5, 0, 0],
                    italics: false,
                    height: 14,
                    bold: false,
                    width: 200,
                  },
                  {
                    text: 'ADMISSION INSTRUCTION ',
                    fontSize: 12,
                    margin: [0, 5, 0, 0],
                    height: 15,
                    bold: true,
                    width: 200,
                  },
                  // tslint:disable-next-line: max-line-length
                  {
                    text: 'Page ' + currentPage + ' of ' + pageCount + '',
                    fontSize: 10,
                    margin: [0, 5, 0, 0],
                    height: 15,
                    bold: false,
                    width: 200,
                  },
                ],
              };
            },
            footer(currentPage, pageCount) {
              return {
                columns: [
                  // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

                  {
                    text:
                      'Copyright © ' +
                      todaydate.getFullYear() +
                      ' PLAZA PREMIUM LOUNGE. All rights reserved \n',
                    alignment: 'left',
                    fontSize: 8,
                    margin: [30, 30, 0, 0],
                    width: '50%',
                  },
                  {
                    text:
                      'Generated By: ' +
                      res.result.generatedBypdf +
                      ', ' +
                      gettodaydate,
                    alignment: 'left',
                    bolf: true,
                    fontSize: 8,
                    margin: [40, 30, 0, 0],
                    width: '50%',
                  },
                ],
              };
            },
            background(currentPage, pageSize) {
              return [
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 28,
                      y1: 28,
                      x2: 570,
                      y2: 28,
                      lineWidth: 2,
                    }, // Up line
                    {
                      type: 'rect',

                      x: 28,
                      y: 28,
                      w: 193,
                      h: 26,
                    },
                    {
                      type: 'rect',

                      x: 221,
                      y: 28,
                      w: 180,
                      h: 26,
                    },
                    {
                      type: 'rect',

                      x: 401,
                      y: 28,
                      w: 169,
                      h: 26,
                    },

                    {
                      type: 'line',
                      x1: 28,
                      y1: 800,
                      x2: 570,
                      y2: 800,
                      lineWidth: 2,
                    }, // Bottom line
                    {
                      type: 'line',
                      x1: 28,
                      y1: 28,
                      x2: 28,
                      y2: 800,
                      lineWidth: 2,
                    }, // Left line
                    {
                      type: 'line',
                      x1: 570,
                      y1: 28,
                      x2: 570,
                      y2: 800,
                      lineWidth: 2,
                    }, // Rigth line
                  ],
                },
              ];
            },
            content: [],
          };
          let todaydate = new Date();
          setTimeout(() => {
            for (let index = 0; index < res.result.tokendata.length; index++) {
              let EntitlementsData = [
                [
                  { text: 'Bin Range', bold: true, fontSize: 11 },
                  { text: 'Outlet Name', bold: true, fontSize: 11 },

                  { text: 'Applicable To', bold: true, fontSize: 11 },
                  { text: 'Entitlement', bold: true, fontSize: 11 },
                  { text: 'Qty', bold: true, fontSize: 11 },
                  { text: 'Within', bold: true, fontSize: 11 },
                  { text: 'Quota', bold: true, fontSize: 11 },
                  { text: 'Currency', bold: true, fontSize: 11 },
                  { text: 'Price', bold: true, fontSize: 11 },
                ],
              ];
              let TokenIdentification = [
                [
                  // { text: 'Mask Pattern', bold: true, fontSize: 11 },
                  { text: 'Start Bin', bold: true, fontSize: 11 },
                  { text: 'End Bin', bold: true, fontSize: 11 },
                  { text: 'Issuing Country', bold: true, fontSize: 11 },
                  // { text: 'Issuing Language', bold: true, fontSize: 11 },
                ],
              ];
              let TokenDetailsTable = [
                [
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                ],
              ];

              let TokenSampletable = [];

              let Localisations = [
                [
                  { text: 'Attribute', bold: true, fontSize: 11 },
                  { text: 'English', bold: true, fontSize: 11 },
                  { text: 'Hindi', bold: true, fontSize: 11 },
                  { text: 'Chinese', bold: true, fontSize: 11 },
                  { text: 'Korean', bold: true, fontSize: 11 },
                ],
              ];
              let DocumentRequired = [
                [
                  { text: 'Name', bold: true, fontSize: 11 },
                  { text: 'Description', bold: true, fontSize: 11 },
                ],
              ];

              var termsandcondition = [
                // [
                // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }
                //  ]
              ];

              if (
                res.result.tokendata[index].documents.length > 0 &&
                res.result.tokendata[index].documents != undefined
              ) {
                for (
                  let l = 0;
                  l < res.result.tokendata[index].documents.length;
                  l++
                ) {
                  let docrow = [];
                  for (let i = 0; i < this.tokenDocuments.length; i++) {
                    if (
                      res.result.tokendata[index].documents[l] ==
                      this.tokenDocuments[i].keyCode
                    ) {
                      docrow.push(
                        { text: this.tokenDocuments[i].key1, fontSize: 10 },
                        { text: this.tokenDocuments[i].key2, fontSize: 10 }
                      );
                      DocumentRequired.push(docrow);
                    }
                  }
                }
              } else {
                let spamrow = [];
                spamrow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 2,
                  alignment: 'center',
                });
                DocumentRequired.push(spamrow);
              }
              /* get documents name */

              if (
                res.result.tokendata[index].tnc != undefined &&
                res.result.tokendata[index].tnc != ''
              ) {
                var tncrow = [];
                tncrow.push({
                  text: res.result.tokendata[index].tnc,
                  bold: true,
                  alignment: 'left',
                  fontSize: 10,
                });
                termsandcondition.push(tncrow);
              } else {
                var tncrow = [];
                tncrow.push({
                  text: 'T&C not found',
                  bold: true,
                  alignment: 'left',
                  fontSize: 10,
                });
                termsandcondition.push(tncrow);
              }

              let BinRange = '';
              if (res.result.tokendata[index].localisation != undefined) {
                let keyvalues = Object.keys(
                  res.result.tokendata[index].localisation
                );
                let loclisationRow = [];
                loclisationRow.push(
                  { text: keyvalues[0], fontSize: 10 },
                  {
                    text: res.result.tokendata[index].localisation.name.en,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.hi,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.chi,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.kor,
                    fontSize: 10,
                  }
                );
                Localisations.push(loclisationRow);
              } else {
                let spamrow = [];
                spamrow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 5,
                  alignment: 'center',
                });
                Localisations.push(spamrow);
              }
              if (res.result.tokendata[index].tokenIdentification.length > 0) {
                for (
                  let k = 0;
                  k < res.result.tokendata[index].tokenIdentification.length;
                  k++
                ) {
                  let row = [];
                  BinRange =
                    res.result.tokendata[index].tokenIdentification[k]
                      .startBIN +
                    '-' +
                    res.result.tokendata[index].tokenIdentification[k].endBIN;
                  row.push(
                    // { text: res.result.tokendata[index].tokenIdentification[k].mask, bold: false, fontSize: 10 },
                    {
                      text: res.result.tokendata[index].tokenIdentification[k]
                        .startBIN,
                      bold: false,
                      fontSize: 10,
                    },
                    {
                      text: res.result.tokendata[index].tokenIdentification[k]
                        .endBIN,
                      bold: false,
                      fontSize: 10,
                    },
                    {
                      text: res.result.tokendata[index].tokenIdentification[k]
                        .issuingCountry,
                      bold: false,
                      fontSize: 10,
                    }
                    // { text: res.result.tokendata[index].tokenIdentification[k].issuingLanguage, bold: false, fontSize: 10 },
                  );
                  TokenIdentification.push(row);
                }
              } else {
                let spamrow = [];
                spamrow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 5,
                  alignment: 'center',
                });
                TokenIdentification.push(spamrow);
              }

              let tokencatgoryname,
                tokeyidentifyby = '',
                tokentypes;

              const matchadmisiontype = this.tokenTypes.find(
                (app) => app.keyCode === res.result.tokendata[index].type
              );
              if (matchadmisiontype) {
                tokentypes = matchadmisiontype.key1;
              }
              if (res.result.imagedata[index] != undefined) {
                if (res.result.imagedata[index].length > 0) {
                  for (
                    let n = 0;
                    n < res.result.imagedata[index].length;
                    n = n + 2
                  ) {
                    if (res.result.imagedata.length > 0) {
                      let tokensamplerow = [];
                      for (let r = 0; r < 2; r++) {
                        if (r + n < res.result.imagedata[index].length) {
                          let getimagelength = '';
                          getimagelength = res.result.imagedata[index][n + r];

                          tokensamplerow.push({
                            width: '50%',
                            stack: [
                              {
                                image: getimagelength,
                                width: 150,
                                fit: [200, 300],
                                alignment: 'center',
                              },
                              {
                                text: '',
                                fontsize: 10,
                                bold: true,
                                fontSize: 10,
                                alignment: 'center',
                              },
                            ],
                          });
                        }
                      }
                      TokenSampletable.push({ columns: tokensamplerow });
                    }
                  }
                } else {
                  TokenSampletable = [];
                }
              } else {
                TokenSampletable = [];
              }
              if (res.result.loundgeEntitlement != undefined) {
                if (res.result.loundgeEntitlement.length > 0) {
                  if (
                    res.result.loundgeEntitlement[index].entitlements.length > 0
                  ) {
                    for (
                      let m = 0;
                      m <
                      res.result.loundgeEntitlement[index].entitlements.length;
                      m++
                    ) {
                      let applicatname;
                      let withinvalues;

                      const matchApp = this.applicableTo.find(
                        (app) =>
                          app.keyCode ===
                          res.result.loundgeEntitlement[index].entitlements[m]
                            .applicableTo
                      );
                      if (matchApp) {
                        applicatname = matchApp.key1;
                      }

                      const matchwithin = this.entitlementWithin.find(
                        (app) =>
                          app.keyCode ===
                          res.result.loundgeEntitlement[index].entitlements[m]
                            .within
                      );
                      if (matchwithin) {
                        withinvalues = matchwithin.key1;
                      }
                      let Price = '';
                      if (
                        res.result.loundgeEntitlement[index].entitlements[m]
                          .discountType === 1
                      ) {
                        Price = Price =
                          res.result.loundgeEntitlement[index].entitlements[m]
                            .discountedPrice + '% Discount';
                      } else {
                        Price =
                          res.result.loundgeEntitlement[index].entitlements[m]
                            .discountedPrice;
                      }

                      let row = [];

                      row.push(
                        { text: BinRange, bold: false, fontSize: 10 },
                        {
                          text:
                            res.result.loundgeEntitlement[index].loungeID ==
                              null
                              ? 'N/A'
                              : res.result.loundgeEntitlement[index].loungeID
                                .name,
                          bold: false,
                          fontSize: 10,
                        },
                        { text: applicatname, bold: false, fontSize: 10 },
                        {
                          text: res.result.loundgeEntitlement[index]
                            .entitlements[m].product.name,
                          bold: false,
                          fontSize: 10,
                        },
                        {
                          text: res.result.loundgeEntitlement[index]
                            .entitlements[m].quantity,
                          bold: false,
                          fontSize: 10,
                        },
                        { text: withinvalues, bold: false, fontSize: 10 },
                        {
                          text: res.result.loundgeEntitlement[index]
                            .entitlements[m].quota
                            ? res.result.loundgeEntitlement[index].entitlements[
                              m
                            ].quota == 99999
                              ? 'Unlimited'
                              : res.result.loundgeEntitlement[index]
                                .entitlements[m].quota
                            : '',
                          bold: false,
                          fontSize: 10,
                        },
                        {
                          text: res.result.loundgeEntitlement[index]
                            .entitlements[m].currency,
                          bold: false,
                          fontSize: 10,
                        },
                        {
                          text: Price,
                          bold: false,
                          fontSize: 10,
                        }
                      );
                      EntitlementsData.push(row);
                    }
                  } else {
                    // if (k == 0) {
                    //   var spanentirow = []
                    //   spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 5, alignment: 'center' })
                    //   EntitlementsData.push(spanentirow)
                    // }
                  }
                } else {
                  let spanentirow = [];
                  spanentirow.push({
                    text: 'No data available in table',
                    bold: true,
                    colSpan: 8,
                    alignment: 'center',
                  });
                  EntitlementsData.push(spanentirow);
                }
              } else {
                let spanentirow = [];
                spanentirow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 9,
                  alignment: 'center',
                });
                EntitlementsData.push(spanentirow);
              }
              for (
                let n = 0;
                n < res.result.tokendata[index].identifiedBy.length;
                n++
              ) {
                let matchIdentifiedBy = this.allTokenIdentifiers.find(
                  (app) =>
                    app.keyCode === res.result.tokendata[index].identifiedBy[n]
                );
                if (matchIdentifiedBy) {
                  tokeyidentifyby += matchIdentifiedBy.key1 + ',';
                }
              }
              tokeyidentifyby = tokeyidentifyby.slice(0, -1);

              const matchcategory = this.tokenCategories.find(
                (app) => app.keyCode === res.result.tokendata[index].category
              );
              if (matchcategory) {
                tokencatgoryname = matchcategory.key1;
              }

              let tokenDetails = [];

              tokenDetails.push(
                { text: 'Name:', bold: false, fontSize: 10 },
                {
                  text: res.result.tokendata[index].name,
                  bold: true,
                  fontSize: 10,
                },
                { text: 'Type:', bold: false, fontSize: 10 },
                { text: tokentypes, bold: false, fontSize: 10 }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Category:', bold: false, fontSize: 10 },
                { text: tokencatgoryname, bold: false, fontSize: 10 },
                { text: 'Identified By:', bold: false, fontSize: 10 },
                { text: tokeyidentifyby, bold: false, fontSize: 10 }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Partner Name:', bold: false, fontSize: 10 },
                {
                  text: res.result.tokendata[index].partnerID.name,
                  bold: false,
                  fontSize: 10,
                },
                { text: 'Created Date:', bold: false, fontSize: 10 },
                {
                  text: this.cs.formatDateTime(
                    res.result.tokendata[index].partnerID.createdOn
                  ),
                  bold: false,
                  fontSize: 10,
                }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              var shorcode = 'N/A';
              if (res.result.tokendata[index].shortCode != undefined) {
                shorcode = res.result.tokendata[index].shortCode;
              }
              tokenDetails.push(
                { text: 'Status:', bold: false, fontSize: 10 },
                {
                  text: this.statusMap[res.result.tokendata[index].status],
                  bold: false,
                  fontSize: 10,
                },
                { text: 'Short Code', bold: false, fontSize: 10 },
                { text: shorcode, bold: false, fontSize: 10 }
              );

              TokenDetailsTable.push(tokenDetails);
              docDefinition.content.push({
                layout: 'noBorders',
                table: {
                  headerRows: 0,
                  widths: [70, 200, 70, 150],
                  body: TokenDetailsTable,
                },
              });

              docDefinition.content.push(
                /* Terms & Conditions */
                '\n',
                {
                  text: 'Terms & Conditions: \n',
                  decoration: 'underline',
                  alignment: 'left',
                  fontSize: 13,
                  margin: [0, 0, 0, 0],
                  bold: true,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: termsandcondition,
                  },
                }
              );
              docDefinition.content.push(
                '\n',
                /* Token Identification table */
                {
                  text: 'Token Identification',
                  decoration: 'underline',
                  bold: true,
                  fontSize: 13,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: TokenIdentification,
                  },
                }
              );

              docDefinition.content.push(
                /* Outlet Entilement table */
                '\n',
                {
                  text: 'Outlet Entitlements: \n',
                  decoration: 'underline',
                  alignment: 'left',
                  fontSize: 13,
                  margin: [0, 0, 0, 0],
                  bold: true,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: [60, 71, 70, 60, 22, 35, 30, 55, 30],
                    body: EntitlementsData,
                  },
                }
              );
              docDefinition.content.push(
                /* Document Required */
                '\n',
                {
                  text: 'Document Required: \n',
                  decoration: 'underline',
                  alignment: 'left',
                  fontSize: 13,
                  margin: [0, 0, 0, 0],
                  bold: true,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: DocumentRequired,
                  },
                }
              );

              docDefinition.content.push(
                /* Token sample */
                '\n',
                {
                  text: 'Token sample',
                  decoration: 'underline',
                  bold: true,
                  fontSize: 13,
                },
                '\n',
                TokenSampletable,
                '\n'
              );

              docDefinition.content.push(
                /* Localisation table data */
                '\n',
                {
                  text: 'Localisation',
                  decoration: 'underline',
                  bold: true,
                  fontSize: 13,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*'],
                    body: Localisations,
                  },
                },
                '\n'
              );

              if (res.result.tokendata.length - 1 > index) {
                docDefinition.content.push({
                  text: '*****************',
                  pageBreak: 'after',
                  alignment: 'center',
                });
              } else {
              }
            }

            let datcounts = res.result.tokendata.length;

            let getgeneratepdffile = pdfMake
              .createPdf(docDefinition)
              .download(OutletName.trim() + '.pdf');
            this.loadershow = false;
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
              let FileName = OutletName + '.pdf';
              const pdfFile = new File([blob], FileName, {
                type: 'application/pdf',
              });
              this.WS.post('api/master/s3/presignedURL', {
                type: 'Partner Contract',
                extension: 'pdf',
                contentType: pdfFile.type,
                fileName: FileName,
              }).subscribe((res: any) => {
                this.WS.put(
                  res.result.urlInfo.url,
                  pdfFile,
                  pdfFile.type
                ).subscribe((event: HttpEvent<any>) => {
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
                        type: 'Partner Contract',
                        Datacount: datcounts,
                        fileName: pdfFile.name,
                        activity: 'Export',
                        extension: 'pdf',
                      }).subscribe((re: IResponse) => {
                        if (re.status === 1) {
                          this.toastr.success('Downloaded successfully');
                          //  resolve(true);
                        } else if (re.status === 2) {
                          this.toastr.success('Not Downloaded');
                          // reject(false)
                        } else {
                          // reject(false)
                        }
                      });
                  }
                });
              });
            });
          }, 500);
        } else {
          this.toastr.info(res.description);
          this.loadershow = false;
        }
      });
    } catch (error) {
      this.loadershow = false;
      this.toastr.error(error.message);
    }
  }

  public downloadOutletTokenNew(_id: string, OutletName: string): void {
    try {
      this.loadershow = true;
      this.WS.post('api/master/lounge/fetch/fetchTokenIdByOutletNew', {
        lougngeId: _id,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          var todaydates = new Date();
          var curetndatetime = todaydates.toISOString();
          var gettodaydate = this.cs.formatDateTime(new Date(curetndatetime));

          let docDefinition = {
            pageMargins: [40, 60, 40, 60],
            pageSize: 'A4',

            header(currentPage, pageCount) {
              return {
                margin: [30, 30, 30, 30],
                columns: [
                  // tslint:disable-next-line: max-line-length
                  {
                    text: 'PLAZA PREMIUM LOUNGE',
                    fontSize: 10,
                    margin: [10, 5, 0, 0],
                    italics: false,
                    height: 14,
                    bold: false,
                    width: 200,
                  },
                  {
                    text: 'ADMISSION INSTRUCTION ',
                    fontSize: 12,
                    margin: [0, 5, 0, 0],
                    height: 15,
                    bold: true,
                    width: 200,
                  },
                  // tslint:disable-next-line: max-line-length
                  {
                    text: 'Page ' + currentPage + ' of ' + pageCount + '',
                    fontSize: 10,
                    margin: [0, 5, 0, 0],
                    height: 15,
                    bold: false,
                    width: 200,
                  },
                ],
              };
            },
            footer(currentPage, pageCount) {
              return {
                columns: [
                  // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

                  {
                    text:
                      'Copyright © ' +
                      todaydate.getFullYear() +
                      ' PLAZA PREMIUM LOUNGE. All rights reserved \n',
                    alignment: 'left',
                    fontSize: 8,
                    margin: [30, 30, 0, 0],
                    width: '50%',
                  },
                  {
                    text:
                      'Generated By: ' +
                      res.result.generatedBypdf +
                      ', ' +
                      gettodaydate,
                    alignment: 'left',
                    bolf: true,
                    fontSize: 8,
                    margin: [40, 30, 0, 0],
                    width: '50%',
                  },
                ],
              };
            },
            background(currentPage, pageSize) {
              return [
                {
                  canvas: [
                    {
                      type: 'line',
                      x1: 28,
                      y1: 28,
                      x2: 570,
                      y2: 28,
                      lineWidth: 2,
                    }, // Up line
                    {
                      type: 'rect',

                      x: 28,
                      y: 28,
                      w: 193,
                      h: 26,
                    },
                    {
                      type: 'rect',

                      x: 221,
                      y: 28,
                      w: 180,
                      h: 26,
                    },
                    {
                      type: 'rect',

                      x: 401,
                      y: 28,
                      w: 169,
                      h: 26,
                    },

                    {
                      type: 'line',
                      x1: 28,
                      y1: 800,
                      x2: 570,
                      y2: 800,
                      lineWidth: 2,
                    }, // Bottom line
                    {
                      type: 'line',
                      x1: 28,
                      y1: 28,
                      x2: 28,
                      y2: 800,
                      lineWidth: 2,
                    }, // Left line
                    {
                      type: 'line',
                      x1: 570,
                      y1: 28,
                      x2: 570,
                      y2: 800,
                      lineWidth: 2,
                    }, // Rigth line
                  ],
                },
              ];
            },
            content: [],
          };
          let todaydate = new Date();
          setTimeout(() => {
            // console.log('results', res.result);
            for (let index = 0; index < res.result.tokendata.length; index++) {
              var Applicable_At = [
                [
                  { text: 'Bin Range', bold: true, fontSize: 11 },
                  { text: 'Outlet Name', bold: true, fontSize: 11 },
                  { text: 'Outlet Address', bold: true, fontSize: 11 },
                  { text: 'Outlet Brand', bold: true, fontSize: 11 },
                ],
              ];

              var TokenDetailsTable = [
                [
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                ],
              ];

              var TokenSampletable = [];
              let tokenIdentificationArray = [];
              let outletEntitilmentArray = [];

              var Localisations = [
                [
                  { text: 'Attribute', bold: true, fontSize: 11 },
                  { text: 'English', bold: true, fontSize: 11 },
                  { text: 'Hindi', bold: true, fontSize: 11 },
                  { text: 'Chinese', bold: true, fontSize: 11 },
                  { text: 'Korean', bold: true, fontSize: 11 },
                ],
              ];
              var DocumentRequired = [
                [
                  { text: 'Name', bold: true, fontSize: 11 },
                  { text: 'Description', bold: true, fontSize: 11 },
                ],
              ];

              var termsandcondition = [
                // [
                // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }
                //  ]
              ];

              if (
                res.result.tokendata[index].documents.length > 0 &&
                res.result.tokendata[index].documents != undefined
              ) {
                // console.log(this.tokenDocuments);
                for (
                  var l = 0;
                  l < res.result.tokendata[index].documents.length;
                  l++
                ) {
                  var docrow = [];
                  for (var i = 0; i < this.tokenDocuments.length; i++) {
                    if (
                      res.result.tokendata[index].documents[l] ==
                      this.tokenDocuments[i].keyCode
                    ) {
                      docrow.push(
                        { text: this.tokenDocuments[i].key1, fontSize: 10 },
                        { text: this.tokenDocuments[i].key2, fontSize: 10 }
                      );

                      DocumentRequired.push(docrow);
                    }
                  }
                }
              } else {
                var spamrow = [];
                spamrow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 2,
                  alignment: 'center',
                });
                DocumentRequired.push(spamrow);
              }

              if (
                res.result.tokendata[index].tnc != undefined &&
                res.result.tokendata[index].tnc != ''
              ) {
                var tncrow = [];
                tncrow.push({
                  text: res.result.tokendata[index].tnc,
                  bold: true,
                  alignment: 'left',
                  fontSize: 10,
                });
                termsandcondition.push(tncrow);
              } else {
                var tncrow = [];
                tncrow.push({
                  text: 'T&C not found',
                  bold: true,
                  alignment: 'left',
                  fontSize: 10,
                });
                termsandcondition.push(tncrow);
              }

              /* get documents name */
              var BinRange = '';
              const matchadmisiontype = this.tokenTypes.find(
                (app) => app.keyCode === res.result.tokendata[index].type
              );
              if (matchadmisiontype) {
                tokentypes = matchadmisiontype.key1;
              }
              if (res.result.tokendata[index].localisation != undefined) {
                var keyvalues = Object.keys(
                  res.result.tokendata[index].localisation
                );
                var loclisationRow = [];
                loclisationRow.push(
                  { text: keyvalues[0], fontSize: 10 },
                  {
                    text: res.result.tokendata[index].localisation.name.en,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.hi,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.chi,
                    fontSize: 10,
                  },
                  {
                    text: res.result.tokendata[index].localisation.name.kor,
                    fontSize: 10,
                  }
                );
                Localisations.push(loclisationRow);
              } else {
                var spamrow = [];
                spamrow.push({
                  text: 'No data available in table',
                  bold: true,
                  colSpan: 5,
                  alignment: 'center',
                });
                Localisations.push(spamrow);
              }

              // console.log(
              //   'res.result.OutletEntitlementwithTokenIdentificatioin.length',
              //   res.result.OutletEntitlementwithTokenIdentificatioin.length
              // );

              var tokencatgoryname,
                tokeyidentifyby = '',
                tokentypes;
              if (res.result.imagedata[index] != undefined) {
                if (res.result.imagedata[index].length > 0) {
                  for (
                    var n = 0;
                    n < res.result.imagedata[index].length;
                    n = n + 2
                  ) {
                    if (res.result.imagedata.length > 0) {
                      var tokensamplerow = [];
                      for (let r = 0; r < 2; r++) {
                        if (r + n < res.result.imagedata[index].length) {
                          var getimagelength = '';
                          getimagelength = res.result.imagedata[index][n + r];

                          tokensamplerow.push({
                            width: '50%',
                            stack: [
                              {
                                image: getimagelength,
                                width: 150,
                                fit: [200, 300],
                                alignment: 'center',
                              },
                              {
                                text: '',
                                fontsize: 10,
                                bold: true,
                                fontSize: 10,
                                alignment: 'center',
                              },
                            ],
                          });
                        }
                      }
                      TokenSampletable.push({ columns: tokensamplerow });
                    }
                  }
                } else {
                  TokenSampletable = [];
                }
              } else {
                TokenSampletable = [];
              }

              for (
                let n = 0;
                n < res.result.tokendata[index].identifiedBy.length;
                n++
              ) {
                let matchIdentifiedBy = this.allTokenIdentifiers.find(
                  (app) =>
                    app.keyCode === res.result.tokendata[index].identifiedBy[n]
                );
                if (matchIdentifiedBy) {
                  tokeyidentifyby += matchIdentifiedBy.key1 + ',';
                }
              }
              tokeyidentifyby = tokeyidentifyby.slice(0, -1);

              const matchcategory = this.tokenCategories.find(
                (app) => app.keyCode === res.result.tokendata[index].category
              );
              if (matchcategory) {
                tokencatgoryname = matchcategory.key1;
              }

              var tokenDetails = [];

              tokenDetails.push(
                { text: 'Name:', bold: false, fontSize: 10 },
                {
                  text: res.result.tokendata[index].name,
                  bold: true,
                  fontSize: 10,
                },
                { text: 'Type:', bold: false, fontSize: 10 },
                { text: tokentypes, bold: false, fontSize: 10 }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Category:', bold: false, fontSize: 10 },
                { text: tokencatgoryname, bold: false, fontSize: 10 },
                { text: 'Identified By:', bold: false, fontSize: 10 },
                { text: tokeyidentifyby, bold: false, fontSize: 10 }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Partner Name:', bold: false, fontSize: 10 },
                {
                  text: res.result.tokendata[index].partnerID.name,
                  bold: false,
                  fontSize: 10,
                },
                { text: 'Created Date:', bold: false, fontSize: 10 },
                {
                  text: this.cs.formatDateTime(
                    res.result.tokendata[index].partnerID.createdOn
                  ),
                  bold: false,
                  fontSize: 10,
                }
              );
              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];

              var shorcode = 'N/A';
              if (res.result.tokendata[index].shortCode != undefined) {
                shorcode = res.result.tokendata[index].shortCode;
              }
              tokenDetails.push(
                { text: 'Status:', bold: false, fontSize: 10 },
                {
                  text: this.statusMap[res.result.tokendata[index].status],
                  bold: false,
                  fontSize: 10,
                },
                { text: 'Short Code', bold: false, fontSize: 10 },
                { text: shorcode, bold: false, fontSize: 10 }
              );

              TokenDetailsTable.push(tokenDetails);
              docDefinition.content.push({
                layout: 'noBorders',
                table: {
                  headerRows: 0,
                  widths: [70, 200, 70, 150],
                  body: TokenDetailsTable,
                },
              });

              docDefinition.content.push(
                /* Terms& Conditions */
                '\n',
                {
                  text: 'Terms & Conditions: \n',
                  decoration: 'underline',
                  alignment: 'left',
                  fontSize: 13,
                  margin: [0, 0, 0, 0],
                  bold: true,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: termsandcondition,
                  },
                }
              );

              let identificatonData =
                res.result.OutletEntitlementwithTokenIdentificatioin[index];
              if (identificatonData.length > 0) {
                for (let p = 0; p < identificatonData.length; p++) {
                  var rowIdentify = [];
                  let arrayBody = [];
                  var EntitlementsData = [
                    [
                      { text: 'Outlet Name', bold: true, fontSize: 11 },

                      { text: 'Applicable To', bold: true, fontSize: 11 },
                      { text: 'Entitlement', bold: true, fontSize: 11 },
                      { text: 'Qty', bold: true, fontSize: 11 },
                      { text: 'Within', bold: true, fontSize: 11 },
                      { text: 'Quota', bold: true, fontSize: 11 },
                      { text: 'Currency', bold: true, fontSize: 11 },
                      { text: 'Price', bold: true, fontSize: 11 },
                    ],
                  ];
                  var TokenIdentification = [
                    [
                      { text: 'Start Bin', bold: true, fontSize: 11 },
                      { text: 'End Bin', bold: true, fontSize: 11 },
                      { text: 'Issuing Country', bold: true, fontSize: 11 },
                    ],
                  ];

                  const elementIdentification =
                    identificatonData[p].identification;
                  const elementLoungeEntitlements =
                    identificatonData[p].loungeEntitlements;

                  BinRange =
                    elementIdentification.startBIN +
                    '-' +
                    elementIdentification.endBIN;
                  rowIdentify.push(
                    // { text: res.result.tokendata[index].tokenIdentification[k].mask, bold: false, fontSize: 10 },
                    {
                      text: elementIdentification.startBIN,
                      bold: false,
                      fontSize: 10,
                    },
                    {
                      text: elementIdentification.endBIN,
                      bold: false,
                      fontSize: 10,
                    },
                    {
                      text: elementIdentification.issuingCountry,
                      bold: false,
                      fontSize: 10,
                    }
                    // { text: res.result.tokendata[index].tokenIdentification[k].issuingLanguage, bold: false, fontSize: 10 },
                  );

                  TokenIdentification.push(rowIdentify);

                  arrayBody.push([
                    [
                      'Token Identification:',
                      '\n',
                      {
                        table: {
                          // headerRows: 1,
                          widths: ['*', '*', '*'],
                          body: TokenIdentification,
                        },
                      },
                      '\n',
                    ],
                  ]);

                  if (elementLoungeEntitlements.length > 0) {
                    // for (let j = 0; j < res.result.loundgeEntitlement.length; j++) {

                    for (let k = 0; k < elementLoungeEntitlements.length; k++) {
                      // res.result.loundgeEntitlement[index][0].entitlements.length
                      let loungeEntitleData = elementLoungeEntitlements[k];
                      if (loungeEntitleData.entitlements.length > 0) {
                        for (
                          let m = 0;
                          m < loungeEntitleData.entitlements.length;
                          m++
                        ) {
                          let Entitlmentss = loungeEntitleData.entitlements[m];
                          var applicatname;
                          let withinvalues;

                          const matchApp = this.applicableTo.find(
                            (app) => app.keyCode === Entitlmentss.applicableTo
                          );
                          if (matchApp) {
                            applicatname = matchApp.key1;
                          }
                          const matchwithin = this.entitlementWithin.find(
                            (app) => app.keyCode === Entitlmentss.within
                          );
                          if (matchwithin) {
                            withinvalues = matchwithin.key1;
                          }
                          let Price = '';
                          if (Entitlmentss.discountType === 1) {
                            Price = Price =
                              Entitlmentss.discountedPrice + '% Discount';
                          } else {
                            Price = Entitlmentss.discountedPrice;
                          }

                          var rowEntitletment = [];
                          rowEntitletment.push(
                            // { text: BinRange, bold: false, fontSize: 10 },
                            {
                              text:
                                loungeEntitleData.loungeID == null
                                  ? 'N/A'
                                  : loungeEntitleData.loungeID.name,
                              bold: false,
                              fontSize: 10,
                            },
                            { text: applicatname, bold: false, fontSize: 10 },
                            {
                              text: Entitlmentss.product.name,
                              bold: false,
                              fontSize: 10,
                            },
                            {
                              text: Entitlmentss.quantity,
                              bold: false,
                              fontSize: 10,
                            },
                            { text: withinvalues, bold: false, fontSize: 10 },
                            {
                              text: Entitlmentss.quota
                                ? Entitlmentss.quota == 99999
                                  ? 'Unlimited'
                                  : Entitlmentss.quota
                                : '',
                              bold: false,
                              fontSize: 10,
                            },
                            {
                              text: Entitlmentss.currency,
                              bold: false,
                              fontSize: 10,
                            },
                            { text: Price, bold: false, fontSize: 10 }
                          );
                          EntitlementsData.push(rowEntitletment);
                        }
                      } else {
                        // // if (k == 0) {
                        // var spanentirow = []
                        // spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 5, alignment: 'center' })
                        // EntitlementsData.push(spanentirow)
                        // }
                      }
                    }

                    arrayBody.push([
                      [
                        'Outlet Entitlements:',
                        '\n',
                        {
                          table: {
                            // headerRows: 0,
                            widths: [71, 70, 60, 35, 44, 45, 45, 65],
                            body: EntitlementsData,
                          },
                        },
                        '\n',
                      ],
                    ]);
                  } else {
                    // var spanentirow = [];
                    // spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 9, alignment: 'center' });
                    // EntitlementsData.push(spanentirow);
                  }
                  docDefinition.content.push(
                    '\n\n',
                    /* Token Identification table */

                    {
                      // layout: 'lightHorizontalLines',
                      table: {
                        widths: ['*'],
                        body: arrayBody,
                      },
                    }
                  );
                }
              }

              docDefinition.content.push(
                /* Document Required */
                '\n',
                {
                  text: 'Document Required: \n',
                  decoration: 'underline',
                  alignment: 'left',
                  fontSize: 13,
                  margin: [0, 0, 0, 0],
                  bold: true,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: DocumentRequired,
                  },
                }
              );

              docDefinition.content.push(
                /* Token sample */
                '\n',
                {
                  text: 'Token sample',
                  decoration: 'underline',
                  bold: true,
                  fontSize: 13,
                },
                '\n',
                TokenSampletable,
                '\n'
              );

              docDefinition.content.push(
                /* Localisation table data */
                '\n',
                {
                  text: 'Localisation',
                  decoration: 'underline',
                  bold: true,
                  fontSize: 13,
                },
                '\n',
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*', '*', '*', '*'],
                    body: Localisations,
                  },
                },
                '\n'
              );

              if (res.result.tokendata.length - 1 > index) {
                docDefinition.content.push({
                  text: '-------------',
                  pageBreak: 'after',
                  alignment: 'center',
                });
              }
            }

            let datcounts =
              res.result.OutletEntitlementwithTokenIdentificatioin.length;

            let getgeneratepdffile = pdfMake
              .createPdf(docDefinition)
              .download(OutletName.trim() + '.pdf');
            this.loadershow = false;
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);
            pdfDocGenerator.getBlob((blob) => {
              let FileName = OutletName + '.pdf';
              const pdfFile = new File([blob], FileName, {
                type: 'application/pdf',
              });
              this.WS.post('api/master/s3/presignedURL', {
                type: 'Partner Contract',
                extension: 'pdf',
                contentType: pdfFile.type,
                fileName: FileName,
              }).subscribe((res: any) => {
                this.WS.put(
                  res.result.urlInfo.url,
                  pdfFile,
                  pdfFile.type
                ).subscribe((event: HttpEvent<any>) => {
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
                        type: 'Partner Contract',
                        Datacount: datcounts,
                        fileName: pdfFile.name,
                        activity: 'Export',
                        extension: 'pdf',
                      }).subscribe((re: IResponse) => {
                        if (re.status === 1) {
                          this.toastr.success('Downloaded successfully');
                        } else if (re.status === 2) {
                          this.toastr.success('Not Downloaded');
                        } else {
                          // reject(false)
                        }
                      });
                  }
                });
              });
            });
          }, 500);
        } else {
          this.toastr.info(res.description);
          this.loadershow = false;
        }
      });
    } catch (error) {
      this.loadershow = false;
      this.toastr.error(error.message);
    }
  }

  private fetchAdmissionTypes(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.tokenTypes = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchTokenDocuments(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.tokenDocuments = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchApplicableTo(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.applicableTo = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchAdmissionCategory(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.tokenCategories = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchTokenIdentifiedBy(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.allTokenIdentifiers = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchEntitlementWithin(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      if (res.status === 1) {
        this.entitlementWithin = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      setTimeout(() => {
        img.onload = () => {
          let canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          let dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        };
      }, 500);

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('OUTLET')
    );
    if (matchPermission && matchPermission['OUTLET'].includes('EXPORT')) {
      try {
        this.outletLoaderShow = true;
        this.loaderMessage = 'Exporting data..';

        this.exporter.exportTable('xlsx', { fileName: filename });

        setTimeout(() => {
          this.outletLoaderShow = false;
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
    this.lounge.length = 0;
    this.airport.length = 0;
    this.Country.length = 0;
    this.partners.length = 0;
    this.vendors.length = 0;
    this.newParentLounge.length = 0;
    this.invoices.length = 0;
    this.user.length = 0;
    this.partnersLink.length = 0;
    this.cloneSourceLounge.length = 0;
  }

  tokenSearchSuggestionIndex = -1;

  onTokenSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenSearchSuggestionIndex = Math.max(
          this.tokenSearchSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenSearchSuggestionIndex = Math.min(
          this.tokenSearchSuggestionIndex + 1,
          this.lounge.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenSearchSuggestionIndex >= 0) {
          this.setTokenSearchLounge(
            this.lounge[this.tokenSearchSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenAdvPortSuggestionIndex = -1;

  onTokenAdvPortInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenAdvPortSuggestionIndex = Math.max(
          this.tokenAdvPortSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenAdvPortSuggestionIndex = Math.min(
          this.tokenAdvPortSuggestionIndex + 1,
          this.airport.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenAdvPortSuggestionIndex >= 0) {
          this.setTokenAdvancePort(
            this.airport[this.tokenAdvPortSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenCountrySuggestionIndex = -1;

  onTokenCountryInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenCountrySuggestionIndex = Math.max(
          this.tokenCountrySuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenCountrySuggestionIndex = Math.min(
          this.tokenCountrySuggestionIndex + 1,
          this.Country.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenCountrySuggestionIndex >= 0) {
          this.setTokenAdvanceCountry(
            this.Country[this.tokenCountrySuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

class LoungeValidator extends AbstractValidator<ILoungeImport> {
  public success = 0;
  public failure = 0;
  public eachValue: Subject<ILoungeImport>;
  public title = 'Import Outlet';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Outlet Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/outlet.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Outlet Name*',
      {
        column: 'Outlet Name*',
        key: 'name',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Display Name*',
      {
        column: 'Display Name*',
        key: 'displayName',
        validations: [DataValidatorRequired()],
      },
    ],    
    [
      'Outlet Category*',
      {
        column: 'Outlet Category*',
        key: 'category',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Code*',
      {
        column: 'Outlet Code*',
        key: 'code',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Type*',
      {
        column: 'Outlet Type*',
        key: 'type',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Brand*',
      {
        column: 'Outlet Brand*',
        key: 'brand',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Owned By (Partner)*',
      {
        column: 'Outlet Owned By (Partner)*',
        key: 'outletOwnedBy',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Operated By (Vendor)*',
      {
        column: 'Outlet Operated By (Vendor)*',
        key: 'outletOperatedBy',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Use Receipt Template*',
      {
        column: 'Use Receipt Template*',
        key: 'outletReceipt',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Parent Outlet',
      {
        column: 'Parent Outlet',
        key: 'parentLounge',
        validations: [],
      },
    ],
    [
      'Business Line*',
      {
        column: 'Business Line*',
        key: 'businessLine',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Address Line 1*',
      {
        column: 'Address Line 1*',
        key: 'addressLine1',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Level/Floor',
      {
        column: 'Level/Floor',
        key: 'addressLine2',
        validations: [],
      },
    ],
    [
      'Port*',
      {
        column: 'Port*',
        key: 'airport',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Journey Type*',
      {
        column: 'Journey Type*',
        key: 'journeyType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Terminal Code*',
      {
        column: 'Terminal Code*',
        key: 'terminalCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Sub Terminal',
      {
        column: 'Sub Terminal',
        key: 'subTerminal',
        validations: [],
      },
    ],
    [
      'Zone*',
      {
        column: 'Zone*',
        key: 'zone',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Area(sq meter)*',
      {
        column: 'Area(sq meter)*',
        key: 'area',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Capacity*',
      {
        column: 'Capacity*',
        key: 'capacity',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Is Active',
      {
        column: 'Is Active',
        key: 'isActive',
        validations: [],
      },
    ],
    [
      'Is Secured',
      {
        column: 'Is Secured',
        key: 'isSecured',
        validations: [],
      },
    ],
    [
      'Secured By*',
      {
        column: 'Secured By*',
        key: 'securedBy',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Base Currency*',
      {
        column: 'Base Currency*',
        key: 'baseCurrency',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Date Of Opening*',
      {
        column: 'Date Of Opening*',
        key: 'dateOfOpening',
        validations: [DataValidatorDate()],
      },
    ],
    [
      'Phone No*',
      {
        column: 'Phone No*',
        key: 'phoneNo',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Email*',
      {
        column: 'Email*',
        key: 'email',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Outlet Description',
      {
        column: 'Outlet Description',
        key: 'description',
        validations: [],
      },
    ],
    [
      'Current Use Status*',
      {
        column: 'Current Use Status*',
        key: 'currentUseStatus',
        validations: [],
      },
    ],
    
  ]);

  constructor(
    private WS: WebService,
    u: ILoungeImport = null,
    private toastr: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<ILoungeImport>();
    this.fileSubject = new Subject<File>();
    this.eachValue.subscribe((v: any) => {
      this.callSaveLoungeWebService(v);
    });
  }

  callSaveLoungeWebService(inputData: any): void {
    this.WS.post('api/master/lounge/save/import', {
      inputData: inputData,
    }).subscribe((res: any) => {
      const response = res;
      this.saveResponse.next(response);
    });
  }
}

class LoungePriceValidator extends AbstractValidator<ILoungePriceImport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public eachValue: Subject<ILoungePriceImport>;
  public title = 'Import Outlet Price';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'Outlet Price Import';
  public templateName = 'Outlet Price Template';
  public templateURL =''
    // env.BASE_URL + 'api/master/template/download/LoungePriceTemplate.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'MasterID',
      {
        column: 'MasterID',
        key: 'masterID',
        validations: [],
      },
    ],
    [
      'AccountID*',
      {
        column: 'AccountID*',
        key: 'partnerContractID',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'AddmissionInstructionId*',
      {
        column: 'AddmissionInstructionId*',
        key: 'admissionInstructionID',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'AccountName',
      {
        column: 'AccountName',
        key: 'partnerName',
        validations: [],
      },
    ],
    [
      'AIName',
      {
        column: 'AIName',
        key: 'aiName',
        validations: [],
      },
    ],
    [
      'ClientId',
      {
        column: 'ClientId',
        key: 'partnerID',
        validations: [],
      },
    ],
    [
      'ClientName',
      {
        column: 'ClientName',
        key: 'partnerName',
        validations: [],
      },
    ],
    [
      'ServiceId*',
      {
        column: 'ServiceId*',
        key: 'productSku',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'ServiceName',
      {
        column: 'ServiceName',
        key: 'productName',
        validations: [],
      },
    ],
    [
      'EntitledQuantity*',
      {
        column: 'EntitledQuantity*',
        key: 'EntitledQuantity',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Currency*',
      {
        column: 'Currency*',
        key: 'Currency',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'ApplicableTo*',
      {
        column: 'ApplicableTo*',
        key: 'ApplicableTo',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'ServiceDuration*',
      {
        column: 'ServiceDuration*',
        key: 'ServiceDuration',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'LocationId*',
      {
        column: 'LocationId*',
        key: 'outletCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'LocationName',
      {
        column: 'LocationName',
        key: 'outletName',
        validations: [],
      },
    ],
    [
      'Price*',
      {
        column: 'Price*',
        key: 'contractPrice',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'GrossTransactionAmount',
      {
        column: 'GrossTransactionAmount',
        key: 'amount',
        validations: [],
      },
    ],
    [
      'TaxAmount',
      {
        column: 'TaxAmount',
        key: 'tax',
        validations: [],
      },
    ],
    [
      'TaxRate',
      {
        column: 'TaxRate',
        key: 'taxRate',
        validations: [],
      },
    ],
    [
      'CreatedDate*',
      {
        column: 'CreatedDate*',
        key: 'createdOn',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'ModifiedDate*',
      {
        column: 'ModifiedDate*',
        key: 'modifiedOn',
        validations: [DataValidatorRequired()],
      },
    ],
    // [
    //   'MasterType*',
    //   {
    //     column: 'MasterType*',
    //     key: 'masterType',
    //     validations: [],
    //   },
    // ]
  ]);
  public updateTemplateURL(tokenName: string): void {
    // this.templateURL = env.BASE_URL + `api/master/LoungePriceTemplate/download/${tokenName}.xlsx`;
    this.templateURL = tokenName;
  }

  constructor(private WS: WebService, u: ILoungePriceImport = null) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<ILoungePriceImport>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callPriceUpdate(v);
    });
  }

  callPriceUpdate(inputData: any): void {
    this.WS.post('api/master/lounge/update/contractPrice', {
      data: inputData,
      // inputData: inputData.tJSON,
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID
    }).subscribe((res: any) => {
      // const response = JSON.parse(res);
      this.saveResponse.next(res);
      // this.saveResponse.subscribe(r => console.log(r));
    });
  }
}

export interface ILoungeImport {
  name?: string;
  displayName?: string;
  category?: string;
  code?: string;
  type?: string;
  brand?: string;
  parentLounge?: string;
  businessLine?: string;
  addressLine1?: string;
  addressLine2?: string;
  airport?: string;
  journeyType?: string;
  travelDirection?: string;
  terminalCode?: string;
  subTerminal?: string;
  zone?: string;
  capacity?: string;
  isActive?: boolean;
  isSecured?: boolean;
  securedBy?: string;
  currency?: string;
  dateOfOpening?: string;
  phoneNo?: string;
  email?: string;
  loungeDescription?: string;
}
export class OutletPartnerValidator extends AbstractValidator<ILoungePartnerLinkImport> {
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public eachValue: Subject<ILoungePartnerLinkImport>;
  public title = 'Import Outlet Partner Link';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Outlet Partner Link Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/outletPartnerLink.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Outlet Code*',
      {
        column: 'Outlet Code*',
        key: 'code',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Partner Outlet Id*',
      {
        column: 'Partner Outlet Id*',
        key: 'partnerOutletId',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);
  constructor(
    private WS: WebService,
    private partnerId = null,
    u: ILoungePartnerLinkImport = null
  ) {
    super(u);
    this.eachValue = new Subject<ILoungePartnerLinkImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();
    this.eachValue.subscribe((v: any) => {
      this.callSavePartner(v);
    });
  }

  callSavePartner(inputData: any): void {
    this.WS.post('api/master/lounge/partner/link/save/import', {
      data: inputData,

      partnerId: this.partnerId,
    }).subscribe((res: any) => {
      this.saveResponse.next(res);
    });
  }
}
