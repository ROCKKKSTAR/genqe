import { Component, OnInit,  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IGlobalSetting, IShift } from 'src/app/models/globalSetting.interface';
import { ILanguage } from 'src/app/models/language.interface';
import { ILounge } from 'src/app/models/lounge.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { AlertModalComponent } from '../alert-modal.component';

interface ISettlementRecord{
  _id: string;
  invoiceNo: string;
  createdOn:any;
  method: string;
  settlementID:string;
  settledOn:any;
  admissionDoneBy:string;
  referenceNo: string;
  currency: number;
  settledname:string;
  amount:string;
}

interface IUnSettlementRecord{
  _id: string;
  isSelected: boolean;
  invoiceNo: string;
  method: string;
  currency: string;
  referenceNo: string;
  amount: number;
  createdOn: any;
}

@Component({
  selector: 'app-show-settle-modal',
  templateUrl: './show-settle-modal.component.html',
  styleUrls: ['./show-settle-modal.component.css']
})
export class ShowSettleModalComponent implements OnInit {
  @ViewChild('settleSort') settledSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  public data: ILanguage;
  private userSub: Subscription = null;
  public shiftpos = ''
  public selectComponent=''
  public selectNameCollect=''
  public selectNameSettle=''
  public settle=true
  public showSettle=false
  public startTimeAR = '00:00';
  public endTimeAR = '23:59';
  public currentLoung: ILounge;
  public todayDate = new Date().toISOString().substring(0, 10);
  public toDate = new Date().toISOString().substring(0, 10);
  public settlefromDate = new Date().toISOString().substring(0, 10);
  public settletoDate = new Date().toISOString().substring(0, 10);

  public totalOrdersID = [];
  public totalOrdersIDForSettle = [];

  public totalAmount = {};
  public totalAmountForSettle = {};
  public count=[]
  public countUnsettle=[]
  // public paginator: MatPaginator;
  public settledData:ISettlementRecord[]=[]
  public disable=true
  public inputValue="ALL"
  public confirmationLoader = false;
  public confirmationLoadermessage = '';
  public settlementRecords: IGlobalSetting[] = [];
  public name=''
  public allUsers: { _id: string; name: string }[] = [];
  public authenticatedUser: IUser;
  public outletShift: IShift[] = []
  private languageSubscription: Subscription = null;
  private loungeSub: Subscription;
  public OutletPos = ''
  public genSettleReport=false;
  public genUnSettleReport=false
  public dataSource: MatTableDataSource<ISettlementRecord> = new MatTableDataSource([]);
  public dataSources: MatTableDataSource<IUnSettlementRecord> = new MatTableDataSource([]);
  public displayCol2 = ['select', 'invoiceNum', 'method', 'amount', 'referenceNo', 'createdOn'];
  public displayCol = ['invoiceNum', 'method', 'amount','settlementID','settledOn','SettledBy',"collectionDoneBy","collectionDoneOn"];
  // public displayCol = ['invoiceNum', 'method', 'amount','settlementID', 'referenceNo', 'createdOn','settledOn','SettledBy',"collectionDoneBy","collectionDoneOn"];
  public Unsettle="Unsettle"

  public selectingSettleData=''
  constructor(
    private auth: AuthenticationService,
    private WS: WebService,
    private toastr: ToastrService,
    private common: CommonServiceService,
    // private dlgRef: MatDialogRef<AlertModalComponent>,
    private router: Router

  ) { }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe(user => {
      if (user) {
        this.authenticatedUser = user;
      }
    this.fetchUsers()
    });
    this.fetchSettlements('SETTLEMENT_TYPE')
    setTimeout(() => {
      this.languageSubscription = this.common._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.loungeSub = this.auth.currentLounge.subscribe(lounge => {
      if (lounge) {
        this.currentLoung = lounge;
        this.OutletPos = this.currentLoung.name
        this.getShiftTime()
      }
    });
    this.selectNameSettle=this.authenticatedUser._id
  }


  public getShiftTime(): void {
    this.WS.post('api/master/report/fetchShift', { OutletID: this.currentLoung._id })
      .subscribe(
        (res: IResponse) => {

          if (res.status === 1) {
            if (res.result.outletShifts.length > 0) {
              this.outletShift = res.result.outletShifts
              this.shiftpos = res.result.outletShifts[3].shiftName
            }
          } else {
            this.toastr.info(res.description);
          }
        }
      );
  }
  private fetchSettlements(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.settlementRecords = res.result.values as IGlobalSetting[];
       this.selectingSettleData=res.result.values[1].key1
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  private fetchUsers(): void {
    this.allUsers = [];
    this.WS.post('api/master/report/user/name/fetchselect2', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.allUsers = res.result.users;        
        let item={_id:"ALL",name:"ALL"}
        this.allUsers.unshift(item)
        this.selectNameCollect=this.allUsers[0]._id
        this.selectNameSettle=this.allUsers[0]._id

      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }
  public onChangeSetShiftTime(): void {
    if (this.outletShift.length > 0) {
      let getShiftTiming = this.outletShift.find(a => a.shiftName === this.shiftpos);
      this.startTimeAR = getShiftTiming.openingTime
      this.endTimeAR = getShiftTiming.closingTime
    }       
  }
  public selctDataForRecrods(selectComponent:string):void{
     if(selectComponent=="Settled"){
         this.showSettle=true
         this.settle=false
         this.selectNameCollect=this.allUsers[0]._id
         this.selectNameSettle=this.allUsers[0]._id
         this.shiftpos =this.outletShift[3].shiftName
         this.todayDate = new Date().toISOString().substring(0, 10);
         this.toDate = new Date().toISOString().substring(0, 10);
         this.settlefromDate = new Date().toISOString().substring(0, 10);
         this.settletoDate = new Date().toISOString().substring(0, 10);
         this.startTimeAR = '00:00';
         this.endTimeAR = '23:59';
         this.dataSource = new MatTableDataSource([]);
         this.count=[]
        this.genSettleReport=false
        this.totalOrdersIDForSettle=this.count
        this.totalAmountForSettle = {};
        this.genUnSettleReport=false

     }else if(selectComponent=="Unsettled"){
      this.showSettle=false
      this.settle=true
      this.selectNameCollect=this.allUsers[0]._id
      this.shiftpos =this.outletShift[3].shiftName
      this.todayDate = new Date().toISOString().substring(0, 10);
      this.toDate = new Date().toISOString().substring(0, 10);
      this.startTimeAR = '00:00';
      this.endTimeAR = '23:59';
      this.dataSources = new MatTableDataSource([]);
       this.countUnsettle=[]
       this.totalOrdersID=this.countUnsettle
       this.totalAmount={}
       this.genUnSettleReport=false
     }
  }
  public changeLanguage(lang): void {
    this.data = this.common.getLanguageData(lang);
  }

public resetSettle(){
  this.selectNameCollect=this.allUsers[0]._id
  this.selectNameSettle=this.allUsers[0]._id
  this.shiftpos =this.outletShift[3].shiftName
  this.todayDate = new Date().toISOString().substring(0, 10);
  this.toDate = new Date().toISOString().substring(0, 10);
  this.settlefromDate = new Date().toISOString().substring(0, 10);
  this.settletoDate = new Date().toISOString().substring(0, 10);
  this.startTimeAR = '00:00';
  this.endTimeAR = '23:59';
  this.dataSource = new MatTableDataSource([]);
  this.count=[]
  this.genSettleReport=false
  this.totalOrdersIDForSettle=this.count
  this.totalAmountForSettle = {};
}
public resetUnSettle(){
  this.selectNameCollect=this.allUsers[0]._id
  this.shiftpos =this.outletShift[3].shiftName
  this.todayDate = new Date().toISOString().substring(0, 10);
  this.toDate = new Date().toISOString().substring(0, 10);
  this.startTimeAR = '00:00';
  this.endTimeAR = '23:59';
  this.dataSources = new MatTableDataSource([]);
  this.countUnsettle=[]
  this.totalOrdersID=this.countUnsettle
  this.totalAmount={}
  this.genUnSettleReport=false
}
  public fetchTodaysettled(collectedby,settleuser,shift,fromTime, toTime,CfromDate, CtoDate,SfromDate, StoDate): void {
    let FromdateAR = CfromDate + 'T' + this.startTimeAR + ':00.00Z'
    let TodateAR = CtoDate + 'T' + this.endTimeAR + ':00.00Z'
    // let SFromdateAR = SfromDate + 'T' + this.startTimeAR + ':00.00Z'
    // let STodateAR = StoDate + 'T' + this.endTimeAR + ':00.00Z'
    let SFromdateAR = SfromDate + 'T00:00:00.00Z'
    let STodateAR = StoDate + 'T23:59:00.00Z'

    var loungeId = this.currentLoung._id
      this.totalAmountForSettle = {};
      this.count=[]
      this.WS.post('api/master/today/settled', {
      LoungeId: loungeId,collectedby,settleuser,shift, fromDate:FromdateAR, toDate:TodateAR,SfromDate:SFromdateAR, StoDate:STodateAR, fromTime, toTime
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.settledData=res.result.resultArray as ISettlementRecord[]
        this.settledData.map((p)=>{
          p.invoiceNo=p.invoiceNo,
            p.method= p.method,
            p.settlementID= p.settlementID,
            p.currency= p.currency
            p.referenceNo=p.referenceNo,
            p.admissionDoneBy=p.admissionDoneBy,
            p.amount=p.amount
            if (p.settledOn) {
              p.settledOn = this.common.formatDateTime(new Date(p.settledOn))
            }
            if(p.createdOn){
              p.createdOn=this.common.formatDateTime(new Date(p.createdOn))

            } 
            if (!this.totalOrdersIDForSettle.includes(p.invoiceNo)){
              this.count.push(p.invoiceNo)
              this.totalOrdersIDForSettle=this.count 
            }
            if (!this.totalAmountForSettle[p.currency]) {
              this.totalAmountForSettle[p.currency] = 0;
            }
            this.totalAmountForSettle[p.currency] += p.amount;
        })      
        this.dataSource = new MatTableDataSource(this.settledData);
        this.dataSource.sort=this.settledSort
        this.dataSource.paginator = this.paginator;
        this.toastr.success(res.description);
        this.genSettleReport=true
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
        this.count=[]
        this.genSettleReport=false
        this.totalOrdersIDForSettle=this.count
        this.dataSource = new MatTableDataSource([]);
      }
      else {
        this.toastr.error(res.description);
      }
    })
  }
  // public closeDialog(): void {
  //   this.dlgRef.close(null);
  // }
  public toggleSelectAll(checked: boolean): void {
    const data = this.dataSources.data;
    data.forEach(row => row.isSelected = checked)
  }

  public fetchTodayUnsettled(userID,shift, fromDate, toDate, fromTime, toTime): void {
    this.countUnsettle=[]
    this.totalAmount = {};
    this.WS.post('api/admission/today/unsettled', {
      userID,shift, fromDate, toDate, fromTime, toTime
    }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        const payments: IUnSettlementRecord[] = [];
        res.result.payments.map(p => {
          const rec = {
            _id: p.orderID ? p.orderID._id : p.admissionID.orderID._id,
            isSelected: false,
            invoiceNo: p.orderID ? p.orderID.invoiceNo : p.admissionID.orderID.invoiceNo,
            method: p.stripeResponse.mode,
            // currency: p.stripeResponse.convertedCurrency ? p.stripeResponse.convertedCurrency : p.stripeResponse.currency,
            // amount: p.stripeResponse.convertedAmount ? p.stripeResponse.convertedAmount : p.stripeResponse.amount_subtotal,
            currency:p.stripeResponse.currency,
            amount:p.stripeResponse.amount_subtotal,
            referenceNo: p.stripeResponse.referenceNumber,
            createdOn: p.createdOn
          };
          payments.push(rec)
          if (!this.totalOrdersID.includes(rec._id)) {
            this.countUnsettle.push(rec._id)
            this.totalOrdersID=this.countUnsettle
          }
          if (!this.totalAmount[rec.currency]) {
            this.totalAmount[rec.currency] = 0;
          }
          this.totalAmount[rec.currency] += rec.amount;
        });
        this.dataSources = new MatTableDataSource(payments);
        this.dataSources.paginator = this.paginator;
        this.toastr.success(res.description);
        this.genUnSettleReport=true
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
        this.totalAmount = {};
        this.dataSources = new MatTableDataSource([]);
        this.genUnSettleReport=false
      }
      else {
        this.toastr.error(res.description);
      }
    })
  }
  public generatePdf_Showsettlement(auth,collectedby,settleUser,shift, fromDate, toDate,SfromDate,StoDate, fromTime, toTime): void {
      
    this.confirmationLoader = true;
    this.confirmationLoadermessage = 'Downloading letter of unsettlement...';
    var LoungeId = this.currentLoung._id
    let cfrom=fromDate
    let cto=toDate
    let sfrom=SfromDate
    let sto=StoDate
    fromDate = fromDate + 'T' + this.startTimeAR + ':00.00Z'
    toDate = toDate + 'T' + this.endTimeAR + ':00.00Z'
    SfromDate = SfromDate + 'T' + this.startTimeAR + ':00.00Z'
    StoDate = StoDate + 'T' + this.endTimeAR + ':00.00Z'
    this.common.generatePDFForShowSettlement(LoungeId,auth,collectedby,settleUser,shift, fromDate, toDate,SfromDate, StoDate, fromTime, toTime,cfrom,cto,sfrom,sto
      ).then((respons) => {
      if (respons === true) {
        this.confirmationLoader = false;
        this.toastr.success(
          `${this.data
            ? this.data.master.admissionToken.downloadedSuccessfully
            : 'Downloaded successfully'
          }`
        );
      } else if (respons === false) {
        this.confirmationLoader = false;
        this.toastr.info(
          'Required data not Found'
        );
        return;
      }
    });
  }
  public generatePdf_settlement(auth,userID, fromDate, toDate, fromTime, toTime): void {
     
    this.confirmationLoader = true;
    this.confirmationLoadermessage = 'Downloading letter of unsettlement...';
    this.common.generatePDFForSettlement(auth,userID, fromDate, toDate, fromTime, toTime).then((respons) => {
      if (respons === true) {
        this.confirmationLoader = false;
        this.toastr.success(
          `${this.data
            ? this.data.master.admissionToken.downloadedSuccessfully
            : 'Downloaded successfully'
          }`
        );
      } else if (respons === false) {
        this.confirmationLoader = false;
        this.toastr.info(
          'Required data not Found'
        );
        return;
      }
    });
  }
  public markSettled(): void {
    const data = this.dataSources.data;
    let orderID = data.filter(row => row.isSelected).map(row => row._id);
    orderID = orderID.filter((item, index) => orderID.indexOf(item) === index);
    if (!orderID.length) {
      this.toastr.info('Select order to mark as settled');
      return;
    }
    this.WS.post('api/admission/mark/settled', { orderID }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSources = new MatTableDataSource(this.dataSources.data.filter(row => !row.isSelected));
        this.toastr.success(res.description);
        // this.closeDialog();
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    })
  }
}
