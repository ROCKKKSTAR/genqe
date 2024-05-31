import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ALERT_RESPONSE, IAlert } from './alert.interface';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.css']
})
export class AlertModalComponent implements OnInit {
  public resConfirm: ALERT_RESPONSE;
  public resConfirmred:ALERT_RESPONSE;
  public resCancel: ALERT_RESPONSE;
  public resDeny: ALERT_RESPONSE;
  public resUndef: ALERT_RESPONSE = ALERT_RESPONSE.UNDEF;
  public textColor: string = 'black';
  constructor(@Inject(MAT_DIALOG_DATA) public data: IAlert, private dlgRef: MatDialogRef<AlertModalComponent>) {
  }

  ngOnInit(): void {
    this.resCancel = this.data.labelCancel ? ALERT_RESPONSE.CANCEL : ALERT_RESPONSE.UNDEF;
    this.resConfirm = this.data.labelConfirm ? ALERT_RESPONSE.CONFIRM : ALERT_RESPONSE.UNDEF;
    this.resConfirmred = this.data.labelConfirmRed ? ALERT_RESPONSE.CONFIRM : ALERT_RESPONSE.UNDEF;
    this.resDeny = this.data.labelDeny ? ALERT_RESPONSE.DENY : ALERT_RESPONSE.UNDEF;
    this.textColor = this.data.textColor ? this.data.textColor : 'black';
  }
  public onClose(response: ALERT_RESPONSE): void {
    this.dlgRef.close(response);
  }

}
