import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { IMember, IUnlinkCardMember } from 'src/app/models/member.interface';
import { WebService } from 'src/app/services/web.service';
import { AbstractValidator, IColumn } from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { ILanguage } from 'src/app/models/language.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IAdmission } from 'src/app/models/admission.interface';
import { ToastrService } from 'ngx-toastr';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { read } from 'fs';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';

declare var $;
@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) memberSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("exporter") exporter!: MatTableExporterDirective;
  @ViewChild('cardSort') cardSort: MatSort;
  @ViewChild('cardPaginator') cardpaginator: MatPaginator;
  @ViewChild('closeButton') closeButton: ElementRef;
  @ViewChild('closeButtonTable') closeButtonTable: ElementRef;
  
  @ViewChild('actionHistoryPaginator') actionHistoryPaginator: MatPaginator;
  @ViewChild('actionHistorySort') actionHistorySort: MatSort;

  public isSidebarOpen = true;
  public addNewAssociatedPartner = false;
  public details=false
  public remarks='';
  public showData: boolean;
  public ExportLoader = false;
  public exportloaderMessage = ''
  public showImport: boolean;
  public showMemberDetails = false;
  public data: ILanguage;
  public dataSourceMember: MatTableDataSource<IMember>;
  public dataSourceUnlinkMember:MatTableDataSource<IUnlinkCardMember>
  public displayedColumns: string[] = ['memberID','arrtureMemberID', 'memberType', 'mobileNum', 'email', 'lastModifiedOn', 'status', 'action'];
  public displayedColumnsUnlinkmember: string[] = ['_id','cardName', 'cardNumber','expiry','access'];
  public dataSourceStatusHistory: MatTableDataSource<any>;
  public displyedActionColumn = [
    'action',
    'refmem',
    'remarks',
    'outlet',
    'modifiedOn',
    'modifiedBy',
  ];
  public reasonType=[];
  public reason=''
  public showUnlinkMember=false;
  public currentYear:any
  selectedRowId: any;
  memberCardId: string[] = [];
  public statusHistory=[];

  private languageSubscription: Subscription = null;
  memberID = '';
  memberType = '';
  mobileNum = '';
  email = '';
  lastAdmissionDate = '';
  public memberData = [];
  // public memberSearch=IMember;
  public memberAdvanceData = [];
  public memberTypeArray = [];
  // memberName1:'';
  memberMobile: '';
  memberEmail: '';
  applicableTill=''
dynamicMemberDeviceID=''
  public memberTypes: IGlobalSetting[] = [];
  public dataSourceAdmissions: MatTableDataSource<IAdmission>;
  public admColumns: string[] = ['admissionNo', 'hmac', 'admissionDate', 'guests', 'partner', 'outlet', 'status'];
  private admissionStatus: IGlobalSetting[] = [];
  public loadershow = false;
  public refmemberID='';
  public createMem=false
  public bookmem=false
  public loaderMessage = '';
  public keywordSearch = '';
  // create Member Variables
  public titles: IGlobalSetting[] = [];
  public title;
  public firstName:string='';
  public lastName:string='';
  public telePhoneNum:string='';
  public Mememail='';
  public annaualMemEffDate=new Date().toISOString().substring(0, 10);
  public currencyValue:string='';
  public amount:string=''
  // public individualCheckbox=false;
  // public AnnualCheckbox=false;
  public membershipPlan: IGlobalSetting[] = [];
  public membershipPayment: IGlobalSetting[] = [];
  public corporateType:any[] = []; ;
   public memberPlan:any;
   public memberPay:any;
   public memberStatus:any
   public memberCorporateType:any
   public memberShipID:any
   public currency:any;

  // public cashCheckbox=false;
  // public BankCheckbox=false;
  public authValue:any
  public userOutlet:any
  public authenticatedUser: IUser;
  private userSub: Subscription;


  // Savecrad details
  selectedPartnerName: string;
  selectedCardNumber: string;
  selectedName: string;
  selectedLinkedCard: string;
  selectedQuotaRemaining: string;
  selectedQuota: string;
  public qrCode = '';
  public cardName=''
  public applicable = '';
  public cardID = '';
  cards = [];
  public linkedCardNumData: any[]
  public image='';
  public expiry;
  public paxCount = [];
  public loungeNames = [];
  public filteredLoungeNames = [];
  public loungeCount: number;
  showDataSave: boolean = true;
  showAddCard:boolean=true
  paxData: boolean = false;
  qrCodeData: boolean = false;
  showlinkCardData: boolean = false;
  showLounge: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private WS: WebService,
    private cs: CommonServiceService,
    private toastr: ToastrService,
    private common: CommonServiceService,
    private router: Router,
    private auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }     
    });
    this.fetchMemberTypes('MEMBER_TYPE');
    this.fetchMemberData();
    // this.fetchadvanceMemberSearchData();    
    this.fetchAdmissionStatuses('ADMISSION_STATUS');
    this.fetchReasonToUnlink('MEMBER_REASON_TOUNLINK_CARD')
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe(lang => {
        this.changeLanguage(lang);
      });
    }, 100);
    if (this.route.snapshot.queryParams.n && this.route.snapshot.queryParams.n === 'y') {
      // console.log('Showing import');
      this.showMemberDetails = true;
    }
    if(this.route.snapshot.queryParams.mem){
      this.getTableClickMemberData(this.route.snapshot.queryParams.mem)
    }
    this.authValue=localStorage.getItem('token')
    this.userOutlet=this.authenticatedUser.userOutlet._id
  }

  private fetchMemberTypes(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.memberTypes = res.result.values as IGlobalSetting[];
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  
  private fetchReasonToUnlink(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.reasonType = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }


  private fetchAdmissionStatuses(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', { lookupCode }).subscribe((res: any) => {
      if (res.status === 1) {
        this.admissionStatus = res.result.values as IGlobalSetting[];
        // this.mapGlobalSettingsOnData();
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }

  private mapGlobalSettingsOnData(): void {
    this.memberData.forEach(mem => {
      if (this.memberTypes.length) {
        const matchType = this.memberTypes.find(t => t.keyCode === mem.memberType);
        mem.displayMemberType = matchType ? matchType.key1 : '';
      }
    });
    this.dataSourceMember = new MatTableDataSource(this.memberData);
    this.dataSourceMember.sort = this.memberSort;
    this.dataSourceMember.paginator = this.paginator;
  }

  // fetchMemberData() {
  //   throw new Error('Method not implemented.');
  // }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  public fetchMemberData(): void {
    this.loaderMessage = 'Fetching members, please wait...'
    this.loadershow = true;
    this.WS.post('api/master/member/fetchMemberData').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.memberData = res.result;
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
      this.loadershow = false
    });
  }
  public simpleSearchMember(): void {
    this.loaderMessage = 'Fetching members, please wait...'
    this.loadershow = true;
    this.WS.post('api/master/member/simpleSearchMemberData', { search: this.keywordSearch }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.memberData = res.result;
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
        this.dataSourceMember = new MatTableDataSource([]);
        this.dataSourceMember.sort = this.memberSort;
        this.dataSourceMember.paginator = this.paginator;
      }
      else {
        this.toastr.error(res.description);
        this.dataSourceMember = new MatTableDataSource([]);
        this.dataSourceMember.sort = this.memberSort;
        this.dataSourceMember.paginator = this.paginator;
      }
      this.loadershow = false;
    });
  }
  public advanceSearchMember(hmac): void {
    this.loaderMessage = 'Fetching members, please wait...'
    this.loadershow = true;
    this.WS.post('api/master/member/advanceSearchMemberData', { hmac }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.memberData = res.result;
        this.mapGlobalSettingsOnData();
        // console.log(this.memberData.length,'146')
        this.toastr.success(res.description);
      }
      else {
        // console.log(res.description);
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  public fetchadvanceMemberSearchData(): void {
    this.WS.post('api/master/member/getAdvanceFormInput').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.mapGlobalSettingsOnData();
        this.memberAdvanceData = res.result.partners;
        this.memberTypeArray = res.result.memberType;
      }
      else {
        console.log(res.description);
      }
    });
  }
  public DynamicMemberID(memberid): void {
    this.WS.post('api/master/member/create/dynamicMemberID',{memberid:memberid,deviceID:"1234567899"}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public getTableClickMemberData(memberID: string): void {
    this.WS.post('api/master/member/fetch/id', { _id: memberID }).subscribe((res: IResponse) => {
      if (res.status === 1) {
    this.details=true;
    this.showMemberDetails = true;
        this.memberID = res.result.member.memberID;
        const matchType = this.memberTypes.find(t => t.keyCode === res.result.member.memberType);
        this.memberType = matchType ? matchType.key1 : '';
        this.memberMobile = res.result.member.mobileNum;
        this.memberEmail = res.result.member.email;
        this.applicableTill=res.result.member.applicableTill?this.common.formatDateTime(res.result.member.applicableTill):""
        this.dynamicMemberDeviceID=res.result.member.dynamicMemberDeviceID?res.result.member.dynamicMemberDeviceID:""
        this.lastAdmissionDate = res.result.admissions[0] ? this.common.formatDateTime(res.result.admissions[0].createdOn) : '';
        this.statusHistory=res.result.member.statusHistory
          this.mapActionHistory(this.statusHistory)
        res.result.admissions.forEach(adm => {
          adm.hmac = res.result.admissionHmac && res.result.admissionHmac[adm._id] ? res.result.admissionHmac[adm._id] : ""
          const matchStatus = this.admissionStatus.find(s => s.keyCode === adm.status);
          if (matchStatus) {
            adm.displayStatus = matchStatus.key1;
          }
        });
        this.dataSourceAdmissions = new MatTableDataSource(res.result.admissions);
        this.toastr.success(res.description);
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }
  
  public mapActionHistory(data): void {
    this.dataSourceStatusHistory = new MatTableDataSource(data);
    this.dataSourceStatusHistory.sort = this.actionHistorySort;
    this.dataSourceStatusHistory.paginator = this.actionHistoryPaginator;
  }

  public navigateToAdmission(admissionID: string): void {
    this.router.navigate(['admissions'], {
      queryParams: {
        adm: admissionID
      }
    });
  }
  ngAfterViewInit(): void {
    if (this.keywordSearch.trim() !== '') {
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
        if ($(event.target).hasClass('select2-selection__choice__remove').length || $(event.target).parent('.select2-selection__choice__remove').length) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          // $('body').find('.query1').removeClass('visible');
          // $('#query1').hide();
          this.showData = false;
        }
      }
    });
    document.getElementById('txtSearch').focus();
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
  public exportReport(filename) {
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
  }
  hideMemberDetails() {
    if (this.route.snapshot.queryParams.n && this.route.snapshot.queryParams.n === 'y') {
      this.showMemberDetails = false;
      this.location.replaceState('/members');
      // this.fetchMemberData();

    } else {
      this.showMemberDetails = false;
      this.details=false
      if(this.keywordSearch==''){
      this.fetchMemberData();
      }
    }
    // this.showMemberDetails = false;
    // window.location.reload();
    // this.ngOnInit();
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      document.getElementById('txtSearch').focus();
    }, 50);
  }
  addNewMember(isshow): void {
    this.showMemberDetails = isshow;
  }

  public backToResults(): void {
    this.showImport = false;
  }

  public showMembersImport(): void {
    this.showImport = true;
  }

  public syncMemberID(memid: string): void {
    this.WS.post('api/master/member/syncMember',{
      memberid:memid
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public unLinkMemberCard(refmemberID: string, memberID): void {   
    this.refmemberID=refmemberID;
    this.memberCardId=memberID
    // this.memberCardId=[];
    this.remarks="";
    this.fetchRecentVisits()
  }

  private fetchRecentVisits(): void {
    this.loadershow = true;
    this.loaderMessage = 'Fetching your cards';
    this.cards = [];
    this.WS.post('api/master/member/recent/visits', {
      refMemberID: this.refmemberID,
    }).subscribe((res: IResponse) => {         
      if (res.status === 1) {
        let currentYear = new Date().getFullYear();
        res.result.members.map((mem) => {
          let matchYear = mem.quota
            ? mem.quota.find((q) => q.year === currentYear)
            : null;
          this.cards.push({
            _id: mem._id,
            img:
              mem.sample && mem.sample !== ''
                ? mem.sample
                : '../../../assets/img/credit-card.png',
            cardNumber: mem.maskedNum,
            linkedCard: mem.linkedCards.length>0?mem.linkedCards.length:'',
            linkedCardNum: mem.linkedCards,
            isKYCDone: mem.isKYCDone,
            kycDoneOn: mem.kycDoneOn,
            expiry: mem.expiry,
            partnerName: mem.lastAdmission
              ? mem.lastAdmission.partnerID.name
              : '',
            cardName: mem.cardID ? mem.cardID.name : '',
            quota: matchYear ? matchYear.total : 'NA',
            quotaRemaining: matchYear
              ? matchYear.total - matchYear.consumed[1]
              : 'NA',
            hasAdmissions: matchYear ? true : false,
            cardID: mem.cardID._id,
            memberID:mem.memberID
            // member_id:adm.memberID._id
          });
        });
        this.loadershow = false;
        this.qrCodeData = false;
          this.paxData = false;
          this.showLounge = false;
        this.showUnlinkMember=true;
        // this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
    this.loadershow = false;
  }
  // public updateSelectedMembers(isChecked:boolean, _id:string){
  //   if (isChecked) {
  //         this.memberCardId.push(_id);
  //       } else {
  //         if (this.memberCardId.includes(_id)) {
  //           this.memberCardId = this.memberCardId.filter(member => member !== _id);
  //         }
  //       }

  // }

// selectAllChecked = false;


// selectAllCheckbox(event: any): void {
//   this.selectAllChecked = event.target.checked;

//   if (this.selectAllChecked) {
//     this.memberCardId = this.dataSourceUnlinkMember.data.map(row => row._id);
//   } else {
//     this.memberCardId = [];
//   }
// }

public submitUnlinkcard(){
console.log(this.memberCardId)
if(!this.reason && this.reason == ''){
  return this.toastr.info('Please select reason');
}
if(!this.remarks && this.remarks == ''){
  return this.toastr.info('Please Enter Remarks');
}
this.WS.post('api/master/member/delink/card',{memberID:this.memberCardId,remarks:this.remarks,action:this.reason,refMemberID:this.refmemberID}).subscribe((res:IResponse)=>{
  if(res.status==1){
    this.closeButton.nativeElement.click();
    // this.unLinkMemberCard(this.refmemberID, this.memberCardId)
    this.reason='';
    this.remarks='';
    this.toastr.success(res.description);
    this.closeButtonTable.nativeElement.click();
  }else if(res.status==2){
    this.toastr.info(res.description);
  }else{
    this.toastr.error(res.description);
  }

})
}
public closeLinkedCard(){
  this.closeButton.nativeElement.click();
}
public closeLinkedCardTable(){
  this.closeButtonTable.nativeElement.click();
}
public submitLinkedCardTable(){
  this.remarks=''
  this.reason=''
}
public fetchLinkedCardData(img,linkedCardNum, cardName, cardNumber,cardID,quotaRemaining,quota,expiry){
  this.linkedCardNumData=[]
  let cards={ expiry: expiry, cardNumber: cardNumber }
  this.linkedCardNumData.push(cards)
  linkedCardNum.forEach(lcardNumber => {
    let cardData = { expiry: "Supplementary Card", cardNumber: lcardNumber };
    this.linkedCardNumData.push(cardData);
  });    
  console.log("this.linkedCardNumData", this.linkedCardNumData)
  this.selectedName=cardName
  this.image=img
  // this.linkedCardNumData.unshift(cardNumber)
  // this.linkedCardNumData.push(linkedCardNum)
  this.cardID=cardID
  this.selectedCardNumber=cardNumber
  this.selectedQuotaRemaining=quotaRemaining
  this.selectedQuota=quota
  this.paxData = false;
  // this.showData = false;
  this.showUnlinkMember=false;
  this.showAddCard=false;
  this.showLounge = false;
  this.showlinkCardData=true;
  this.qrCodeData = false;
}
public showCards(): void {
  this.paxData = false;
  // this.showData = true;
  this.showUnlinkMember=true;
  this.showAddCard =true;
  this.showLounge = false;
  this.showlinkCardData=false
  // this.fetchRecentVisits();
  // this.fetchRecentVisits();
}
public hideQrcode() {
  this.qrCodeData = false;
  // this.showData = true;
  this.showUnlinkMember=true;
  this.showAddCard=true;
  this.paxData = false;
  this.showLounge = false;
  this.showlinkCardData=false
}
public hidelinkCardData(){
  this.qrCodeData = false;
  // this.showData = true;
  this.showUnlinkMember=true;
  this.showAddCard=true;
  this.showlinkCardData=false
  this.paxData = false;
  this.showLounge = false;
}
public searchLounge(searchString) {
  if (searchString.trim() === '') {
    this.showHistory(this.selectedName,this.cardID, this.selectedCardNumber);
  } else {
    let filteredData = this.filteredLoungeNames.filter((item) => {
      console.log(
        `${item.displayName || item.name},${item.addressLine1},${
          item.addressLine2
        } (${item.airportName.join(', ')}, ${item.countryName.join(
          ', '
        )})`.toLowerCase()
      );
      const data = `${item.displayName || item.name},${item.addressLine1},${item.addressLine2} (${item.airportName.join(', ')}, ${item.countryName.join(', ')})`.toLowerCase();
      return data.includes(searchString.toLowerCase());
    });
    this.loungeNames = filteredData;
  }
}
public generateQrCode(_id,cardName) {
  // console.log('_id', _id);
  this.WS.post('api/master/member/create/dynamicMemberIDApk', {
    memberid: _id,
    outlet:this.userOutlet,
    token: this.authValue,
  }).subscribe((res: IResponse) => {
    if (res.status === 1) {       
        // this.showData = false;
        this.showUnlinkMember=false;
        this.showAddCard=false;
        this.showLounge = false;
        this.qrCodeData = true;
        this.showlinkCardData=false
        this.cardName=cardName
        if(res.result[0].dynamicMemberID){
        this.qrCode = res.result[0].dynamicMemberID;
       }
        // this.applicable = res.result.matchMember.applicableTill;
        const date = new Date(res.result[0].applicableTill);
        const options: Intl.DateTimeFormatOptions = {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };

        this.applicable = date.toLocaleString('en-US', options); // Adjust        
      // console.log('this.qrCode', this.qrCode);
    }else if(res.status===2){
      this.toastr.info(res.description);
    }
    // console.log(res);
  });
}

public showPaxData(memberID: string, cardNumber, linkedCard,linkedCardNum,cardName,image,cardID,expiry): void {
  this.loadershow = true;
  this.loaderMessage = 'Fetching recent visits';
  this.paxCount = [];
  this.memberID = memberID;
  this.WS.post('api/master/member/fetch/id', {
    token:this.authValue,
    _id: memberID,
  }).subscribe((res: IResponse) => {
    if (res.status === 1) {
      // this.showData = false;
      this.showUnlinkMember=false;
      this.showAddCard=false;
      this.showLounge = false;
      this.showlinkCardData=false
      this.paxData = true;
      let matchMember = this.cards.find((c) => c._id === memberID);
      this.selectedCardNumber = cardNumber;
      this.selectedLinkedCard = linkedCard;
      this.image=image
      this.cardID=cardID
      this.selectedName=cardName
      this.linkedCardNumData=linkedCardNum
      this.selectedPartnerName = matchMember.partnerName;
      this.selectedQuota = matchMember.quota;
      this.expiry=expiry
      this.selectedQuotaRemaining = matchMember.quotaRemaining;
      if (res.result.admissions && res.result.admissions.length) {
        res.result.admissions = res.result.admissions.filter(
          (adm) => adm.status === 16
        );
        res.result.admissions.map((adm) => {
          this.paxCount.push({
            loungeName: `${adm.loungeID.displayName?adm.loungeID.displayName:adm.loungeID.name} - ${adm.loungeID.airport.airportName}`,
            visitDate: `${adm.localDay}-${getFormattedMonth(
              adm.localMonth
            )}-${adm.localYear} ${formatTime(
              adm.localHour,
              adm.localMinutes
            )}`,
            count: adm.guests,
            isSupplementaryAdmission: adm.memberID.toString() === memberID
          });
        });
      }
      // this.toastr.success(res.description);
    } else if (res.status === 2) {
      this.toastr.info(res.description);
    } else {
      this.toastr.error(res.description);
    }
    this.loadershow = false;
  });
}

public showHistory(cardName,cardID, cardNumber) {
  console.log('cardID', cardID);
  this.loadershow = true;
  this.cardID = cardID;
  this.loungeCount = 0;
  this.loaderMessage = 'Fetching Available Lounges';
  this.WS.post('api/master/member/availableLounges', {
    _id: cardID,
  }).subscribe((res: IResponse) => {
    if (res.status === 1) {
      // this.showData = false;
      this.showUnlinkMember=false;
      this.showAddCard=false;
      this.paxData = false;
      this.showLounge = true;
      this.showlinkCardData=false
      this.filteredLoungeNames = res.result.loungeNames;
      this.loungeCount = this.filteredLoungeNames.length;
      this.loungeNames = this.filteredLoungeNames;
      this.selectedCardNumber = cardNumber;
      this.selectedName=cardName
      console.log('this.loungeNames', this.loungeNames);
    } else if (res.status === 2) {
      this.toastr.info(res.description);
    } else {
      this.toastr.error(res.description);
    }
    this.loadershow = false;
  });
}


}
class MemberValidator extends AbstractValidator<IMember> {
  // tslint:disable-next-line:variable-name
  public eachValue: Subject<IMember>;
  public title = 'Import Lounge';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Lounge Template';
  public templateURL =
    'https://upublish-in-public.s3.ap-south-1.amazonaws.com/import-templates/ImportAssetTemplate.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Name',
      {
        column: 'Name',
        key: 'name',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'LocCode',
      {
        column: 'LocCode',
        key: 'locCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Description',
      {
        column: 'Description',
        key: 'description',
        validations: [],
      },
    ],
    [
      'Type',
      {
        column: 'Type',
        key: 'type',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'ParentLocation',
      {
        column: 'ParentLocation',
        key: 'parentlocation',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Address',
      {
        column: 'Address',
        key: 'address',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Country',
      {
        column: 'Country',
        key: 'country',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PinCode',
      {
        column: 'PinCode',
        key: 'pincode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'BusinessLine',
      {
        column: 'BusinessLine',
        key: 'businessline',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Phone',
      {
        column: 'Phone',
        key: 'phone',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Fax',
      {
        column: 'Fax',
        key: 'fax',
        validations: [],
      },
    ],
    [
      'TimeZoneOffset',
      {
        column: 'TimeZoneOffset',
        key: 'timezoneoffset',
        validations: [],
      },
    ],
    [
      'Email',
      {
        column: 'Email',
        key: 'email',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Category',
      {
        column: 'Category',
        key: 'category',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Status',
      {
        column: 'Status',
        key: 'status',
        validations: [],
      },
    ],
    [
      'OrganisationId',
      {
        column: 'OrganisationId',
        key: 'organisationid',
        validations: [],
      },
    ],
    [
      'SiteId',
      {
        column: 'SiteId',
        key: 'siteid',
        validations: [],
      },
    ],
  ]);
  months: any;

  constructor(private WS: WebService, u: IMember = null) {
    super(u);
    this.eachValue = new Subject<IMember>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();
    this.eachValue.subscribe((v) => {
      console.log('received value from import - ', v);
      this.callSavePropertyWebService(v);
    });
    this.fileSubject.subscribe((v) => {
      console.log('received value from fileSubject - ', v);
    });
  }
  callSavePropertyWebService(inputData: any): void {
    this.WS.uploadMultipleFile('import/location/save', inputData.filedata, {
      inputData: inputData.tJSON,
      filelength: inputData.filelength,
      indexNo: inputData.indexNo,
    }).subscribe((res: any) => {
      // console.log(inputData.indexNo);
      // console.log(res);
      this.saveResponse.next(JSON.parse(res));
    });
  }
  public formatDateTime(date: Date): string {
    const d = new Date(date);
    return `${d.getDate()}-${this.months[d.getMonth()]}-${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
  }


}
function getFormattedMonth(month: any) {
  const months: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[month - 1];
}

function formatTime(hour: any, minutes: any) {
  const amPm: string = hour >= 12 ? 'PM' : 'AM';
  const formattedHour: number = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinutes: string = minutes.toString().padStart(2, '0');
  return `${formattedHour}:${formattedMinutes} ${amPm}`;
}
