import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { DatePipe, Location } from '@angular/common';
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
import { ILounge } from 'src/app/models/lounge.interface';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
declare var $;
@Component({
  selector: 'app-outlet-events',
  templateUrl: './outlet-events.component.html',
  styleUrls: ['./outlet-events.component.css'],
})
export class OutletEventsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('dmrEventsSort') dmrEventsSort: MatSort;
  @ViewChild('status') status: ElementRef;
  @ViewChild('outlet1') outlet: ElementRef;
  @ViewChild('DMRcategory') category: ElementRef;
  @ViewChild('remarks') remarks: ElementRef;
  // public allOutlet: { _id: string; name: string }[] = [];
  public isSidebarOpen = true;
  public AdvRemarks = '';
  public AdvCategory = 0;
  public fromdateEVT = new Date().toISOString().substring(0, 10);
  // fromdateEVT= new Date()//toISOString().substring(0,10)
  public todayDate = new Date().toISOString().substring(0, 10);
  dateEV = new Date().toISOString().substring(0, 10);
  // public todayDate = new Date().toISOString().substring(0, 10);
  public dmrEventsData: IDMREvents[] = [];
  public loungeData: ILounge[] = [];
  public showDmrEventsDetails = false;
  public showImport: boolean;
  public showData: boolean;
  public data: ILanguage;
  public authenticatedUser: IUser;
  public authenticatedOutlet: ILounge;

  public loaderMessage = '';

  public todaydateHideMAx = ''

  public todaydateHideMin = '';

  public simpleSearch = '';
  DMRoutlet: string;
  public DMRcategory = 0;
  public isActive = true;
  public loadershow = false;
  public DMRremarks = '';
  public dmrDownload = false;
  public dmrCategory: IGlobalSetting[] = [];
  public AdvdmrCategory: IGlobalSetting[] = [];
  public partnerTypes: IGlobalSetting[] = [];
  public _id = '';
  public dataSourcedmrEvents: MatTableDataSource<IDMREvents>;
  public displayeddmrEventsColumn: string[] = [
    // 'outlet',
    'category',
    'remarks',
    'date',
    'status',
  ];
  private userSub: Subscription;
  private languageSubscription: Subscription = null;
  eventTime: string;
  public startTimeAR;

  public eventDate;
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private datePipe: DatePipe,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) {
    this.cs.callDmr.subscribe(() => { this.getdmrEvents(); })
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
        this.authenticatedOutlet = user.userOutlet;
        this.DMRoutlet = this.authenticatedOutlet.name;
      }
    });
    // this.getLounge();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    // this.importValidator = new PincodeValidator(this.WS, this.u, this.toaster);
    // console.log(this.route.snapshot.queryParams.n);
    // console.log(this.route.snapshot.queryParams.n);
    // this.fromdateEVT = this.datePipe.transform(new Date(), 'yyyy-M-dd')

    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      // console.log('Showing import');
      this.showDmrEventsDetails = true;
    }
    this.fetchDMRCategory('DMR_CATEGORY');
    this.getdmrEvents();
    this.fetchParnterTypes('PARTNER_TYPE');
    var today = this.cs.formatDateTime(new Date());
    this.todaydateHideMAx = this.datePipe.transform(today, 'yyyy-MM-dd')
    this.eventTime = today;
    this.eventDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.startTimeAR = this.datePipe.transform(today, 'HH:mm');


    var todaydate = new Date();
    var mindate = new Date(
      todaydate.getFullYear() - 2,
      todaydate.getMonth(),
      todaydate.getDate()
    );
    let maxdatetime = new Date(
      todaydate.getFullYear(),
      todaydate.getMonth(),
      todaydate.getDate() + 2
    );


    this.todaydateHideMAx = this.datePipe.transform(maxdatetime, 'yyyy-MM-dd');
    this.todaydateHideMin = this.datePipe.transform(mindate, 'yyyy-MM-dd');
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
    // console.log(this.data);
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
  hideDmrEventsDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showDmrEventsDetails = false;
    } else {
      this.showDmrEventsDetails = false;
    }
    this.showDmrEventsDetails = false;
    this.resetdmrEvents();
    if (this.simpleSearch.trim() === '') {
      // this.getdmrEvents();
    } else {

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
  showDmrDownload(): void {
    this.dmrDownload = true;


  }
  hideDmrDownload(): void {
    this.dmrDownload = false;
  }

  // public getOutletId(): void {
  //   this.DMRoutlet=this.authenticatedOutlet._id
  //   // this.getAction();
  // }

  public backToResults(): void {
    this.showImport = false;
    this.getdmrEvents();
  }
  addNewDmrEvents(isshow): void {
    // this.getOutletId()
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('DMR')
    );
    if (matchPermission && matchPermission['DMR'].includes('NEW')) {
      this.showDmrEventsDetails = isshow;
      this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
      );
    }
  }

  public resetdmrEvents(): void {
    (this._id = ''),
      (this.DMRoutlet = this.authenticatedOutlet.name),
      (this.DMRcategory = this.DMRcategory),
      (this.DMRremarks = ''),
      (this.isActive = this.isActive);
    var today = this.cs.formatDateTime(new Date());
    this.eventDate = this.datePipe.transform(today, 'yyyy-MM-dd');
    this.startTimeAR = this.datePipe.transform(today, 'HH:mm');
    this.eventTime = today;
  }

  public getTableClickData(id: string): void {
    this.getdmrEventsById(id);
  }

  public getdmrEventsById(dmrEventsId: string): void {
    this.WS.post('api/master/dmrEvents/fetch/id', {
      id: dmrEventsId,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.resetdmrEvents();
        // const dmrEvents: IDMREvents = res.result.dmrEvents;

        this._id = res.result.dmrEvents._id;
        this.DMRoutlet = res.result.dmrEvents.outlet.name;
        this.DMRcategory = res.result.dmrEvents.category;
        this.DMRremarks = res.result.dmrEvents.remarks;
        this.isActive = res.result.dmrEvents.status;
        var createdOn = this.cs.formatDateTime(res.result.dmrEvents.createdOn)
        this.eventDate = this.datePipe.transform(createdOn, 'yyyy-MM-dd');
        this.startTimeAR = this.datePipe.transform(createdOn, 'HH:mm');
        this.eventTime = createdOn;

        // this._id: dmrEvents.id
        this.showDmrEventsDetails = true;
      } else {
        this.toaster.info(res.description);
      }
    });
  }
  // public getLounge(): void {
  //   this.WS.post('api/master/lounge/fetchLoungeData', {
  //     Inactive: true,
  //   }).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       this.allOutlet = res.result;
  //       this.toaster.success(`${res.description}`);
  //     } else {
  //       this.toaster.error(res.description);
  //     }
  //   });
  // }

  public getdmrEvents(): void {
    this.loadershow = true;
    this.WS.post('api/master/dmrEvents/get', { date: this.todayDate }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dmrEventsData = res.result as IDMREvents[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.loadershow = false
        this.toaster.success(res.description);
      } else {
        this.loadershow = false;
        this.toaster.error(res.description);
      }
    });
  }

  private fetchDMRCategory(lookupCode): void {
    // ;
    this.WS.post('api/master/globalSetting/fetch/lookupCodeReceipt', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      // const res = r.decrypted;
      if (res.status === 1) {
        // if (this.dmrEventsData.length) {
        this.dmrCategory = res.result.values as IGlobalSetting[];
        // this.AdvdmrCategory = res.result.values as IGlobalSetting[];
        if (this.dmrCategory.length && this.DMRcategory === 0) {
          this.DMRcategory = this.dmrCategory[0].keyCode;
          // this.AdvCategory = this.DMRcategory;
        }
        this.mapGlobalSettingsOnData();
        // }
        // this.dataSourcedmrEvents = new MatTableDataSource(this.dmrCategory);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }

  private mapGlobalSettingsOnData(): void {
    if (this.dmrEventsData.length) {
      this.dmrEventsData.map((token) => {
        if (this.dmrCategory.length) {
          const matchCat = this.dmrCategory.find(
            (t) => t.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
      });
    }
    this.dataSourcedmrEvents = new MatTableDataSource(this.dmrEventsData);
    this.dataSourcedmrEvents.sort = this.dmrEventsSort;
    this.dataSourcedmrEvents.paginator = this.paginator;
  }

  public savedmrEvents(): void {
    if (this.DMRoutlet !== this.authenticatedOutlet.name) {
      this.toaster.info('Please Enter Valid Outlet Name');
      // $('#vendorName')
      this.outlet.nativeElement.focus();
      return;
    }
    if (this.DMRcategory === 0) {
      this.toaster.info('Please select Valid Category');
      // $('#actionType')
      this.category.nativeElement.focus();
      return;
    }
    if (this.DMRremarks === '') {
      this.toaster.info('Please Enter Remarks');
      // $('#tin')
      this.remarks.nativeElement.focus();
      return;
    }
    let eventOn = this.eventDate + 'T' + this.startTimeAR + ':00.00Z'

    this.loadershow = true;
    this.loaderMessage = 'Saving event...';
    this.WS.post('api/master/dmrEvents/save', {
      _id: this._id,
      outlet: this.authenticatedOutlet,
      category: this.DMRcategory,
      remarks: this.DMRremarks,
      status: this.isActive,
      eventDate: eventOn
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.cs.bellCountComponent()
        this.dmrEventsData = res.result as IDMREvents[];
        this.mapGlobalSettingsOnData();
        this.getdmrEvents();
        this.resetdmrEvents();
        this.loadershow = false;
        this.showDmrEventsDetails = false;
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toaster.info(res.description);
      } else {
        this.loadershow = false;
        this.toaster.error(res.description);
      }
    });
  }
  public simpleSearchdmrEventsData(value): void {
    // console.log(value);
    this.WS.post('api/master/dmrEvents/simpleSearch', {
      search: value,
    }).subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.dmrEventsData = res.result;
        this.mapGlobalSettingsOnData();
        // this.dataSourceAction = new MatTableDataSource(this.actionData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.dmrEventsData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }
  public advancedmrEventsSearch(): void {
    this.WS.post(
      'api/master/dmrEvents/advance/search',
      {
        category: this.AdvCategory,
        date: this.dateEV,
        // remarks: this.AdvRemarks
      }
      // countryId: this.countryId
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        ;
        this.dmrEventsData = res.result as IDMREvents[];

        // this.dataSourceMain = new MatTableDataSource(this.vendorData);
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.dmrEventsData = [];
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


  public generateEventReportPDf(): void {

    this.loadershow = true;
    this.loaderMessage = 'Downloading report...';

    this.WS.post('api/master/dmrEvents/fetchEventByOutlet', { fromdate: this.fromdateEVT }).subscribe((res: IResponse) => {

      this.loadershow = false;
      if (res.status === 1) {


        let todaydate = new Date();
        // var lowecasealphbet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        let reportData = res.result.getActivityReport.Result.getadmisionaa
        let VoidreportData = res.result.getActivityReport.Result.voidAdmission
        let shifName = res.result.shiftName

        let tomorrowDate = new Date(this.fromdateEVT)
        // tomorrowDate= new Date(tomorrowDate.setDate(tomorrowDate.getDate()+1))
        let curetndatetime = todaydate.toISOString();
        let gettodaydate = this.cs.formatDateTime(new Date(curetndatetime));
        let getFromDate = this.cs.formatDate(tomorrowDate);


        let gettodaydateWithouttime = this.cs.formatDate(new Date(this.fromdateEVT));
        let TokenDetailsTable = [
          [
            { text: '', bold: true, fontSize: 11 },
            { text: '', bold: true, fontSize: 11 },
            { text: '', bold: true, fontSize: 11 },
            { text: '', bold: true, fontSize: 11 }
          ]
        ];

        let MainHeightlights = [
          // [
          // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }

          //  ]
        ];



        let totalPaxCount = 0
        let voidtotalPaxCount = 0




        // var customerComplains = [
        //   // [
        //   // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }

        //   //  ]
        // ];
        let username = this.authenticatedUser.name


        let docDefinition = {
          pageMargins: [40, 60, 40, 60],
          pageSize: 'A4',

          header: function (currentPage, pageCount) {


            if (currentPage === 1) {
              return {
                margin: [30, 30, 30, 30],
                columns: [
                  { text: '', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
                  { text: 'Daily Management Report ', fontSize: 12, margin: [0, 5, 0, 0], height: 15, bold: true, decoration: 'underline', width: 200 },
                  { text: '', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 200 }

                ]
              };
            }

          }
          ,
          footer: function (currentPage, pageCount) {




            return {

              columns: [
                // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

                { text: 'Copyright © ' + todaydate.getFullYear() + ' PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                { text: 'Generated By: ' + username + ', ' + gettodaydate, alignment: 'right', bolf: true, fontSize: 8, margin: [30, 30, 28, 0], width: '50%' },

              ]
            };
          },
          background: function (currentPage, pageSize) {
            return [
              {
                canvas: [

                  { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line

                  // {
                  //   type: 'rect',

                  //   x: 28,
                  //   y: 28,
                  //   w: 193,
                  //   h: 26,
                  // },
                  // {
                  //   type: 'rect',

                  //   x: 221,
                  //   y: 28,
                  //   w: 180,
                  //   h: 26,
                  // },
                  // {
                  //   type: 'rect',

                  //   x: 401,
                  //   y: 28,
                  //   w: 169,
                  //   h: 26,
                  // },

                  { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                  { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                  { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                ],

              }
            ];
          },
          content: []
        };


        let tokenDetails = [];
        // let openingShiftTime=shifName.outletShifts[0].openingTime;
        // let closingShiftTime=shifName.outletShifts[2].closingTime;


        let ReportDatetime = this.cs.formatDateTime(new Date())
        // console.log('res.result.tokendata[index]',res.result.tokendata[index])  shortCode
        tokenDetails.push(
          { text: 'Report Date:', bold: true, fontSize: 9 },
          { text: ReportDatetime, bold: false, fontSize: 9 },
          { text: 'User Name:', bold: true, fontSize: 9 },
          { text: this.authenticatedUser.name, bold: false, fontSize: 9 }
        );
        TokenDetailsTable.push(tokenDetails);
        tokenDetails = [];
        tokenDetails.push(
          { text: 'Start Date:', bold: true, fontSize: 9 },
          { text: gettodaydateWithouttime, bold: false, fontSize: 9 },
          { text: 'End Date:', bold: true, fontSize: 9 },
          { text: getFromDate, bold: false, fontSize: 9 }
        );
        TokenDetailsTable.push(tokenDetails);
        tokenDetails = [];
        tokenDetails.push(
          { text: 'Start Time:', bold: true, fontSize: 9 },
          { text: '00:00', bold: false, fontSize: 9 },
          { text: 'End Time:', bold: true, fontSize: 9 },
          { text: '23:59', bold: false, fontSize: 9 }
        );
        TokenDetailsTable.push(tokenDetails);
        tokenDetails = [];




        tokenDetails.push(
          { text: 'Outlet Name:', bold: true, fontSize: 9 },
          { text: this.DMRoutlet, bold: false, fontSize: 9 },
          { text: '', bold: false, fontSize: 9 },
          { text: '', bold: false, fontSize: 9 }
        );

        TokenDetailsTable.push(tokenDetails);
        let tncrow = []
        tncrow.push(
          { text: 'Operations ( MG , Site Visits , Reporting SL, Expected Guest, Special Event )', bold: true, alignment: 'left', fontSize: 10 });
        MainHeightlights.push(tncrow);

        if (this.dmrCategory.length > 0) {
          for (let j = 0; j < this.dmrCategory.length; j++) {
            const elementCategory = this.dmrCategory[j];
            let CategoryName = elementCategory.keyCode
            let Categoryvalues = []
            Categoryvalues.push({ text: elementCategory.key1 + ':' + '\n', bold: true, alignment: 'left', fontSize: 9 })
            let counter = 1



            for (let k = 0; k < res.result.dmrEvents.length; k++) {
              const elementEventdata = res.result.dmrEvents[k];


              if (CategoryName === elementEventdata.category) {
                let createdOnDate = this.cs.formatDateTime(elementEventdata.createdOn)

                Categoryvalues.push({ text: counter + ':' + elementEventdata.remarks + '(' + createdOnDate + ')' + '\n', bold: false, alignment: 'left', fontSize: 9 })
                counter++;
              }

            }


            if (Categoryvalues.length === 1) {
              Categoryvalues.push({ text: 'NONE\n\n', bold: false, alignment: 'left', fontSize: 8 })
            }
            let tncrow = []
            tncrow.push(
              { text: Categoryvalues });
            MainHeightlights.push(tncrow);

          }
        }


        docDefinition.content.push(
          {
            layout: 'noBorders',
            table: {
              // headerRows: 0,
              widths: [70, 275, 70, 150],
              body: TokenDetailsTable
            }
          });


        docDefinition.content.push( /* Terms& Conditions */
          '\n',
          { text: 'Main Highlights:', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
          '\n',
          {
            // layout: 'lightHorizontalLines',
            table: {
              headerRows: 1,
              widths: ['*'],
              body: MainHeightlights
            }
          });
        let ActivityData = [];
        let VoidActivityData = [];

        if (shifName.outletShifts.length > 0) {
          ActivityData.push(
            [
              { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

              // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

              { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

              { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
              { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

            ])

          VoidActivityData.push(
            [
              { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

              // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

              { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

              { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
              { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

            ])

        } else {
          ActivityData.push(
            [
              { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

              // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

              { text: 'Shift-AM', bold: true, alignment: 'left', fontSize: 9 },

              { text: 'Shift-PM', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Shift-Night', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

            ])
          VoidActivityData.push(
            [
              { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

              // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

              { text: 'Shift-AM', bold: true, alignment: 'left', fontSize: 9 },

              { text: 'Shift-PM', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Shift-Night', bold: true, alignment: 'left', fontSize: 9 },
              { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

            ])
        }
        if (reportData.length > 0) {






          let totalAM = 0;
          let totalPM = 0;
          let totalNight = 0;
          let GrandTotal = 0;

          if (this.partnerTypes.length > 0) {
            for (let j = 0; j < this.partnerTypes.length; j++) {
              const elementPartnerType = this.partnerTypes[j];



              let amSubtotal = 0
              let pmSubtotal = 0
              let nightSubtotal = 0
              let counter = 1
              for (let index = 0; index < reportData.length; index++) {
                const element = reportData[index];


                if (elementPartnerType.key1 === element._id.ClientType) {

                  let rowdata = []
                  let item = {
                    partnerName: '',
                    Category: '',
                    ClientType: '',
                    AM: 0,
                    PM: 0,
                    Night: 0
                  }

                  item.partnerName = element._id.partnerName
                  item.Category = element._id.Category
                  item.ClientType = element._id.ClientType

                  let amCount = 0
                  let pmcount = 0
                  let nightCount = 0
                  element.shifts.forEach(elementforeach => {
                    // let strRegex = new RegExp(/^[a-z0-9]+$/i);
                    if (elementforeach.shiftName) {

                      // let isString=strRegex.test(elementforeach.shiftName)

                      let isshiftFindAM = elementforeach.shiftName.toLowerCase().includes('am')
                      if (isshiftFindAM) {
                        amCount = elementforeach.countShift
                        return
                      }
                      let isshiftFindPM = elementforeach.shiftName.toLowerCase().includes('pm')
                      if (isshiftFindPM) {
                        pmcount = elementforeach.countShift
                        return
                      }
                      let isshiftFindNight = elementforeach.shiftName.toLowerCase().includes('night')
                      if (isshiftFindNight) {
                        nightCount = elementforeach.countShift
                        return
                      }

                    }
                  });



                  item.AM = amCount
                  item.PM = pmcount
                  item.Night = nightCount

                  amSubtotal = amSubtotal + amCount
                  pmSubtotal = pmSubtotal + pmcount
                  nightSubtotal = nightSubtotal + nightCount
                  totalAM = totalAM + amCount;
                  totalPM = totalPM + pmcount;
                  totalNight = totalNight + nightCount;


                  let totalTypes = item.AM + item.PM + item.Night
                  rowdata.push(
                    { text: counter, bold: false, fontSize: 9 },
                    { text: item.partnerName, bold: false, fontSize: 9 },
                    { text: item.ClientType, bold: false, fontSize: 9 },
                    // { text: item.Category, bold: false, fontSize: 9 },

                    { text: item.AM, bold: false, fontSize: 9 },
                    { text: item.PM, bold: false, fontSize: 9 },
                    { text: item.Night, bold: false, fontSize: 9 },

                    { text: totalTypes, bold: false, fontSize: 9 })



                  totalPaxCount = totalPaxCount + totalTypes
                  counter++
                  ActivityData.push(rowdata)




                }

                if (index === reportData.length - 1) {
                  let subtotal = amSubtotal + pmSubtotal + nightSubtotal

                  if (subtotal > 0) {



                    let subtotalRow = []
                    subtotalRow.push(
                      { colSpan: 3, text: 'Sub Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
                      { text: '', bold: false, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      // { text: '', bold: false, fontSize: 9 },

                      { text: amSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: pmSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

                      { text: amSubtotal + pmSubtotal + nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
                    ActivityData.push(subtotalRow)

                    amSubtotal = 0
                    pmSubtotal = 0
                    nightSubtotal = 0
                    counter = 1
                  }
                }
                // DMRRecords.push(item)

              }


              // if(rowdata.length>0){
              //   ActivityData.push(rowdata)
              // }

            }
          }



          let TotalRow = []

          TotalRow.push(
            { colSpan: 3, text: 'Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
            { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            // { text: '', bold: false, fontSize: 9 },

            { text: totalAM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: totalPM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

            { text: totalAM + totalPM + totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
          ActivityData.push(TotalRow)



          // for (let i = 0; i < reportData.length; i++) {
          //   const element = reportData[i];
          //   let rowdata = []
          //   let totalTypes = element.AM + element.PM + element.Night
          //   rowdata.push(
          //     { text: counter, bold: false, fontSize: 9 },
          //     { text: element.partnerName, bold: false, fontSize: 9 },
          //     { text: element.ClientType, bold: false, fontSize: 9 },
          //     { text: element.Category, bold: false, fontSize: 9 },

          //     { text: element.AM, bold: false, fontSize: 9 },
          //     { text: element.PM, bold: false, fontSize: 9 },
          //     { text: element.Night, bold: false, fontSize: 9 },

          //     { text: totalTypes, bold: false, fontSize: 9 })


          //   ActivityData.push(rowdata)
          //   totalPaxCount = totalPaxCount + totalTypes
          //   counter++
          // }

        }

        // docDefinition.content.push( /* Terms& Conditions */
        //   '\n',
        //   { text: 'Pax Count : ' + totalPaxCount + ' (Breakdown of all Pax entering the lounge as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
        //   '\n',
        //   {

        //     table: {
        //       headerRows: 0,
        //       widths: [30, 80, 80, 75, 45, 45, 60, 30],
        //       body: ActivityData
        //     }
        //   });

        /*Void admission data */


        if (VoidreportData.length > 0) {

          // let ActivityData = []

          // if (shifName.outletShifts.length > 0) {
          //   VoidActivityData.push(
          //     [
          //       { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

          //       // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

          //       { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

          //       { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
          //       { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

          //     ])

          // } else {
          //   VoidActivityData.push(
          //     [
          //       { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

          //       // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

          //       { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

          //       { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
          //       { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
          //       { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

          //     ])

          // }

          let totalAM = 0;
          let totalPM = 0;
          let totalNight = 0;
          let GrandTotal = 0;

          if (this.partnerTypes.length > 0) {
            for (let j = 0; j < this.partnerTypes.length; j++) {
              const elementPartnerType = this.partnerTypes[j];



              let amSubtotal = 0
              let pmSubtotal = 0
              let nightSubtotal = 0
              let counter = 1
              for (let index = 0; index < VoidreportData.length; index++) {
                const element = VoidreportData[index];


                if (elementPartnerType.key1 === element._id.ClientType) {

                  let rowdata = []
                  let item = {
                    partnerName: '',
                    Category: '',
                    ClientType: '',
                    AM: 0,
                    PM: 0,
                    Night: 0
                  }

                  item.partnerName = element._id.partnerName
                  item.Category = element._id.Category
                  item.ClientType = element._id.ClientType

                  let amCount = 0
                  let pmcount = 0
                  let nightCount = 0
                  element.shifts.forEach(elementforeach => {
                    // let strRegex = new RegExp(/^[a-z0-9]+$/i);
                    if (elementforeach.shiftName) {

                      // let isString=strRegex.test(elementforeach.shiftName)

                      let isshiftFindAM = elementforeach.shiftName.toLowerCase().includes('am')
                      if (isshiftFindAM) {
                        amCount = elementforeach.countShift
                        return
                      }
                      let isshiftFindPM = elementforeach.shiftName.toLowerCase().includes('pm')
                      if (isshiftFindPM) {
                        pmcount = elementforeach.countShift
                        return
                      }
                      let isshiftFindNight = elementforeach.shiftName.toLowerCase().includes('night')
                      if (isshiftFindNight) {
                        nightCount = elementforeach.countShift
                        return
                      }

                    }
                  });



                  item.AM = amCount
                  item.PM = pmcount
                  item.Night = nightCount

                  amSubtotal = amSubtotal + amCount
                  pmSubtotal = pmSubtotal + pmcount
                  nightSubtotal = nightSubtotal + nightCount
                  totalAM = totalAM + amCount;
                  totalPM = totalPM + pmcount;
                  totalNight = totalNight + nightCount;


                  let totalTypes = item.AM + item.PM + item.Night
                  rowdata.push(
                    { text: counter, bold: false, fontSize: 9 },
                    { text: item.partnerName, bold: false, fontSize: 9 },
                    { text: item.ClientType, bold: false, fontSize: 9 },
                    // { text: item.Category, bold: false, fontSize: 9 },

                    { text: item.AM, bold: false, fontSize: 9 },
                    { text: item.PM, bold: false, fontSize: 9 },
                    { text: item.Night, bold: false, fontSize: 9 },

                    { text: totalTypes, bold: false, fontSize: 9 })



                  voidtotalPaxCount = voidtotalPaxCount + totalTypes
                  counter++
                  VoidActivityData.push(rowdata)




                }

                if (index === VoidreportData.length - 1) {
                  let subtotal = amSubtotal + pmSubtotal + nightSubtotal

                  if (subtotal > 0) {



                    let subtotalRow = []
                    subtotalRow.push(
                      { colSpan: 3, text: 'Sub Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
                      { text: '', bold: false, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      // { text: '', bold: false, fontSize: 9 },

                      { text: amSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: pmSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
                      { text: nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

                      { text: amSubtotal + pmSubtotal + nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
                    VoidActivityData.push(subtotalRow)

                    amSubtotal = 0
                    pmSubtotal = 0
                    nightSubtotal = 0
                    counter = 1
                  }
                }
                // DMRRecords.push(item)

              }


              // if(rowdata.length>0){
              //   ActivityData.push(rowdata)
              // }

            }
          }



          let TotalRow = []

          TotalRow.push(
            { colSpan: 3, text: 'Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
            { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            // { text: '', bold: false, fontSize: 9 },

            { text: totalAM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: totalPM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
            { text: totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

            { text: totalAM + totalPM + totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
          VoidActivityData.push(TotalRow)



          // for (let i = 0; i < reportData.length; i++) {
          //   const element = reportData[i];
          //   let rowdata = []
          //   let totalTypes = element.AM + element.PM + element.Night
          //   rowdata.push(
          //     { text: counter, bold: false, fontSize: 9 },
          //     { text: element.partnerName, bold: false, fontSize: 9 },
          //     { text: element.ClientType, bold: false, fontSize: 9 },
          //     { text: element.Category, bold: false, fontSize: 9 },

          //     { text: element.AM, bold: false, fontSize: 9 },
          //     { text: element.PM, bold: false, fontSize: 9 },
          //     { text: element.Night, bold: false, fontSize: 9 },

          //     { text: totalTypes, bold: false, fontSize: 9 })


          //   ActivityData.push(rowdata)
          //   totalPaxCount = totalPaxCount + totalTypes
          //   counter++
          // }

        }

        docDefinition.content.push( /* Terms & Conditions */
          '\n',
          { text: 'Pax Count : ' + totalPaxCount + ' (Breakdown of all Pax entering the lounge as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
          '\n',
          {

            table: {
              headerRows: 0,
              widths: [30, 86, 100, 75, 65, 60, 35],
              body: ActivityData
            }
          });
        docDefinition.content.push( /* Terms & Conditions */
          '\n',
          { text: 'Void Transaction Count : ' + voidtotalPaxCount + ' (Breakdown of void transactions as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
          '\n',
          {

            table: {
              headerRows: 0,
              widths: [30, 86, 100, 75, 65, 60, 35],
              body: VoidActivityData
            }
          });

        pdfMake.createPdf(docDefinition).download('DailyManagementReport.pdf')

      }
      else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }

    });

  }




  // public generateEventReportPDf(): void {

  //   this.loadershow = true;
  //   this.loaderMessage = 'Downloading report...';

  //   this.WS.post('api/master/dmrEvents/fetchEventByOutlet', { fromdate: this.fromdateEVT }).subscribe((res: IResponse) => {
  //     // console.log('evenresponse', res)
  //     this.loadershow = false;
  //     if (res.status === 1) {


  //       let todaydate = new Date();
  //       // var lowecasealphbet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  //       let reportData = res.result.getActivityReport.Result.getadmisionaa
  //       let VoidreportData = res.result.getActivityReport.Result.voidAdmission
  //       let shifName = res.result.shiftName


  //       let curetndatetime = todaydate.toISOString();
  //       let gettodaydate = this.cs.formatDateTime(new Date(curetndatetime));
  //       let gettodaydateWithouttime = this.cs.formatDate(new Date(this.fromdateEVT));
  //       let TokenDetailsTable = [
  //         [
  //           { text: '', bold: true, fontSize: 11 },
  //           { text: '', bold: true, fontSize: 11 },
  //           { text: '', bold: true, fontSize: 11 },
  //           { text: '', bold: true, fontSize: 11 }
  //         ]
  //       ];

  //       let MainHeightlights = [
  //         // [
  //         // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }

  //         //  ]
  //       ];



  //       let totalPaxCount = 0
  //       let voidtotalPaxCount = 0




  //       // var customerComplains = [
  //       //   // [
  //       //   // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }

  //       //   //  ]
  //       // ];
  //       let username = this.authenticatedUser.name


  //       let docDefinition = {
  //         pageMargins: [40, 60, 40, 60],
  //         pageSize: 'A4',

  //         header: function (currentPage, pageCount) {


  //           if (currentPage === 1) {
  //             return {
  //               margin: [30, 30, 30, 30],
  //               columns: [
  //                 { text: '', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
  //                 { text: 'Daily Management Report ', fontSize: 12, margin: [0, 5, 0, 0], height: 15, bold: true, decoration: 'underline', width: 200 },
  //                 { text: '', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 200 }

  //               ]
  //             };
  //           }

  //         }
  //         ,
  //         footer: function (currentPage, pageCount) {




  //           return {

  //             columns: [
  //               // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

  //               { text: 'Copyright © ' + todaydate.getFullYear() + ' PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
  //               { text: 'Generated By: ' + username + ', ' + gettodaydate, alignment: 'right', bolf: true, fontSize: 8, margin: [30, 30, 28, 0], width: '50%' },

  //             ]
  //           };
  //         },
  //         background: function (currentPage, pageSize) {
  //           return [
  //             {
  //               canvas: [

  //                 { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line

  //                 // {
  //                 //   type: 'rect',

  //                 //   x: 28,
  //                 //   y: 28,
  //                 //   w: 193,
  //                 //   h: 26,
  //                 // },
  //                 // {
  //                 //   type: 'rect',

  //                 //   x: 221,
  //                 //   y: 28,
  //                 //   w: 180,
  //                 //   h: 26,
  //                 // },
  //                 // {
  //                 //   type: 'rect',

  //                 //   x: 401,
  //                 //   y: 28,
  //                 //   w: 169,
  //                 //   h: 26,
  //                 // },

  //                 { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
  //                 { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
  //                 { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
  //               ],

  //             }
  //           ];
  //         },
  //         content: []
  //       };


  //       let tokenDetails = [];

  //       let ReportDatetime = this.cs.formatDateTime(new Date())
  //       // console.log('res.result.tokendata[index]',res.result.tokendata[index])  shortCode
  //       tokenDetails.push(
  //         { text: 'Report Date:', bold: true, fontSize: 9 },
  //         { text: ReportDatetime, bold: false, fontSize: 9 },
  //         { text: 'User Name:', bold: true, fontSize: 9 },
  //         { text: this.authenticatedUser.name, bold: false, fontSize: 9 }
  //       );
  //       TokenDetailsTable.push(tokenDetails);
  //       tokenDetails = [];
  //       tokenDetails.push(
  //         { text: 'Start Date:', bold: true, fontSize: 9 },
  //         { text: gettodaydateWithouttime, bold: false, fontSize: 9 },
  //         { text: 'End Date:', bold: true, fontSize: 9 },
  //         { text: gettodaydateWithouttime, bold: false, fontSize: 9 }
  //       );
  //       TokenDetailsTable.push(tokenDetails);
  //       tokenDetails = [];
  //       tokenDetails.push(
  //         { text: 'Start Time:', bold: true, fontSize: 9 },
  //         { text: '00:00', bold: false, fontSize: 9 },
  //         { text: 'End Time:', bold: true, fontSize: 9 },
  //         { text: '23:59', bold: false, fontSize: 9 }
  //       );
  //       TokenDetailsTable.push(tokenDetails);
  //       tokenDetails = [];




  //       tokenDetails.push(
  //         { text: 'Outlet Name:', bold: true, fontSize: 9 },
  //         { text: this.DMRoutlet, bold: false, fontSize: 9 },
  //         { text: '', bold: false, fontSize: 9 },
  //         { text: '', bold: false, fontSize: 9 }
  //       );

  //       TokenDetailsTable.push(tokenDetails);
  //       let tncrow = []
  //       tncrow.push(
  //         { text: 'Operations ( MG , Site Visits , Reporting SL, Expected Guest, Special Event )', bold: true, alignment: 'left', fontSize: 10 });
  //       MainHeightlights.push(tncrow);

  //       if (this.dmrCategory.length > 0) {
  //         for (let j = 0; j < this.dmrCategory.length; j++) {
  //           const elementCategory = this.dmrCategory[j];
  //           let CategoryName = elementCategory.keyCode
  //           let Categoryvalues = []
  //           Categoryvalues.push({ text: elementCategory.key1 + ':' + '\n', bold: true, alignment: 'left', fontSize: 9 })
  //           let counter = 1



  //           for (let k = 0; k < res.result.dmrEvents.length; k++) {
  //             const elementEventdata = res.result.dmrEvents[k];


  //             if (CategoryName === elementEventdata.category) {
  //               let createdOnDate = this.cs.formatDateTime(elementEventdata.createdOn)

  //               Categoryvalues.push({ text: counter + ':' + elementEventdata.remarks + '(' + createdOnDate + ')' + '\n', bold: false, alignment: 'left', fontSize: 9 })
  //               counter++;
  //             }

  //           }


  //           if (Categoryvalues.length === 1) {
  //             Categoryvalues.push({ text: 'NONE\n\n', bold: false, alignment: 'left', fontSize: 8 })
  //           }
  //           let tncrow = []
  //           tncrow.push(
  //             { text: Categoryvalues });
  //           MainHeightlights.push(tncrow);

  //         }
  //       }


  //       docDefinition.content.push(
  //         {
  //           layout: 'noBorders',
  //           table: {
  //             // headerRows: 0,
  //             widths: [75, 275, 70, 150],
  //             body: TokenDetailsTable
  //           }
  //         });


  //       docDefinition.content.push( /* Terms& Conditions */
  //         '\n',
  //         { text: 'Main Highlights:', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
  //         '\n',
  //         {
  //           // layout: 'lightHorizontalLines',
  //           table: {
  //             headerRows: 1,
  //             widths: ['*'],
  //             body: MainHeightlights
  //           }
  //         });
  //       let ActivityData = [];
  //       let VoidActivityData = [];

  //       if (shifName.outletShifts.length > 0) {
  //         ActivityData.push(
  //           [
  //             { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //             // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //             { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

  //             { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //             { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //           ])

  //           VoidActivityData.push(
  //             [
  //               { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //               { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //               { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //               // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //               { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

  //               { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //               { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //               { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //             ])

  //       } else {
  //         ActivityData.push(
  //           [
  //             { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //             // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //             { text: 'Shift-AM', bold: true, alignment: 'left', fontSize: 9 },

  //             { text: 'Shift-PM', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Shift-Night', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //           ])
  //           VoidActivityData.push(
  //             [
  //               { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //             // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //             { text: 'Shift-AM', bold: true, alignment: 'left', fontSize: 9 },

  //             { text: 'Shift-PM', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Shift-Night', bold: true, alignment: 'left', fontSize: 9 },
  //             { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //             ])
  //       }
  //       if (reportData.length > 0) {






  //         let totalAM = 0;
  //         let totalPM = 0;
  //         let totalNight = 0;
  //         let GrandTotal = 0;

  //         if (this.partnerTypes.length > 0) {
  //           for (let j = 0; j < this.partnerTypes.length; j++) {
  //             const elementPartnerType = this.partnerTypes[j];



  //             let amSubtotal = 0
  //             let pmSubtotal = 0
  //             let nightSubtotal = 0
  //             let counter = 1
  //             for (let index = 0; index < reportData.length; index++) {
  //               const element = reportData[index];


  //               if (elementPartnerType.key1 === element._id.ClientType) {

  //                 let rowdata = []
  //                 let item = {
  //                   partnerName: '',
  //                   Category: '',
  //                   ClientType: '',
  //                   AM: 0,
  //                   PM: 0,
  //                   Night: 0
  //                 }

  //                 item.partnerName = element._id.partnerName
  //                 item.Category = element._id.Category
  //                 item.ClientType = element._id.ClientType
  //                 //  console.log('element._id.shifts',element.shifts) 
  //                 let amCount = 0
  //                 let pmcount = 0
  //                 let nightCount = 0
  //                 element.shifts.forEach(elementforeach => {
  //                   // let strRegex = new RegExp(/^[a-z0-9]+$/i);
  //                   if (elementforeach.shiftName) {

  //                     // let isString=strRegex.test(elementforeach.shiftName)

  //                     let isshiftFindAM = elementforeach.shiftName.toLowerCase().includes('am')
  //                     if (isshiftFindAM) {
  //                       amCount = elementforeach.countShift
  //                       return
  //                     }
  //                     let isshiftFindPM = elementforeach.shiftName.toLowerCase().includes('pm')
  //                     if (isshiftFindPM) {
  //                       pmcount = elementforeach.countShift
  //                       return
  //                     }
  //                     let isshiftFindNight = elementforeach.shiftName.toLowerCase().includes('night')
  //                     if (isshiftFindNight) {
  //                       nightCount = elementforeach.countShift
  //                       return
  //                     }

  //                   }
  //                 });



  //                 item.AM = amCount
  //                 item.PM = pmcount
  //                 item.Night = nightCount

  //                 amSubtotal = amSubtotal + amCount
  //                 pmSubtotal = pmSubtotal + pmcount
  //                 nightSubtotal = nightSubtotal + nightCount
  //                 totalAM = totalAM + amCount;
  //                 totalPM = totalPM + pmcount;
  //                 totalNight = totalNight + nightCount;


  //                 let totalTypes = item.AM + item.PM + item.Night
  //                 rowdata.push(
  //                   { text: counter, bold: false, fontSize: 9 },
  //                   { text: item.partnerName, bold: false, fontSize: 9 },
  //                   { text: item.ClientType, bold: false, fontSize: 9 },
  //                   // { text: item.Category, bold: false, fontSize: 9 },

  //                   { text: item.AM, bold: false, fontSize: 9 },
  //                   { text: item.PM, bold: false, fontSize: 9 },
  //                   { text: item.Night, bold: false, fontSize: 9 },

  //                   { text: totalTypes, bold: false, fontSize: 9 })



  //                 totalPaxCount = totalPaxCount + totalTypes
  //                 counter++
  //                 ActivityData.push(rowdata)




  //               }

  //               if (index === reportData.length - 1) {
  //                 let subtotal = amSubtotal + pmSubtotal + nightSubtotal

  //                 if (subtotal > 0) {



  //                   let subtotalRow = []
  //                   subtotalRow.push(
  //                     { colSpan: 3, text: 'Sub Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
  //                     { text: '', bold: false, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     // { text: '', bold: false, fontSize: 9 },

  //                     { text: amSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: pmSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

  //                     { text: amSubtotal + pmSubtotal + nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
  //                   ActivityData.push(subtotalRow)

  //                   amSubtotal = 0
  //                   pmSubtotal = 0
  //                   nightSubtotal = 0
  //                   counter = 1
  //                 }
  //               }
  //               // DMRRecords.push(item)

  //             }


  //             // if(rowdata.length>0){
  //             //   ActivityData.push(rowdata)
  //             // }

  //           }
  //         }



  //         let TotalRow = []

  //         TotalRow.push(
  //           { colSpan: 3, text: 'Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
  //           { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           // { text: '', bold: false, fontSize: 9 },

  //           { text: totalAM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: totalPM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

  //           { text: totalAM + totalPM + totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
  //         ActivityData.push(TotalRow)



  //         // for (let i = 0; i < reportData.length; i++) {
  //         //   const element = reportData[i];
  //         //   let rowdata = []
  //         //   let totalTypes = element.AM + element.PM + element.Night
  //         //   rowdata.push(
  //         //     { text: counter, bold: false, fontSize: 9 },
  //         //     { text: element.partnerName, bold: false, fontSize: 9 },
  //         //     { text: element.ClientType, bold: false, fontSize: 9 },
  //         //     { text: element.Category, bold: false, fontSize: 9 },

  //         //     { text: element.AM, bold: false, fontSize: 9 },
  //         //     { text: element.PM, bold: false, fontSize: 9 },
  //         //     { text: element.Night, bold: false, fontSize: 9 },

  //         //     { text: totalTypes, bold: false, fontSize: 9 })


  //         //   ActivityData.push(rowdata)
  //         //   totalPaxCount = totalPaxCount + totalTypes
  //         //   counter++
  //         // }

  //       }

  //       // docDefinition.content.push( /* Terms& Conditions */
  //       //   '\n',
  //       //   { text: 'Pax Count : ' + totalPaxCount + ' (Breakdown of all Pax entering the lounge as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
  //       //   '\n',
  //       //   {

  //       //     table: {
  //       //       headerRows: 0,
  //       //       widths: [30, 80, 80, 75, 45, 45, 60, 30],
  //       //       body: ActivityData
  //       //     }
  //       //   });

  //       /*Void admission data */


  //       if (VoidreportData.length > 0) {

  //         // let ActivityData = []

  //         // if (shifName.outletShifts.length > 0) {
  //         //   VoidActivityData.push(
  //         //     [
  //         //       { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //         //       // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //         //       { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

  //         //       { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //         //     ])

  //         // } else {
  //         //   VoidActivityData.push(
  //         //     [
  //         //       { text: 'Sr.No.', bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Parent Name', bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Partner Type', bold: true, alignment: 'left', fontSize: 9 },

  //         //       // { text: 'Partner Category', bold: true, alignment: 'left', fontSize: 9 },

  //         //       { text: shifName.outletShifts[0].shiftName, bold: true, alignment: 'left', fontSize: 9 },

  //         //       { text: shifName.outletShifts[1].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: shifName.outletShifts[2].shiftName, bold: true, alignment: 'left', fontSize: 9 },
  //         //       { text: 'Total', bold: true, alignment: 'left', fontSize: 9 },

  //         //     ])

  //         // }

  //         let totalAM = 0;
  //         let totalPM = 0;
  //         let totalNight = 0;
  //         let GrandTotal = 0;

  //         if (this.partnerTypes.length > 0) {
  //           for (let j = 0; j < this.partnerTypes.length; j++) {
  //             const elementPartnerType = this.partnerTypes[j];



  //             let amSubtotal = 0
  //             let pmSubtotal = 0
  //             let nightSubtotal = 0
  //             let counter = 1
  //             for (let index = 0; index < VoidreportData.length; index++) {
  //               const element = VoidreportData[index];


  //               if (elementPartnerType.key1 === element._id.ClientType) {

  //                 let rowdata = []
  //                 let item = {
  //                   partnerName: '',
  //                   Category: '',
  //                   ClientType: '',
  //                   AM: 0,
  //                   PM: 0,
  //                   Night: 0
  //                 }

  //                 item.partnerName = element._id.partnerName
  //                 item.Category = element._id.Category
  //                 item.ClientType = element._id.ClientType
  //                 //  console.log('element._id.shifts',element.shifts) 
  //                 let amCount = 0
  //                 let pmcount = 0
  //                 let nightCount = 0
  //                 element.shifts.forEach(elementforeach => {
  //                   // let strRegex = new RegExp(/^[a-z0-9]+$/i);
  //                   if (elementforeach.shiftName) {

  //                     // let isString=strRegex.test(elementforeach.shiftName)

  //                     let isshiftFindAM = elementforeach.shiftName.toLowerCase().includes('am')
  //                     if (isshiftFindAM) {
  //                       amCount = elementforeach.countShift
  //                       return
  //                     }
  //                     let isshiftFindPM = elementforeach.shiftName.toLowerCase().includes('pm')
  //                     if (isshiftFindPM) {
  //                       pmcount = elementforeach.countShift
  //                       return
  //                     }
  //                     let isshiftFindNight = elementforeach.shiftName.toLowerCase().includes('night')
  //                     if (isshiftFindNight) {
  //                       nightCount = elementforeach.countShift
  //                       return
  //                     }

  //                   }
  //                 });



  //                 item.AM = amCount
  //                 item.PM = pmcount
  //                 item.Night = nightCount

  //                 amSubtotal = amSubtotal + amCount
  //                 pmSubtotal = pmSubtotal + pmcount
  //                 nightSubtotal = nightSubtotal + nightCount
  //                 totalAM = totalAM + amCount;
  //                 totalPM = totalPM + pmcount;
  //                 totalNight = totalNight + nightCount;


  //                 let totalTypes = item.AM + item.PM + item.Night
  //                 rowdata.push(
  //                   { text: counter, bold: false, fontSize: 9 },
  //                   { text: item.partnerName, bold: false, fontSize: 9 },
  //                   { text: item.ClientType, bold: false, fontSize: 9 },
  //                   // { text: item.Category, bold: false, fontSize: 9 },

  //                   { text: item.AM, bold: false, fontSize: 9 },
  //                   { text: item.PM, bold: false, fontSize: 9 },
  //                   { text: item.Night, bold: false, fontSize: 9 },

  //                   { text: totalTypes, bold: false, fontSize: 9 })



  //                 voidtotalPaxCount = voidtotalPaxCount + totalTypes
  //                 counter++
  //                 VoidActivityData.push(rowdata)




  //               }

  //               if (index === VoidreportData.length - 1) {
  //                 let subtotal = amSubtotal + pmSubtotal + nightSubtotal

  //                 if (subtotal > 0) {



  //                   let subtotalRow = []
  //                   subtotalRow.push(
  //                     { colSpan: 3, text: 'Sub Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
  //                     { text: '', bold: false, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     // { text: '', bold: false, fontSize: 9 },

  //                     { text: amSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: pmSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //                     { text: nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

  //                     { text: amSubtotal + pmSubtotal + nightSubtotal, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
  //                   VoidActivityData.push(subtotalRow)

  //                   amSubtotal = 0
  //                   pmSubtotal = 0
  //                   nightSubtotal = 0
  //                   counter = 1
  //                 }
  //               }
  //               // DMRRecords.push(item)

  //             }


  //             // if(rowdata.length>0){
  //             //   ActivityData.push(rowdata)
  //             // }

  //           }
  //         }



  //         let TotalRow = []

  //         TotalRow.push(
  //           { colSpan: 3, text: 'Total', fillColor: '#e8eaeb', alignment: 'right', bold: true, fontSize: 9 },
  //           { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: '', bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           // { text: '', bold: false, fontSize: 9 },

  //           { text: totalAM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: totalPM, bold: true, fillColor: '#e8eaeb', fontSize: 9 },
  //           { text: totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 },

  //           { text: totalAM + totalPM + totalNight, bold: true, fillColor: '#e8eaeb', fontSize: 9 })
  //         VoidActivityData.push(TotalRow)



  //         // for (let i = 0; i < reportData.length; i++) {
  //         //   const element = reportData[i];
  //         //   let rowdata = []
  //         //   let totalTypes = element.AM + element.PM + element.Night
  //         //   rowdata.push(
  //         //     { text: counter, bold: false, fontSize: 9 },
  //         //     { text: element.partnerName, bold: false, fontSize: 9 },
  //         //     { text: element.ClientType, bold: false, fontSize: 9 },
  //         //     { text: element.Category, bold: false, fontSize: 9 },

  //         //     { text: element.AM, bold: false, fontSize: 9 },
  //         //     { text: element.PM, bold: false, fontSize: 9 },
  //         //     { text: element.Night, bold: false, fontSize: 9 },

  //         //     { text: totalTypes, bold: false, fontSize: 9 })


  //         //   ActivityData.push(rowdata)
  //         //   totalPaxCount = totalPaxCount + totalTypes
  //         //   counter++
  //         // }

  //       }

  //       docDefinition.content.push( /* Terms & Conditions */
  //       '\n',
  //       { text: 'Pax Count : ' + totalPaxCount + ' (Breakdown of all Pax entering the lounge as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
  //       '\n',
  //       {

  //         table: {
  //           headerRows: 0,
  //           widths: [30, 86, 100, 75, 65, 60, 35],
  //           body: ActivityData
  //         }
  //       });
  //       docDefinition.content.push( /* Terms & Conditions */
  //         '\n',
  //         { text: 'Void Transaction Count : ' + voidtotalPaxCount + ' (Breakdown of void transactions as per shift): \n', decoration: 'underline', alignment: 'left', fontSize: 10, margin: [0, 0, 0, 0], bold: true },
  //         '\n',
  //         {

  //           table: {
  //             headerRows: 0,
  //             widths: [30, 86, 100, 75, 65, 60, 35],
  //             body: VoidActivityData
  //           }
  //         });

  //       pdfMake.createPdf(docDefinition).download('DailyManagementReport.pdf')

  //     }
  //     else if (res.status === 2) {
  //       this.toaster.info(res.description);
  //     } else {
  //       this.toaster.error(res.description);
  //     }

  //   });

  // }
  private fetchParnterTypes(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerTypes = res.result.values as IGlobalSetting[];
        // console.log('880', this.partnerTypes)
        this.partnerTypes = this.partnerTypes.sort((a, b) => {
          return a.key1 > b.key1 ? 1 : b.key1 > a.key1 ? -1 : 0;
        });

        this.mapGlobalSettingsOnData();
      }
    });
  }
}




export class IDMREvents {
  // tslint:disable-next-line: variable-name
  outlet: string;
  _id: string;
  category: number;
  remarks: string;
  displayCategory: string;
  createdOn: any;
  status: string;
}
