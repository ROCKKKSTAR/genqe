import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { MatSort } from '@angular/material/sort';
import { WebService } from 'src/app/services/web.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { IResponse } from 'src/app/models/server-data-source.model';
import { MatTableDataSource } from '@angular/material/table';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/models/user.interface';
import { Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { element } from 'protractor';

// const ELEMENT_DATA: ComponentData[] = [
//   {
//     parameterCode: 'ab45rf',
//     displayValue: 121,
//     parameterValue: 1,
//     parameterDesc: 'This is random thing',
//   },
//   {
//     parameterCode: 'fd43lk',
//     displayValue: 331,
//     parameterValue: 78,
//     parameterDesc: 'This is random thing',
//   },
//   {
//     parameterCode: 'it99jn',
//     displayValue: 9,
//     parameterValue: 44,
//     parameterDesc: 'This is random thing',
//   },
// ];
// export interface ComponentData {
//   parameterCode: string;
//   displayValue: number;
//   parameterValue: number;
//   parameterDesc: string;
// }
declare var $;
@Component({
  selector: 'app-global-setting',
  templateUrl: './global-setting.component.html',
  styleUrls: ['./global-setting.component.css'],
})
export class GlobalSettingComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) globalsettingdataSort: MatSort;
  @ViewChild('globalPaginator') globalPaginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;

  public isSidebarOpen = true;
  public showGlobalSettings = false;
  public globalSettingloadershow = false;
  public simplesearch = '';
  public advanceSearch:boolean=false
  public showImport: boolean;
  public showData: boolean;
  public authenticatedUser: IUser;
  public ExportLoader = false;
  public exportloaderMessage = '';
  private userSub: Subscription;
  // public dataSourceMainpartner: MatTableDataSource<IPartnerResponse>;
  // public displayedColumns: string[] = ['name','event', 'type', 'status'];
  public dataSourceGlobalSetting: MatTableDataSource<IGlobalSetting>;
  public displayedParameterColumn: string[] = [
    'lkCode',
    'keyCode',
    'key1',
    'key2',
    'key3',
    'key4',
    'key5',
    'status',
    'lastModifiedOn',
  ];
  public globalsettingdata: IGlobalSetting[] = [];
  public GSData: IGlobalSetting[] = [];
  lkCode: string;
  keyCode: string;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  key5: string;
  // tslint:disable-next-line: variable-name
  _id: any;
  status: any;
  languageSubscription: Subscription;
  public data: ILanguage;
  globaldata: IGlobalSetting[] = [];
  public globalSetting1: IGlobalSetting = {
    lkCode: '',
    keyCode: 0,
    key1: '',
    key2: '',
    key3: '',
    key4: '',
    key5: '',
    key6: '',
    key7: '',
    key8: '',
    _id: '',
  };
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) {
    this.showImport = false;
  }
  // tslint:disable-next-line: use-lifecycle-interface
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

    // tslint:disable-next-line: typedef
    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection_choice_remove').length ||
          $(event.target).parent('.select2-selection_choice_remove').length ||
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
    this.fetchData();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
  }

  addNewGlobalSetting(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('GLOBAL_SETTING')
    );
    // tslint:disable-next-line: no-string-literal
    if (matchPermission && matchPermission['GLOBAL_SETTING'].includes('NEW')) {
      this.showGlobalSettings = isshow;
      this.lkCode = '';
      this._id = '';
      this.GSData = [];
    } else {
      this.toaster.info('Access denied');
    }
  }
  // tslint:disable-next-line: typedef
  showQueryForm() {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
      this.globalsettingdata = [];
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }

  hideGlobalSettings(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showGlobalSettings = false;
    } else {
      this.showGlobalSettings = false;
    }
    this.showGlobalSettings = false;
    this.ResetGS();
   // this.fetchData();
    // this.resetPincodeData();
    // this.getPincode();

    if (this.simplesearch.trim() === "") {
      if (this.advanceSearch) {
        this.advanceGlobalSettingsDataSearch();
      }
      else{
        this.fetchData();
      }
    } else {
      this.simpleSearchGSData(this.simplesearch)
    }
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      document.getElementById('txtSearch').focus();
    }, 50);
  }
  public fetchglobalsettingsNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/global/fetchGSNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.globalsettingdata = res.result.GS as IGlobalSetting[];
            if (!this.globalsettingdata.length) {
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
      this.globalsettingdata = [];
    }
  }
  public setTokenGlobalsetting(
    globalsettingdata: IGlobalSetting,
    type: string
  ): void {
     ;
    if (type === 'search') {
      this.lkCode = globalsettingdata.lkCode;
      this.globalsettingdata = [];
    } else {
      this.getglobalsettingsById(globalsettingdata._id);

      this.globalsettingdata = [];
    }
  }
  // public setTokenGlobalsetting(globalsettingdata: IGlobalSetting, type: string): void {
  //   this.globalsettingdata = [];
  //   if (type === 'search') {
  //     this.lkCode = globalsettingdata[0].lkCode;
  //     this.globalsettingdata = [];
  //   } else {
  //     this.getglobalsettingsByIdforadv(globalsettingdata._id);
  //     this.globalsettingdata = [];
  //   }
  //   this._id = globalsettingdata._id;
  //   this.lkCode = globalsettingdata[0].lkCode;
  //   this.showGlobalSettings = true;
  //   this.getglobalsettingsById(this._id);
  //   this.globalsettingdata = [];
  // }
  public getglobalsettingsByIdforadv(globalId: string): void {
    this.WS.post('api/master/globalSetting/fetchglobalSetting', {
      id: globalId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.lkCode = res.result.globalsettingdata[0].lkCode;
      } else {
        this.toaster.info(res.description);
      }
    });
  }
  public fetchDataSearch(): void {
    this.simplesearch = '';
    this.fetchData();
  }
  public fetchData(): void {
    this.globalSettingloadershow = true;
    this.simplesearch='';
    this.advanceSearch=false;
    this.WS.post('api/master/globalSetting/fetchdata').subscribe(
      (res: IResponse) => {
        // console.log(res);
        if (res.status === 1) {
          this.globalsettingdata = res.result;
          this.globalsettingdata.map((recors) => {
            // var getFormatedDate = recors.lastModifiedOn==undefined||recors.lastModifiedOn==''?'':this.cs.formatDateTime(recors.lastModifiedOn);

            // recors.lastModifiedOn = getFormatedDate;
            // recors.transactiontime = getFormatedDate[1] + ' ' + getFormatedDate[2]
            if (recors.lastModifiedOn) {
              recors.lastModifiedOn = recors.lastModifiedOn;
            } else {
              recors.lastModifiedOn = '';
            }
            // console.log('this.cs.formatDateTime', this.cs.formatDateTime);
          });
          this.globalSettingloadershow = false;
          this.dataSourceGlobalSetting = new MatTableDataSource(
            this.globalsettingdata
          );
          this.dataSourceGlobalSetting.sort = this.globalsettingdataSort;
          this.dataSourceGlobalSetting.paginator = this.globalPaginator;
          this.toaster.success(res.description);
        } else if (res.status === 2) {
          this.globalSettingloadershow = false;
          this.dataSourceGlobalSetting = new MatTableDataSource(
            this.globalsettingdata
          );
          this.toaster.info(res.description);
        } else {
          this.toaster.error(res.description);
        }
      }
    );
  }
  // tslint:disable-next-line: adjacent-overload-signatures
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  public emptyLkCode() {
    this.GSData = [];
  }

  public advanceGlobalSettingsDataSearch(): void {
    this.simplesearch='';
    this.advanceSearch=true
    // tslint:disable-next-line: no-
    this.WS.post('api/master/globalSetting/advancesearchglobalsetting', {
      lkCode: this.globalSetting1.lkCode,
      status: this.status,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // console.log('admin', this.globalsettingdata);
        this.globalsettingdata = res.result;
        this.globalsettingdata.map((recors) => {
          if (recors.lastModifiedOn) {
            recors.lastModifiedOn = recors.lastModifiedOn;
          } else {
            recors.lastModifiedOn = '';
          }
        });
        this.mapGlobalSettingsData();
        this.globalSettingloadershow = false;
        this.toaster.success('Global Settings Details Found Successfully');
      } else if (res.status === 2) {
        this.globalsettingdata = [];
        this.mapGlobalSettingsData();
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
    $('#query1').hide();
  }

  public mapGlobalSettingsData(): void {
    this.dataSourceGlobalSetting = new MatTableDataSource(
      this.globalsettingdata
    );
    this.dataSourceGlobalSetting.sort = this.globalsettingdataSort;
    this.dataSourceGlobalSetting.paginator = this.globalPaginator;
  }

  public ResetDoubleClick(): void {
    // this.getUserById(this._id)
    if (this._id !== '') {
      this.getglobalsettingsById(this._id);
    } else {
      this.lkCode = '';
      this.keyCode = '';
      this.status = null;
      // this.addNewLounge(true, true);
      this.ResetGlobalSettingsTable();
    }
  }
  public ResetGlobalSettingsTable(): void {
    // this.showUserDetails = true;
    // this.getUserById(this._id)
    this.lkCode = '';
    this.keyCode = '';
    this.key1 = '';
    this.key2 = '';
    this.key3 = '';
    this.key4 = '';
    this.key5 = '';
    this._id = '';
  }
  public ResetAdvanceSearch(): void {
    this.globalSetting1.lkCode = '';
    this.status = null;
  }
  public isJson(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  public objectValidation(): void {
    if (
      this.globalSetting1.key1 !== '' &&
      this.isJson(this.globalSetting1.key1)
    ) {
      this.globalSetting1.key1 = JSON.stringify(
        JSON.parse(this.globalSetting1.key1)
      );
    }
    if (
      this.globalSetting1.key2 !== '' &&
      this.isJson(this.globalSetting1.key2)
    ) {
      this.globalSetting1.key2 = JSON.stringify(
        JSON.parse(this.globalSetting1.key2)
      );
    }
    if (
      this.globalSetting1.key3 !== '' &&
      this.isJson(this.globalSetting1.key3)
    ) {
      this.globalSetting1.key3 = JSON.stringify(
        JSON.parse(this.globalSetting1.key3)
      );
    }
    if (
      this.globalSetting1.key4 !== '' &&
      this.isJson(this.globalSetting1.key4)
    ) {
      this.globalSetting1.key4 = JSON.stringify(
        JSON.parse(this.globalSetting1.key4)
      );
    }
    if (
      this.globalSetting1.key5 !== '' &&
      this.isJson(this.globalSetting1.key5)
    ) {
      this.globalSetting1.key5 = JSON.stringify(
        JSON.parse(this.globalSetting1.key5)
      );
    }
  }
  public upsertGlobalSettingsDetails(): void {
    if (this.globalSetting1.lkCode === ' ' || !this.globalSetting1.lkCode) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.GlobalSettings.PleaseenteraLkCode
            : 'Please enter a LkCode'
        }`
      );
      $('#lkCode').focus();
      return;
    }
    if (this.globalSetting1.keyCode === 0 || this.globalSetting1.keyCode < 0) {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.GlobalSettings.PleaseenterkeyCode
            : 'Please enter keyCode'
        }`
      );
      $('#keyCode').focus();
      return;
    }
    if (!this.globalSetting1.key1 || this.globalSetting1.key1 === ' ') {
      this.toaster.info(
        `${
          this.data
            ? this.data.master.GlobalSettings.Pleaseenterakey1
            : 'Please enter a key1'
        }`
      );
      $('#key1').focus();
      return;
    }
    // if (!this.key2 || this.key2 === '') {
    //   this.toaster.info(`${this.data ? this.data.master.GlobalSettings.Pleaseenterakey2 : 'Please enter a key2'}`);
    //   $('#key2').focus();
    //   return;
    // }
    // if (!this.key3 || this.key3 === '') {
    //   this.toaster.info(`${this.data ? this.data.master.GlobalSettings.Pleaseenterkey3 : 'Please enter key3'}`);
    //   $('#key3').focus();
    //   return;
    // }
    // if (!this.key4 || this.key4 === '') {
    //   this.toaster.info(`${this.data ? this.data.master.GlobalSettings.Pleasenterkey4 : 'Please enter key4'}`);
    //   $('#key4').focus();
    //   return;
    // }
    // if (!this.key5 || this.key5 === '') {
    //   this.toaster.info(`${this.data ? this.data.master.GlobalSettings.Pleaseenterkey5 : 'Please enter key4'}`);
    //   $('#key5').focus();
    //   return;
    // }
    this.objectValidation();
    this.WS.post('api/master/globalSetting/saveglobalSetting', {
      _id: this._id,
      lkCode: this.globalSetting1.lkCode,
      keyCode: this.globalSetting1.keyCode,
      // settings:this.globalSetting1
      settings: btoa(JSON.stringify(this.globalSetting1)),
      // key2:btoa(JSON.stringify(this.key2)),
      // key3:btoa(JSON.stringify(this.key3)),
      // key4:btoa(JSON.stringify(this.key4)),
      // key5:btoa(JSON.stringify(this.key5,))
    }).subscribe((res: IResponse) => {
      // console.log('259', res);
      if (res.status === 1) {
        this.hideGlobalSettings();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  public fetchGSNames(keyword: any, GSId: string): void {
     ;
    if (keyword.length > 2) {
      this.WS.post('api/master/global/fetchGSNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
             ;
            this.GSData = res.result.GS as IGlobalSetting[];
            // console.log('515', this.GSData);
            // let d = this.GSData.find(element=>{
            //   element==keyword
            // })
            // console.log('465', d)
            if (!this.GSData.length) {
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
      this.GSData = [];
    }
  }
  public setTokenGS(GSData: IGlobalSetting, keyword): void {
     ;
    this.getglobalsettings(GSData);
    // this.getglobalsettingsById(GSData._id);
    this.GSData = [];
  }
  public setTokenGSadvance(GSData: IGlobalSetting, keyword): void {
     ;
    this.getglobalsettingsadvance(GSData);
    // this.getglobalsettingsById(GSData._id);
    this.GSData = [];
  }
  public getglobalsettingsadvance(GSData: any): void {
    // console.log('alll', GSId);
     ;
    this.WS.post('api/master/globalSetting/fetchglobalLKCode', {
      lkCode: GSData,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
         ;
        // console.log('GS', res);
        // this._id = res.result.gs[0]._id;
        this.globalSetting1.lkCode = res.result.gs[0].lkCode;
        // this.lkCode = res.result.gs[0].lkCode;
        // this.globalSetting1.keyCode = res.result.gs[0].keyCode;
        // this.globalSetting1.key1 = res.result.gs[0].key1;
        // this.globalSetting1.key2 = res.result.gs[0].key2;
        // this.globalSetting1.key3 = res.result.gs[0].key3;
        // this.globalSetting1.key4 = res.result.gs[0].key4;
        // this.globalSetting1.key5 = res.result.gs[0].key5;
        // this.showGlobalSettings = true;
      } else {
        // this.toastr.info(res.description);
        // console.log('xyz', this.globalsettingdata[0]);
      }
    });
  }
  public getglobalsettings(GSData: any): void {
    // console.log('alll', GSId);
     ;
    this.WS.post('api/master/globalSetting/fetchglobalLKCode', {
      lkCode: GSData,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
         ;
        // console.log('GS', res);
        // this._id = res.result.gs[0]._id;
        this.globalSetting1.lkCode = res.result.gs[0].lkCode;
        // this.lkCode = res.result.gs[0].lkCode;
        // this.globalSetting1.keyCode = res.result.gs[0].keyCode;
        // this.globalSetting1.key1 = res.result.gs[0].key1;
        // this.globalSetting1.key2 = res.result.gs[0].key2;
        // this.globalSetting1.key3 = res.result.gs[0].key3;
        // this.globalSetting1.key4 = res.result.gs[0].key4;
        // this.globalSetting1.key5 = res.result.gs[0].key5;
        this.showGlobalSettings = true;
      } else {
        // this.toastr.info(res.description);
        // console.log('xyz', this.globalsettingdata[0]);
      }
    });
  }
  public getglobalsettingsById(GSId: string): void {
    // console.log('alll', GSId);
    this.WS.post('api/master/globalSetting/fetchglobalSetting', {
      id: GSId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // console.log('GS', res);
        this._id = res.result.gs[0]._id;
        this.globalSetting1.lkCode = res.result.gs[0].lkCode;
        this.globalSetting1.keyCode = res.result.gs[0].keyCode;
        this.globalSetting1.key1 = res.result.gs[0].key1;
        this.globalSetting1.key2 = res.result.gs[0].key2;
        this.globalSetting1.key3 = res.result.gs[0].key3;
        this.globalSetting1.key4 = res.result.gs[0].key4;
        this.globalSetting1.key5 = res.result.gs[0].key5;
        this.showGlobalSettings = true;
      } else {
        // this.toastr.info(res.description);
        // console.log('xyz', this.globalsettingdata[0]);
      }
    });
  }
  public ResetGS(): void {
    // this.showUserDetails = true;
    this.globalSetting1.lkCode = '';
    this.globalSetting1.keyCode = 0;
    this.globalSetting1.key1 = '';
    this.globalSetting1.key2 = '';
    this.globalSetting1.key3 = '';
    this.globalSetting1.key4 = '';
    this.globalSetting1.key5 = '';
  }
  public simpleSearchGSData(value): void {
    this.advanceSearch=false;
    // console.log(value);
    this.globalSettingloadershow = true;
    // this.simplesearch=value
    this.WS.post('api/master/globalSetting/simplesearchglobalsetting', {
      search: this.simplesearch,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.globalsettingdata = res.result;
        this.globalSettingloadershow = false;
        this.dataSourceGlobalSetting = new MatTableDataSource(
          this.globalsettingdata
        );
        this.dataSourceGlobalSetting.sort = this.globalsettingdataSort;
        this.dataSourceGlobalSetting.paginator = this.globalPaginator;
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.globalSettingloadershow = false;
        this.toaster.info(res.description);
        this.dataSourceGlobalSetting = new MatTableDataSource();
      } else {
        this.globalsettingdata = [];
        this.toaster.error(res.description);
      }
    });
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('GLOBAL_SETTING')
    );
    if (
      matchPermission &&
      matchPermission['GLOBAL_SETTING'].includes('EXPORT')
    ) {
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
    this.globalsettingdata.length = 0;
    this.GSData.length = 0;
  }

  tokenGSAdvSuggestionIndex = -1;

  onTokenGSAdvInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenGSAdvSuggestionIndex = Math.max(
          this.tokenGSAdvSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenGSAdvSuggestionIndex = Math.min(
          this.tokenGSAdvSuggestionIndex + 1,
          this.GSData.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenGSAdvSuggestionIndex >= 0) {
          this.setTokenGSadvance(
            this.GSData[this.tokenGSAdvSuggestionIndex],
            ''
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}
