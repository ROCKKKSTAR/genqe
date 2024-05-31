import { Injectable, ɵCompiler_compileModuleSync__POST_R3__, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment as env } from 'src/environments/environment';

import { TranslateService } from '@ngx-translate/core';
import { ILanguage } from '../models/language.interface';
import { promise } from 'protractor';
import { WebService } from './web.service';
import { IResponse } from '../models/server-data-source.model';
import { IGlobalSetting } from '../models/globalSetting.interface';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';

import * as JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
// var htmlToPdfmake = require("html-to-pdfmake");
import htmlToPdfmake from 'html-to-pdfmake'
import { AuthenticationService } from './auth.service';
import { N } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
// import * as htmlToImage from 'html-to-image'
// import { toPng } from 'html-to-image'; 
import html2canvas from 'html2canvas';
// import { ConsoleReporter } from 'jasmine';
interface IUnSettlementRecord {
  _id: string;
  isSelected: boolean;
  invoiceNo: string;
  method: string;
  currency: string;
  referenceNo: string;
  amount: number;
  createdOn: string;
}
interface ISettlementRecord {
  _id: string;
  invoiceNo: string;
  createdOn: any;
  method: string;
  settlementID: string;
  settledOn: any;
  admissionDoneBy: string;
  currency: number;
  amount: any;
  settledname: string;
}



@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {
  private months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  public DashboardSubject = new BehaviorSubject<any>(false);
  DashboardSubjectObservable = this.DashboardSubject.asObservable();

  public CreateBookHeaderSubject = new BehaviorSubject<any>({});
  CreateBookHeaderSubjectObservable = this.CreateBookHeaderSubject.asObservable();

  public ChapterChangeSubject = new BehaviorSubject<any>({});
  ChapterChangeSubjectObservable = this.ChapterChangeSubject.asObservable();
  @ViewChild('screen') screen: ElementRef;
  public LanguageChangeSubject = new BehaviorSubject<any>({});
  public _language = new BehaviorSubject<string>('English');
  public languageData: ILanguage;
  public eventSubject = new Subject<any>();
  public bellCount: Subject<any> = new Subject();
  langKeyCode: string;
  bellCountComponent() {
    this.bellCount.next()
  }

  public callDmr: Subject<any> = new Subject();
  dmrCall() {
    this.callDmr.next()
  }

  public failedTokens: Subject<any> = new Subject();
  failedTokensCall() {
    this.failedTokens.next()
  }


  public local_language = new BehaviorSubject<string>('en');
  public statusMap = {
    0: 'Draft',
    1: 'Approved',
    2: 'Approval Pending',
    3: 'Deactivated',
    '-10': 'Rejected',
  };
  public totalAmount = {};
  public totalOrdersID = [];
  public tokenDocuments: IGlobalSetting[] = [];
  private tokenCategories: IGlobalSetting[] = [];
  public tokenIdentifiedBy: IGlobalSetting[] = [];
  public tokenTypes: IGlobalSetting[] = [];
  public applicableTo: IGlobalSetting[] = [];
  public allTokenIdentifiers: IGlobalSetting[] = [];
  private entitlementWithin: IGlobalSetting[] = [];
  public LoungeBrand: IGlobalSetting[] = [];
  public PartnerType: IGlobalSetting[] = [];


  changeDashboard(value): void {
    this.DashboardSubject.next(value);
  }

  changeCreateBookHeader(value): void {
    this.CreateBookHeaderSubject.next(value);
  }

  changeChapter(value): void {
    this.ChapterChangeSubject.next(value);
  }

  constructor(
    private toastr: ToastrService,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private WS: WebService,
    private http: HttpClient,
    private auth: AuthenticationService
  ) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  public async fetchSideBarmenu(lookupCode: string): Promise<boolean> {
    return this.http.post(env.BASE_URL + 'api/master/globalSetting/fetch/lookupCode', { lookupCode: 'SIDEBAR_MENU_ITEMS' }, { observe: 'body', responseType: 'json' }).toPromise()
      .then((res: IResponse) => {
        if (res.status === 1) {
          this.auth.sidebarItems = res.result.values;
          return true
        } else if (res.status === 2) {
          this.toastr.info(res.description);
          return false
        } else {
          this.toastr.error(res.description);
          return true
        }
      })
    // this.WS.post('api/master/globalSetting/fetch/lookupCode', {
    //   lookupCode,
    // }).subscribe((res: any) => {
    //   console.log('Fetched sidebar')
    //   if (res.status === 1) {
    //     this.auth.sidebarItems = res.result.values;
    //   } else if (res.status === 2) {
    //     this.toastr.info(res.description);
    //   } else {
    //     this.toastr.error(res.description);
    //   }
    // });
  }

  public setLanguage(lang: string): void {
    this._language.next(lang);
  }
  public setLangKeyCOde(keyCode: string): void {
    this.langKeyCode = keyCode;
  }
  public getLangKeyCOde(): any {
    return this.langKeyCode
  }

  public getLanguage(): any {
    return this._language.value;
  }

  public showSuccess(msg): void {
    this.toastr.success(msg, 'Repro Books');
  }
  public showError(msg): void {
    if (msg) {
      this.toastr.error(msg, 'Repro Books');
    }
  }
  public showInfo(msg): void {
    this.toastr.info(msg, 'Repro Books');
  }
  public showWarning(msg): void {
    this.toastr.warning(msg, 'Repro Books');
  }
  public loadScript(src: string): any {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = (e) => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  public preloadLanguage(lang: IGlobalSetting[]): void {
    if (lang.length) {
      for (const l of lang) {
        if (l.key2 === 'Chinese' || l.key2 === 'English') {
          this.http.get(`/assets/i18n/${l.key2}.json`).subscribe(t => {

          });
        }
      }
    }
  }
  public getLanguageData(lang: string): ILanguage {
    if (lang) {
      this.translate.use(lang);
      this.translate.get(['schema']).subscribe((t) => {
        this.languageData = t.schema;
      });
    }
    return this.languageData;
  }

  public fetchLocalisationLanguages(): Observable<Object> {
    return this.WS.post('api/master/globalSetting/fetch/lookupCode', { lookupCode: 'LOCALISATION_LANGUAGE' });
  }

  public formatDateTime(date: Date): string {



    let timezone = 'Asia/Calcutta';
    const selected = this.auth.getSelectedLounge();
    if (selected.airport && selected.airport.airportTimezone) {
      timezone = selected.airport.airportTimezone;
    }
    const option: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const d = new Date(date).toLocaleString('en-US', option);

    // let UTC = new Date().toISOString();
    // let timeSplit = UTC.split('T');
    // console.log(timeSplit);
    // Wed, November 30, 2022 at 5:34 PM
    // let hours = timeSplit[1].split(':')[0] +
    // const d = new Date(date).toLocaleString();
    // `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MM-yyyy')}`
    // console.log('ds',`${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyyhh:mm a')}`)
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyy HH:mm')}` //`${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
  }

  public formatDateTime12Hours(date: Date): string {



    let timezone = 'Asia/Calcutta';
    const selected = this.auth.getSelectedLounge();
    if (selected.airport && selected.airport.airportTimezone) {
      timezone = selected.airport.airportTimezone;
    }
    const option: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const d = new Date(date).toLocaleString('en-US', option);

    // let UTC = new Date().toISOString();
    // let timeSplit = UTC.split('T');
    // console.log(timeSplit);
    // Wed, November 30, 2022 at 5:34 PM
    // let hours = timeSplit[1].split(':')[0] +
    // const d = new Date(date).toLocaleString();
    // `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MM-yyyy')}`
    // console.log('ds',`${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyyhh:mm a')}`)
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyy hh:mm a')}` //`${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
  }

  public validDate = (date) => {
    const valid = new Date(date)
    return valid instanceof Date && !isNaN(valid.valueOf())
  }

  public formatDate(date: Date): string {
    let timezone = 'Asia/Calcutta';
    const selected = this.auth.getSelectedLounge();
    if (selected.airport && selected.airport.airportTimezone) {
      timezone = selected.airport.airportTimezone;
    }
    const option: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };

    if (!this.validDate(date)) {
      return ''
    }

    const d = new Date(date).toLocaleString('en-US', option);
    // return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}`;
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyy')}`//`${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MM-yyyy')}`
  }

  public formatDateForInputs(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because January is 0!
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  public formatTime(date: Date): string {
    let timezone = 'Asia/Calcutta';
    const selected = this.auth.getSelectedLounge();
    if (selected.airport && selected.airport.airportTimezone) {
      timezone = selected.airport.airportTimezone;
    }
    const option: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const d = new Date(date).toLocaleString('en-US', option);
    // return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}`;
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'HH:MM')}`
  }

  public formatUTCDateTime(date: Date): string {
    let timezone = 'Asia/Calcutta';
    // const selected = this.auth.getSelectedLounge();
    // if (selected.airport && selected.airport.airportTimezone) {
    //   timezone = selected.airport.airportTimezone;
    // }
    const option: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const d = new Date(date).toLocaleString('en-US', option);
    // return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}`;
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyy hh:mm a')}`
  }

  public formatDateCard(date: Date): string {
    // const d = new Date(date);
    // return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}`;
    // return `${this.datePipe.transform(d, 'dd-MMM-yyyy')}`
    let timezone = 'Asia/Calcutta';
    // const selected = this.auth.getSelectedLounge();
    // if (selected.airport && selected.airport.airportTimezone) {
    //   timezone = selected.airport.airportTimezone;
    // }
    const option: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    const d = new Date(date).toLocaleString('en-US', option);
    // return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}`;
    return `${this.datePipe.transform(d.replace(/at/g, ''), 'dd-MMM-yyyy')}`
  }

  public generatePDF(tokenId, callscreen) {
    this.fetchTokenDocuments('TOKEN_DOCUMENT');
    this.fetchApplicableTo('ENTITLEMENT_APPLICABLE_TO');
    this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
    this.fetchAdmissionCategory('ADMISSION_TOKEN_CATEGORY');
    this.fetchTokenIdentifiedBy('TOKEN_IDENTIFIED_BY');

    this.fetchEntitlementWithin('ENTITLEMENT_WITHIN');
    return new Promise((resolve, reject) => {
      try {
        // this.fetchTokenDocuments('TOKEN_DOCUMENT');
        // this.fetchApplicableTo('ENTITLEMENT_APPLICABLE_TO');
        // this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
        // this.fetchAdmissionCategory('ADMISSION_TOKEN_CATEGORY');
        // this.fetchTokenIdentifiedBy('TOKEN_IDENTIFIED_BY');

        // this.fetchEntitlementWithin('ENTITLEMENT_WITHIN');
        if (!tokenId) {
          this.toastr.info('Token id not found');
          return;
        }
        this.WS.post('api/master/admissionToken/ExportPDF', { TokenyId: tokenId, screen: callscreen }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));
            // console.log('res.result export pdf', res.result)

            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',

              header: function (currentPage, pageCount) {
                return {
                  margin: [30, 30, 30, 30],
                  columns: [
                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
                    { text: 'ADMISSION INSTRUCTION ', fontSize: 12, margin: [0, 5, 0, 0], height: 15, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 200 }

                  ]
                };
              }
              ,
              footer: function (currentPage, pageCount) {




                return {

                  columns: [
                    // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

                    { text: 'Copyright © 2022 PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    { text: 'Generated By: ' + res.result.generatedBypdf + ', ' + gettodaydate, alignment: 'left', bolf: true, fontSize: 8, margin: [40, 30, 0, 0], width: '50%' },

                  ]
                };
              },
              background: function (currentPage, pageSize) {
                return [
                  {
                    canvas: [

                      { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
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

                      { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                    ],

                  }
                ];
              },
              content: []
            };

            setTimeout(() => {
              for (let index = 0; index < res.result.tokendata.length; index++) {
                var EntitlementsData = [
                  [
                    { text: 'Bin Range', bold: true, fontSize: 11 },
                    { text: 'Outlet Name', bold: true, fontSize: 11 },

                    { text: 'Applicable To', bold: true, fontSize: 11 },
                    { text: 'Entitlement', bold: true, fontSize: 11 },
                    { text: 'Qty', bold: true, fontSize: 11 },
                    { text: 'Within', bold: true, fontSize: 11 },
                    { text: 'Quota', bold: true, fontSize: 11 },
                    { text: 'Currency', bold: true, fontSize: 11 },
                    { text: 'Price', bold: true, fontSize: 11 }
                  ]
                ];
                var TokenIdentification = [
                  [
                    // { text: 'Mask Pattern', bold: true, fontSize: 11 },
                    { text: 'Start Bin', bold: true, fontSize: 11 },
                    { text: 'End Bin', bold: true, fontSize: 11 },
                    { text: 'Issuing Country', bold: true, fontSize: 11 },
                    // { text: 'Issuing Language', bold: true, fontSize: 11 },

                  ]
                ];
                var Applicable_At = [
                  [
                    { text: 'Bin Range', bold: true, fontSize: 11 },
                    { text: 'Outlet Name', bold: true, fontSize: 11 },
                    { text: 'Outlet Address', bold: true, fontSize: 11 },
                    { text: 'Outlet Brand', bold: true, fontSize: 11 }
                  ]
                ];

                var TokenDetailsTable = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 }
                  ]
                ];

                var TokenSampletable = [];

                var Localisations = [
                  [
                    { text: 'Attribute', bold: true, fontSize: 11 },
                    { text: 'English', bold: true, fontSize: 11 },
                    { text: 'Hindi', bold: true, fontSize: 11 },
                    { text: 'Chinese', bold: true, fontSize: 11 },
                    { text: 'Korean', bold: true, fontSize: 11 },
                  ]
                ];
                var DocumentRequired = [
                  [
                    { text: 'Name', bold: true, fontSize: 11 },
                    { text: 'Description', bold: true, fontSize: 11 }
                  ]
                ];

                var termsandcondition = [
                  // [
                  // //   { text: 'TERMS & CONDITION', bold: true, alignment: 'center', fontSize: 11 }

                  //  ]
                ];


                if (res.result.tokendata[index].documents.length > 0 && res.result.tokendata[index].documents != undefined) {

                  // console.log(this.tokenDocuments);
                  for (var l = 0; l < res.result.tokendata[index].documents.length; l++) {
                    // if(res.result.tokendata.documents[0].keyCode==)
                    var docrow = [];
                    for (var i = 0; i < this.tokenDocuments.length; i++) {

                      if (res.result.tokendata[index].documents[l] == this.tokenDocuments[i].keyCode) {
                        docrow.push(
                          { text: this.tokenDocuments[i].key1, fontSize: 10 },
                          { text: this.tokenDocuments[i].key2, fontSize: 10 });


                        DocumentRequired.push(docrow);
                      }


                    }
                  }

                } else {
                  var spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 2, alignment: 'center' });
                  DocumentRequired.push(spamrow);
                }


                if (res.result.tokendata[index].tnc != undefined && res.result.tokendata[index].tnc != '') {
                  var tncrow = []
                  tncrow.push(
                    { text: res.result.tokendata[index].tnc, bold: true, alignment: 'left', fontSize: 10 });
                  termsandcondition.push(tncrow);
                } else {
                  var tncrow = []
                  tncrow.push(
                    { text: 'T&C not found', bold: true, alignment: 'left', fontSize: 10 });
                  termsandcondition.push(tncrow);
                }



                /* get documents name */
                var BinRange = '';
                const matchadmisiontype = this.tokenTypes.find(app => app.keyCode === res.result.tokendata[index].type);
                if (matchadmisiontype) {
                  tokentypes = matchadmisiontype.key1;
                }
                if (res.result.tokendata[index].localisation != undefined) {
                  var keyvalues = Object.keys(res.result.tokendata[index].localisation);
                  var loclisationRow = [];
                  loclisationRow.push(
                    { text: keyvalues[0], fontSize: 10 },
                    { text: res.result.tokendata[index].localisation.name.en, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation.name.hi, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation.name.chi, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation.name.kor, fontSize: 10 },
                  );
                  Localisations.push(loclisationRow);
                } else {
                  var spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 5, alignment: 'center' });
                  Localisations.push(spamrow);
                }
                if (res.result.tokendata[index].tokenIdentification.length > 0) {
                  for (var k = 0; k < res.result.tokendata[index].tokenIdentification.length; k++) {
                    var row = [];
                    BinRange = res.result.tokendata[index].tokenIdentification[k].startBIN + '-' + res.result.tokendata[index].tokenIdentification[k].endBIN;
                    row.push(
                      // { text: res.result.tokendata[index].tokenIdentification[k].mask, bold: false, fontSize: 10 },
                      { text: res.result.tokendata[index].tokenIdentification[k].startBIN, bold: false, fontSize: 10 },
                      { text: res.result.tokendata[index].tokenIdentification[k].endBIN, bold: false, fontSize: 10 },
                      { text: res.result.tokendata[index].tokenIdentification[k].issuingCountry, bold: false, fontSize: 10 },
                      // { text: res.result.tokendata[index].tokenIdentification[k].issuingLanguage, bold: false, fontSize: 10 },
                    );
                    TokenIdentification.push(row);
                  }
                } else {
                  var spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 5, alignment: 'center' });
                  TokenIdentification.push(spamrow);
                }
                var tokencatgoryname, tokeyidentifyby = '', tokentypes;
                if (res.result.imagedata[index] != undefined) {
                  if (res.result.imagedata[index].length > 0) {
                    for (var n = 0; n < res.result.imagedata[index].length; n = n + 2) {
                      if (res.result.imagedata.length > 0) {
                        var tokensamplerow = [];
                        for (let r = 0; r < 2; r++) {

                          if (r + n < res.result.imagedata[index].length) {
                            var getimagelength = '';
                            getimagelength = res.result.imagedata[index][n + r];
                            // imageData = resimg

                            tokensamplerow.push({
                              width: '50%',
                              stack: [{
                                image: getimagelength,
                                width: 150,
                                fit: [200, 300],
                                alignment: 'center'
                              }, { text: '', fontsize: 10, bold: true, fontSize: 10, alignment: 'center' }
                              ]
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
                // if (res.result.loundgeEntitlement != undefined) {
                if (res.result.loundgeEntitlement.length > 0) {
                  // for (let j = 0; j < res.result.loundgeEntitlement.length; j++) {

                  for (let k = 0; k < res.result.loundgeEntitlement[index].length; k++) {

                    if (res.result.loundgeEntitlement[index][k].entitlements.length > 0) {
                      for (let m = 0; m < res.result.loundgeEntitlement[index][k].entitlements.length; m++) {
                        var applicatname;
                        let withinvalues;
                        const matchApp = this.applicableTo.find(app => app.keyCode === res.result.loundgeEntitlement[index][k].entitlements[m].applicableTo);
                        if (matchApp) {
                          applicatname = matchApp.key1;
                        }
                        const matchwithin = this.entitlementWithin.find(app => app.keyCode === res.result.loundgeEntitlement[index][k].entitlements[m].within);
                        if (matchwithin) {
                          withinvalues = matchwithin.key1;
                        }
                        var row = [];
                        row.push(
                          { text: BinRange, bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].loungeID == null ? 'N/A' : res.result.loundgeEntitlement[index][k].loungeID.name, bold: false, fontSize: 10 },
                          { text: applicatname, bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].entitlements[m].product.name, bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].entitlements[m].quantity, bold: false, fontSize: 10 },
                          { text: withinvalues, bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].entitlements[m].quota ? res.result.loundgeEntitlement[index][k].entitlements[m].quota == 99999 ? 'Unlimited' : res.result.loundgeEntitlement[index][k].entitlements[m].quota : '', bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].entitlements[m].currency, bold: false, fontSize: 10 },
                          { text: res.result.loundgeEntitlement[index][k].entitlements[m].discountedPrice, bold: false, fontSize: 10 },

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
                    var applicableROw = [];
                    applicableROw.push(
                      { text: BinRange, bold: false, fontSize: 10 },
                      { text: res.result.loundgeEntitlement[index][k].loungeID == null ? 'N/A' : res.result.loundgeEntitlement[index][k].loungeID.name, bold: false, fontSize: 10 },
                      { text: res.result.loundgeEntitlement[index][k].loungeID == null ? 'N/A' : res.result.loundgeEntitlement[index][k].loungeID.addressLine1 + ',' + res.result.loundgeEntitlement[index][k].loungeID.addressLine2, bold: false, fontSize: 10 },
                      { text: res.result.loundgeEntitlement[index][k].loungeID == null ? 'N/A' : res.result.loundgeEntitlement[index][k].loungeID.brand, bold: false, fontSize: 10 }
                    );

                    Applicable_At.push(applicableROw);

                  }
                  // }
                } else {
                  var spanentirow = [];
                  spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 9, alignment: 'center' });
                  EntitlementsData.push(spanentirow);
                  var spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 4, alignment: 'center' });
                  Applicable_At.push(spamrow);
                }
                // } else {
                //   var spamrow = [];
                //   spamrow.push({ text: 'Data not found', bold: true, colSpan: 4, alignment: 'center' });
                //   Applicable_At.push(spamrow);
                //   var spanentirow = [];
                //   spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 9, alignment: 'center' });
                //   EntitlementsData.push(spanentirow);
                // }

                for (let n = 0; n < res.result.tokendata[index].identifiedBy.length; n++) {
                  let matchIdentifiedBy = this.allTokenIdentifiers.find(app => app.keyCode === res.result.tokendata[index].identifiedBy[n]);
                  if (matchIdentifiedBy) {
                    tokeyidentifyby += matchIdentifiedBy.key1 + ',';
                  }
                }
                tokeyidentifyby = tokeyidentifyby.slice(0, -1);


                const matchcategory = this.tokenCategories.find(app => app.keyCode === res.result.tokendata[index].category);
                if (matchcategory) {
                  tokencatgoryname = matchcategory.key1;
                }

                var tokenDetails = [];
                // console.log('res.result.tokendata[index]',res.result.tokendata[index])  shortCode
                tokenDetails.push(
                  { text: 'Name:', bold: false, fontSize: 10 },
                  { text: res.result.tokendata[index].name, bold: true, fontSize: 10 },
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
                  { text: res.result.tokendata[index].partnerID.name, bold: false, fontSize: 10 },
                  { text: 'Created Date:', bold: false, fontSize: 10 },
                  { text: this.formatDateTime(res.result.tokendata[index].partnerID.createdOn), bold: false, fontSize: 10 }
                );
                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];

                //  console.log('res.result.tokendata[index].shortCode', res.result.tokendata[index].shortCode)
                var shorcode = 'N/A'
                if (res.result.tokendata[index].shortCode != undefined) {
                  shorcode = res.result.tokendata[index].shortCode
                }
                tokenDetails.push(
                  { text: 'Status:', bold: false, fontSize: 10 },
                  { text: this.statusMap[res.result.tokendata[index].status], bold: false, fontSize: 10 },
                  { text: 'Short Code', bold: false, fontSize: 10 },
                  { text: shorcode, bold: false, fontSize: 10 }
                );


                TokenDetailsTable.push(tokenDetails);
                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [70, 200, 70, 150],
                      body: TokenDetailsTable
                    }
                  });
                docDefinition.content.push( /* Terms& Conditions */
                  '\n',
                  { text: 'Terms & Conditions: \n', decoration: 'underline', alignment: 'left', fontSize: 13, margin: [0, 0, 0, 0], bold: true },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: termsandcondition
                    }
                  });
                docDefinition.content.push('\n',
                  /* Token Identification table */
                  { text: 'Token Identification', decoration: 'underline', bold: true, fontSize: 13 },
                  '\n',
                  {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*'],
                      body: TokenIdentification
                    }
                  });

                docDefinition.content.push(
                  /* Outlet Entilement table */
                  '\n',
                  { text: 'Outlet Entitlements: \n', decoration: 'underline', alignment: 'left', fontSize: 13, margin: [0, 0, 0, 0], bold: true },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: [60, 71, 70, 60, 22, 35, 30, 55, 30],
                      body: EntitlementsData
                    }
                  });
                docDefinition.content.push( /* Document Required */
                  '\n',
                  { text: 'Document Required: \n', decoration: 'underline', alignment: 'left', fontSize: 13, margin: [0, 0, 0, 0], bold: true },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*', '*'],
                      body: DocumentRequired
                    }
                  });

                docDefinition.content.push(/* Token sample */
                  '\n',
                  { text: 'Token sample', decoration: 'underline', bold: true, fontSize: 13 },
                  '\n',
                  TokenSampletable,
                  '\n',

                );

                docDefinition.content.push(/* Localisation table data */
                  '\n',
                  { text: 'Localisation', decoration: 'underline', bold: true, fontSize: 13 },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*', '*'],
                      body: Localisations
                    }
                  },
                  '\n'
                );

                if (res.result.tokendata.length - 1 > index) {
                  docDefinition.content.push({
                    text: '-------------',
                    pageBreak: 'after',
                    alignment: 'center'
                  });
                }

              }
              var pdffilename = '';
              var datcounts = res.result.tokendata.length;
              if (res.result.tokendata.length > 0) {
                pdffilename = res.result.tokendata[0].name;
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              const pdfDocGenerator = pdfMake.createPdf(docDefinition);
              pdfDocGenerator.getBlob((blob) => {
                var FileName = res.result.tokendata[0].name + '.pdf';
                const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                this.WS.post('api/master/s3/presignedURL', {
                  type: 'Partner Contract',
                  extension: 'pdf',
                  contentType: pdfFile.type,
                  fileName: FileName
                }).subscribe((res: any) => {
                  //  console.log(res);
                  this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                    switch (event.type) {
                      case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                      case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                      case HttpEventType.UploadProgress:
                        break;
                      case HttpEventType.Response:

                        this.WS.post('api/master/fileImportExport/save/import', {
                          path: res.result.urlInfo.key,
                          type: 'Partner Contract',
                          fileName: pdfFile.name,
                          Datacount: datcounts,
                          activity: 'Export',
                          extension: 'pdf'
                        }).subscribe((re: IResponse) => {
                          if (re.status === 1) {
                            re.result;



                            let resMessage = {
                              status: false,
                              message: re.description
                            }
                            resolve(resMessage);
                          }
                          else if (re.status === 2) {
                            let resMessage = {
                              status: false,
                              message: re.description
                            }
                            reject(resMessage);
                          }
                          else {
                            let resMessage = {
                              status: false,
                              message: re.description
                            }
                            reject(resMessage);
                          }
                        });
                    }

                  });
                });
              });

            }, 500);
          }
          else if (res.status === 2) {
            let resMessage = {
              status: false,
              message: res.description
            }
            reject(resMessage);
          }
          else {
            let resMessage = {
              status: false,
              message: res.description
            }
            reject(resMessage);
          }
        });
      } catch (error) {
        console.log('Error', error);
        let resMessage = {
          status: false,
          message: error
        }
        reject(resMessage);

      }
    });
  }

  public generatePDFnew(tokenId, callscreen, IsSendEmail, isZipFile) {
    this.fetchTokenDocuments('TOKEN_DOCUMENT');
    this.fetchApplicableTo('ENTITLEMENT_APPLICABLE_TO');
    this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
    this.fetchAdmissionCategory('ADMISSION_TOKEN_CATEGORY');
    this.fetchTokenIdentifiedBy('TOKEN_IDENTIFIED_BY');

    this.fetchEntitlementWithin('ENTITLEMENT_WITHIN');
    return new Promise((resolve, reject) => {
      try {
        // this.fetchTokenDocuments('TOKEN_DOCUMENT');
        // this.fetchApplicableTo('ENTITLEMENT_APPLICABLE_TO');
        // this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
        // this.fetchAdmissionCategory('ADMISSION_TOKEN_CATEGORY');
        // this.fetchTokenIdentifiedBy('TOKEN_IDENTIFIED_BY');

        // this.fetchEntitlementWithin('ENTITLEMENT_WITHIN')

        const zip = new JSZip();
        let FileName
        if (!tokenId) {
          this.toastr.info('Token id not found');
          return;
        }
        this.WS.post('api/master/admissionToken/ExportPDFNew', { TokenyId: tokenId, screen: callscreen }).subscribe((res: IResponse) => {
          if (res.status === 1) {


            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));
            // console.log('res.result export pdf new', res.result)

            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',

              header: function (currentPage, pageCount) {
                return {
                  margin: [30, 30, 30, 30],



                  columns: [

                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
                    { text: 'ADMISSION INSTRUCTION ', fontSize: 12, margin: [0, 5, 0, 0], height: 15, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', alignment: 'right', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 100 }

                  ]
                };
              }
              ,
              footer: function (currentPage, pageCount) {


                let getfullyear = new Date()


                return {

                  columns: [
                    // { image: footerlogo, height: 40, width: 120, alignment: 'left', margin: [10, 20, 0, 0] },

                    { text: 'Copyright © ' + getfullyear.getFullYear() + ' PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    { text: 'Generated By: ' + res.result.generatedBypdf + ', ' + gettodaydate, alignment: 'right', bolf: true, fontSize: 8, margin: [30, 30, 28, 0], width: '50%' },

                  ]
                };
              },
              background: function (currentPage, pageSize) {
                return [

                  {



                    canvas: [

                      { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
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

                      { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                    ],

                  }
                ];
              },
              content: []
            };

            setTimeout(async () => {
              // console.log('result', res.result)
              for (let index = 0; index < res.result.tokendata.length; index++) {

                let TokenDetailsTable = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 }
                  ]
                ];

                let TokenSampletable = [];



                let Localisations = [
                  [
                    { text: 'Attribute', bold: true, fontSize: 11 },
                    { text: 'English', bold: true, fontSize: 11 },
                    { text: 'Hindi', bold: true, fontSize: 11 },
                    { text: 'Chinese', bold: true, fontSize: 11 },
                    { text: 'Korean', bold: true, fontSize: 11 },
                  ]
                ];
                let DocumentRequired = [
                  [
                    { text: 'Name', bold: true, fontSize: 11 },
                    { text: 'Description', bold: true, fontSize: 11 }
                  ]
                ];

                let termsandcondition = [];


                if (res.result.tokendata[index].documents.length > 0 && res.result.tokendata[index].documents != undefined) {


                  for (let l = 0; l < res.result.tokendata[index].documents.length; l++) {

                    let docrow = [];
                    for (let i = 0; i < this.tokenDocuments.length; i++) {

                      if (res.result.tokendata[index].documents[l] == this.tokenDocuments[i].keyCode) {
                        docrow.push(
                          { text: this.tokenDocuments[i].key1, fontSize: 10 },
                          { text: this.tokenDocuments[i].key2, fontSize: 10 });


                        DocumentRequired.push(docrow);
                      }


                    }
                  }

                } else {
                  let spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 2, alignment: 'center' });
                  DocumentRequired.push(spamrow);
                }


                if (res.result.tokendata[index].tnc != undefined && res.result.tokendata[index].tnc != '') {
                  let tncrow = []
                  tncrow.push(
                    { text: res.result.tokendata[index].tnc, bold: false, alignment: 'left', fontSize: 10 });
                  termsandcondition.push(tncrow);
                } else {
                  let tncrow = []
                  tncrow.push(
                    { text: 'T&C not found', bold: false, alignment: 'left', fontSize: 10 });
                  termsandcondition.push(tncrow);
                }



                /* get documents name */

                const matchadmisiontype = this.tokenTypes.find(app => app.keyCode === res.result.tokendata[index].type);
                if (matchadmisiontype) {
                  tokentypes = matchadmisiontype.key1;
                }
                if (res.result.tokendata[index].localisation != undefined) {
                  let keyvalues = Object.keys(res.result.tokendata[index].localisation);
                  let loclisationRow = [];
                  loclisationRow.push(
                    { text: keyvalues[0], fontSize: 10 },
                    { text: res.result.tokendata[index].localisation?.name?.en, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation?.name?.hi, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation?.name?.chi, fontSize: 10 },
                    { text: res.result.tokendata[index].localisation?.name?.kor, fontSize: 10 },
                  );
                  Localisations.push(loclisationRow);
                } else {
                  let spamrow = [];
                  spamrow.push({ text: 'No data available in table', bold: true, colSpan: 5, alignment: 'center' });
                  Localisations.push(spamrow);
                }


                var tokencatgoryname, tokeyidentifyby = '', tokentypes;
                let parts: any
                let imagePath
                let contentType = ''


                const imageMimeTypes = [
                  'image/jpeg',
                  'image/jpg',
                  'image/png',
                ]


                if (res.result.imagedata[index] != undefined) {
                  if (res.result.imagedata[index].length > 0) {
                    for (var n = 0; n < res.result.imagedata[index].length; n = n + 2) {
                      if (res.result.imagedata.length > 0) {
                        var tokensamplerow = [];
                        for (let r = 0; r < 2; r++) {

                          if (r + n < res.result.imagedata[index].length) {
                            imagePath = res.result.imagedata[index][n + r]
                            parts = imagePath.split(';');
                            contentType = (parts[0].split(':')[1]);

                            if (imageMimeTypes.includes(contentType)) {
                              var getimagelength = res.result.imagedata[index][n + r];
                              // imageData = resimg
                              tokensamplerow.push({
                                width: '50%',
                                stack: [{
                                  image: getimagelength,
                                  width: 150,
                                  fit: [200, 300],
                                  alignment: 'center'
                                }, { text: '', fontsize: 10, bold: true, fontSize: 10, alignment: 'center' }
                                ]
                              });
                            }
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

                for (let n = 0; n < res.result.tokendata[index].identifiedBy.length; n++) {
                  let matchIdentifiedBy = this.allTokenIdentifiers.find(app => app.keyCode === res.result.tokendata[index].identifiedBy[n]);
                  if (matchIdentifiedBy) {
                    tokeyidentifyby += matchIdentifiedBy.key1 + ',';
                  }
                }
                tokeyidentifyby = tokeyidentifyby.slice(0, -1);


                const matchcategory = this.tokenCategories.find(app => app.keyCode === res.result.tokendata[index].category);
                if (matchcategory) {
                  tokencatgoryname = matchcategory.key1;
                }

                var tokenDetails = [];

                tokenDetails.push(
                  { text: 'Name:', bold: false, fontSize: 10 },
                  { text: res.result.tokendata[index]?.name, bold: true, fontSize: 10 },
                  { text: 'Type:', bold: false, fontSize: 10 },
                  { text: tokentypes, bold: false, fontSize: 10 },
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
                  { text: res.result.tokendata[index]?.partnerID?.name, bold: false, fontSize: 10 },
                  { text: 'Created Date:', bold: false, fontSize: 10 },
                  { text: this.formatDateTime(res.result.tokendata[index].createdOn), bold: false, fontSize: 10 }
                );
                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];


                let shorcode = 'N/A'
                if (res.result.tokendata[index].shortCode != undefined) {
                  shorcode = res.result.tokendata[index].shortCode
                }
                tokenDetails.push(
                  { text: 'Status:', bold: false, fontSize: 10 },
                  { text: this.statusMap[res.result.tokendata[index].status], bold: false, fontSize: 10 },
                  { text: 'Short Code', bold: false, fontSize: 10 },
                  { text: shorcode, bold: false, fontSize: 10 }
                );


                TokenDetailsTable.push(tokenDetails);

                tokenDetails = [];
                tokenDetails.push(
                  { text: 'Effective Date:', bold: false, fontSize: 10 },
                  { text: res.result.tokendata[index].effectiveDate, bold: false, fontSize: 10 },
                  { text: '', bold: false, fontSize: 10 },
                  { text: '', bold: false, fontSize: 10 }
                );

                TokenDetailsTable.push(tokenDetails);
                if (res.result.tokendata[index].partnerLogo) {
                  docDefinition.content.push({
                    width: '50%',
                    stack: [{
                      image: res.result.tokendata[index].partnerLogo,
                      width: 90,
                      fit: [90, 90],
                      alignment: 'left'
                    }
                    ]
                  },);
                }

                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      // margin: [10, 25, 0, 0],
                      widths: [70, 200, 70, 150],
                      body: TokenDetailsTable
                    }
                  });




                docDefinition.content.push( /* Terms& Conditions */
                  '\n',
                  { text: 'Terms & Conditions: \n', decoration: 'underline', alignment: 'left', fontSize: 13, margin: [0, 0, 0, 0], bold: true },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: termsandcondition
                    }
                  });

                let identificatonData = res.result.OutletEntitlementwithTokenIdentificatioin[index]
                if (identificatonData.length > 0) {

                  for (let p = 0; p < identificatonData.length; p++) {
                    let rowIdentify = [];
                    let arrayBody = []
                    let EntitlementsData = [
                      [
                        // { text: 'Bin Range', bold: true, fontSize: 11 },
                        { text: 'Outlet Name', bold: true, fontSize: 11 },

                        { text: 'Applicable To', bold: true, fontSize: 11 },
                        { text: 'Entitlement', bold: true, fontSize: 11 },
                        { text: 'Qty', bold: true, fontSize: 11 },
                        { text: 'Within', bold: true, fontSize: 11 },
                        { text: 'Quota', bold: true, fontSize: 11 },
                        { text: 'Currency', bold: true, fontSize: 11 },
                        { text: 'Price', bold: true, fontSize: 11 }
                      ]
                    ];
                    let TokenIdentification = [

                      [
                        // { text: 'Mask Pattern', bold: true, fontSize: 11 },
                        { text: 'Start Bin', bold: true, fontSize: 11 },
                        { text: 'End Bin', bold: true, fontSize: 11 },
                        { text: 'Issuing Country', bold: true, fontSize: 11 },
                        // { text: 'Issuing Language', bold: true, fontSize: 11 },

                      ]

                    ]

                    const elementIdentification = identificatonData[p].identification;
                    const elementLoungeEntitlements = identificatonData[p].loungeEntitlements;

                    rowIdentify.push(
                      { text: elementIdentification.startBIN, bold: false, fontSize: 10 },
                      { text: elementIdentification.endBIN, bold: false, fontSize: 10 },
                      { text: elementIdentification.issuingCountry, bold: false, fontSize: 10 },
                    );
                    TokenIdentification.push(rowIdentify);
                    arrayBody.push([['Token Identification:', '\n',
                      {

                        table: {
                          // headerRows: 1,
                          widths: ['*', '*', '*'],
                          body: TokenIdentification,
                        }
                      }, '\n']])

                    if (elementLoungeEntitlements.length > 0) {
                      for (let k = 0; k < elementLoungeEntitlements.length; k++) {
                        // res.result.loundgeEntitlement[index][0].entitlements.length
                        let loungeEntitleData = elementLoungeEntitlements[k]
                        if (loungeEntitleData.entitlements.length > 0) {
                          for (let m = 0; m < loungeEntitleData.entitlements.length; m++) {
                            let Entitlmentss = loungeEntitleData.entitlements[m]
                            let applicatname;
                            let withinvalues;

                            const matchApp = this.applicableTo.find(app => app.keyCode === Entitlmentss.applicableTo);
                            if (matchApp) {
                              applicatname = matchApp.key1;
                            }
                            const matchwithin = this.entitlementWithin.find(app => app.keyCode === Entitlmentss.within);
                            if (matchwithin) {
                              withinvalues = matchwithin.key1;
                            }
                            let Price = ''
                            if (Entitlmentss.discountType === 1) {
                              Price = Price = Entitlmentss.discountedPrice + '% Discount'
                            } else {
                              Price = Entitlmentss.discountedPrice
                            }

                            let rowEntitletment = [];
                            rowEntitletment.push(
                              // { text: BinRange, bold: false, fontSize: 10 },
                              { text: loungeEntitleData.loungeID == null ? 'N/A' : loungeEntitleData.loungeID?.name, bold: false, fontSize: 10 },
                              { text: applicatname, bold: false, fontSize: 10 },
                              { text: Entitlmentss.product?.name, bold: false, fontSize: 10 },
                              { text: Entitlmentss.quantity, bold: false, fontSize: 10 },
                              { text: withinvalues, bold: false, fontSize: 10 },
                              { text: Entitlmentss.quota ? Entitlmentss.quota == 99999 ? 'Unlimited' : Entitlmentss.quota : '', bold: false, fontSize: 10 },
                              { text: Entitlmentss.currency, bold: false, fontSize: 10 },
                              { text: Price, bold: false, fontSize: 10 },

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

                      arrayBody.push([['Outlet Entitlements:', '\n',
                        {
                          table: {
                            // headerRows: 0,
                            widths: [71, 70, 60, 35, 44, 45, 45, 65],
                            body: EntitlementsData
                          }
                        }, '\n']])

                    } else {
                      // var spanentirow = [];
                      // spanentirow.push({ text: 'No data available in table', bold: true, colSpan: 9, alignment: 'center' });
                      // EntitlementsData.push(spanentirow);

                    }
                    docDefinition.content.push('\n\n',
                      /* Token Identification table */

                      {
                        // layout: 'lightHorizontalLines',
                        table: {
                          widths: ['*'],
                          body: arrayBody,
                        }
                      });
                  }
                }
                docDefinition.content.push( /* Document Required */
                  '\n',
                  { text: 'Document Required: \n', decoration: 'underline', alignment: 'left', fontSize: 13, margin: [0, 0, 0, 0], bold: true },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*', '*'],
                      body: DocumentRequired
                    }
                  });

                docDefinition.content.push(/* Token sample */
                  '\n',
                  { text: 'Token sample', decoration: 'underline', bold: true, fontSize: 13 },
                  '\n',
                  TokenSampletable,
                  '\n',

                );

                /* start notes sections */

                function convertPercentageToPixels(value, baseWidth) {
                  if (typeof value === 'string') {
                    const percentage = parseFloat(value);
                    return Math.floor((percentage / 100) * baseWidth);
                  }
                  return value;
                }

                if (res.result.tokendata[index].AInotes) {

                  const modifiedHtmlContent = res.result.tokendata[index].AInotes.replace(/width:\s*(\d+)%/g, (match, p1) => {
                    return `width: ${convertPercentageToPixels(p1, 690)}px;`;
                  });

                  let html = htmlToPdfmake(`${modifiedHtmlContent}`)


                  docDefinition.content.push('\n',
                    { text: 'Admission Instruction Notes', decoration: 'underline', bold: true, fontSize: 13 },
                    '\n', html);
                }


                /* end notes sections */

                docDefinition.content.push(/* Localisation table data */
                  '\n',
                  { text: 'Localisation', decoration: 'underline', bold: true, fontSize: 13 },
                  '\n',
                  {

                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*', '*'],
                      body: Localisations
                    }
                  }
                );

                if (res.result.tokendata.length - 1 > index) {
                  docDefinition.content.push({
                    text: '-------------',
                    pageBreak: 'after',
                    alignment: 'center'
                  });
                }

              }

              const contentPages = await this.splitContentByPageBreak(docDefinition);

              for (let z = 0; z < contentPages.length; z++) {
                // Create a new docDefinition for the current page
                docDefinition.content = contentPages[z];
                if (isZipFile) {
                  let pdfBuffer = await this.generatePdfBuffer(docDefinition);
                  FileName = res.result.tokendata[z]?.name;
                  if (FileName) {
                    zip.file(`${FileName}_.pdf`, pdfBuffer as Uint8Array);
                  }
                }
              }
              var pdffilename = '';
              var datcounts = res.result.tokendata.length;
              if (res.result.tokendata.length > 0) {
                pdffilename = res.result.tokendata[0]?.name;
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              let pdfType = ''
              if (IsSendEmail === 0) {
                pdfType = 'GENERATE AI';
                var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              } else {
                pdfType = 'SEND AI';
              }
              //  console.log('pdfContentArray', pdfContentArray)
              if (isZipFile) {

                const partnerContractName = IsSendEmail?.name
                zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
                  const zipFileName = `Admission_Instructions_(${partnerContractName})` + '.zip';
                  // Create a Blob for the zip file
                  const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' });
                  // Create a download link for the Blob
                  const downloadLink = document.createElement('a');
                  downloadLink.href = URL.createObjectURL(zipFile);
                  downloadLink.download = zipFileName;
                  // // Trigger the download
                  downloadLink.click();
                  this.WS.post('api/master/s3/presignedURL', {
                    type: pdfType,
                    extension: 'zip',
                    contentType: zipFile.type,
                    fileName: FileName,
                    isZipFile: isZipFile
                  }).subscribe((res: any) => {

                    if (res.status === 1) {
                      this.WS.put(res.result.urlInfo.url, zipFile, zipFile.type).subscribe((event: HttpEvent<any>) => {
                        switch (event.type) {
                          case HttpEventType.Sent:
                            console.log('Request has been made!');
                            break;
                          case HttpEventType.ResponseHeader:
                            console.log('Response header has been received!');
                            break;
                          case HttpEventType.UploadProgress:
                            break;
                          case HttpEventType.Response:
                            // if(IsSendEmail===0){
                            this.WS.post('api/master/fileImportExport/save/import', {
                              path: res.result.urlInfo.key,
                              type: pdfType,
                              fileName: zipFile?.name,
                              Datacount: datcounts,
                              activity: 'Export',
                              extension: 'zip'
                            }).subscribe((re: IResponse) => {
                              if (re.status === 1) {

                                let resMessage = {
                                  status: true,
                                  result: res.result.urlInfo.key,
                                  message: re.description
                                }
                                resolve(resMessage);
                                // resolve(true);
                              }
                              else if (re.status === 2) {

                                let resMessage = {
                                  status: false,
                                  message: re.description
                                }
                                reject(resMessage);
                              }
                              else {
                                let resMessage = {
                                  status: false,
                                  message: re.description
                                }
                                reject(resMessage);
                              }
                            });

                        }

                      });
                    } else {

                      let resMessage = {
                        status: false,
                        message: res.description
                      }
                      reject(resMessage);
                    }

                  });


                });
              } else {
                const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                pdfDocGenerator.getBlob((blob) => {
                  var FileName = res.result.tokendata[0]?.name + '.pdf';
                  const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                  this.WS.post('api/master/s3/presignedURL', {
                    type: pdfType,
                    extension: 'pdf',
                    contentType: pdfFile.type,
                    fileName: FileName
                  }).subscribe((res: any) => {

                    if (res.status === 1) {
                      this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                        switch (event.type) {
                          case HttpEventType.Sent:
                            console.log('Request has been made!');
                            break;
                          case HttpEventType.ResponseHeader:
                            console.log('Response header has been received!');
                            break;
                          case HttpEventType.UploadProgress:
                            break;
                          case HttpEventType.Response:

                            // if(IsSendEmail===0){


                            this.WS.post('api/master/fileImportExport/save/import', {
                              path: res.result.urlInfo.key,
                              type: pdfType,
                              fileName: pdfFile?.name,
                              Datacount: datcounts,
                              activity: 'Export',
                              extension: 'pdf'
                            }).subscribe((re: IResponse) => {
                              if (re.status === 1) {

                                let resMessage = {
                                  status: true,
                                  result: res.result.urlInfo.key,
                                  message: re.description
                                }
                                resolve(resMessage);
                                // resolve(true);
                              }
                              else if (re.status === 2) {

                                let resMessage = {
                                  status: false,
                                  message: re.description
                                }
                                reject(resMessage);
                              }
                              else {
                                let resMessage = {
                                  status: false,
                                  message: re.description
                                }
                                reject(resMessage);
                              }
                            });

                        }

                      });
                    } else {



                      let resMessage = {
                        status: false,
                        message: res.description
                      }
                      reject(resMessage);
                    }

                  });
                });
              }
            }, 500);
          }
          else if (res.status === 2) {
            let resMessage = {
              status: false,
              message: res.description
            }
            reject(resMessage);
          }
          else {
            let resMessage = {
              status: false,
              message: res.description
            }
            reject(resMessage);
          }
        });
      } catch (error) {
        let resMessage = {
          status: false,
          message: error
        }
        reject(resMessage);
        console.log('Error', error);
      }
    });
  }


  splitContentByPageBreak(docDefinition) {
    const pages = [];
    let currentPage = [];

    docDefinition.content.forEach((item) => {
      if (item.pageBreak) {
        // Start a new page and reset the current page
        if (currentPage.length > 0) {
          pages.push(currentPage);
        }
        currentPage = [];
      } else {
        // Add the item to the current page
        currentPage.push(item);
      }
    });

    // Add the last page
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  generatePdfBuffer(docDefinition) {
    return new Promise((resolve, reject) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBuffer((pdfBuffer) => {
        resolve(pdfBuffer);
      });
    });
  };

  public generatePDFForSettlement(auth, userID, fromDate, toDate, fromTime, toTime) {
    return new Promise((resolve, reject) => {
      try {
        let userName = '';
        if (!userID) {
          this.toastr.info('userID not found');
          return;
        }
        if (!fromDate) {
          this.toastr.info('fromDate not found');
          return;
        }
        if (!toDate) {
          this.toastr.info('toDate not found');
          return;
        }
        if (!fromTime) {
          this.toastr.info('fromTime not found');
          return;
        }
        if (!toTime) {
          this.toastr.info('toTime not found');
          return;
        }
        if (userID) {
          if (userID == "ALL") {
            userName = "ALL"
          } else {
            this.WS.post('api/master/user/fetch/id', { id: userID }).subscribe((res: IResponse) => {
              if (res.status === 1) {
                userName = res.result.user[0].name;
              }
            })
          }
        }

        this.WS.post('api/admission/today/unsettled', {
          userID, fromDate, toDate, fromTime, toTime
        }, 'ADMISSION').subscribe((res: IResponse) => {
          if (res.status === 1) {
            this.totalAmount = {};
            const payments: IUnSettlementRecord[] = [];
            const toDateupd = this.formatDate(toDate);
            const fromDateupd = this.formatDate(fromDate)
            res.result.payments.map(p => {
              const showDate = p.createdOn
              // const tempDate = showDate.toISOString();
              const getDate = this.formatDateTime(showDate)

              const rec = {
                _id: p.orderID ? p.orderID._id : p.admissionID.orderID._id,
                isSelected: false,
                invoiceNo: p.orderID ? p.orderID.invoiceNo : p.admissionID.orderID.invoiceNo,
                method: p.stripeResponse.mode,
                // currency: p.stripeResponse.convertedCurrency ? p.stripeResponse.convertedCurrency : p.stripeResponse.currency,
                // amount: p.stripeResponse.convertedAmount ? p.stripeResponse.convertedAmount : p.stripeResponse.amount_subtotal,
                currency: p.stripeResponse.currency,
                amount: p.stripeResponse.amount_subtotal,
                referenceNo: p.stripeResponse.referenceNumber,
                createdOn: getDate
              };
              payments.push(rec)
              if (!this.totalOrdersID.includes(rec._id)) {
                this.totalOrdersID.push(rec._id)
              }
              if (!this.totalAmount[rec.currency]) {
                this.totalAmount[rec.currency] = 0;
              }
              this.totalAmount[rec.currency] += rec.amount;
            });
            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));
            // console.log('res.result export pdf', res.result)

            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',
              pageOrientation: 'landscape',
              header: (currentPage, pageCount) => {
                // var partnerName = '';
                // const matchbrand = this.PartnerType.find(app => app.keyCode === res.result.tokendata[0].partnerID.type);
                // if (matchbrand) {
                //   partnerName = matchbrand.key1;
                // }
                return {
                  margin: [30, 30, 30],
                  columns: [
                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [60, 5, 0, 0], italics: false, height: 14, bold: false, width: 300 },
                    { text: 'UNSETTLEDTRANSACTION REPORT  ', fontSize: 8, margin: [50, 5, 0, 0], height: 14, bold: true, width: 200 },
                    // { text: 'CONFIRMATION - ' + partnerName, fontSize: 8, margin: [0, 5, 0, 0], height: 14, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', fontSize: 10, margin: [130, 5, 0, 0], height: 15, bold: false, width: 400 }

                  ]
                };
              }
              ,
              footer: function (currentPage, pageCount) {




                return {

                  columns: [
                    { text: 'Copyright © 2023 PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    { text: 'Generated By: ' + auth.name + ' , ' + gettodaydate, alignment: 'right', bolf: true, fontSize: 8, margin: [30, 30, 28, 0], width: '50%' },

                  ]
                };
              },
              background: function (currentPage, pageSize) {
                return [
                  {
                    canvas: [

                      // { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
                      { type: 'line', x1: 810, y1: 28, x2: 28, y2: 28, lineWidth: 2 }, //Up line

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
                      {
                        type: 'rect',

                        x: 28,
                        y: 28,
                        // w: 260.33,
                        w: 279,
                        h: 26,
                      },
                      {
                        type: 'rect',

                        x: 307,
                        y: 28,
                        w: 280,
                        h: 26,
                      },
                      {
                        type: 'rect',

                        x: 587,
                        y: 28,
                        w: 222,
                        h: 26,
                      },
                      // { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      // { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      // { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                      { type: 'line', x1: 28, y1: 550, x2: 810, y2: 550, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 550, x2: 28, y2: 28, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 810, y1: 550, x2: 810, y2: 28, lineWidth: 2 }, //Rigth line
                    ],

                  }
                ];
              },
              // tslint:disable-next-line: max-line-length
              content: [

                // { text: 'Date:' + gettodaydate, bold: false, fontSize: 10 }, '\n', { text: 'To:', bold: false, fontSize: 10 }, '\n', { text: 'Fax No:', bold: false, fontSize: 10, alignment: 'left' }, '\n',
                // {text: 'Tel No: ' + res.result.tokendata[0].loungeID.phoneNo, bold: false, fontSize: 10}, '\n' ,{text: 'From: ' + res.result.tokendata[0].loungeID.brand, bold: false, fontSize: 10}, '\n', {text: 'Service Location: ' + res.result.tokendata[0].loungeID.name, bold: false, fontSize: 10},'\n',	{
                //   style: 'tableExample',
                //   table: {
                //     headerRows: 1,
                //     body: [
                //       [{text:'Date', style:'tableHeader', bold:true}, {text:'Flight No.', style:'tableHeader',bold: true}, {text:'No. of Pax', style:'tableHeader', bold: true}, {text:'Services', style:'tableHeader', bold: true}, {text:'Rate', style: 'tableHeader', bold: true}],
                //       [gettodaydate, 'NZ081', '3', 'Private Resting Area', '5940']
                //     ]
                //   }
                // }, '\n', {text: 'Remarks: ', bold: false, fontSize: 10}, '\n', {text: 'Terms and Conditions', bold: false, fontSize: 10},'\n', {text: 'Yours Sincerly', bold: false, fontSize: 10}
              ]
            };

            setTimeout(() => {
              var TokenDetailsTable = [
                // [
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                // ]
              ];
              var tokenDetails = [];
              tokenDetails.push(
                { text: 'CollectedBy:', bold: true, fontSize: 10 },
                { text: userName, bold: false, fontSize: 10 },
                { text: 'Outlet:', bold: true, fontSize: 10 },
                { text: auth.userOutlet.name, bold: false, fontSize: 10 },
              );
              var guest_Data = [
                [
                  { text: 'S.No.', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'RECEIPT NO', alignment: 'center', bold: true, fontSize: 10 },
                  { text: 'METHOD', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'AMOUNT', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'REMARKS', alignment: 'center', bold: true, fontSize: 10 },
                  { text: 'ORDER DATE', alignment: 'center', bold: true, fontSize: 10 },
                ]
              ];
              var paymentModewiseAmount = [
                [
                  { text: 'S.No.', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'Payment Mode', bold: true, fontSize: 10, alignment: 'center' },
                  { text: 'Currency', bold: true, fontSize: 10, alignment: 'center' },
                  { text: 'Amount', bold: true, alignment: 'center', fontSize: 10 },


                ]
              ];

              TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'From Date:', bold: true, fontSize: 10 },
                { text: fromDateupd + '  ' + fromTime, bold: false, fontSize: 10 },
                { text: 'To Date:', bold: true, fontSize: 10 },
                { text: toDateupd + '  ' + toTime, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails);
              // TokenDetailsTable.push(tokenDetails);


              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: [70, 200, 70, 150],
                    body: TokenDetailsTable
                  }
                });

              var DistinctPaymentMethod = [];

              /* get distinct payment mode */
              payments.filter(function (item) {
                var i = DistinctPaymentMethod.findIndex(x => (x.method === item.method));
                if (i <= -1) {
                  DistinctPaymentMethod.push(item);
                }
                return null;
              });
              /* Distinct currency */



              let counter = 1
              for (let l = 0; l < DistinctPaymentMethod.length; l++) {
                const elementModedistinct = DistinctPaymentMethod[l];
                var DistinctCurrency = [];
                payments.filter(function (item) {
                  var i = DistinctCurrency.findIndex(x => (x.currency === item.currency));
                  if (i <= -1) {
                    DistinctCurrency.push(item);
                  }
                  return null;
                });



                for (let p = 0; p < DistinctCurrency.length; p++) {
                  const elementCurrency = DistinctCurrency[p];
                  let totalAmounts = 0
                  for (let k = 0; k < payments.length; k++) {
                    const elementPayment = payments[k];

                    if (elementModedistinct.method === elementPayment.method) {
                      if (elementCurrency.currency === elementPayment.currency) {
                        totalAmounts = totalAmounts + elementPayment.amount
                      }
                    }
                  }
                  let iScurrencfind = payments.filter(a => a.currency === elementCurrency.currency && a.method === elementModedistinct.method)


                  if (iScurrencfind.length > 0) {


                    let paymenttableRow = []
                    paymenttableRow.push({ text: counter, bold: false, alignment: 'center', fontSize: 10 },
                      { text: elementModedistinct.method, bold: false, alignment: 'center', fontSize: 10 },
                      { text: elementCurrency.currency, bold: false, alignment: 'center', fontSize: 10 },
                      { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },)

                    paymentModewiseAmount.push(paymenttableRow)
                    counter++;
                  }
                }
              }
              let countersrno = 1
              for (let index1 = 0; index1 < payments.length; index1++) {

                var guest_Data_Details = [];
                guest_Data_Details.push(
                  { text: countersrno, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].invoiceNo, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].method, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].currency + ' ' + payments[index1].amount, alignment: 'center', bold: false, fontSize: 10, color: payments[index1].amount < 0 ? 'red' : 'none' },
                  { text: payments[index1].referenceNo, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].createdOn, bold: false, alignment: 'center', fontSize: 10 },
                );

                guest_Data.push(guest_Data_Details);
                countersrno++
              }
              docDefinition.content.push('\n',
                {
                  // layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: ['10%', '*', '*', '*'],
                    body: paymentModewiseAmount
                  }
                });




              //   var setUserData = [
              //     [
              //       { text: '', bold: true, fontSize: 11 },
              //       { text: '', bold: true, fontSize: 11 },
              //     ]
              //   ];
              //   var setUserDetails = []
              //   setUserDetails.push(

              //     { text: 'User:' , bold: true, fontSize: 11 },
              //     { text: userName, bold: false, fontSize: 11 },

              // );
              // setUserData.push(setUserDetails);
              // // var setDataDetails = [

              // //     { text: 'User:' , bold: true, fontSize: 11 },
              // //     { text: auth.name, bold: false, fontSize: 11 },
              // //     { text: 'Outlet:', bold: true, fontSize: 11 },
              // //     { text: auth.userOutlet.name, bold: false, fontSize: 11 },
              // //     { text: 'From Date:' , bold: true, fontSize: 11 },
              // //     { text: fromDate, bold: false, fontSize: 11 },
              // //     { text: 'To Date:', bold: true, fontSize: 11 },
              // //     { text: toDate, bold: false, fontSize: 11 },

              // // ]
              // docDefinition.content.push(
              //   {
              //     layout: 'noBorders',
              //     table: {
              //       headerRows: 0,
              //       widths: [70, 150],
              //       body: setUserData
              //     }
              //   });

              //     var setOutletData = [
              //       [
              //         { text: '', bold: true, fontSize: 11 },
              //         { text: '', bold: true, fontSize: 11 },
              //       ]
              //     ];
              //     var setOutletDetails = []
              //     setOutletDetails.push(

              //       { text: 'Outlet:', bold: true, fontSize: 11 },
              //       { text: auth.userOutlet.name, bold: false, fontSize: 11 },

              //   );
              //   setOutletData.push(setOutletDetails);
              //   docDefinition.content.push(
              //     {
              //       layout: 'noBorders',
              //       table: {
              //         headerRows: 0,
              //         widths: [70, 150],
              //         body: setOutletData
              //       }
              //     });

              //   var setFromData = [
              //     [
              //       { text: '', bold: true, fontSize: 11 },
              //       { text: '', bold: true, fontSize: 11 },
              //     ]
              //   ];
              //   var setFromDetails = []
              //   setFromDetails.push(

              //     { text: 'From Date:' , bold: true, fontSize: 11 },
              //     { text: fromDate + ' ' + fromTime, bold: false, fontSize: 11 },

              // );
              // setFromData.push(setFromDetails);
              // docDefinition.content.push(
              //   {
              //     layout: 'noBorders',
              //     table: {
              //       headerRows: 0,
              //       widths: [70, 150],
              //       body: setFromData
              //     }
              //   });

              //   var setToData = [
              //     [
              //       { text: '', bold: true, fontSize: 11 },
              //       { text: '', bold: true, fontSize: 11 },
              //     ]
              //   ];
              //   var setToDetails = []
              //   setToDetails.push(

              //     { text: 'To Date:', bold: true, fontSize: 11 },
              //     { text: toDate + ' ' + toTime, bold: false, fontSize: 11 },

              // );
              // setToData.push(setToDetails);
              // docDefinition.content.push(
              //   {
              //     layout: 'noBorders',
              //     table: {
              //       headerRows: 0,
              //       widths: [70, 150],
              //       body: setToData
              //     }
              //   });
              //   var setfromTime = [
              //     [
              //       { text: '', bold: true, fontSize: 11 },
              //       { text: '', bold: true, fontSize: 11 },
              //     ]
              //   ];
              //   var setfromTimeDetails = []
              //   setfromTimeDetails.push(

              //     { text: 'Start Time:', bold: true, fontSize: 11 },
              //     { text: fromTime, bold: false, fontSize: 11 },

              // );
              // setfromTime.push(setfromTimeDetails);
              // docDefinition.content.push(
              //   {
              //     layout: 'noBorders',
              //     table: {
              //       headerRows: 0,
              //       widths: [70, 150],
              //       body: setfromTime
              //     }
              //   });
              //   var setToTime = [
              //     [
              //       { text: '', bold: true, fontSize: 11 },
              //       { text: '', bold: true, fontSize: 11 },
              //     ]
              //   ];
              //   var setToTimeDetails = []
              //   setToTimeDetails.push(

              //     { text: 'End Time:', bold: true, fontSize: 11 },
              //     { text: toTime, bold: false, fontSize: 11 },

              // );
              // setToTime.push(setToTimeDetails);
              // docDefinition.content.push(
              //   {
              //     layout: 'noBorders',
              //     table: {
              //       headerRows: 0,
              //       widths: [70, 150],
              //       body: setToTime
              //     }
              //   });

              var space_Data = [
                [
                  { text: '', alignment: 'center', bold: true, fontSize: 10 },

                ]
              ];

              var space_Data_Details = [];
              space_Data_Details.push(
                // tslint:disable-next-line: max-line-length
                { text: '', bold: true, alignment: 'center', fontSize: 10 },
              );
              space_Data.push(space_Data_Details);

              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: ['*'],
                    body: space_Data
                  }
                });





              // docDefinition.content.push(setData);
              docDefinition.content.push(
                {
                  table: {
                    headerRows: 1,
                    widths: [50, 130, 80, 130, 160, 150],
                    body: guest_Data
                  }
                });
              var pdffilename = '';
              var datcounts = payments.length;
              if (payments.length > 0) {
                pdffilename = 'UnSettledTransaction Report' + ' ' + (new Date()).toLocaleDateString()
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              const pdfDocGenerator = pdfMake.createPdf(docDefinition);
              pdfDocGenerator.getBlob((blob) => {
                var FileName = 'SettlementReport.pdf';
                const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                this.WS.post('api/master/s3/presignedURL', {
                  type: 'Partner Contract',
                  extension: 'pdf',
                  contentType: pdfFile.type,
                  fileName: FileName
                }).subscribe((res: any) => {
                  //  console.log(res);
                  this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                    switch (event.type) {
                      case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                      case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                      case HttpEventType.UploadProgress:
                        break;
                      case HttpEventType.Response:

                        this.WS.post('api/master/fileImportExport/save/import', {
                          path: res.result.urlInfo.key,
                          type: 'Partner Contract',
                          fileName: pdfFile.name,
                          Datacount: datcounts,
                          activity: 'Export',
                          extension: 'pdf'
                        }).subscribe((re: IResponse) => {
                          if (re.status === 1) {
                            re.result;
                            resolve(true);
                          }
                          else if (re.status === 2) {
                            reject(false);
                          }
                          else {
                            reject(false);
                          }
                        });
                    }

                  });
                });
              });

            }, 500);
          }
          else if (res.status === 2) {
            resolve(false);
          }
          else {
            resolve(false);
          }
        });
      } catch (error) {
        console.log('Error', error);
        reject(false);


      }
    });
  }


  public generatePDFForShowSettlement(LoungeId, auth, collectedby, settleuser, shift, fromDate, toDate, SfromDate, StoDate, fromTime, toTime, cfrom, cto, sfrom, sto) {
    // console.log(LoungeId,auth, collectedby,settleuser,shift, fromDate, toDate,SfromDate,StoDate, fromTime, toTime)
    return new Promise((resolve, reject) => {
      try {
        let userName = '';
        let name = ''
        if (!collectedby) {
          this.toastr.info('userID not found');
          return;
        }
        if (!settleuser) {
          this.toastr.info('settledby user ID not found');
          return;
        }
        if (!fromDate) {
          this.toastr.info('fromDate not found');
          return;
        }
        if (!toDate) {
          this.toastr.info('toDate not found');
          return;
        }
        if (!SfromDate) {
          this.toastr.info('Settled fromDate not found');
          return;
        }
        if (!StoDate) {
          this.toastr.info('Settleded ToDate not found');
          return;
        }
        if (!fromTime) {
          this.toastr.info('fromTime not found');
          return;
        }
        if (!toTime) {
          this.toastr.info('toTime not found');
          return;
        }
        if (collectedby) {
          if (collectedby == "ALL") {
            name = "ALL"
          } else {
            this.WS.post('api/master/user/fetch/id', { id: collectedby }).subscribe((res: IResponse) => {
              if (res.status === 1) {
                name = res.result.user[0].name;
              }
            })
          }
        }
        if (settleuser) {
          if (settleuser == "ALL") {
            userName = "ALL"
          } else {
            this.WS.post('api/master/user/fetch/id', { id: settleuser }).subscribe((res: IResponse) => {
              if (res.status === 1) {
                userName = res.result.user[0].name;
              }
            })
          }
        }
        this.WS.post('api/master/today/settled', {
          LoungeId, collectedby, settleuser, shift, fromDate, toDate, SfromDate, StoDate, fromTime, toTime
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            this.totalAmount = {};
            const payments: ISettlementRecord[] = [];
            const toDateupd = this.formatDate(cto);
            const fromDateupd = this.formatDate(cfrom)
            const SettlefromDateupd = this.formatDate(sfrom)
            const SettleToDateupd = this.formatDate(sto);
            res.result.resultArray.map(p => {
              const showDate = p.createdOn
              const getDate = this.formatDateTime(showDate)
              const setteledGetData = p.settledOn
              const showGetDate = this.formatDateTime(setteledGetData)
              const order = p.orderDate
              const orderDate = this.formatDateTime(order)

              const rec = {
                _id: p._id,
                invoiceNo: p.invoiceNo,
                method: p.method,
                settlementID: p.settlementID,
                currency: p.currency,
                amount: p.amount,
                settledname: p.settledname,
                admissionDoneBy: p.admissionDoneBy,
                settledOn: showGetDate,
                createdOn: getDate
              };
              payments.push(rec)
            });
            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));

            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',
              pageOrientation: 'landscape',
              header: (currentPage, pageCount) => {
                // var partnerName = '';
                // const matchbrand = this.PartnerType.find(app => app.keyCode === res.result.tokendata[0].partnerID.type);
                // if (matchbrand) {
                //   partnerName = matchbrand.key1;
                // }
                return {
                  margin: [30, 30, 30],
                  columns: [
                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [60, 5, 0, 0], italics: false, height: 14, bold: false, width: 300 },
                    { text: 'SETTLEMENT REPORT  ', fontSize: 8, margin: [70, 5, 0, 0], height: 14, bold: true, width: 200 },
                    // { text: 'CONFIRMATION - ' + partnerName, fontSize: 8, margin: [0, 5, 0, 0], height: 14, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', fontSize: 10, margin: [130, 5, 0, 0], height: 15, bold: false, width: 400 }

                  ]
                };
              }
              ,
              footer: function (currentPage, pageCount) {




                return {

                  columns: [
                    { text: 'Copyright © 2023 PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    { text: 'Generated By: ' + auth.name + ' , ' + gettodaydate, alignment: 'right', bolf: true, fontSize: 8, margin: [30, 30, 28, 0], width: '50%' },

                  ]
                };
              },
              background: function (currentPage, pageSize) {
                return [
                  {
                    canvas: [

                      // { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
                      { type: 'line', x1: 810, y1: 28, x2: 28, y2: 28, lineWidth: 2 }, //Up line
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
                      {
                        type: 'rect',

                        x: 28,
                        y: 28,
                        // w: 260.33,
                        w: 279,
                        h: 26,
                      },
                      {
                        type: 'rect',

                        x: 307,
                        y: 28,
                        w: 280,
                        h: 26,
                      },
                      {
                        type: 'rect',

                        x: 587,
                        y: 28,
                        w: 222,
                        h: 26,
                      },
                      // { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      // { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      // { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                      { type: 'line', x1: 28, y1: 550, x2: 810, y2: 550, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 550, x2: 28, y2: 28, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 810, y1: 550, x2: 810, y2: 28, lineWidth: 2 }, //Rigth line
                    ],

                  }
                ];
              },
              // tslint:disable-next-line: max-line-length
              content: [

                // { text: 'Date:' + gettodaydate, bold: false, fontSize: 10 }, '\n', { text: 'To:', bold: false, fontSize: 10 }, '\n', { text: 'Fax No:', bold: false, fontSize: 10, alignment: 'left' }, '\n',
                // {text: 'Tel No: ' + res.result.tokendata[0].loungeID.phoneNo, bold: false, fontSize: 10}, '\n' ,{text: 'From: ' + res.result.tokendata[0].loungeID.brand, bold: false, fontSize: 10}, '\n', {text: 'Service Location: ' + res.result.tokendata[0].loungeID.name, bold: false, fontSize: 10},'\n',	{
                //   style: 'tableExample',
                //   table: {
                //     headerRows: 1,
                //     body: [
                //       [{text:'Date', style:'tableHeader', bold:true}, {text:'Flight No.', style:'tableHeader',bold: true}, {text:'No. of Pax', style:'tableHeader', bold: true}, {text:'Services', style:'tableHeader', bold: true}, {text:'Rate', style: 'tableHeader', bold: true}],
                //       [gettodaydate, 'NZ081', '3', 'Private Resting Area', '5940']
                //     ]
                //   }
                // }, '\n', {text: 'Remarks: ', bold: false, fontSize: 10}, '\n', {text: 'Terms and Conditions', bold: false, fontSize: 10},'\n', {text: 'Yours Sincerly', bold: false, fontSize: 10}
              ]
            };

            setTimeout(() => {
              var TokenDetailsTable = [
                // [
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                //   { text: '', bold: true, fontSize: 11 },
                // ]
              ];




              var tokenDetails = [];
              tokenDetails.push(
                { text: 'SettledBy:', bold: true, fontSize: 10 },
                { text: userName, bold: false, fontSize: 10 },
                { text: 'Outlet:', bold: true, fontSize: 10 },
                { text: auth.userOutlet.name, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails)
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Collection From Date:', bold: true, fontSize: 10 },
                { text: fromDateupd, bold: false, fontSize: 10 },
                { text: 'Collection To Date:', bold: true, fontSize: 10 },
                { text: toDateupd, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails);
              // TokenDetailsTable.push(tokenDetails);
              // TokenDetailsTable.push(tokenDetails);
              tokenDetails = [];
              tokenDetails.push(
                { text: 'CollectedBy:', bold: true, fontSize: 10 },
                { text: name, bold: false, fontSize: 10 },
                { text: 'Shifts:', bold: true, fontSize: 10 },
                { text: shift, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails)
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Settle From Date:', bold: true, fontSize: 10 },
                { text: SettlefromDateupd, bold: false, fontSize: 10 },
                { text: 'Settle To Date:', bold: true, fontSize: 10 },
                { text: SettleToDateupd, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails)
              tokenDetails = [];
              tokenDetails.push(
                { text: 'Start Time:', bold: true, fontSize: 10 },
                { text: fromTime, bold: false, fontSize: 10 },
                { text: 'End Time:', bold: true, fontSize: 10 },
                { text: toTime, bold: false, fontSize: 10 },
              );
              TokenDetailsTable.push(tokenDetails)

              var guest_Data = [
                [
                  { text: 'S.No', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'RECEIPT NUMBER', alignment: 'center', bold: true, fontSize: 10 },
                  { text: 'METHOD', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'AMOUNT', bold: true, alignment: 'center', fontSize: 10 },
                  // { text: 'SETTLEMENT ID', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'SETTLED ON', alignment: 'center', bold: true, fontSize: 10 },
                  { text: 'SETTLED BY', bold: true, alignment: 'center', fontSize: 10 },
                  { text: 'COLLECTION DONE BY', alignment: 'center', bold: true, fontSize: 10 },
                  { text: 'COLLECTION DONE ON', alignment: 'center', bold: true, fontSize: 10 },

                ]
              ];


              var paymentModewiseAmount = [
                [
                  { text: 'Type', bold: false, alignment: 'left', fontSize: 10, margin: [40, 0, 0, 0] },
                  { text: 'Sub Type', bold: false, fontSize: 10, alignment: 'left', },
                  { text: 'Currency', bold: false, fontSize: 10, alignment: 'right' },
                  { text: 'Amount', bold: false, alignment: 'right', fontSize: 10 },
                  { text: 'Rate', bold: false, alignment: 'right', fontSize: 10 },
                  { text: 'Base Amount', bold: false, alignment: 'right', fontSize: 10 },


                ]
              ];
              let headerRowSpace = [];
              headerRowSpace.push({}, {}, {}, {}, {}, {});
              paymentModewiseAmount.push(headerRowSpace);
              // let headerRowName={ text: 'Payments', bold: true, alignment: 'center', fontSize: 13 }

              const smallAmounts = {};
              const foreignCash = {}

              let grandTotal = 0;
              for (let key in res.result.data) {
                // let headerRow=[];
                // headerRow.push({ text: key, bold: true, alignment: 'center', fontSize: 10 },
                // {},{},{},{},{}
                // );

                // paymentModewiseAmount.push(headerRow);
                let transactionTypeTotal = 0;
                const currencyTotals = {};

                for (let i = 0; i < res.result.data[key].length; i++) {
                  const currency = res.result.data[key][i].currency;
                  const amount = res.result.data[key][i].amount;
                  const convertedAmount = res.result.data[key][i].convertedAmount;
                  const exchangeRate = res.result.data[key][i].exchangeRate;
                  if (amount < 0) {
                    if (currency in smallAmounts) {
                      smallAmounts[currency].amount += amount;
                      smallAmounts[currency].convertedAmount += convertedAmount;
                      smallAmounts[currency].exchangeRate = exchangeRate

                    } else {
                      smallAmounts[currency] = {
                        amount,
                        convertedAmount,
                        exchangeRate
                      };
                    }
                    continue;

                  }


                  if (res.result.data[key][i].currency != res.result.loungeCurrency.baseCurrency) {
                    if (amount > 0) {
                      if (currency in foreignCash) {
                        foreignCash[currency].amount += amount;
                        foreignCash[currency].convertedAmount += convertedAmount;
                        foreignCash[currency].exchangeRate = exchangeRate
                      } else {
                        foreignCash[currency] = {
                          amount,
                          convertedAmount,
                          exchangeRate
                        };
                      }
                    }
                  } else {
                    if (amount > 0) {
                      if (currency in currencyTotals) {
                        currencyTotals[currency].amount += amount;
                        currencyTotals[currency].convertedAmount += convertedAmount;
                        currencyTotals[currency].exchangeRate = exchangeRate
                      } else {
                        currencyTotals[currency] = {
                          amount,
                          convertedAmount,
                          exchangeRate
                        };
                      }
                    }
                  }
                }

                let headerRow = [];
                headerRow.push({ text: key, bold: true, alignment: 'left', fontSize: 11, margin: [42, 0, 0, 0] },
                  {}, {}, {}, {}, {}
                );

                if (Object.keys(currencyTotals).length > 0) {
                  paymentModewiseAmount.push(headerRow);
                  let headerRowSpace = [];
                  headerRowSpace.push({}, {}, {}, {}, {}, {});
                  paymentModewiseAmount.push(headerRowSpace);
                }


                if (Object.keys(currencyTotals).length > 0) {
                  for (const currency in currencyTotals) {

                    const total = currencyTotals[currency];
                    //   let headerRow=[];
                    // headerRow.push({ text: total, bold: true, alignment: 'center', fontSize: 10 },
                    // {},{},{},{},{}
                    // );

                    // paymentModewiseAmount.push(headerRow);
                    let paymenttableRow = []
                    paymenttableRow.push(
                      { text: key, bold: true, alignment: 'left', fontSize: 11, margin: [42, 0, 0, 0] },
                      { text: key == 'Cash' ? '' : key, bold: true, alignment: 'left', fontSize: 11 },
                      { text: currency, bold: false, alignment: 'right', fontSize: 10, },
                      { text: total.amount.toFixed(2), bold: false, alignment: 'right', fontSize: 10, },
                      { text: total.exchangeRate.toFixed(2), bold: false, alignment: 'right', fontSize: 10, },
                      { text: total.convertedAmount.toFixed(2), bold: false, alignment: 'right', fontSize: 10 }
                    );
                    paymentModewiseAmount.push(paymenttableRow);
                    transactionTypeTotal += total.convertedAmount

                  }
                  let line = []

                  line.push({
                    canvas: [{ type: 'line', x1: 40, y1: 0, x2: 685, y2: 0, lineWidth: 1, lineColor: 'black' }],
                    colSpan: 6
                  });
                  paymentModewiseAmount.push(line);
                  let eachRowTotalType = [];
                  eachRowTotalType.push({},
                    {}, {}, {}, { text: 'Total:', bold: true, alignment: 'right', fontSize: 10 }, { text: transactionTypeTotal.toFixed(2), bold: true, alignment: 'right', fontSize: 10 }
                  );
                  paymentModewiseAmount.push(eachRowTotalType);

                  grandTotal += transactionTypeTotal;
                }

                // for(let i=0; i<smallAmounts.length;i++){
                //   console.log(smallAmounts[i])
                //   let paymenttableRow=[]
                //   paymenttableRow.push(
                //     { text: "rk", bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' },
                //     { text: "rk", bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' },
                //     { text: smallAmounts[i].currency, bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' },
                //     { text: smallAmounts[i].amount, bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' },
                //     { text: smallAmounts[i].exchangeRate, bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' },
                //     { text: smallAmounts[i].convertedAmount, bold: false, alignment: 'center', fontSize: 10, fillColor: 'tan' }
                //   );
                //   paymentModewiseAmount.push(paymenttableRow);
                // }
              }
              if (Object.keys(foreignCash).length > 0) {
                let headerRowChangeForeign = [];
                headerRowChangeForeign.push({ text: 'Foreign Cash', bold: true, alignment: 'left', fontSize: 11, margin: [40, 0, 0, 0] },
                  {}, {}, {}, {}, {}
                );
                paymentModewiseAmount.push(headerRowChangeForeign);
                let headerRowChangeSpace = [];
                headerRowChangeSpace.push({}, {}, {}, {}, {}, {}
                );
                paymentModewiseAmount.push(headerRowChangeSpace);
                let transactionTypeChangeForeignTotal = 0
                for (const currency in foreignCash) {
                  const total = foreignCash[currency];


                  let paymenttableRow = []
                  paymenttableRow.push(
                    { text: 'Foreign Currency', bold: true, alignment: 'left', fontSize: 10, margin: [40, 0, 0, 0] },
                    { text: "", bold: false, alignment: 'right', fontSize: 10, },
                    { text: currency, bold: false, alignment: 'right', fontSize: 10, },
                    { text: total.amount.toFixed(2), bold: false, alignment: 'right', fontSize: 10, },
                    { text: total.exchangeRate.toFixed(2), bold: false, alignment: 'right', fontSize: 10, },
                    { text: total.convertedAmount.toFixed(2), bold: false, alignment: 'right', fontSize: 10 }
                  );
                  paymentModewiseAmount.push(paymenttableRow);
                  transactionTypeChangeForeignTotal += total.convertedAmount


                }
                grandTotal += transactionTypeChangeForeignTotal

                let line2 = []

                line2.push({
                  canvas: [{ type: 'line', x1: 40, y1: 0, x2: 685, y2: 0, lineWidth: 1, lineColor: 'black' }],
                  colSpan: 6
                });
                paymentModewiseAmount.push(line2);
                let eachRowTotalTypeForeign = [];
                eachRowTotalTypeForeign.push({},
                  {}, {}, {}, { text: 'Total:', bold: true, alignment: 'right', fontSize: 10 }, { text: transactionTypeChangeForeignTotal.toFixed(2), bold: true, alignment: 'right', fontSize: 10 }
                );
                paymentModewiseAmount.push(eachRowTotalTypeForeign);
              }
              //  let line3=[]

              //     line3.push({
              //       canvas: [{ type: 'line', x1: 40, y1: 0, x2: 635, y2: 0, lineWidth: 1, lineColor: 'black' }],
              //       colSpan: 6
              //     });
              //     paymentModewiseAmount.push(line3);
              let paymentModewiseAmountForChange = [
                [
                  { text: 'Type', bold: false, alignment: 'left', fontSize: 10, margin: [40, 0, 0, 0] },
                  { text: ' ', bold: true, alignment: 'right', fontSize: 10 },
                  { text: 'Currency', bold: true, fontSize: 10, alignment: 'right' },
                  { text: 'Given Change', bold: true, alignment: 'right', fontSize: 10 },
                  { text: 'Difference', bold: true, alignment: 'right', fontSize: 10 },
                  { text: 'Actual Change', bold: true, alignment: 'right', fontSize: 10 },
                ]
              ];
              let headerRowChange = [];
              headerRowChange.push({}, {}, {}, {}, {}, {}
              );
              paymentModewiseAmountForChange.push(headerRowChange);
              if (Object.keys(smallAmounts).length > 0) {

                let headerRowChange = [];
                headerRowChange.push({ text: 'Change', bold: true, alignment: 'left', fontSize: 11, margin: [42, 0, 0, 0] },
                  {}, {}, {}, {}, {}
                );
                paymentModewiseAmount.push(headerRowChange);

                let transactionTypeChangeTotal = 0
                for (const currency in smallAmounts) {
                  const total = smallAmounts[currency];

                  let paymenttableRows = []
                  paymenttableRows.push(
                    { text: "Cash Change", bold: true, alignment: 'left', fontSize: 10, margin: [40, 0, 0, 0] },
                    { text: " ", bold: false, alignment: 'right', fontSize: 10 },
                    { text: currency, bold: false, alignment: 'right', fontSize: 10, },
                    { text: total.amount.toFixed(2), bold: false, alignment: 'right', fontSize: 10, color: total.amount.toFixed(2) < 0 ? 'red' : 'none' },
                    { text: (total.amount - total.convertedAmount).toFixed(2), bold: false, alignment: 'right', fontSize: 10, },
                    { text: total.convertedAmount.toFixed(2), bold: false, alignment: 'right', fontSize: 10 }
                  );
                  paymentModewiseAmountForChange.push(paymenttableRows)

                  transactionTypeChangeTotal += total.convertedAmount
                  // paymentModewiseAmount=[
                  //   paymentModewiseAmountForChange,
                  //   ...paymenttableRow
                  // ];

                }
                let line4 = []

                line4.push({
                  canvas: [{ type: 'line', x1: 38, y1: 0, x2: 686, y2: 0, lineWidth: 1, lineColor: 'black' }],
                  colSpan: 6
                });
                paymentModewiseAmountForChange.push(line4);
                let eachRowTotalType = [];
                eachRowTotalType.push({},
                  {}, {}, {}, { text: 'Total:', bold: true, alignment: 'right', fontSize: 10 }, { text: transactionTypeChangeTotal.toFixed(2), bold: true, alignment: 'right', fontSize: 10 }
                );
                paymentModewiseAmountForChange.push(eachRowTotalType);
                grandTotal += transactionTypeChangeTotal
              }

              let line5 = []

              line5.push({
                canvas: [{ type: 'line', x1: 38, y1: 0, x2: 686, y2: 0, lineWidth: 1, lineColor: 'black' }],
                colSpan: 6
              });
              paymentModewiseAmountForChange.push(line5);
              let grandTotalRow = [];
              grandTotalRow.push({},
                {}, {}, {}, { text: 'Grand Total:', bold: true, alignment: 'right', fontSize: 10 }, { text: grandTotal.toFixed(2), bold: true, alignment: 'right', fontSize: 10 }
              );

              paymentModewiseAmountForChange.push(grandTotalRow);
              //  paymentModewiseAmount.push(paymenttableRows)
              //  console.log("paymenttableRow", paymenttableRow)
              //  console.log("paymentModewiseAmount", paymentModewiseAmount)


              let countersrno = 1
              for (let index1 = 0; index1 < payments.length; index1++) {

                var guest_Data_Details = [];
                guest_Data_Details.push(
                  { text: countersrno, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].invoiceNo, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].method, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].currency + ' ' + payments[index1].amount, bold: false, alignment: 'center', fontSize: 10, color: payments[index1].amount < 0 ? 'red' : 'none' },
                  // { text: payments[index1].settlementID, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].settledOn, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].settledname, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].admissionDoneBy, bold: false, alignment: 'center', fontSize: 10 },
                  { text: payments[index1].createdOn, bold: false, alignment: 'center', fontSize: 10 },
                );

                guest_Data.push(guest_Data_Details);
                countersrno++
              }

              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: [140, 200, 140, 150],
                    body: TokenDetailsTable
                  },
                  margin: [55, 0, 0, 0]
                });


              /* get distinct payment mode */
              //   let DistinctPaymentMethod=[]
              //  payments.filter(function (item) {
              //   var i = DistinctPaymentMethod.findIndex(x => (x.method === item.method));
              //   if (i <= 1) {
              //     DistinctPaymentMethod.push(item);
              //   }
              //   console.log("DistinctPaymentMethod", DistinctPaymentMethod)
              //   return null;
              // });
              //   /* Distinct currency */
              //   let counter = 1
              //   for (let l = 0; l < DistinctPaymentMethod.length; l++) {
              //     const elementModedistinct = DistinctPaymentMethod[l];
              //     var DistinctCurrency = [];
              //     DistinctPaymentMethod.filter(function (item) {
              //       var i = DistinctCurrency.findIndex(x => (x.method === item.method));
              //       if (i <= -1) {
              //         DistinctCurrency.push(item);
              //       }
              //       return null;
              //     });



              //     for (let p = 0; p < DistinctCurrency.length; p++) {
              //       const elementCurrency = DistinctCurrency[p];
              //       let totalAmounts = 0
              //       for (let k = 0; k < payments.length; k++) {
              //         const elementPayment = payments[k];

              //         if (elementModedistinct.method === elementPayment.method) {
              //           if (elementCurrency.currency === elementPayment.currency) {
              //             totalAmounts = totalAmounts + elementPayment.amount
              //           }
              //         }
              //       }




              //         let paymenttableRow = []
              //         paymenttableRow.push({ text: counter, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: elementModedistinct.method, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: elementCurrency.currency, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },

              //           )

              //         paymentModewiseAmount.push(paymenttableRow)
              //         counter++;
              //     }
              //   }
              //  let paymenttableRow = []
              //         paymenttableRow.push({ text: counter, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: elementModedistinct.method, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: elementCurrency.currency, bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },
              //           { text: totalAmounts.toFixed(2), bold: false, alignment: 'center', fontSize: 10 },

              //           )

              //         paymentModewiseAmount.push(paymenttableRow)
              //         counter++;
              //     }
              //   }



              var space_Data = [
                [
                  { text: '', alignment: 'center', bold: true, fontSize: 10 },

                ]
              ];

              var space_Data_Details = [];
              space_Data_Details.push(
                // tslint:disable-next-line: max-line-length
                { text: '', bold: true, alignment: 'center', fontSize: 10 },
              );
              space_Data.push(space_Data_Details);

              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: ['*'],
                    body: space_Data
                  }
                });
              // docDefinition.content.push('\n',
              // {
              //   layout: 'noBorders',
              //   table: {
              //     headerRows: 0,
              //     widths: ['*'],
              //     body: headerRowName
              //   }
              // });

              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: [150, 150, 44, 95, 105, 100],
                    body: paymentModewiseAmount
                  }
                });
              if (Object.keys(smallAmounts).length > 0) {
                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [110, 100, 135, 100, 100, 100],
                      body: paymentModewiseAmountForChange
                    }
                  });
              }

              docDefinition.content.push('\n',
                {
                  layout: 'noBorders',
                  table: {
                    headerRows: 0,
                    widths: ['*'],
                    body: space_Data
                  }
                });

              // docDefinition.content.push(setData);
              docDefinition.content.push(
                {
                  table: {
                    headerRows: 1,
                    widths: [30, 100, 50, 60, 130, 70, 110, 130],
                    // widths:['auto','auto','auto','auto','auto','auto','auto','auto','auto','auto','auto'],
                    body: guest_Data
                  }
                });
              var pdffilename = '';
              var datcounts = payments.length;
              if (payments.length > 0) {
                pdffilename = 'SettlementReport' + ' ' + (new Date()).toLocaleDateString();
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              const pdfDocGenerator = pdfMake.createPdf(docDefinition);
              pdfDocGenerator.getBlob((blob) => {
                var FileName = 'SettledReport.pdf';
                const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                this.WS.post('api/master/s3/presignedURL', {
                  type: 'Partner Contract',
                  extension: 'pdf',
                  contentType: pdfFile.type,
                  fileName: FileName
                }).subscribe((res: any) => {
                  //  console.log(res);
                  this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                    switch (event.type) {
                      case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                      case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                      case HttpEventType.UploadProgress:
                        break;
                      case HttpEventType.Response:

                        this.WS.post('api/master/fileImportExport/save/import', {
                          path: res.result.urlInfo.key,
                          type: 'Partner Contract',
                          fileName: pdfFile.name,
                          Datacount: datcounts,
                          activity: 'Export',
                          extension: 'pdf'
                        }).subscribe((re: IResponse) => {
                          if (re.status === 1) {
                            re.result;
                            resolve(true);
                          }
                          else if (re.status === 2) {
                            reject(false);
                          }
                          else {
                            reject(false);
                          }
                        });
                    }

                  });
                });
              });

            }, 500);
          }
          else if (res.status === 2) {
            resolve(false);
          }
          else {
            resolve(false);
          }
        });
      } catch (error) {
        reject(false);
        console.log('Error', error);
      }
    });
  }

  public generatePDFForDelayedFlight(tokenId, callscreen) {
    this.fetchLoungeBrand('LOUNGE_BRAND');
    this.fetchPartnerType('PARTNER_TYPE');
    return new Promise((resolve, reject) => {
      try {
        if (!tokenId) {
          this.toastr.info('Token id not found');
          return;
        }
        this.WS.post('api/master/admissionToken/getDataforDelayedFlight', { TokenyId: tokenId, screen: callscreen }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));


            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',

              header: (currentPage, pageCount) => {
                var partnerName = '';
                const matchbrand = this.PartnerType.find(app => app.keyCode === res.result.tokendata[0].partnerID.type);
                if (matchbrand) {
                  partnerName = matchbrand.key1;
                }
                return {
                  margin: [30, 30, 30, 30],
                  columns: [
                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
                    { text: 'CONFIRMATION - ' + partnerName, fontSize: 8, margin: [0, 5, 0, 0], height: 14, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 200 }

                  ]
                };
              }
              ,
              footer: function (currentPage, pageCount) {




                return {

                  columns: [
                    // { text: 'Copyright © 2022 PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    // { text: 'Form No.: PLAZA-HK1-LF32 ' + ', ' + gettodaydate, alignment: 'left', bolf: true, fontSize: 8, margin: [40, 30, 0, 0], width: '50%' },

                  ]
                };
              },
              background: function (currentPage, pageSize) {
                return [
                  {
                    canvas: [

                      { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
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

                      { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                    ],

                  }
                ];
              },
              // tslint:disable-next-line: max-line-length
              content: [
                // { text: 'Date:' + gettodaydate, bold: false, fontSize: 10 }, '\n', { text: 'To:', bold: false, fontSize: 10 }, '\n', { text: 'Fax No:', bold: false, fontSize: 10, alignment: 'left' }, '\n',
                // {text: 'Tel No: ' + res.result.tokendata[0].loungeID.phoneNo, bold: false, fontSize: 10}, '\n' ,{text: 'From: ' + res.result.tokendata[0].loungeID.brand, bold: false, fontSize: 10}, '\n', {text: 'Service Location: ' + res.result.tokendata[0].loungeID.name, bold: false, fontSize: 10},'\n',	{
                //   style: 'tableExample',
                //   table: {
                //     headerRows: 1,
                //     body: [
                //       [{text:'Date', style:'tableHeader', bold:true}, {text:'Flight No.', style:'tableHeader',bold: true}, {text:'No. of Pax', style:'tableHeader', bold: true}, {text:'Services', style:'tableHeader', bold: true}, {text:'Rate', style: 'tableHeader', bold: true}],
                //       [gettodaydate, 'NZ081', '3', 'Private Resting Area', '5940']
                //     ]
                //   }
                // }, '\n', {text: 'Remarks: ', bold: false, fontSize: 10}, '\n', {text: 'Terms and Conditions', bold: false, fontSize: 10},'\n', {text: 'Yours Sincerly', bold: false, fontSize: 10}
              ]
            };

            setTimeout(() => {
              for (let index = 0; index < res.result.tokendata.length; index++) {

                var TokenDetailsTable = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];


                var brandName = '';
                const matchbrand = this.LoungeBrand.find(app => app.keyCode === res.result.tokendata[index].loungeID.brand);
                if (matchbrand) {
                  brandName = matchbrand.key1;
                }

                var tokenDetails = [];
                tokenDetails.push(
                  { text: 'Date:', bold: true, fontSize: 10 },
                  { text: gettodaydate, bold: false, fontSize: 10 },
                  { text: 'To:', bold: true, fontSize: 10 },
                  { text: '', bold: false, fontSize: 10 }
                );
                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];
                tokenDetails.push(
                  { text: 'Email:', bold: true, fontSize: 10 },
                  { text: res.result.tokendata[index].loungeID.email, bold: false, fontSize: 10 },
                  { text: 'Tel No.:', bold: true, fontSize: 10 },
                  { text: '', bold: false, fontSize: 10 }
                );

                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];
                tokenDetails.push(
                  { text: 'From:', bold: true, fontSize: 10 },
                  { text: brandName, bold: false, fontSize: 10 },
                  { text: 'Tel No.:', bold: true, fontSize: 10 },
                  { text: res.result.tokendata[index].loungeID.phoneNo, bold: false, fontSize: 10 }
                );

                TokenDetailsTable.push(tokenDetails);
                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [70, 200, 70, 150],
                      body: TokenDetailsTable
                    }
                  });

                var serviceLocation = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var serviceLocationDetails = [];
                serviceLocationDetails.push(
                  { text: 'Service Location:', bold: true, fontSize: 10 },
                  // tslint:disable-next-line: max-line-length
                  { text: res.result.tokendata[index].loungeID.name + ' ' + res.result.tokendata[index].loungeID.addressLine1, bold: false, fontSize: 10 },
                );
                serviceLocation.push(serviceLocationDetails);

                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [70, 400],
                      body: serviceLocation
                    }
                  });

                var ordersData = [
                  [
                    { text: 'Date', bold: true, fontSize: 11 },
                    { text: 'Flight No.', bold: true, fontSize: 11 },
                    { text: 'No. Of Pax', bold: true, fontSize: 11 },
                    { text: 'Services', bold: true, fontSize: 11 },
                    { text: 'Rate', bold: true, fontSize: 11 },
                    // { text: `Rate (${res.result.tokendata[index].currency})`, bold: true, fontSize: 11 }
                  ]
                ];

                // for(let index2 = 0; index2 < res.result.boarding_Pass_Data.length; index2++){

                var order_row = [];
                order_row.push(
                  { text: gettodaydate, bold: false, fontSize: 11 },
                  { text: res.result.boarding_Pass_Data[index].fields.flightNumber, bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].admissionID.guests, bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].products[0].name, bold: false, fontSize: 11 },
                  // { text: '', bold: false, fontSize: 11 },
                  { text: (res.result.tokendata[index].admissionID.admissionTokenID.delayedFlightContractId ? res.result.tokendata[index].admissionID.admissionTokenID.delayedFlightContractId.currency : '') + " " + (res.result.tokendata[index].admissionID.admissionTokenID.delayedFlightContractId ? res.result.tokendata[index].admissionID.admissionTokenID.delayedFlightContractId.agreedContractAmount : ' '), bold: false, fontSize: 11 }
                );

                ordersData.push(order_row);
                // }

                docDefinition.content.push(
                  /* Outlet Entilement table */
                  '\n\n',
                  {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*', '*'],
                      body: ordersData
                    }
                  });



                let remarks_Data = [
                  [
                    { text: 'Remarks:', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];
                let remarks_Data_Details = [];
                const date_Data = res.result.tokendata[index].admissionID.createdOn;
                const admission_Date = this.formatDateTime(date_Data);
                const end_Admission_Date = res.result.tokendata[index].admissionID.endAdmissionDate;
                const admission_End_Date = this.formatDateTime(end_Admission_Date);

                remarks_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: ' We Accomodated ' + res.result.tokendata[index].admissionID.guests + ' for ' + res.result.tokendata[index].products[0].name + ' at ' + brandName + ' from ' + admission_Date + ' till ' + admission_End_Date + '. Guest Details as Follows - \n ', bold: false, fontSize: 11 },
                );
                remarks_Data.push(remarks_Data_Details);


                // for(let index1 = 0 ; index1 < res.result.boarding_Pass_Data.length; index1++){

                //   let guest_Data_Details = [];
                // tslint:disable-next-line: max-line-length
                //   guest_Data_Details.push({ text: res.result.tokendata[index].products[0].name + ' - ' + res.result.boarding_Pass_Data[index1].fields.name + ', ' + (res.result.boarding_Pass_Data[index1].fields.pnr === undefined || res.result.boarding_Pass_Data[index1].fields.pnr === '' ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.pnr) + ', ' + (res.result.boarding_Pass_Data[index1].fields.fromCity === undefined || res.result.boarding_Pass_Data[index1].fields.fromCity === ''  ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.fromCity) + ' --> ' + (res.result.boarding_Pass_Data[index1].fields.toCity === undefined || res.result.boarding_Pass_Data[index1].fields.toCity === '' ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.toCity), bold: false, fontSize: 11 });


                //   remarks_Data.push(guest_Data_Details);

                // }
                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: remarks_Data
                    }
                  });

                var guest_Data = [
                  [
                    { text: 'S.No.', bold: true, fontSize: 11 },
                    { text: 'Guest Name', bold: true, fontSize: 11 },
                    { text: 'PNR', bold: true, fontSize: 11 },
                    { text: 'Airline Code', bold: true, fontSize: 11 },
                    { text: 'Frequent Flyer Number', bold: true, fontSize: 11 },
                    { text: 'Class Code', bold: true, fontSize: 11 },
                    { text: 'Date Of Flight', bold: true, fontSize: 11 },
                  ]
                ];

                for (let index1 = 0; index1 < res.result.boarding_Pass_Data.length; index1++) {

                  var guest_Data_Details = [];
                  const flight_Data = res.result.boarding_Pass_Data[index1].fields.dateOfFlight
                  const dateOfFlight = this.formatDate(flight_Data);
                  guest_Data_Details.push(
                    { text: index1 + 1, bold: false, fontSize: 11 },
                    { text: res.result.boarding_Pass_Data[index1].fields.name, bold: false, fontSize: 11 },
                    { text: res.result.boarding_Pass_Data[index1].fields.pnr, bold: false, fontSize: 11 },
                    { text: res.result.boarding_Pass_Data[index1].fields.airlineCode, bold: false, fontSize: 11 },
                    { text: res.result.boarding_Pass_Data[index1].fields.frequentFlyerNumber, bold: false, fontSize: 11 },
                    {
                      text: res.result.boarding_Pass_Data[index1].fields.classCode
                      , bold: false, fontSize: 11
                    },
                    {
                      text: dateOfFlight
                      , bold: false, fontSize: 11
                    },
                  );

                  guest_Data.push(guest_Data_Details);
                }

                docDefinition.content.push(
                  {

                    table: {
                      headerRows: 1,
                      widths: [30, 70, 50, 70, 120, 30, 80],
                      body: guest_Data
                    }
                  });


                var terms_Conditions = [
                  [
                    { text: 'Terms and Conditions:', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var terms_Conditions_Details = [];
                terms_Conditions_Details.push(
                  // { text: 'Terms and Conditions:', bold: true, fontSize: 11 },'\n',res.result.tokendata[index].admissionID.guests
                  // { text: '1. Reservation is required: services and facilities are subject to availability. \n 2. Signed Confirmation - Airline Passengers is treated as Official Contract. No seperate contract will be issued for bookings. \n 3. No Show or cancellation less than 1 hour to the service time is subject to full payment of total amount.', bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].admissionID.admissionTokenID.tnc, bold: false, fontSize: 11 },
                );
                terms_Conditions.push(terms_Conditions_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: terms_Conditions
                    }
                  });

                var salutation_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var salutation_Data_Details = [];
                salutation_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Yours Sincerely for on behalf of: \n' + res.result.tokendata[index].loungeID.name, bold: true, fontSize: 11 },
                  // { text: '', bold: false, fontSize: 11 },
                  { text: 'Confirmed and Accepted by: \n (Put Company Name here)', bold: true, fontSize: 11 },
                  // { text: '', bold: false, fontSize: 11 },
                );
                salutation_Data.push(salutation_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [300, 300],
                      body: salutation_Data
                    }
                  });

                var space_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var space_Data_Details = [];
                space_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: '-------------------------', bold: false, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '-------------------------', bold: false, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                );
                space_Data.push(space_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: space_Data
                    }
                  });

                var signature_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var signature_Data_Details = [];
                signature_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Signature', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Signature and Company Stamp', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                signature_Data.push(signature_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: signature_Data
                    }
                  });

                var name_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var name_Data_Details = [];
                name_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Name:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Name:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                name_Data.push(name_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: name_Data
                    }
                  });

                var title_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var title_Data_Details = [];
                title_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Title:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Title:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                title_Data.push(title_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: title_Data
                    }
                  });

                docDefinition.content.push('\n\n',
                  { text: 'Kindly return a signed copy to us via email: ' + (res.result.tokendata[index].loungeID.email !== undefined ? res.result.tokendata[index].loungeID.email : ''), fontSize: 11 }
                );



                // docDefinition.content.push(
                //   /* Outlet Entilement table */
                //   '\n\n',
                //   {
                //       body: {text: 'Remarks: ', bold: true, fontSize: 11}
                //   });

              }
              var pdffilename = '';
              var datcounts = res.result.tokendata.length;
              if (res.result.tokendata.length > 0) {
                pdffilename = res.result.tokendata[0].invoiceNo;
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              const pdfDocGenerator = pdfMake.createPdf(docDefinition);
              pdfDocGenerator.getBlob((blob) => {
                var FileName = res.result.tokendata[0].invoiceNo + '.pdf';
                const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                this.WS.post('api/master/s3/presignedURL', {
                  type: 'Partner Contract',
                  extension: 'pdf',
                  contentType: pdfFile.type,
                  fileName: FileName
                }).subscribe((res: any) => {
                  //  console.log(res);
                  this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                    switch (event.type) {
                      case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                      case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                      case HttpEventType.UploadProgress:
                        break;
                      case HttpEventType.Response:

                        this.WS.post('api/master/fileImportExport/save/import', {
                          path: res.result.urlInfo.key,
                          type: 'Partner Contract',
                          fileName: pdfFile.name,
                          Datacount: datcounts,
                          activity: 'Export',
                          extension: 'pdf'
                        }).subscribe((re: IResponse) => {
                          if (re.status === 1) {
                            re.result;
                            resolve(true);
                          }
                          else if (re.status === 2) {
                            reject(false);
                          }
                          else {
                            reject(false);
                          }
                        });
                    }

                  });
                });
              });

            }, 500);
          }
          else if (res.status === 2) {
            resolve(false);
          }
          else {
            resolve(false);
          }
        });
      } catch (error) {
        reject(false);
        console.log('Error', error);
      }
    });
  }

  private fetchAdmissionTypes(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.tokenTypes = res.result.values as IGlobalSetting[];

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
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchPartnerType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.PartnerType = res.result.values as IGlobalSetting[];
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
      // const res = r.decrypted;
      if (res.status === 1) {
        this.tokenDocuments = res.result.values as IGlobalSetting[];

        // this.mapGlobalSettingsOnData();
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
      // const res = r.decrypted;
      // console.log(res);
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
      // const res = r.decrypted;
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
      // const res = r.decrypted;
      if (res.status === 1) {
        this.allTokenIdentifiers = res.result.values as IGlobalSetting[];

        // this.mapGlobalSettingsOnData();
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
      // const res = r.decrypted;
      // console.log(res);
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
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      setTimeout(() => {
        img.onload = () => {
          var canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          var dataURL = canvas.toDataURL('image/png');
          // console.log('dataURL',dataURL)
          resolve(dataURL);
        };
      }, 500);

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });

  }


  getBase64ImageFromHTML(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.innerHTML = url;
    });
  }
  public calculateDayDiff(startDate: string, endDate: string): any {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // tslint:disable-next-line: max-line-length
    const date = Math.floor((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) / (1000 * 60 * 60 * 24));
    return date;
  }

  public generateContractForDelayedFlight(tokenId, callscreen) {
    this.fetchLoungeBrand('LOUNGE_BRAND');
    this.fetchPartnerType('PARTNER_TYPE');
    return new Promise((resolve, reject) => {
      try {
        if (!tokenId) {
          this.toastr.info('Token id not found');
          return;
        }
        this.WS.post('api/master/delayedFlight/getDataforDelayedFlightContract', { TokenyId: tokenId, screen: callscreen }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            var todaydate = new Date();
            var curetndatetime = todaydate.toISOString();
            var gettodaydate = this.formatDateTime(new Date(curetndatetime));
            // console.log('res.result export pdf', res.result)

            var docDefinition = {
              pageMargins: [40, 60, 40, 60],
              pageSize: 'A4',
              header: (currentPage, pageCount) => {
                var partnerName = '';
                const matchbrand = this.PartnerType.find(app => app.keyCode === res.result.tokendata[0].partnerId.type);
                if (matchbrand) {
                  partnerName = matchbrand.key1;
                }
                return {
                  margin: [30, 30, 30, 30],
                  columns: [
                    { text: 'PLAZA PREMIUM LOUNGE', fontSize: 10, margin: [10, 5, 0, 0], italics: false, height: 14, bold: false, width: 200 },
                    { text: 'CONFIRMATION LETTER - ' + partnerName.toUpperCase(), fontSize: 10, margin: [0, 5, 0, 0], height: 14, bold: true, width: 200 },
                    { text: 'Page ' + currentPage + ' of ' + pageCount + '', fontSize: 10, margin: [0, 5, 0, 0], height: 15, bold: false, width: 200 }
                  ]
                };
              },

              footer: function (currentPage, pageCount) {
                return {
                  columns: [
                    // { text: 'Copyright © 2022 PLAZA PREMIUM LOUNGE. All rights reserved \n', alignment: 'left', fontSize: 8, margin: [30, 30, 0, 0], width: '50%' },
                    // { text: 'Form No.: PLAZA-HK1-LF32 ' + ', ' + gettodaydate, alignment: 'right', bolf: true, margin: [0, 30, 30, 30], fontSize: 8, width: '50%' },
                  ]
                };
              },

              background: function (currentPage, pageSize) {
                return [
                  {
                    canvas: [

                      { type: 'line', x1: 28, y1: 28, x2: 570, y2: 28, lineWidth: 2 }, //Up line
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
                      { type: 'line', x1: 28, y1: 800, x2: 570, y2: 800, lineWidth: 2 }, //Bottom line
                      { type: 'line', x1: 28, y1: 28, x2: 28, y2: 800, lineWidth: 2 }, //Left line
                      { type: 'line', x1: 570, y1: 28, x2: 570, y2: 800, lineWidth: 2 }, //Rigth line
                    ],
                  }
                ];
              },
              // tslint:disable-next-line: max-line-length
              content: [
                // { text: 'Date:' + gettodaydate, bold: false, fontSize: 10 }, '\n', { text: 'To:', bold: false, fontSize: 10 }, '\n', { text: 'Fax No:', bold: false, fontSize: 10, alignment: 'left' }, '\n',
                // {text: 'Tel No: ' + res.result.tokendata[0].loungeID.phoneNo, bold: false, fontSize: 10}, '\n' ,{text: 'From: ' + res.result.tokendata[0].loungeID.brand, bold: false, fontSize: 10}, '\n', {text: 'Service Location: ' + res.result.tokendata[0].loungeID.name, bold: false, fontSize: 10},'\n',	{
                //   style: 'tableExample',
                //   table: {
                //     headerRows: 1,
                //     body: [
                //       [{text:'Date', style:'tableHeader', bold:true}, {text:'Flight No.', style:'tableHeader',bold: true}, {text:'No. of Pax', style:'tableHeader', bold: true}, {text:'Services', style:'tableHeader', bold: true}, {text:'Rate', style: 'tableHeader', bold: true}],
                //       [gettodaydate, 'NZ081', '3', 'Private Resting Area', '5940']
                //     ]
                //   }
                // }, '\n', {text: 'Remarks: ', bold: false, fontSize: 10}, '\n', {text: 'Terms and Conditions', bold: false, fontSize: 10},'\n', {text: 'Yours Sincerly', bold: false, fontSize: 10}
              ]
            };

            setTimeout(() => {
              for (let index = 0; index < res.result.tokendata.length; index++) {
                var TokenDetailsTable = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var brandName = '';
                const matchbrand = this.LoungeBrand.find(app => app.keyCode === res.result.tokendata[index].outletId.brand);
                if (matchbrand) {
                  brandName = matchbrand.key1;
                }
                var partnerNameSplit = res.result.tokendata[index].partnerId.name.split('-');
                const partnerName = partnerNameSplit[0];
                var tokenDetails = [];
                tokenDetails.push(
                  { text: 'Date:', bold: true, fontSize: 10 },
                  { text: gettodaydate, bold: false, fontSize: 10 },
                  { text: 'To:', bold: true, fontSize: 10 },
                  { text: partnerName, bold: false, fontSize: 10 }
                );
                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];
                tokenDetails.push(
                  { text: 'Email:', bold: true, fontSize: 10 },
                  { text: res.result.tokendata[index].partnerEmailId, bold: false, fontSize: 10 },
                  { text: 'Tel No.:', bold: true, fontSize: 10 },
                  { text: res.result.tokendata[index].partnerTelNo, bold: false, fontSize: 10 }
                );

                TokenDetailsTable.push(tokenDetails);
                tokenDetails = [];
                tokenDetails.push(
                  { text: 'From:', bold: true, fontSize: 10 },
                  { text: brandName, bold: false, fontSize: 10 },
                  { text: 'Tel No.:', bold: true, fontSize: 10 },
                  { text: res.result.tokendata[index].outletId.phoneNo, bold: false, fontSize: 10 }
                );

                TokenDetailsTable.push(tokenDetails);
                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [70, 200, 70, 150],
                      body: TokenDetailsTable
                    }
                  });

                var serviceLocation = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var serviceLocationDetails = [];
                serviceLocationDetails.push(
                  { text: 'Service Location:', bold: true, fontSize: 10 },
                  // tslint:disable-next-line: max-line-length
                  { text: res.result.tokendata[index].outletId.name + ' ' + res.result.tokendata[index].outletId.addressLine1, bold: false, fontSize: 10 },
                );
                serviceLocation.push(serviceLocationDetails);

                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [70, 400],
                      body: serviceLocation
                    }
                  });

                var ordersData = [
                  [
                    { text: 'Date', bold: true, fontSize: 11 },
                    { text: 'Flight No.', bold: true, fontSize: 11 },
                    { text: 'No. Of Pax', bold: true, fontSize: 11 },
                    { text: 'Services', bold: true, fontSize: 11 },
                    { text: 'Rate', bold: true, fontSize: 11 },
                    // { text: `Rate (${res.result.tokendata[index].currency})`, bold: true, fontSize: 11 }
                  ]
                ];

                // for(let index2 = 0; index2 < res.result.boarding_Pass_Data.length; index2++){

                var order_row = [];
                var loungeuse = 'Lounge Use - (' + res.result.tokendata[index].hours + 'Hours)';
                order_row.push(
                  { text: gettodaydate, bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].airlineNo ? res.result.tokendata[index].airlineNo : '', bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].paxCount, bold: false, fontSize: 11 },
                  { text: loungeuse, bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].currency + ' ' + ((res.result.tokendata[index].agreedContractAmount == 'NA') ? ' ' : (res.result.tokendata[index].agreedContractAmount)), bold: false, fontSize: 11 },
                  // { text: res.result.tokendata[index].amount, bold: false, fontSize: 11 }
                );

                ordersData.push(order_row);
                // }

                docDefinition.content.push(
                  /* Outlet Entilement table */
                  '\n\n',
                  {
                    table: {
                      headerRows: 1,
                      widths: ['*', '*', '*', '*', '*'],
                      body: ordersData
                    }
                  });



                let remarks_Data = [
                  [
                    { text: 'Remarks:', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];
                let remarks_Data_Details = [];
                const date_Data = res.result.tokendata[index].partnerContractId.contractStart;
                const admission_Date = this.formatDateTime(date_Data);
                const end_Admission_Date = res.result.tokendata[index].partnerContractId.contractEnd;
                const admission_End_Date = this.formatDateTime(end_Admission_Date);
                const loungeName = res.result.tokendata[index].outletId.name;
                remarks_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: ' We will accomodate ' + res.result.tokendata[index].paxCount + ' Pax for ' + 'Lounge Use - (' + res.result.tokendata[index].hours + ' Hours)' + ' at our lounge ' + loungeName + '.' },
                );
                remarks_Data.push(remarks_Data_Details);


                // for(let index1 = 0 ; index1 < res.result.boarding_Pass_Data.length; index1++){

                //   let guest_Data_Details = [];
                // tslint:disable-next-line: max-line-length
                //   guest_Data_Details.push({ text: res.result.tokendata[index].products[0].name + ' - ' + res.result.boarding_Pass_Data[index1].fields.name + ', ' + (res.result.boarding_Pass_Data[index1].fields.pnr === undefined || res.result.boarding_Pass_Data[index1].fields.pnr === '' ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.pnr) + ', ' + (res.result.boarding_Pass_Data[index1].fields.fromCity === undefined || res.result.boarding_Pass_Data[index1].fields.fromCity === ''  ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.fromCity) + ' --> ' + (res.result.boarding_Pass_Data[index1].fields.toCity === undefined || res.result.boarding_Pass_Data[index1].fields.toCity === '' ? 'Not Available' : res.result.boarding_Pass_Data[index1].fields.toCity), bold: false, fontSize: 11 });


                //   remarks_Data.push(guest_Data_Details);

                // }
                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: remarks_Data
                    }
                  });

                // var guest_Data = [
                //   [
                //     { text: 'S.No.', bold: true, fontSize: 11 },
                //     { text: 'Guest Name', bold: true, fontSize: 11 },
                //     { text: 'PNR', bold: true, fontSize: 11 },
                //     { text: 'Airline Code', bold: true, fontSize: 11 },
                //     { text: 'Frequent Flyer Number', bold: true, fontSize: 11 },
                //     { text: 'Class Code', bold: true, fontSize: 11 },
                //     { text: 'Date Of Flight', bold: true, fontSize: 11 },
                //   ]
                // ];

                // for (let index1 = 0; index1 < res.result.boarding_Pass_Data.length; index1++) {

                //   var guest_Data_Details = [];
                //   const flight_Data = res.result.boarding_Pass_Data[index1].fields.dateOfFlight
                //   const dateOfFlight = this.formatDate(flight_Data);
                //   guest_Data_Details.push(
                //     { text: index1 + 1, bold: false, fontSize: 11 },
                //     { text: res.result.boarding_Pass_Data[index1].fields.name, bold: false, fontSize: 11 },
                //     { text: res.result.boarding_Pass_Data[index1].fields.pnr, bold: false, fontSize: 11 },
                //     { text: res.result.boarding_Pass_Data[index1].fields.airlineCode, bold: false, fontSize: 11 },
                //     { text: res.result.boarding_Pass_Data[index1].fields.frequentFlyerNumber, bold: false, fontSize: 11 },
                //     {
                //       text: res.result.boarding_Pass_Data[index1].fields.classCode
                //       , bold: false, fontSize: 11
                //     },
                //     {
                //       text: dateOfFlight
                //       , bold: false, fontSize: 11
                //     },
                //   );

                //   guest_Data.push(guest_Data_Details);
                // }

                // docDefinition.content.push(
                //   {

                //     table: {
                //       headerRows: 1,
                //       widths: [30, 70, 50, 70, 120, 30, 80],
                //       body: guest_Data
                //     }
                //   });


                var terms_Conditions = [
                  [
                    { text: 'Terms and Conditions:', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var terms_Conditions_Details = [];
                terms_Conditions_Details.push(
                  // { text: 'Terms and Conditions:', bold: true, fontSize: 11 },'\n',res.result.tokendata[index].admissionID.guests
                  // { text: '1. Reservation is required: services and facilities are subject to availability. \n 2. Signed Confirmation - Airline Passengers is treated as Official Contract. No seperate contract will be issued for bookings. \n 3. No Show or cancellation less than 1 hour to the service time is subject to full payment of total amount.', bold: false, fontSize: 11 },
                  { text: res.result.tokendata[index].admissionTokenId.tnc, bold: false, fontSize: 11 },
                );
                terms_Conditions.push(terms_Conditions_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 1,
                      widths: ['*'],
                      body: terms_Conditions
                    }
                  });

                var salutation_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    // { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var salutation_Data_Details = [];
                salutation_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Yours Sincerely for on behalf of: \n' + res.result.tokendata[index].outletId.name, bold: true, fontSize: 11 },
                  // { text: '', bold: false, fontSize: 11 },
                  { text: 'Confirmed and Accepted by: \n ' + partnerName, bold: true, fontSize: 11 },
                  // { text: '', bold: false, fontSize: 11 },
                );
                salutation_Data.push(salutation_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: [300, 300],
                      body: salutation_Data
                    }
                  });

                var space_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var space_Data_Details = [];
                space_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: '-------------------------', bold: false, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                  { text: '-------------------------', bold: false, fontSize: 11 },
                  { text: '', bold: true, fontSize: 11 },
                );
                space_Data.push(space_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: space_Data
                    }
                  });

                var signature_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var signature_Data_Details = [];
                signature_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Signature', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Signature and Company Stamp', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                signature_Data.push(signature_Data_Details);

                docDefinition.content.push('\n',
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: signature_Data
                    }
                  });

                var name_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var name_Data_Details = [];
                name_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Name:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Name:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                name_Data.push(name_Data_Details);

                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: name_Data
                    }
                  });

                var title_Data = [
                  [
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                    { text: '', bold: true, fontSize: 11 },
                  ]
                ];

                var title_Data_Details = [];
                title_Data_Details.push(
                  // tslint:disable-next-line: max-line-length
                  { text: 'Title:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                  { text: 'Title:', bold: true, fontSize: 11 },
                  { text: '', bold: false, fontSize: 11 },
                );
                title_Data.push(title_Data_Details);

                docDefinition.content.push(
                  {
                    layout: 'noBorders',
                    table: {
                      headerRows: 0,
                      widths: ['*', 200, '*', '*'],
                      body: title_Data
                    }
                  });

                docDefinition.content.push('\n',
                  { text: 'Kindly return a signed copy to us via email: ' + (res.result.tokendata[index].outletId.email !== undefined ? res.result.tokendata[index].outletId.email : ''), fontSize: 11 }
                );



                // docDefinition.content.push(
                //   /* Outlet Entilement table */
                //   '\n\n',
                //   {
                //       body: {text: 'Remarks: ', bold: true, fontSize: 11}
                //   });

              }
              var pdffilename = '';
              var datcounts = res.result.tokendata.length;
              if (res.result.tokendata.length > 0) {
                pdffilename = res.result.tokendata[0].airline;
              } else {
                // pdffilename= res.result.tokendata[0].name
              }
              var getgeneratepdffile = pdfMake.createPdf(docDefinition).download(pdffilename.trim() + '.pdf');
              const pdfDocGenerator = pdfMake.createPdf(docDefinition);
              pdfDocGenerator.getBlob((blob) => {
                var FileName = res.result.tokendata[0].airline + '.pdf';
                const pdfFile = new File([blob], FileName, { type: 'application/pdf' });
                this.WS.post('api/master/s3/presignedURL', {
                  type: 'Partner Contract',
                  extension: 'pdf',
                  contentType: pdfFile.type,
                  fileName: FileName
                }).subscribe((res: any) => {
                  //  console.log(res);
                  this.WS.put(res.result.urlInfo.url, pdfFile, pdfFile.type).subscribe((event: HttpEvent<any>) => {
                    switch (event.type) {
                      case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                      case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                      case HttpEventType.UploadProgress:
                        break;
                      case HttpEventType.Response:

                        this.WS.post('api/master/fileImportExport/save/import', {
                          path: res.result.urlInfo.key,
                          type: 'Partner Contract',
                          fileName: pdfFile.name,
                          Datacount: datcounts,
                          activity: 'Export',
                          extension: 'pdf'
                        }).subscribe((re: IResponse) => {
                          if (re.status === 1) {
                            re.result;
                            resolve(true);
                          }
                          else if (re.status === 2) {
                            reject(false);
                          }
                          else {
                            reject(false);
                          }
                        });
                    }

                  });
                });
              });

            }, 500);
          }
          else if (res.status === 2) {
            resolve(false);
          }
          else {
            resolve(false);
          }
        });
      } catch (error) {
        reject(false);
        console.log('Error', error);
      }
    });
  }



  // Method to send the event data
  sendEvent(data: any) {
    this.eventSubject.next(data);
  }
}
