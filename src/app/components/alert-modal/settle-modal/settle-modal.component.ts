import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { IShift } from 'src/app/models/globalSetting.interface';
import { ILanguage } from 'src/app/models/language.interface';
import { ILounge } from 'src/app/models/lounge.interface';
import { IOrder } from 'src/app/models/order.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { AlertModalComponent } from '../alert-modal.component';

interface ISettlementRecord{
  _id: string;
  isSelected: boolean;
  invoiceNo: string;
  method: string;
  currency: string;
  referenceNo: string;
  amount: number;
  createdOn: string;
}
@Component({
  selector: 'app-settle-modal',
  templateUrl: './settle-modal.component.html',
  styleUrls: ['./settle-modal.component.css']
})
export class SettleModalComponent implements OnInit {
  public data: ILanguage;
  private languageSubscription: Subscription = null;
  private userSub: Subscription = null;
  public displayCol = ['select', 'invoiceNum', 'method', 'amount', 'referenceNo', 'createdOn'];
  public dataSource: MatTableDataSource<ISettlementRecord> = new MatTableDataSource([]);
  public paginator: MatPaginator;
  public totalAmount = {};
  public totalOrdersID = [];
  public allUsers: { _id: string; name: string }[] = [];
  public authenticatedUser: IUser;
  public confirmationLoader = false;
  public confirmationLoadermessage = '';
  public todayDate = new Date().toISOString().substring(0, 10);
  public startTimeAR = '00:00';
  public endTimeAR = '23:59';
  public outletShift: IShift[] = []
  public shiftpos = ''
  public currentLoung: ILounge;
  private loungeSub: Subscription;
  public OutletPos = ''
  upData: ISettlementRecord[];
  constructor(
    private WS: WebService,
    private toastr: ToastrService,
    private common: CommonServiceService,
    private auth: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe(user => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.fetchUsers();
    // this.fetchTodayUnsettled();

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
  }

  public getShiftTime(): void {
    this.WS.post('api/master/report/fetchShift', { OutletID: this.currentLoung._id })
      .subscribe(
        (res: IResponse) => {

          if (res.status === 1) {
            if (res.result.outletShifts.length > 0) {
              this.outletShift = res.result.outletShifts
              this.shiftpos = res.result.outletShifts[3].shiftName
              console.log(' this.outletShift', this.outletShift)
            }
          } else {
            this.toastr.info(res.description);
          }
        }
      );
  }


  public onChangeSetShiftTime(): void {
    console.log('this.shiftpos', this.shiftpos)
    if (this.outletShift.length > 0) {
      let getShiftTiming = this.outletShift.find(a => a.shiftName === this.shiftpos);

      this.startTimeAR = getShiftTiming.openingTime
      this.endTimeAR = getShiftTiming.closingTime



      console.log('getShiftTiming', getShiftTiming)
    }


  }
  public changeLanguage(lang): void {
    this.data = this.common.getLanguageData(lang);
  }

  public toggleSelectAll(checked: boolean): void {
    const data = this.dataSource.data;
    data.forEach(row => row.isSelected = checked)
  }

  private fetchUsers(): void {
    this.allUsers = [];
    this.WS.post('api/master/report/user/name/fetchselect2', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.allUsers = res.result.users;
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }

  public generatePdf_settlement(auth,userID, fromDate, toDate, fromTime, toTime): void {
     
    this.confirmationLoader = true;
    this.confirmationLoadermessage = 'Downloading letter of unsettlement...';
    this.common.generatePDFForSettlement(auth,userID, fromDate, toDate, fromTime, toTime).then((respons) => {
      console.log('respons', respons);

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

  public fetchTodayUnsettled(userID, fromDate, toDate, fromTime, toTime): void {
    this.WS.post('api/admission/today/unsettled', {
      userID, fromDate, toDate, fromTime, toTime
    }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.totalAmount = {};
        // res.result.orders.forEach(o => this.totalAmount += o.amount);
        // if (res.result.orders.length) {
        //   this.currency = res.result.orders[0].currency;
        // }
        // this.dataSource = new MatTableDataSource(res.result.orders);
        // this.dataSource.paginator = this.paginator;
        const payments: ISettlementRecord[] = [];
        res.result.payments.map(p => {
          const rec = {
            _id: p.orderID ? p.orderID._id : p.admissionID.orderID._id,
            isSelected: false,
            invoiceNo: p.orderID ? p.orderID.invoiceNo : p.admissionID.orderID.invoiceNo,
            method: p.stripeResponse.mode,
            currency: p.stripeResponse.convertedCurrency ? p.stripeResponse.convertedCurrency : p.stripeResponse.currency,
            amount: p.stripeResponse.convertedAmount ? p.stripeResponse.convertedAmount : p.stripeResponse.amount_subtotal,
            referenceNo: p.stripeResponse.referenceNumber,
            createdOn: p.createdOn
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
        this.dataSource = new MatTableDataSource(payments);
        this.dataSource.paginator = this.paginator;
        this.toastr.success(res.description);
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
        this.totalAmount = {};
        this.dataSource = new MatTableDataSource([]);
      }
      else {
        this.toastr.error(res.description);
      }
    })
  }

  public markSettled(): void {
    const data = this.dataSource.data;
    let orderID = data.filter(row => row.isSelected).map(row => row._id);
    orderID = orderID.filter((item, index) => orderID.indexOf(item) === index);
    if (!orderID.length) {
      this.toastr.info('Select order to mark as settled');
      return;
    }
    this.WS.post('api/admission/mark/settled', { orderID }, 'ADMISSION').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSource = new MatTableDataSource(this.dataSource.data.filter(row => !row.isSelected));
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

  // public closeDialog(): void {
  //   this.dlgRef.close(null);
  // }

}
