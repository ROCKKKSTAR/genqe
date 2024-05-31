import { HttpEvent, HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { ICurrency, IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { ILanguage } from 'src/app/models/language.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { MatTableExporterDirective } from 'mat-table-exporter';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { environment as env } from 'src/environments/environment';
declare var $;
@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css'],
})
export class CurrencyComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) currencySort: MatSort;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public isSidebarOpen = true;
  public showCurrencyDetails = false;
  public addCurrencyDetails = false;
  public RespectToType: IGlobalSetting[] = [];
  public ExportLoader = false;
  public exportloaderMessage = '';
  public showImport: boolean;
  public importValidator: CurrencyValidator;
  public showData: boolean;
  public currency: ICurrency[] = [];
  public data: ILanguage;
  private languageSubscription: Subscription = null;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public dataSourceCurrency: MatTableDataSource<ICurrency>;

  public displayedColumns: string[] = [
    'name',
    'currencyCode',
    'value',
    'respectTo',
    'action',
  ];
  public currencyData: ICurrency[] = [];
  public currencyCount: number;
  // currencyId: string;
  u: ICurrency;
  _id: string;
  name: string;
  currencyCode: string;
  value: number;
  public respectTo: any;
  // respectToVal : string;
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

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    // console.log('userid');
    // console.log(this.authenticatedUser._id);
    this.getCurrencyData();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new CurrencyValidator(this.WS, this.u, this.toaster);
    // console.log(this.route.snapshot.queryParams.n);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      //  console.log('Showing import');
      this.showCurrencyDetails = true;
    }
    // this.fetchRespectTo('RESPECT_TO');
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

  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
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

  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CURRENCY')
    );
    if (matchPermission && matchPermission.CURRENCY.includes('IMPORT')) {
      this.showImport = !this.showImport;
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.currency.accessDenied : 'Access Denied'
        }`
      );
      // this.toaster.info('Access denied');
    }
  }

  public backToResults(): void {
    this.showImport = false;
    this.getCurrencyData();
  }

  addNewCurrency(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CURRENCY')
    );
    if (matchPermission && matchPermission.CURRENCY.includes('NEW')) {
      this.addCurrencyDetails = isshow;
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.currency.accessDenied : 'Access Denied'
        }`
      );
      // this.toaster.info('Access denied');
    }
  }

  hideCurrencyDetails(): void {
    this.showCurrencyDetails = false;
    this.addCurrencyDetails = false;
    this.resetCurrencyData();
    // this.getCurrencyData();
    if(this.simpleSearch.trim()==""){
      if(this.advanceSearch){
this.advanceCurrencyDataSearch();
      }else{
this.getCurrencyData()
      }
    }
    else{
this.simpleSearchCurrencyData(this.simpleSearch);
    }
  }




  public resetCurrencyData(): void {
    // console.log('reset clicked');
    this._id = '';
    this.name = '';
    this.currencyCode = '';
    this.value = null;
    this.respectTo = '';
    // this.respectTo = ;
  }

  public getCurrencyData(): void {
    this.advanceSearch=false
    this.WS.post('api/master/currency/getCurrencyData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.simpleSearch=''
          this.currencyData = res.result.currencyData;
          this.currencyCount = res.result.currencyCount;
          this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
          this.dataSourceCurrency.sort = this.currencySort;
          this.dataSourceCurrency.paginator = this.paginator;
          // this.mapGlobalSettingsOnData();
          this.toaster.success(`${this.currencyCount} ${res.description} `);
        } else {
          this.toaster.error(res.description);
          // console.log(res.description);
        }
      }
    );
  }
  // private fetchRespectTo(lookupCode: string): void {
  //   this.WS.post('api/master/globalSetting/fetch/lookupCode', {
  //     lookupCode,
  //   }).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //        ;
  //       this.RespectToType = res.result.values as IGlobalSetting[];
  //       if (this.RespectToType.length && this.respectTo === 0) {
  //         this.respectTo = this.RespectToType[0].keyCode;
  //         // this.respectToVal = this.RespectToType[0].key1;
  //       }
  //       // this.mapGlobalSettingsOnData();
  //     } else if (res.status === 2) {
  //       this.toaster.info(res.description);
  //     } else {
  //       this.toaster.error(res.description);
  //     }
  //   });
  // }
  // private mapGlobalSettingsOnData(): void {
  //   if (this.currencyData.length) {
  //     this.currencyData.map((token) => {
  //       if (this.RespectToType.length) {
  //          ;
  //         const matchCat = this.RespectToType.find(
  //           (t) => t.keyCode === token.respectTo
  //         );
  //         if (matchCat) {
  //           token.displayrespectTo = matchCat.key1;
  //         }
  //       }
  //     });
  //     this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
  //     this.dataSourceCurrency.sort = this.currencySort;
  //     this.dataSourceCurrency.paginator = this.paginator;
  //   }
  // }
  public simpleSearchCurrencyData(value): void {
    this.advanceSearch=false;
    this.WS.post('api/master/currency/simpleSearchCurrencyData', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.currencyData = res.result;
        this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
        this.dataSourceCurrency.sort = this.currencySort;
        this.dataSourceCurrency.paginator = this.paginator;
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.currencyData = [];
        this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
        this.dataSourceCurrency.sort = this.currencySort;
        this.dataSourceCurrency.paginator = this.paginator;
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }

  public advanceCurrencyDataSearch(): void {
    this.advanceSearch=true;
    this.WS.post('api/master/currency/advanceCurrencyDataSearch', {
      currencyName: this.name,
      currencyCode: this.currencyCode,
      currencyValue: this.value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        console.log(res.result);
        this.currencyData = res.result;
        this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
        this.dataSourceCurrency.sort = this.currencySort;
        this.dataSourceCurrency.paginator = this.paginator;
        this.toaster.success(res.description);
      } else {
        this.currencyData = [];
        this.dataSourceCurrency = new MatTableDataSource(this.currencyData);
        this.dataSourceCurrency.sort = this.currencySort;
        this.dataSourceCurrency.paginator = this.paginator;
        this.toaster.info(res.description);
        console.log(res.description);
      }
      this.resetCurrencyData();
      $('#query1').hide();
    });
  }

  public fetchCurrencyById(currencyId: string): void {
    this.WS.post('api/master/currency/fetch/id', { id: currencyId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // console.log(res.result);
          this._id = res.result.currencyData._id;
          this.name = res.result.currencyData.currencyName;
          this.currencyCode = res.result.currencyData.currencyCode;
          this.value = res.result.currencyData.currencyValue;
          this.respectTo = res.result.currencyData.respectTo;
          // this.mapGlobalSettingsOnData();
          this.showCurrencyDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public saveCurrencyDetails(): void {
    // console.log(this._id + 'currency id');
    if (!this.name || this.name === '') {
      $('#name').focus();
      this.toaster.info(
        `${this.data
          ? this.data.master.currency.enterCurrencyName
          : 'Enter Currency Name'
        }`
      );

      // this.toaster.info('Enter Currency Name');
      return;
    }
    if (!this.currencyCode || this.currencyCode === '') {
      $('#currencyCode').focus();
      this.toaster.info(
        `${this.data
          ? this.data.master.currency.enterCurrencyCode
          : 'Enter Currency Code'
        }`
      );
      // this.toaster.info('Enter Currency Code');
      return;
    }
    if (!this.value || this.value === null) {
      $('#value').focus();
      this.toaster.info(
        `${this.data
          ? this.data.master.currency.enterCurrencyValue
          : 'Enter Currency Value wrt INR'
        }`
      );
      // this.toaster.info('Enter Currency Value wrt INR');
      return;
    }
    if (!this.respectTo || this.respectTo === null) {
      $('#respectTo').focus();
      this.toaster.info(
        `${this.data
          ? this.data.master.currency.enterrespectTo
          : 'Enter Respect To'
        }`
      );
      // this.toaster.info('Enter Currency Value wrt INR');
      return;
    }
    this.WS.post('api/master/currency/saveCurrencyData', {
      _id: this._id,
      currencyName: this.name,
      currencyCode: this.currencyCode,
      currencyValue: this.value,
      respectTo: this.respectTo
    }).subscribe((res: IResponse) => {
      // console.log(res);

      if (res.status === 1) {
        this._id = res.result._id;
        this.name = res.result.currencyName;
        this.currencyCode = res.result.currencyCode;
        this.value = res.result.currencyValue;
        this.respectTo = res.result.respectTo;

        this.showCurrencyDetails = false;
        this.addCurrencyDetails = false;
      //  this.getCurrencyData();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.info(res.description);
      }
      this.showData = false;
    });
  }

  // tslint:disable-next-line: typedef
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CURRENCY')
    );
    if (matchPermission && matchPermission['CURRENCY'].includes('EXPORT')) {
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
      this.toaster.info(`${this.data ? this.data.admission.accessDenied : 'Access denied'}`);
    }
  }
}

class CurrencyValidator extends AbstractValidator<ICurrency> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importID = '';
  public eachValue: Subject<ICurrency>;
  public title = 'Import Currency';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Currency Exchange Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/currency.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Currency From*',
      {
        column: 'Currency From*',
        key: 'currencyName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'CurrencyFrom*',
      {
        column: 'CurrencyFrom*',
        key: 'currencyCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Rate*',
      {
        column: 'Rate*',
        key: 'value',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Currency To*',
      {
        column: 'Currency To*',
        key: 'respectTo',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: ICurrency = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<ICurrency>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSaveCurrencyWebService(v);
    });
  }

  callSaveCurrencyWebService(inputData: any): void {
    this.WS.post(
      'api/master/currency/save/import', {
      inputData: inputData,
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID,
    }
    ).subscribe((res: any) => {
      const response = res;
      this.saveResponse.next(response);
    });
  }
}
