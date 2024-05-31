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
import { environment as env } from 'src/environments/environment';
import { Subject, Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { IResponse } from 'src/app/models/server-data-source.model';
import { ICountry } from 'src/app/models/globalSetting.interface';
declare var $;
@Component({
  selector: 'app-airline-code',
  templateUrl: './airline-code.component.html',
  styleUrls: ['./airline-code.component.css'],
})
export class AirlineCodeComponent implements OnInit, AfterViewInit {
  @ViewChild('iata') iata: ElementRef;
  @ViewChild('icao') icao: ElementRef;
  @ViewChild('airline') airline: ElementRef;
  @ViewChild('callSign') callSign: ElementRef;
  @ViewChild('country') country: ElementRef;
  @ViewChild('comments') comments: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('airlineSort') airlineSort: MatSort;
  public selCountry: ICountry[] = [];
  public showAirlineDetails = false;
  public showImport: boolean;
  public isSidebarOpen = true;
  public showData: boolean;
  private languageSubscription: Subscription = null;
  public importValidator: AirlinesValidator;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public ExportLoader = false;
  public exportloaderMessage = '';
  public dataSourceAirline: MatTableDataSource<IAirlines>;
  public blank = '';
  public displayedAirlineColumn: string[] = [
    'airline',
    'country',
    'icao',
    'iata',
    'callSign',
    'comments',
  ];
  public airlineToken = {
    _id: '',
    iata: '',
    icao: '',
    airline: '',
    callSign: '',
    country: '',
    comments: '',
  };
  public airlineTokenAdv = {
    _id: '',
    iata: '',
    icao: '',
    airline: '',
    callSign: '',
    country: '',
    comments: '',
  };
  public airlineData: IAirlines[] = [];
  public airlines: IAirlines[] = [];
  u: IAirlines;
  countryId: any;
  countryName: any;
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
    this.importValidator = new AirlinesValidator(this.WS, this.u);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showAirlineDetails = true;
    }
    this.getAirline();
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
  }
  addNewAirlineCode(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('AIRLINES_CODES')
    );
    if (matchPermission && matchPermission['AIRLINES_CODES'].includes('NEW')) {
      this.showAirlineDetails = isshow;
      // this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
      );
    }
  }
  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('AIRLINES_CODES')
    );
    if (
      matchPermission &&
      matchPermission['AIRLINES_CODES'].includes('IMPORT')
    ) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
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
  hideAirlinesDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showAirlineDetails = false;
    } else {
      this.showAirlineDetails = false;
    }
    this.showAirlineDetails = false;
    this.resetAirline();
    if (this.simpleSearch.trim() === '') {
      // this.getAirline();
      if(this.advanceSearch){
        this.advanceACSearch()
      }else{
        this.getAirline()
      }
    } else {
      this.simpleSearchAirlineData(this.simpleSearch)
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
  public backToResults(): void {
    this.showImport = false;
    this.getAirline();
  }
  public saveAirlinesCodes(): void {
    // if (this.airlineToken.iata.trim() === '') {
    //   this.toaster.info('Please Enter IATA');
    //   // $('#vendorName')
    //   this.iata.nativeElement.focus();
    //   return;
    // }
    // if (this.airlineToken.icao.trim() === '') {
    //   this.toaster.info('Please Enter ICAO');
    //   // $('#actionType')
    //   this.icao.nativeElement.focus();
    //   return;
    // }
    if (this.airlineToken.airline.trim() === '') {
      this.toaster.info('Please Enter Airline');
      // $('#category')
      this.airline.nativeElement.focus();
      return;
    }
    // if (this.airlineToken.callSign.trim() === '') {
    //   this.toaster.info('Please Enter Call Sign');
    //   // $('#tin')
    //   this.callSign.nativeElement.focus();
    //   return;
    // }
    if (this.airlineToken.country.trim() === '') {
      this.toaster.info('Please Enter Country');
      // $('#tin')
      this.country.nativeElement.focus();
      return;
    }
    // if (this.airlineToken.comments.trim() === '') {
    //   this.toaster.info('Please Enter Comments');
    //   // $('#tin')
    //   this.comments.nativeElement.focus();
    //   return;
    // }
     ;
    this.WS.post('api/master/airlinesCodes/save', {
      airlineToken: this.airlineToken,
      countryId: this.countryId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.airlineToken = {
          _id: res.result.airline._id,
          iata: res.result.airline.iata,
          icao: res.result.airline.icao,
          airline: res.result.airline.airline,
          callSign: res.result.airline.callSign,
          country: res.result.airline.country,
          comments: res.result.airline.comments,
        };
        // this.getAirline();
        this.resetAirline();
        this.showAirlineDetails = false;
        this.toaster.success(res.description);
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
          this.selCountry = res.result.Country as ICountry[];
          if (!this.selCountry.length) {
            this.toaster.info('Not found');
          }
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      });
    } else {
      this.selCountry = [];
    }
  }
  public setTokenCountry(country: ICountry): void {
    this.getCountryById(country._id);
    this.selCountry = [];
  }
  public getCountryById(countryId: string): void {
    this.WS.post('api/master/country/fetch/id', { id: countryId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.countryId = res.result.Country._id;
          this.airlineToken.country = res.result.Country.name;
          this.airlineTokenAdv.country = res.result.Country.name;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public getAirline(): void {
    this.advanceSearch=false
    this.WS.post('api/master/airlinesCodes/get').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.airlineData = res.result as IAirlines[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  private mapGlobalSettingsOnData(): void {
    this.dataSourceAirline = new MatTableDataSource(this.airlineData);
    this.dataSourceAirline.sort = this.airlineSort;
    this.dataSourceAirline.paginator = this.paginator;
  }

  public getTableClickData(id: string): void {
    this.getAirlineById(id);
  }

  public getAirlineById(airlineId: string): void {
    this.WS.post('api/master/airlinesCodes/fetch/id', {
      id: airlineId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
         ;
        this.resetAirline();
        const airline: IAirlines = res.result.airlines;
        let countryName;
        if (!res.result.airlines.country) {
          countryName = '';
        } else {
          countryName = res.result.airlines.country.name;
        }
        this.airlineToken = {
          _id: airline._id,
          iata: airline.iata,
          icao: airline.icao,
          airline: airline.airline,
          callSign: airline.callSign,
          country: countryName,
          comments: airline.comments,
        };
        this.showAirlineDetails = true;
      } else {
        this.toaster.info(res.description);
      }
    });
  }

  public resetAirline(): void {
    this.airlineToken = {
      _id: '',
      iata: '',
      icao: '',
      airline: '',
      callSign: '',
      country: '',
      comments: '',
    };
  }

  public fetchAirline(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/airlinesCodes/names/fetch', {
        keyword,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.airlines = res.result.airlines as IAirlines[];
          if (!this.airlines.length) {
            this.toaster.info('Not found');
          }
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      });
    } else {
      this.airlines = [];
    }
  }

  public setTokenAirline(airline: IAirlines, type: string): void {
    if (type === 'search') {
      this.airlineTokenAdv.airline = airline.airline;
      this.airlines = [];
    } else {
      this.getTableClickData(airline._id);
      this.airlines = [];
    }
  }

  public simpleSearchAirlineData(value): void {
    // console.log(value);
    this.advanceSearch=false
    this.WS.post('api/master/airlinesCodes/simpleSearchAirlineData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.airlineData = res.result;
        this.mapGlobalSettingsOnData();
        // this.dataSourceAction = new MatTableDataSource(this.actionData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.airlineData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }

  public advanceACSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true
    this.WS.post(
      'api/master/airlinesCodes/advance/search',
      this.airlineTokenAdv
      // countryId: this.countryId
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
         ;
        this.airlineData = res.result as IAirlines[];

        // this.dataSourceMain = new MatTableDataSource(this.vendorData);
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.airlineData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
      // this.resetReceipt();
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }

  public exportReport(filename) {
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
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.airlines.length = 0;
    this.selCountry.length = 0;
  }

  tokenAirlineSuggestionIndex = -1;

  onTokenAirlineInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenAirlineSuggestionIndex = Math.max(
          this.tokenAirlineSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenAirlineSuggestionIndex = Math.min(
          this.tokenAirlineSuggestionIndex + 1,
          this.airlines.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenAirlineSuggestionIndex >= 0) {
          this.setTokenAirline(
            this.airlines[this.tokenAirlineSuggestionIndex],
            'search'
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
          this.selCountry.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenCountrySuggestionIndex >= 0) {
          this.setTokenCountry(
            this.selCountry[this.tokenCountrySuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

class AirlinesValidator extends AbstractValidator<IAirlines> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importID = '';
  public eachValue: Subject<IAirlines>;
  public title = 'Import Airlines Codes';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'Airlines Codes Import';
  public templateName = 'Airlines Codes Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/airlinesCodes.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'IATA',
      {
        column: 'IATA',
        key: 'iata',
        validations: [],
      },
    ],
    [
      'ICAO',
      {
        column: 'ICAO',
        key: 'icao',
        validations: [],
      },
    ],
    [
      'Airline*',
      {
        column: 'Airline*',
        key: 'airline',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Call Sign',
      {
        column: 'Call Sign',
        key: 'callSign',
        validations: [],
      },
    ],
    [
      'Country*',
      {
        column: 'Country*',
        key: 'country',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Comments',
      {
        column: 'Comments',
        key: 'comments',
        validations: [],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IAirlines = null
    // private toaster: ToastrService
  ) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IAirlines>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSaveAirlinesWebService(v);
    });
  }

  callSaveAirlinesWebService(inputData: any): void {
    // for(let i=0; i<inputData.length; i++ ){

    // }
    this.WS.post('api/master/airlinesCodes/save/import', {
      data: inputData,
      // inputData: inputData.tJSON,
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID,
    }).subscribe((res: any) => {
      // const response = res;
      this.saveResponse.next(res);
    });
  }
}
export interface IAirlines {
  _id?: string;
  iata?: string;
  icao?: string;
  airline?: string;
  callSign?: string;
  country?: string;
  comments?: string;
}
