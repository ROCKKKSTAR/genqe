import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { WebService } from 'src/app/services/web.service';
import { threadId } from 'worker_threads';
import { AlertModalComponent } from '../alert-modal.component';

@Component({
  selector: 'app-reject-modal',
  templateUrl: './reject-modal.component.html',
  styleUrls: ['./reject-modal.component.css']
})
export class RejectModalComponent implements OnInit {
  public rejectReasons: IGlobalSetting[] = [];
  public rejectionData = {
    reason: 0,
    stringReason: '',
    comment: ''
  };
  public isExtend = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private WS: WebService,
    private toastr: ToastrService,
    private dlgRef: MatDialogRef<AlertModalComponent>) { }

  ngOnInit(): void {
    console.log(this.data)
    if (this.data.type) {
      if (this.data.type === 'TOKEN') {
        this.fetchRejectReason('TOKEN_REJECT_REASON');
      }
      else if (this.data.type === 'ADMISSION') {
        this.fetchRejectReason('ADMISSION_CANCEL_REASON');
      }
      else if (this.data.type === 'ADMISSION_REENTER') {
        this.fetchRejectReason('REENTER_REASON');
      }
      else if (this.data.type === 'BLACKLIST_TOKEN') {
        this.fetchBlacklistReason('BLACKLIST_REASON');
      }
      else if (this.data.type === 'REFUND') {
        this.fetchRejectReason('REFUND_REASON');
      } else if (this.data.type === 'CONTRACT') {
        if (this.data.labelReject === 'Deactive') {
          this.fetchRejectReason('CONTRACT_DEACT');
        } else if (this.data.labelReject === 'Activate') {
          this.fetchRejectReason('CONTRACT_ACT');
        } else {
          this.fetchContractExtendReasons('CONTRACT_EXTEND');
          this.rejectionData.comment = this.data.date;
          this.isExtend = true;
        }
      } else if (this.data.type === 'TOKEN_CONTRACT') {
        if (this.data.labelReject === 'Deactive') {
          this.fetchRejectReason('TOKEN_CONTRACT_DEACT');
        } else {
          this.fetchRejectReason('TOKEN_CONTRACT_ACT');
        }
      }
    }
  }

  private fetchBlacklistReason(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', { lookupCode }).subscribe((res: any) => {
      // const res = r.decrypted;
      if (res.status === 1) {
        this.rejectReasons = res.result.values as IGlobalSetting[];
        if (this.data.mode === 'INPUT') {
          if (this.rejectReasons.length) {
            this.rejectionData.reason = this.rejectReasons[0].keyCode;
          }
        }
        else {
          this.rejectionData = {
            stringReason: '',
            reason: this.data.data.reason,
            comment: this.data.data.comment
          };
        }
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchContractExtendReasons(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', { lookupCode }).subscribe((res: any) => {
      console.log(res);
      if (res.status === 1) {
        this.rejectReasons = res.result.values as IGlobalSetting[];
        if (this.data.mode === 'INPUT') {
          if (this.rejectReasons.length) {
            this.rejectionData.stringReason = this.rejectReasons[0].key1;
          }
        }
        else {
          this.rejectionData = {
            stringReason: this.data.data.reason,
            reason: this.data.data.reason,
            comment: this.data.data.comment
          };
        }
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchRejectReason(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', { lookupCode }).subscribe((res: any) => {
      // const res = r.decrypted;
      console.log(res);
      if (res.status === 1) {
        this.rejectReasons = res.result.values as IGlobalSetting[];
        if (this.data.mode === 'INPUT') {
          if (this.rejectReasons.length) {
            // this.rejectionData.reason = this.rejectReasons[0].key1;
          }
        }
        else {
          this.rejectionData = {
            stringReason: '',
            reason: this.data.data.reason,
            comment: this.data.data.comment
          };
        }
      }
      else if (res.status === 2) {
        this.toastr.info(res.description);
      }
      else {
        this.toastr.error(res.description);
      }
    });
  }

  public cancelReject(): void {
    this.dlgRef.close(null);
  }

  public reject(): void {
    if (this.rejectionData.stringReason === '' && this.data.labelReject === 'Change End Date') {
      this.toastr.info('Select valid reason');
      return;
    }
    if (this.rejectionData.reason === 0 && !this.isExtend) {
      this.toastr.info('Select rejection/cancellation reason');
      return;
    }
    if (this.rejectionData.comment === '' && this.data.labelReject === 'Change End Date') {
      this.toastr.info('Enter Contract New End Date');
      return;
    }
    if (this.rejectionData.comment === '') {
      this.toastr.info('Enter rejection/cancellation comment');
      return;
    }
    this.dlgRef.close(this.rejectionData);
  }

  public getReasonValue(dataType: string, key1: string, keycode: string): string {
    return dataType === 'CONTRACT' || dataType === 'TOKEN_CONTRACT' ? key1 : keycode;
  }

}
