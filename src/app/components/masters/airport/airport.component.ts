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
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { AppAlertComponent } from '../../alert-modal/alert.component';

declare var $;
@Component({
  selector: 'app-airport',
  templateUrl: './airport.component.html',
  styleUrls: ['./airport.component.css'],
})
export class AirportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) partnerSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public showData: boolean;
  public data: ILanguage;
  public airport: IAirport[] = [];
  public timezone: ITimezone[] = [];
  public timezoneData: ITimezone[] = [];
  private languageSubscription: Subscription = null;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public showAirportDetails = false;
  public importValidator: AirportValidator;
  public isSidebarOpen: boolean = true;
  public portLoaderShow = false;
  public country: ICountry[] = [];
  public portRegions: IGlobalSetting[] = [];
  public showImport: boolean;
  public ExportLoader = false;
  public exportloaderMessage = '';
  public airportData: IAirport[] = [];
  public dataSourceAirport: MatTableDataSource<IAirport>;
  public displayedColumns: string[] = [
    'airportName',
    'airportCode',
    'airportCity',
    'airportState',
    'airportCountry',
    'airportContinent',
    'airportRegion',
    'airportTimezone',
    'airportTimezoneInUTC',
    'location',
    'status',
  ];
  airportName: any;
  _id: any;
  airportCode: any;
  airportCity: any;
  airportState: any;
  airportCountry: any;
  airportId: any;
  u: IAirport;
  name: any;
  airportCountryId: any;
  airportCount: any;
  airportContinent: any;
  airportRegion: number;
  airportTimezone: [];
  selectedTimezone: [];
  isActive = true;
  portType: IGlobalSetting[];
  port = 0;
  // defaultPort = 0;
  airportTimezoneInUTC: any;
  airportTimezoneId: any;
  airportUTC: any;
  public simpleSearch = '';
  timeZoneInndex: any;
  airportTimezoneNumber: any;
  location:any;
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
    this.importValidator = new AirportValidator(this.WS, this.u, this.toaster);
    this.getAirport();
    this.fetchPortType('PORT_TYPE');
    this.fetchPortRegion('PARTNER_REGION');
    this.fetchFilleTypes('AIRPORT_DOCUMENT_FILE_TYPE');
    // console.log(this.route.snapshot.queryParams.n);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showAirportDetails = true;
    }
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
  }
  // changeLanguage(lang: string) {
  //   throw new Error('Method not implemented.');
  // }

  public getAirport(): void {
    this.portLoaderShow = true;
    this.advanceSearch=false;
    this.WS.post('api/master/airport/fetchAirportData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.portLoaderShow = false;
          this.airportData = res.result as IAirport[];
          this.airportCount = res.result.length;
          this.mapGlobalSettingsOnData();
          this.toaster.success(`${this.airportCount} ${res.description}`);
        } else {
          this.toaster.error(res.description);
          // console.log(res.description);
        }
      }
    );
  }

  private fetchPortType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.portType = res.result.values as IGlobalSetting[];
        if (this.portType.length && this.port === 0) {
          this.port = this.portType[0].keyCode;
        }
        // this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  private fetchPortRegion(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.portRegions = res.result.values as IGlobalSetting[];
        // console.log('192', this.portRegions);
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  private mapGlobalSettingsOnData(): void {
    if (this.airportData.length) {
      this.airportData.map((token) => {
        if (this.portRegions.length) {
          const matchType = this.portRegions.find(
            (l) => l.keyCode === token.airportRegion
          );
          if (matchType) {
            token.displayRegions = matchType.key1;
          }
        }
      });
      this.dataSourceAirport = new MatTableDataSource(this.airportData);
      this.dataSourceAirport.sort = this.partnerSort;
      this.dataSourceAirport.paginator = this.paginator;
    }
  }

  addNewAirport(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PORT_STATION')
    );
    if (matchPermission && matchPermission['PORT_STATION'].includes('NEW')) {
      this.showAirportDetails = isshow;
      this.airportName = '';
      this.airportCode = '';
      this.airportCity = '';
      this.airportState = '';
      this.airportCountry = '';
      this.location = '';
    } else {
      this.toaster.info('Access denied');
    }
  }

  hideAirportDetails() {
    this.showAirportDetails = false;
    this.airportName = '';
    this.airportCode = '';
    this.airportCity = '';
    this.airportState = '';
    this.airportCountry = '';
    this.airportContinent = '';
    this.airportRegion = null;
    this.airportTimezone = [];
    this.airportTimezoneInUTC = '';
    // this.getAirport();
    if (this.simpleSearch === '') {
      if (this.advanceSearch) {
        this.advanceAirportDataSearch()
      } else {
        this.getAirport()
      }
    }
    else {
      this.simpleSearchAirportData(this.simpleSearch)
    }
  }

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

  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PORT_STATION')
    );
    if (matchPermission && matchPermission['PORT_STATION'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
    } else {
      this.toaster.info('Access denied');
    }
  }

  public backToResults(): void {
    this.showImport = false;
    this.getAirport();
  }

  public simpleSearchAirportData(value): void {
    this.advanceSearch=false;
    // console.log(value);
    this.WS.post('api/master/airport/simpleSearchAirportData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.airportData = res.result;
        this.mapGlobalSettingsOnData();
        this.dataSourceAirport = new MatTableDataSource(this.airportData);
        // this.dataSourceAirport.sort = this.partnerSort;
        // this.dataSourceAirport.paginator = this.paginator;
        this.toaster.success(res.description);
      } else {
        this.airportData = [];
        this.mapGlobalSettingsOnData();
        this.dataSourceAirport = new MatTableDataSource(this.airportData);
        // this.dataSourceAirport.sort = this.partnerSort;
        // this.dataSourceAirport.paginator = this.paginator;
        this.toaster.info(res.description);
        // console.log(res.description);
      }
    });
  }

  public openGoogleMaps():void{
    // if(this.location[0] !== null && this.location[1] !== null){
    if(this.location!== '' || this.location){
      const longitude = this.location[1];
      const latitude = this.location[0];
      // const url = `https://www.google.com/maps/search/?api=1&query=${longitude},${latitude}`
      const url = `https://www.google.com/maps/search/?api=1&query=${this.airportName}`
      console.log(this.location);
      window.open(url.toString(), '_blank');
      console.log(url);
    }else{
      this.toaster.info('No Location Found');
    }
  }

  public advanceAirportDataSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true;
    this.WS.post('api/master/airport/advanceAirportDataSearch', {
      name: this.name,
      code: this.airportCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.airportData = res.result;
        this.mapGlobalSettingsOnData();
        this.dataSourceAirport = new MatTableDataSource(this.airportData);
        // this.dataSourceAirport.sort = this.partnerSort;
        // this.dataSourceAirport.paginator = this.paginator;
        this.toaster.success('Successfully Found Data');
      } else {
        this.airportData = [];
        this.mapGlobalSettingsOnData();
        this.dataSourceAirport = new MatTableDataSource(this.airportData);
        // this.dataSourceAirport.sort = this.partnerSort;
        // this.dataSourceAirport.paginator = this.paginator;
        this.toaster.info('No Data Found');
        // console.log(res.description);
      }
      $('#query1').removeClass('visible');
      $('#query1').hide();
      // this.airportDataReset();
      // $('#query1').hide();
    });
  }

  public upsertAirportDetails(): void {
    if (this.airportName === ' ' || !this.airportName) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortName
            : 'Please Enter a Port Name'
        }`
      );
      $('#airportName1').focus();
      return;
    }
    if (this.airportCode === ' ' || !this.airportCode) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortCode
            : 'Please Enter a Port Code'
        }`
      );
      $('#airportCode').focus();
      return;
    }
    if (!this.airportCity || this.airportCity === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortCity
            : 'Please Enter a Port City'
        }`
      );
      $('#airportCity').focus();
      return;
    }
    if (!this.airportState || this.airportState === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortstate
            : 'Please Enter a Port State'
        }`
      );
      $('#airportState').focus();
      return;
    }
    if (!this.airportCountry || this.airportCountry === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortCountry
            : 'Please Enter a Port Country'
        }`
      );
      $('#airportCountry').focus();
      return;
    }
    if (!this.airportContinent || this.airportContinent === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortContinent
            : 'Please Enter a Port Continent'
        }`
      );
      $('#airportContinent').focus();
      return;
    }
    if (!this.airportRegion || this.airportRegion === null) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortRegion
            : 'Please Enter a Port Region'
        }`
      );
      $('#airportRegion').focus();
      return;
    }
    if (!this.airportTimezone || this.airportTimezone === null) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.airport.PleaseenteraPortTimezone
            : 'Please Enter a Port TimeZone'
        }`
      );
      $('#airportTimezone').focus();
      return;
    }

    if (!this.portType || this.portType === null) {
      this.toaster.info('Please select a Port Type');
      $('#portType').focus();
      return;
    }

    this.WS.post('api/master/airport/upsertAirportDetails', {
      _id: this._id,
      airportName: this.airportName,
      airportCode: this.airportCode,
      airportCity: this.airportCity,
      airportState: this.airportState,
      airportCountry: this.airportCountryId,
      airportContinent: this.airportContinent,
      airportRegion: this.airportRegion,
      airportTimezone: this.airportTimezone,
      airportTimeZoneInUTC: this.airportTimezoneNumber,
      location: this.location,
      isActive: this.isActive,
      airportType: this.port,
    }).subscribe((res: IResponse) => {
      // console.log('256', res);
      if (res.status === 1) {
        this.hideAirportDetails();
        this.simpleSearchAirportData(this.simpleSearch)
        this.mapGlobalSettingsOnData();
       // this.getAirport();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  public getAirportById(airportId: string): void {
    this.tokenRowid = airportId
    this.WS.post('api/master/airport/fetch/id', { id: airportId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.airport._id;
          this.airportName = res.result.airport.airportName;
          this.airportCode = res.result.airport.airportCode;
          this.airportCity = res.result.airport.airportCity;
          this.airportState = res.result.airport.airportState;
          this.airportContinent = res.result.airport.airportContinent;
          this.airportRegion = res.result.airport.airportRegion;
          this.airportTimezone = res.result.airport.airportTimezone;
          this.airportTimezoneInUTC = `${'UTC + ' + res.result.airport.airportTimeZoneInUTC}`;
          this.port = res.result.airport.airportType;
          this.airportCountry = res.result.airport.airportCountry.name;
          this.location = res.result.airport.location !== undefined ? res.result.airport.location.coordinates: ''
          this.isActive = res.result.airport.status;
          // console.log(res.result.airport.location.coordinates);
          this.mapGlobalSettingsOnData();
          this.showAirportDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public getAdvancedAirportById(airportId: string): void {
    this.WS.post('api/master/airport/fetch/id', { id: airportId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.airport._id;
          this.name = res.result.airport.airportName;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public fetchPortNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchPortNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.airport = res.result.airport as IAirport[];
            if (!this.airport.length) {
              this.toaster.info('Not found');
            }
            // console.log('zzzz', this.airport);
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.airport = [];
    }
  }
  public fetchTimezoneNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/airport/fetchTimezoneNames', {
        keyword,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.timezone = res.result.utcArray as ITimezone[];
          console.log('486', this.timezone);
          if (!this.timezone.length) {
            this.toaster.info('Not found');
          }
        } else if (res.status === 2) {
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      });
    } else {
      this.timezone = [];
    }
  }

  browseFile(data) {
    this.ExportLoader = true;
    this.exportloaderMessage = 'Uploading File';
    let file = data.file
    let slectedType = data.fileType
    let fileExtension = file.name.split('.').pop();
    this.WS.post('api/master/get/preSignedAWSUrl', {
      type: `uploadedDocs/airport/${slectedType}`,
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
                    associatedEntityType: 'airport', associatedEntityId: this.tokenRowid
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
  public setTokenPort(airport: IAirport): void {
    this.getAirportById(airport._id);
    this.airport = [];
  }

  public setTokenTimezone(timezone: ITimezone, index: any, name:any): void {
    this.getTimezoneById(timezone._id, index,name);
    // this.selectedTimezone = this.airportTimezone;
    this.timezone = [];
  }

  public setTokenAdvancedPort(airport: IAirport): void {
    this.getAdvancedAirportById(airport._id);
    this.airport = [];
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
    // console.log(country._id, '240');
    this.getCountryById(country._id);
    this.country = [];
  }

  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.timezone.length = 0;
    this.airport.length = 0;
    this.country.length = 0;
  }

  airportSuggestionIndex = -1;

  onAirportInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.airportSuggestionIndex = Math.max(
          this.airportSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.airportSuggestionIndex = Math.min(
          this.airportSuggestionIndex + 1,
          this.airport.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.airportSuggestionIndex >= 0) {
          this.setTokenAdvancedPort(this.airport[this.airportSuggestionIndex]);
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  public getCountryById(countryId: string): void {
    this.WS.post('api/master/country/fetch/id', { id: countryId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.airportCountryId = res.result.Country._id;
          this.airportCountry = res.result.Country.name;
          // console.log('350', this.airportCountryId);
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public getTimezoneById(timezoneId: string, index: any,name:any): void {
    this.timeZoneInndex = index;
    console.log('index', index);
    this.WS.post('api/master/timezone/fetch/id', { id: timezoneId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.airportTimezoneId = res.result.Timezone._id;
          console.log('679', this.airportTimezoneId);
          // res.result.Timezone.utc.forEach((el)=>{
          //   this.airportTimezone = el
          // });
          // this.airportTimezone = res.result.Timezone.utc[0];
          // for (let i = 0; i < res.result.Timezone.utc.length; i++){
          //   this.airportTimezone = res.result.Timezone.utc[i];
          // }
          let innerIndex = res.result.Timezone.utc.indexOf(name)
          //this.airportTimezone = res.result.Timezone.utc[this.timeZoneInndex]?res.result.Timezone.utc[this.timeZoneInndex]:res.result.Timezone.utc[0];
          this.airportTimezone = res.result.Timezone.utc[innerIndex]
          // console.log('688',res.result.Timezone.utc[index]);
          // console.log('689',res.result.Timezone.utc[0]);
          // console.log('690',res.result.Timezone.utc);
          // var selectTimezone = [];
          // res.result.Timezone.utc.map((el: any) => {
          //   selectTimezone.push(el);
          // });

          this.airportTimezoneInUTC = `${'UTC +' + res.result.Timezone.offset}`;
          this.airportTimezoneNumber = res.result.Timezone.offset;
          // console.log('567', res.result.Timezone.utc);
          // console.log('568', selectTimezone);
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public airportDataReset(): void {
    this.airportName = '';
    this.airportCode = '';
    this.airportCity = '';
    this.airportState = '';
    this.airportCountry = '';
    this.airportContinent = '';
    this.airportRegion = null;
    this.airportTimezone = [];
    this.airportTimezoneInUTC = '';
    this.location = [null, null];
    // this.port = 0;
  }
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PORT_STATION')
    );
    if (matchPermission && matchPermission['PORT_STATION'].includes('EXPORT')) {
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
}

class AirportValidator extends AbstractValidator<IAirport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  // public importFileId = '';
  public importType = 'Airport';
  public eachValue: Subject<IAirport>;
  public title = 'Import Port/Station';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Airport Template';
  public templateURL = env.BASE_URL + 'api/master/template/download/port.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'PortName*',
      {
        column: 'PortName*',
        key: 'portName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortCode*',
      {
        column: 'PortCode*',
        key: 'portCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortCity*',
      {
        column: 'PortCity*',
        key: 'portCity',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortState*',
      {
        column: 'PortState*',
        key: 'portState',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortCountry*',
      {
        column: 'PortCountry*',
        key: 'portCountry',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortContinent*',
      {
        column: 'PortContinent*',
        key: 'portContinent',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortRegion*',
      {
        column: 'PortRegion*',
        key: 'portRegion',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortTimezone*',
      {
        column: 'PortTimezone*',
        key: 'portTimezone',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PortType*',
      {
        column: 'PortType*',
        key: 'portType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'IsActive',
      {
        column: 'IsActive',
        key: 'isActive',
        validations: [],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IAirport = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IAirport>();
    this.fileSubject = new Subject<File>();
    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSaveAirportWebService(v);
    });
  }

  callSaveAirportWebService(inputData: any): void {
    this.WS.post('api/master/airport/save/import', {
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
  defaultPort?: number;
  displayRegions?: string;
  _id?: string;
  airportName?: string;
  airportCode?: string;
  airportCity?: string;
  airportState?: string;
  airportCountry?: string;
  airportContinent?: string;
  airportType?: number;
  displayAirportType?: string;
  airportRegion?: number;
  airportTimezone?: string;
  status?: string;
}
export interface ITimezone {
  _id?: string;
  value?: string;
  abbr?: string;
  offset?: string;
  isdst?: boolean;
  text?: string;
  utc?: string[];
  status?: string;
}
