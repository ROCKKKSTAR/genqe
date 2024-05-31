export enum ALERT_RESPONSE {
    UNDEF,
    CONFIRM,
    DENY,
    CANCEL,
}

export interface IAlert {
    title: string;
    message: string;
    labelConfirm?: string;
    labelConfirmRed?:string;
    labelDeny?: string;
    labelCancel?: string;
    response?: ALERT_RESPONSE;   // 0 - Cancel, 1- Confirm, 2 - Deny
    textColor?: string;
}
