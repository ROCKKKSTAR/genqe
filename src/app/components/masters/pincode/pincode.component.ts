import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { environment as env } from 'src/environments/environment';

declare var $;
@Component({
  selector: 'app-pincode',
  templateUrl: './pincode.component.html',
  styleUrls: ['./pincode.component.css']
})
export class PincodeComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) pincodeSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("exporter") exporter!: MatTableExporterDirective;
  public isSidebarOpen = true;
  public showPincodeDetails = false;
  public showImport: boolean;
  public showData: boolean;
  private languageSubscription: Subscription = null;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public importValidator: PincodeValidator;

  public ExportLoader = false;
  public exportloaderMessage = ''
  public data: ILanguage;
  public dataSourcePincode: MatTableDataSource<IPincode>;
  public displayedColumns: string[] = ['pincode', 'countryName', 'countryISOCode', 'stateName', 'cityName', 'region', 'status'];
  public loadershow = false;
  public pincodeLoaderShow = false;
  pincodeData: any;
  pincode: any;
  countryName: any;
  countryISOCode: any;
  stateName: any;
  u: IPincode;
  cityName: any;
  region: any;
  _id: any;
  pincodeCount: any;
  isActive = true;
  public simpleSearch = '';
  public advanceSearch:boolean=false

  constructor(private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cs: CommonServiceService,
    private auth: AuthenticationService) { this.showImport = false; }
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
    this.userSub = this.auth.currentUser.subscribe(user => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe(lang => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new PincodeValidator(this.WS, this.u, this.toaster);
    // console.log(this.route.snapshot.queryParams.n);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showPincodeDetails = true;
    }
    this.getPincode();
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
  }

  addNewPincode(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find(l => Object.keys(l).includes('PINCODE'));
    if (matchPermission && matchPermission['PINCODE'].includes('NEW')) {
      this.showPincodeDetails = isshow;
      this._id = '';
    }
    else {
      this.toaster.info('Access denied');
    }


  }

  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find(l => Object.keys(l).includes('PINCODE'));
    if (matchPermission && matchPermission['PINCODE'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
    }
    else {
      this.toaster.info('Access denied');
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

  hidePincodeDetails(): void {
    if (this.route.snapshot.queryParams.n && this.route.snapshot.queryParams.n === 'y') {
      this.showPincodeDetails = false;
    } else {
      this.showPincodeDetails = false;
    }
    this.showPincodeDetails = false;
    this.resetPincodeData();
    // this.getPincode();
    if(this.simpleSearch.trim()===''){
      // this.getPincode();
      if(this.advanceSearch){
        this.advancePincodeDataSearch();
      }else{
        this.getPincode();
      }
    }else{
      this.simpleSearchPincodeData(this.simpleSearch)
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
    }, 50);
  }

  public backToResults(): void {
    this.showImport = false;
    this.getPincode();
  }

  public resetPincodeData(): void {
    this._id = '';
    this.pincode = '';
    this.countryName = '';
    this.countryISOCode = '';
    this.stateName = '';
    this.cityName = '';
    this.region = '';
  }

  public getPincode(): void {
    this.pincodeLoaderShow = true;
    this.advanceSearch=false;

    this.WS.post('api/master/pincode/fetchPincodeData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.simpleSearch='';
          this.pincodeLoaderShow = false;
          this.pincodeData = res.result;
          this.pincodeCount = res.result.length;
          this.dataSourcePincode = new MatTableDataSource(this.pincodeData);
          this.dataSourcePincode.sort = this.pincodeSort;
          this.dataSourcePincode.paginator = this.paginator;
          // console.log(res.result);
          // console.log(this.pincodeData);
          this.toaster.success(`${this.pincodeCount},${res.description}`);
        } else {
          this.toaster.error(res.description);
          // console.log(res.description);
        }
      }
    );
  }

  public simpleSearchPincodeData(value): void {
    // console.log(value);
    this.advanceSearch=false;
    this.WS.post('api/master/pincode/simpleSearchPincodeData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.pincodeData = res.result;
        this.dataSourcePincode = new MatTableDataSource(this.pincodeData);
        this.dataSourcePincode.sort = this.pincodeSort;
        this.dataSourcePincode.paginator = this.paginator;
        this.toaster.success(res.description);
      }
      else if (res.status === 2) {
        this.toaster.error(res.description);
      }
      else if (res.status === 3) {
        this.pincodeData = [];
        this.dataSourcePincode = new MatTableDataSource(this.pincodeData);
        this.dataSourcePincode.sort = this.pincodeSort;
        this.dataSourcePincode.paginator = this.paginator;
        this.toaster.info(res.description);
      } else {
        // console.log(res.description);
      }
    });
  }

  public advancePincodeDataSearch(): void {
    this.simpleSearch='';
    this.advanceSearch=true;
    this.WS.post('api/master/pincode/advancePincodeDataSearch', {
      pincode: this.pincode,
      countryName: this.countryName,
      countryISOCode: this.countryISOCode,
      stateName: this.stateName,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.pincodeData = res.result;
        this.dataSourcePincode = new MatTableDataSource(this.pincodeData);
        this.toaster.success(res.description);
        // console.log(res.description);
      } else {
        this.pincodeData = [];
        this.dataSourcePincode = new MatTableDataSource(this.pincodeData);
        this.toaster.info(res.description);
        // console.log(res.description);
      }
      // this.resetTaxData();
      $('#query1').hide();
    });
  }

  public upsertPincodeDetails(): void {
    if (this.pincode === ' ' || !this.pincode) {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseenteraPincode : 'Please Enter a Pincode'}`);
      $('#pincode1').focus();
      return;
    }
    if (this.countryName === ' ' || !this.countryName) {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseenteraCountryName : 'Please Enter a Country Name'}`);
      $('#countryName').focus();
      return;
    }
    if (!this.countryISOCode || this.countryISOCode === ' ') {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseenteraCountryISOCode : 'Please Enter a Country ISO Code'}`);
      $('#ISOCode').focus();
      return;
    }
    if (!this.stateName || this.stateName === '') {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseenteraStateName : 'Please Enter a State Name'}`);
      $('#stateName').focus();
      return;
    }
    if (!this.cityName || this.cityName === '') {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseselectaCityName : 'Please Select a City Name'}`);
      $('#cityName').focus();
      return;
    }
    if (!this.region || this.region === '') {
      this.toaster.info(`${this.data ? this.data.master.pincode.PleaseselectaRegion : 'Please Select a Region'}`);
      $('#region').focus();
      return;
    }
    this.WS.post('api/master/pincode/upsertPincodeDetails', {
      _id: this._id,
      pincode: this.pincode,
      countryName: this.countryName,
      countryISOCode: this.countryISOCode,
      stateName: this.stateName,
      cityName: this.cityName,
      region: this.region,
      isActive: this.isActive
    }).subscribe((res: IResponse) => {
      // console.log('259', res);
      if (res.status === 1) {
        this.hidePincodeDetails();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  public getPincodeById(pincodeId: string): void {
    this.WS.post('api/master/pincode/fetch/id', { id: pincodeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.Pincode._id;
          this.pincode = res.result.Pincode.pincode;
          this.countryName = res.result.Pincode.countryName;
          this.countryISOCode = res.result.Pincode.countryISOCode;
          this.stateName = res.result.Pincode.stateName;
          this.cityName = res.result.Pincode.cityName;
          this.region = res.result.Pincode.region;
          this.isActive = res.result.Pincode.status;
          this.showPincodeDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public fetchPincode(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/pincode/fetchPincode', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.pincode = res.result.Pincode as IPincode[];
            if (!this.pincode.length) {
              this.toaster.info('Not found')
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.pincode = [];
    }
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PINCODE')
    );
    if (matchPermission && matchPermission['PINCODE'].includes('EXPORT')) {
      try {
        this.ExportLoader = true;
        this.exportloaderMessage = 'Exporting data..'

        this.exporter.exportTable('xlsx', { fileName: filename })

        setTimeout(() => {
          this.ExportLoader = false;
        }, 1000);

      } catch (error) {
        console.log('Error', error)
      }
    } else {
      this.toaster.info(`${this.data ? this.data.admission.accessDenied : 'Access denied'}`);
    }
  }
}

class PincodeValidator extends AbstractValidator<IPincode> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  // public importFileId = '';
  public importType = 'Pincode';
  public loadershow = false;
  public eachValue: Subject<IPincode>;
  public title = 'Import Pincode';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Pincode Template';
  public templateURL = env.BASE_URL + 'api/master/template/download/pincode.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Pincode*',
      {
        column: 'Pincode*',
        key: 'pincode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Country Name*',
      {
        column: 'Country Name*',
        key: 'countryName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Country ISO Code*',
      {
        column: 'Country ISO Code*',
        key: 'countryISOCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'State Name*',
      {
        column: 'State Name*',
        key: 'stateName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'City Name*',
      {
        column: 'City Name*',
        key: 'cityName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Region*',
      {
        column: 'Region*',
        key: 'region',
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
  ]);

  constructor(private WS: WebService, u: IPincode = null, private toaster: ToastrService) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IPincode>();
    this.fileSubject = new Subject<File>();
    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSavePincodeWebService(v);
    });
  }

  callSavePincodeWebService(inputData: any): void {
    this.WS.post('api/master/pincode/save/import', {
      inputData: inputData
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID
    }).subscribe((res: any) => {
      // const response = JSON.parse(res);
      this.saveResponse.next(res);
    });
  }
}

export interface IPincode {
  pincode: string;
  countryName: string;
  countryISOCode: string;
  stateName: string;
  cityName: string;
  region: string;
}
