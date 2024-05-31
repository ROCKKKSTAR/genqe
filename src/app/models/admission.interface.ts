import { IAdmissionToken } from "./admission-token.interface";
import { ILounge } from "./lounge.interface";
import { IMember } from "./member.interface";
import { IOrder } from "./order.interface";
import { IPartner, IPartnerContract } from "./partner.interface";
import { IProduct } from "./product.interface";
import { IUser } from "./user.interface";

export class IAdmission {
    _id: string;
    tokenType: number;
    displayTokenType?: string;
    code: string;
    loungeID: ILounge;
    admissionTokenID?: IAdmissionToken;
    admissionID: string;
    partnerID?: IPartner;
    partnerName?: string;
    contractID?: IPartnerContract;
    remarks?: string;
    cancelKeyCode?: number;
    redeemOrderID?: IOrder;
    lmsQuotaRemaining?: number;
    partnerQuotaRemaining?: number;
    lmsQuotaRemainingOn?: Date;
    partnerQuotaRemainingOn?: Date;
    memberID: IMember | string;
    createdOn?: Date;
    createdBy?: IUser;
    cancelledBy?: IUser;
    reEnteredBy?: IUser;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser;
    status?: number;
    displayStatus?: string;
    admissionDate?: string;
    endAdmissionDate?: string;
    guests?: IAdmissionGuest[];
    guestCount?: number;
    isCancellationAllowed?: boolean;
    displayDate?: string;
    loungeName?: string;
    primaryCount?: number;
    accompanyCount?: number;
    childCount?: number;
    receiptNo?: string;
}

export interface IAdmissionEntitlement {
    _id?: string;
    entitlementID?: string;
    admissionID: IAdmission | string;
    productID: IProduct;
    price: number;
    currency?: string;
    quantity?: number;
    quota?: number;
    applicableTo?: number;
    displayApplicableTo?: string;
    usedQty?: number;
}

export interface IAdmissionGuest {
    _id?: string;
    guestType?: number;
    displayGuestType?: string;
    name: string;
    email: string;
    phoneNo: string;
    memberID?: string | IMember;
    docs?: IGuestDocs[];
    entitlementID: string;
}

export interface IGuestDocs {
    type: number;
    admissionGuestID?: string;
    name: string;
    metadata?: any | object;
    file: File
}

export interface IBoadingPass {
    _id?: string;
    admissionID?: string;
    bpString?: string;
    guestID?: IAdmissionGuest,
    fields?: object;
    createdOn?: Date;
    createdBy?: IUser; email: string;
}