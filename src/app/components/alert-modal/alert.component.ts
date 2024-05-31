import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ALERT_RESPONSE, IAlert} from './alert.interface';
import {map} from 'rxjs/operators';
import {observableToBeFn} from 'rxjs/internal/testing/TestScheduler';
import {Observable} from 'rxjs';
import { AlertModalComponent } from './alert-modal.component';
import { RejectModalComponent } from './reject-modal/reject-modal.component';
import { SettleModalComponent } from './settle-modal/settle-modal.component';
// import { PosPaymentComponent } from '../pos-payment/pos-payment.component';
// import { ChooseOrderComponent } from '../walkin-pos/choose-order/choose-order.component';

@Injectable()
export  class AppAlertComponent {
  constructor(private matDialog: MatDialog) {
  }
  public alertConfirm(alert: IAlert, width: string = '500px'): Observable<ALERT_RESPONSE> {
    return this.matDialog.open(AlertModalComponent, {
      width, data: alert
    }).afterClosed();
  }
  public alertReject(data: any, width: string = '500px'): Observable<ALERT_RESPONSE> {
    return this.matDialog.open(RejectModalComponent, {
      width, data
    }).afterClosed();
  }
  public openSettlementModal(width: string = '500px'): Observable<ALERT_RESPONSE> {
    return this.matDialog.open(SettleModalComponent, {
      width
    }).afterClosed();
  }
  // public openPOSPayment(data: any, width: string = '800px'): Observable<ALERT_RESPONSE> {
  //   return this.matDialog.open(PosPaymentComponent, {
  //     width, data
  //   }).afterClosed();
  // }
  // public openChooseOrder(data: any, width: string = '800px'): Observable<ALERT_RESPONSE> {
  //   return this.matDialog.open(ChooseOrderComponent, {
  //     width, data
  //   }).afterClosed();
  // }
}
