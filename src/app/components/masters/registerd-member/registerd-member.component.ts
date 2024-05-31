import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { IResponse } from 'src/app/models/server-data-source.model';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { IUser } from 'src/app/models/user.interface';
import { Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { ILounge } from 'src/app/models/lounge.interface';

@Component({
  selector: 'app-registerd-member',
  templateUrl: './registerd-member.component.html',
  styleUrls: ['./registerd-member.component.css']
})
export class RegisterdMemberComponent implements OnInit {
  @ViewChild('registerMemberPaginator') registerMemberPaginator: MatPaginator;
  @ViewChild('registerMemberSort') registerMemberSort: MatSort;
  @ViewChild('actionHistoryPaginator') actionHistoryPaginator: MatPaginator;
  @ViewChild('actionHistorySort') actionHistorySort: MatSort;
  @ViewChild('closeButton') closeButton: ElementRef;

  public isSidebarOpen = true;
  public loadershow = false;
  public showTableData=true;
  public showCreateMember=false;
  public showMemberBooking=false;
  public showMemberdetails=false;
  public loaderMessage="";
  public simpleSearch='';
  public remarks='';
  public showData:boolean;
  public registerMemberData: IRegisteredMember[] = [];
  public dataSourceRegisteredMembers: MatTableDataSource<IRegisteredMember>;
  public fname="";
  public lname="";  
  public number:any;
  public displayedColumns: string[] = [
    'firstName',
    'lastName',
    'number',
    'email',
    'status',
    'annualEffective date',
    'createdOn',
    'createdBy'
  ];
public dataSourceStatusHistory: MatTableDataSource<any>;
  public displyedActionColumn = [
    'action',
    'remarks',
    'outlet',
    'modifiedOn',
    'modifiedBy',
  ];
  public statusHistory=[];
public authenticatedUser: IUser;
private userSub: Subscription;
private languageSubscription: Subscription = null;
public data: ILanguage;
// create Member
public titles: IGlobalSetting[] = [];
  public title;
  public id:any;
  public firstName:string='';
  public lastName:string='';
  public telePhoneNum:string='';
  public Mememail='';
  public annaualMemEffDate=new Date().toISOString().substring(0, 10);
  public date:any;
  public currencyValue:string='';
  public amount:string=''
  public membershipPlan: IGlobalSetting[] = [];
  public membershipPayment: IGlobalSetting[] = [];
  public corporateType:any[] = []; ;  
   public memberPlan:any;
   public memberPay:any;
   public status:any
   public memberStatus:any
   public memberCorporateType:any
   public memberShipID:any
   public currency:any;
   public AdavFromDate:any;
   public AdavToDate:any;
   public AdvanmemberCorporateType:any
   public advancStatus:any

  //  Member Booking
  public memberBookMemberID:any[]=[];
  public memberbookkMemberType='';
  public memberLounge='';
  public accompanyGuest='';
  public memberBookLounges:any[]=[];
  public memberBookProduct:any[]=[];
  public memberProduct='';
  public memberBookdate=new Date().toISOString().substring(0, 10);
  public memberBookingStatus=1;
  public child="";
  public couponCode="";
  public showSubmitMemberBooking=true
  public showResetMemberBooking=true

  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cs: CommonServiceService,
    private auth: AuthenticationService

  ) { }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.fetchRegisteredMembers();
    this.fetchMemberShipPayment('PAYMENT_METHOD');
    this.fetchMemberShipPlan('MEMBERSHIP_PLAN');
    this.fetchMemberTitle('MEMBER_TITLE');
    this.fetchCorporatetypeAI();
    this.getCurrencyName();
    this.fetchMemberBookingMemberID();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  private fetchMemberShipPlan(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.membershipPlan = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public fetchMemberTitle(lookupCode){
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.titles = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
}
  private fetchMemberShipPayment(lookupCode): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.membershipPayment = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchCorporatetypeAI(): void {
    this.WS.post('api/master/fetch/corporateTypeAi', {
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        console.log(res.result.tokens)
        this.corporateType=res.result.tokens
        this.corporateType.sort((a, b) => a.name.localeCompare(b.name));
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchMemberBookingMemberID(): void {
    this.WS.post('api/master/fetch/memberBookingMemberID', {
    }).subscribe((res: any) => {
      // const res = r.decrypted;
      // console.log(res);
      if (res.status === 1) {
        this.memberBookMemberID=res.result
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
public simpleSearchRegisteredMember(search){
  if(search == ''){
    this.fetchRegisteredMembers()
  }
  this.WS.post('api/master/fetch/simpleSearch/RegisterdMember',{
    search:search
  }).subscribe(
    (res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = false;
        this.registerMemberData=res.result as IRegisteredMember[]
        this.dataSourceRegisteredMembers = new MatTableDataSource(this.registerMemberData);
    this.dataSourceRegisteredMembers.sort = this.registerMemberSort;
    this.dataSourceRegisteredMembers.paginator = this.registerMemberPaginator;
    this.simpleSearch=''
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.simpleSearch=''
        this.loadershow = false;
        this.dataSourceRegisteredMembers = new MatTableDataSource();
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    }
  );

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
public fetchRegisteredMembers(){
  this.loadershow = true;
  this.loaderMessage = 'Fetching...';
  this.WS.post('api/master/fetch/RegisterdMember').subscribe(
    (res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = false;
        this.registerMemberData=res.result as IRegisteredMember[]
        this.dataSourceRegisteredMembers = new MatTableDataSource(this.registerMemberData);
    this.dataSourceRegisteredMembers.sort = this.registerMemberSort;
    this.dataSourceRegisteredMembers.paginator = this.registerMemberPaginator;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    }
  );
}
public getTableClickRegisteredMemberData(id:string){
  this.statusHistory=[];
  this.loadershow=true;
  this.loaderMessage="Fetching data..."
  this.id=id
  this.WS.post('api/master/fetch/RegisterdMemberDetails',{id:id}).subscribe(
    (res: IResponse) => {
       if(res.status==1){
          if(res.result[0].title==0){
            this.title='';
          }else{
            this.title=res.result[0].title
          }          
          this.firstName=res.result[0].firstName;
          this.lastName=res.result[0].lastName;
          this.telePhoneNum=res.result[0].telePhoneNumber;
          this.Mememail=res.result[0].email;
          this.annaualMemEffDate=res.result[0].AnnualMemberEffectiveDate;
          this.date=this.cs.formatDateTime12Hours(res.result[0].AnnualMemberEffectiveDate);
          this.currencyValue=res.result[0].currency;
          this.amount=res.result[0].amount;
          this.memberPay=res.result[0].paymentMethod;
          this.memberCorporateType=res.result[0].tokenID;
          this.memberShipID=res.result[0].memberShipID;
          this.memberStatus=res.result[0].status === 2 ? 'Submitted' : (res.result[0].status === 1 ? 'Approved' :(res.result[0].status === 3 ? 'Rejected' : ''))
          this.status=res.result[0].status
          this.statusHistory=res.result[0].statusHistory
          this.mapActionHistory(this.statusHistory)
          this.loadershow=false;
        this.showTableData=false;              
        this.showMemberdetails=true;
       } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    })

}

public advanceRegisterMemberSearch(){
  this.loadershow=true;
  this.loaderMessage="Fetching.....";
this.WS.post('api/master/fetch/advanceSearch/RegisterdMember',{
  firstName:this.fname,
  lastName:this.lname,
  number:this.number,
  fromDate:this.AdavFromDate,
  toDate:this.AdavToDate,
  tokenID:this.AdvanmemberCorporateType,
  status:this.advancStatus
}).subscribe(
  (res:IResponse)=>{
    if(res.status==1){
      this.loadershow = false;
      this.registerMemberData=res.result as IRegisteredMember[]
      this.dataSourceRegisteredMembers = new MatTableDataSource(this.registerMemberData);
  this.dataSourceRegisteredMembers.sort = this.registerMemberSort;
  this.dataSourceRegisteredMembers.paginator = this.registerMemberPaginator;
  this.showData=false
  this.resetAdvanceSearch()
      this.toastr.success(res.description);
    }else if (res.status === 2) {
      this.loadershow = false;
      this.dataSourceRegisteredMembers = new MatTableDataSource();
      this.showData=false;
      this.resetAdvanceSearch()
      this.toastr.info(res.description);
    } else {
      this.loadershow = false;
      this.toastr.error(res.description);
    }
  }
)
}

public resetAdvanceSearch(){
 this.fname='';
 this.lname='';
 this.number='';
 this.AdavFromDate='';
 this.AdavToDate='';
 this.AdvanmemberCorporateType='',
 this.advancStatus=''
}

public createMember(): void {
  const matchPermission = this.authenticatedUser.permissions.find((l) =>
  Object.keys(l).includes('REGISTERED_MEMBERS')
);
if (matchPermission && matchPermission['REGISTERED_MEMBERS'].includes('CREATE_MEMBER')) {
  this.showTableData=false;
  this.showCreateMember=true;
  this.resetCreateMember();
} else {
 
  this.toastr.info(
    `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
  );
}
}
public hideCreateMemberDetails():void {
  this.showTableData=true;
  this.showCreateMember=false;
  this.fetchRegisteredMembers()
}
public hideMemberDetails():void {
  this.showTableData=true;
  this.showMemberdetails=false;
  this.fetchRegisteredMembers()
}
public submitExistingUser(){
  this.showTableData=true;
  this.showMemberdetails=false;
  this.fetchRegisteredMembers()
}
public submit(){
 
  if(!this.memberCorporateType || this.memberCorporateType==''){
    return this.toastr.info('Please select corporate type');
  }
  if(!this.firstName || this.firstName==''){
    return this.toastr.info('Please enter firstName');
  }
  if(!this.lastName || this.lastName==''){
    return this.toastr.info('Please enter lastName');
  }
  if(!this.telePhoneNum || this.telePhoneNum==''){
    return this.toastr.info('Please enter telephoneNumber');
  }
  if(!this.Mememail ||this.Mememail==''){
     return this.toastr.info('Please enter mail');
  }  
  if (!this.ValidateEmail(this.Mememail)) {
    return this.toastr.info(
       `${
         this.data
           ? this.data.master.user.PleaseEnteraValidemail
           : 'Please Enter a Valid email'
       }`
     );
   }
 
  if(!this.memberShipID || this.memberShipID==''){
    return this.toastr.info('Please enter membershipId');
  }
  this.WS.post('api/master/submit/loungeMemberRegistrationDetails', { 
    memberCorporateType:this.memberCorporateType,
    titile:this.title,
    firstName:this.firstName,
    lastName:this.lastName,
    number:this.telePhoneNum,
    email:this.Mememail,
    annualMemEffDate:this.annaualMemEffDate,
    membershipPlan:this.memberPlan,   
    currency:this.currencyValue,
    amount:this.amount,
    memberShipID:this.memberShipID,
    paymentMethod:this.memberPay
   }).subscribe((res: any) => {
    if (res.status === 1) {
      // if(res.result.status==2){
      //   this.memberStatus='Submitted'
      // }
      this.showTableData=true;
      this.showCreateMember=false;
      this.resetCreateMember()
      this.fetchRegisteredMembers()
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
public createMemberID(){
  this.WS.post('api/master/member/createMemberID',{}).subscribe((res: IResponse) => {
    if (res.status === 1) {
      this.memberShipID=res.result;
      this.toastr.success(res.description);
    } else {
      this.toastr.error(res.description);
    }
  });
}
private getCurrencyName(){
  this.WS.post('api/master/member/getCurrency',{}).subscribe((res: IResponse) => {
    if (res.status === 1) {
      this.currency=res.result;
    } else {
      this.toastr.error(res.description);
    }
  });
}
public resetCreateMember(){
  this.title='';
  this.firstName='';
  this.lastName='';
  this.telePhoneNum='';
  this.Mememail=''
  this.annaualMemEffDate=new Date().toISOString().substring(0, 10);
  this.memberPlan=''
  this.currencyValue='';
  this.amount='';
  this.memberPay='';
  this.memberCorporateType='';
  this.memberShipID='';
  this.status='';
}
public ValidateEmail(mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  } else {
    return false;
  }
}

public memberBooking(): void {
  const matchPermission = this.authenticatedUser.permissions.find((l) =>
  Object.keys(l).includes('REGISTERED_MEMBERS')
);
if (matchPermission && matchPermission['REGISTERED_MEMBERS'].includes('MEMBER_BOOKING')) {

  this.showTableData=false;
  this.showCreateMember=false;
  this.showMemberBooking=true;
  this.memberbookkMemberType='';
  this.memberProduct='';
   this.memberLounge='';
   this.memberBookdate=new Date().toISOString().substring(0, 10);
   this.showSubmitMemberBooking=true;
  this.showResetMemberBooking=true;
  this.memberBookingStatus=1;
  this.couponCode='';
  this.accompanyGuest='';
  this.child=''
} else {
 
  this.toastr.info(
    `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
  );
}
}
public hideBookMemberDetails():void{
  this.showTableData=true;
  this.showCreateMember=false;
  this.showMemberBooking=false;
  this.showSubmitMemberBooking=true;
  this.showResetMemberBooking=true;
  this.memberBookingStatus==1;
}
public rejectCreateMember(){
this.WS.post('api/master/loungeMember/reject',{id:this.id,remarks:this.remarks}).subscribe((res:IResponse)=>{
  if(res.status==1){    
    this.status=res.result.status;
    this.closeButton.nativeElement.click();
    this.toastr.success(res.description);
  } else if (res.status === 2) {
    this.toastr.info(res.description);
  }
  else {
    this.toastr.error(res.description);
  }
})
}
public actionHistory(){
  this.statusHistory=[]
  this.WS.post('api/master/loungeMember/actionHistory',{id:this.id}).subscribe((res:IResponse)=>{
    if(res.status==1){    
      this.statusHistory = res.result[0].statusHistory;
      this.mapActionHistory(this.statusHistory);
    } else if (res.status === 2) {
      this.toastr.info(res.description);
    }
    else {
      this.toastr.error(res.description);
    }
  })
}
public mapActionHistory(data): void {
  this.dataSourceStatusHistory = new MatTableDataSource(data);
  this.dataSourceStatusHistory.sort = this.actionHistorySort;
  this.dataSourceStatusHistory.paginator = this.actionHistoryPaginator;
}
public approveCreateMember(){
  this.WS.post('api/master/loungeMember/voucher/save',{
    admissionTokenID:this.memberCorporateType,
    memberShipID:this.memberShipID,
    id:this.id,
    startDate:this.annaualMemEffDate
  }).subscribe((res:IResponse)=>{
    if(res.status==1){
      this.showMemberdetails=false;
      this.showTableData=true;
      this.fetchRegisteredMembers();
      this.toastr.success(res.description);
    } else if (res.status === 2) {
      this.toastr.info(res.description);
    }
    else {
      this.toastr.error(res.description);
    }
  })
}
public validateMemberID(){
  if(!this.memberbookkMemberType && this.memberbookkMemberType==''){
    return this.toastr.info('Please Enter Membership ID');
  }
  this.WS.post('api/master/validate/memberShipID',{memerShipID:this.memberbookkMemberType}).subscribe((res:IResponse)=>{
    if(res.status==1){
       this.memberBookingStatus=2;
       this.memberAIDetails(this.memberbookkMemberType)
       this.toastr.success(res.description);
    } else if (res.status === 2) {
      this.toastr.info(res.description);
    }
    else {
      this.toastr.error(res.description);
    }
  })
}
public memberAIDetails(_id){
  // this.memberbookkMemberType='';
  this.memberBookLounges=[]
   this.memberBookProduct=[]
this.WS.post('api/master/fetch/loungeMemberRegistrationTokenDetails',{tokenId:_id}).subscribe((res:IResponse)=>{
  if(res.status==1){
     this.memberBookLounges=res.result.loungeIDs
     this.memberBookProduct=res.result.products;
  } else if (res.status === 2) {
    this.toastr.info(res.description);
  }
  else {
    this.toastr.error(res.description);
  }
})
}
public resetMemberBooking(){
  this.memberbookkMemberType='';
  this.memberBookingStatus=1;
  this.memberProduct='';
   this.memberLounge='';
   this.accompanyGuest='';
   this.child='';
   this.memberBookdate=new Date().toISOString().substring(0, 10);
   this.memberBookLounges=[]
   this.memberBookProduct=[]
}

public submitMemberBooking(){
  if(this.memberBookingStatus==1){
    return this.toastr.info('Please Validate Membership ID');
  }
this.WS.post('api/booking/preRegisterLoungeBooking',{
  membershipId:this.memberbookkMemberType,
  lounge:this.memberLounge,
  startDate:this.memberBookdate,
  adultCount:this.accompanyGuest,
  childCount:this.child,
  productSku:this.memberProduct,
  token:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWRpc0F1dGhDb250YWluZXIiOiIxZGJjYmMzZi1kOGU2LTRkMDItODJhMS1lNDBiMWFjZDY2OTIiLCJpYXQiOjE3MDc5NzQwODAsImV4cCI6MTcwODAyODA4MH0.nFx1ZfKxCuFUc0JfzJ-9KAGeVXQl9pBjdbi56xvI7sY'
}).subscribe((res:IResponse)=>{
  if(res.status==1){
    this.couponCode=res.result.data.bookingId;
    this.showResetMemberBooking=false;
    this.showSubmitMemberBooking=false;
    this.toastr.success(res.description);
  }else if(res.status==2){
    this.showResetMemberBooking=true;
    this.showSubmitMemberBooking=true;
    this.toastr.info(res.description);
  }else{
    this.toastr.error(res.description);
  }
})
}
}
export class IRegisteredMember {
  firstName: string;
  lastName?: string;
  number?: number;
  email?: string;
  status?:number;
  annualEffectiveDate?: string;
  createdon?: string;
  createdBy?: string;
  }

