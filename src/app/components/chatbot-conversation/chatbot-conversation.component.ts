import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { ILanguage } from 'src/app/models/language.interface';
import { Subscription } from 'rxjs';
import { WebService } from 'src/app/services/web.service';
import { IChatBotConversationResponse, IPartnerResponse } from 'src/app/models/partnerresponse';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IResponse } from 'src/app/models/server-data-source.model';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/models/user.interface';
import { ToastrService } from 'ngx-toastr';
import { MatTableExporterDirective } from 'mat-table-exporter';

import { IPartner } from 'src/app/models/partner.interface';
import { ILounge } from 'src/app/models/lounge.interface';
import { DatePipe } from '@angular/common';
declare var $;

export interface IGlobalSetting {
  productID?: string;
  type?: number;
  total_docs_count?: any;
  _id: string;
  lkCode: string;
  keyCode: number;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  key5: string;
  key6: string;
  key7: string;
  key8: string;
  lastModifiedOn?: any;
  // total_docs_count?: number;
}
@Component({
  selector: 'app-chatbot-conversation',
  templateUrl: './chatbot-conversation.component.html',
  styleUrls: ['./chatbot-conversation.component.css']
})
export class ChatbotConversationComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) partnerSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("exporter") exporter!: MatTableExporterDirective;
  public isSidebarOpen: boolean = true;
  public showData: boolean;
  public chatBotLoaderShow = false;
  public data: ILanguage;
  public authenticatedUser: IUser;
  public simplesearch = ''
  public advanceSearch:boolean=false
  private userSub: Subscription;
  public partner: IPartnerResponse[] = []
  public Category: IGlobalSetting[] = [];
  public dataSourceMainpartner: MatTableDataSource<IChatBotConversationResponse>;
  public displayedColumns: string[] = ['name', 'email', 'city', 'bin', 'displayCategory', 'displayType', 'remarks', 'createdOn', 'action'];
  private languageSubscription: Subscription = null;
  public showPartnerDetails = false;
  public loadershow = false;
  private loungeSub: Subscription;
  public loaderMessage = '';
  public currentLoung: ILounge;
  public ExportLoader = false;
  public tokenTypes: IGlobalSetting[] = [];
  fromDate: any;
  toDate: any;
  public exportloaderMessage = ''
  private _id: string;
  partnername: any;
  event: any;
  response: any;
  type: any;
  request: any;
  date: any;
  status: any;
  partners: IPartner[];
  pid: any;
  pname: any;
  chatBotData: IChatBotConversationResponse[];
  chatBotDataCount: any;
  name: any;
  email: any;
  bin: any;
  tokenType: any;
  city: any;
  category: any;
  remarks: any;
  guestName: any;
  guestEmail: any;
  cityName: any;
  // toastr: any;
  constructor(
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private WS: WebService,
    private datePipe: DatePipe,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe(user => {
      if (user) {
        this.authenticatedUser = user;
      }
    });

    this.loungeSub = this.auth.currentLounge.subscribe(lounge => {
      if (lounge) {
        this.currentLoung = lounge;

        // window.location.reload();

      }
     this.fetchChatBotConversation();
     this.fetchCategory('CUSTOMER_INTERACTION_TYPE');
     this.fetchAdmissionTypes('ADMISSION_TOKEN_TYPE');
    });
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
    this.fromDate = this.datePipe.transform(firstDay, 'yyyy-MM-dd')
    this.toDate = this.datePipe.transform(lastDay, 'yyyy-MM-dd')
    // this.partnerName();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe(lang => {
        this.changeLanguage(lang);
      });
    }, 100);
  }
  public changeLanguage(lang): void {
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
  hidePincodeDetails(): void {
    if (this.route.snapshot.queryParams.n && this.route.snapshot.queryParams.n === 'y') {
      this.showPartnerDetails = false;
    } else {
      this.showPartnerDetails = false;
    }
    this.showPartnerDetails = false;
    if(this.simplesearch.trim()===""){
      if(this.advanceSearch){
        this.advanceChatBotDataSearch();
      }else{
        this.fetchChatBotConversation()
      }
    }else{
      this.simpleSearchChatbotData(this.simplesearch)
    }


    // this.resetPincodeData();
    // this.getPincode();
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      document.getElementById('txtSearch').focus();
    }, 50);
  }
  public addNewPincode(isshow: boolean): void {
    const matchPermission = this.authenticatedUser.permissions.find(l => Object.keys(l).includes('PARTNER_RESPONSES'));
    if (matchPermission && matchPermission['PARTNER_RESPONSES'].includes('NEW')) {
      this.showPartnerDetails = isshow;
      this._id = '';
    }
    else {
      this.toastr.info('Access denied');
    }
  }

  public fetchChatBotConversation(): void {
    this.chatBotLoaderShow = true;
    this.simplesearch='';
    this.advanceSearch=false
    this.WS.post('api/admission/fetchChatBotConversation',{LoungeId: this.currentLoung._id}, 'ADMISSION').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.chatBotLoaderShow = false;
          this.chatBotData = res.result;
          this.chatBotDataCount = res.result.length;
          console.log(this.chatBotData);
          this.mapGlobalSettingsOnData();
          // this.dataSourceMainpartner = new MatTableDataSource(this.chatBotData);
          // this.dataSourceMainpartner.sort = this.partnerSort;
          // this.dataSourceMainpartner.paginator = this.paginator;
          this.toastr.success(`${this.chatBotDataCount} ${res.description}`);
        } else {
          this.toastr.info(res.description);
          // console.log(res.description);
        }
      }
    );
  }

  private fetchCategory(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      // const res = r.decrypted;
      if (res.status === 1) {
        this.Category = res.result.values as IGlobalSetting[];
        this.mapGlobalSettingsOnData();
        console.log('category',this.Category);
      } else if (res.status === 2) {
        // console.log(res.description);
      } else {
        // console.log(res.description);
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
        // if (this.tokenTypes.length && this.saveUpdateToken.type === 0) {
        //   this.saveUpdateToken.type = this.tokenTypes[0].keyCode;
        // }
        this.mapGlobalSettingsOnData();
        console.log('tokentypes', this.tokenTypes);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }


  private mapGlobalSettingsOnData(): void {
    if (this.chatBotData.length) {
      this.chatBotData.map((token) => {
        if (this.Category.length) {
          const matchType = this.Category.find(
            (l) => l.keyCode === token.category
          );
          if (matchType) {
            token.displayCategory = matchType.key1;
          }
        }
        if (this.tokenTypes.length) {
          const matchTokenType = this.tokenTypes.find(
            (t) => t.keyCode === token.tokenType
          );
          if (matchTokenType) {
            token.displayType = matchTokenType.key1;
          }
        }
      });
    }
    this.dataSourceMainpartner = new MatTableDataSource(this.chatBotData);
    this.dataSourceMainpartner.sort = this.partnerSort;
    this.dataSourceMainpartner.paginator = this.paginator;
  }

 

  public advanceChatBotDataSearch(): void {
    this.loadershow = true;

    this.simplesearch='';
    this.advanceSearch=true
    this.WS.post('api/admission/advanceSearchChatBotConversation', {
      name: this.guestName,
      email: this.guestEmail,
      city: this.cityName,
    }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.chatBotData = res.result;
        this.loadershow = false;
        this.toastr.success('Successfully Found Data');
      } else {
        this.chatBotData = [];
        this.toastr.info(res.description);
        this.loadershow = false;
        // console.log(res.description);
      }
      // this.resetCountryData();
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.mapGlobalSettingsOnData();
    });
  }


  public resetadvanceChatBotDataSearch(): void{
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CUSTOMER_INTERACTION')
    );
    if (matchPermission && matchPermission['CUSTOMER_INTERACTION'].includes('RESET')) {
    try {
      this.guestName = "",
      this.guestEmail= "",
       this.cityName= "",
         this.advanceSearch=false
  
  

      
    } catch (error) {
      console.log('Error', error);
    }
  }
  else {
    this.toastr.info(
      `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
    );
  }

  }


  public getpartnerResponseById(partnerId: string): void {
    this.WS.post('api/admission/chatBotConversation/fetch/id', { id: partnerId }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        console.log('res', res.result.Conversation);
        this.name = res.result.Conversation.name;
        this.email = res.result.Conversation.email;
        this.category = res.result.Conversation.category;
        this.bin = res.result.Conversation.bin;
        this.tokenType = res.result.Conversation.tokenType;
        this.city = res.result.Conversation.city;
        this.remarks = res.result.Conversation.remarks;
        this.mapGlobalSettingsOnData();
        this.showPartnerDetails = true;
      } else {
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.simplesearch.trim() !== '') {
      $('.search-input input').focus();
    }
    $('#query1').hide();
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .addClass('not-empty');
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
        if ($(event.target).hasClass('select2-selection__choice__remove').length ||
          $(event.target).parent('.searchSuggestions').length ||
          $(event.target).parent('.select2-selection__choice__remove').length) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          // $('body').find('.query1').removeClass('visible');
          // $('#query1').hide();
          this.showData = false;
        }
      }
    });
  }

  public simpleSearchChatbotData(value): void {
    this.loadershow=true;
    this.simplesearch = value;
    this.advanceSearch=false
    // console.log(value);
    this.WS.post('api/admission/chatBot/simpleSearchChatBotData', {search: value}, 'ADMISSION').
    subscribe((res: IResponse) => {
      // console.log(res);
      if (res.status === 1) {
        this.chatBotData = res.result;
        this.loadershow=false;
        this.dataSourceMainpartner = new MatTableDataSource(this.chatBotData);
        this.dataSourceMainpartner.sort = this.partnerSort;
        this.dataSourceMainpartner.paginator = this.paginator;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.chatBotData = [];
        this.loadershow=false;
        this.dataSourceMainpartner = new MatTableDataSource(this.chatBotData);
        this.dataSourceMainpartner.sort = this.partnerSort;
        this.dataSourceMainpartner.paginator = this.paginator;
        this.toastr.info(res.description);
      } else {
        // console.log(res.description);
      }
      this.mapGlobalSettingsOnData();
    });
  }

  // public exportReport(filename) {
  //   const matchPermission = this.authenticatedUser.permissions.find((l) =>
  //     Object.keys(l).includes('PARTNER_RESPONSES')
  //   );
  //   if (matchPermission && matchPermission['PARTNER_RESPONSES'].includes('EXPORT')) {
  //     try {
  //       this.ExportLoader = true;
  //       this.exportloaderMessage = 'Exporting data..'

  //       this.exporter.exportTable('xlsx', { fileName: filename })

  //       setTimeout(() => {
  //         this.ExportLoader = false;
  //       }, 1000);

  //     } catch (error) {
  //       console.log('Error', error)
  //     }
  //   } else {
  //     this.toastr.info(`${this.data ? this.data.admission.accessDenied : 'Access denied'}`);
  //   }
  // }
}
