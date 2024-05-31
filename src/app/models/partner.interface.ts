import { IEntitlement } from './admission-token.interface';
import { ILounge } from './lounge.interface';
import { IRole, IUser } from './user.interface';

export class IPartner {
    // tslint:disable-next-line: variable-name
    _id: string;
    name?: string;
    tin?: string;
    status?: number;
    // tslint:disable-next-line: variable-name
    type?: number;
    displayType?: string;
    displayName?: string;
    // tslint:disable-next-line: variable-name
    ERP_Number?: string;
    category?: number;
    displayCategory?: string;
    addressLine1?: string;
    addressLine2?: string;
    parentPartnerId?: IPartner[];
    country?: string;
    postalCode?: string;
    region?: number;
    state?: string;
    city?: string;
    entityCode?: string;
    allianceProgram?: number;
    displayAlliance?: number;
    approvalRole?: IRole;
    logoURL?: string;
    organisationId?: number;
    siteId?: number;
    createdOn?: Date;
    createdBy?: IUser | string;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser | string;
    isOnline?: boolean
    localisation?: object;
}

export interface IPartnerContract {

}

export interface IPartnerSettings {
    _id: string,
    lkCode: string
    keyCode: number,
    key1: string
    key2: string,
    key3: string,
    key4: string,
    key5: string,
    description: string,
    createdOn?: Date;
    createdBy?: IUser | string;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser | string;
}

export interface IPartnerEntitlementLink {
    _id: string;
    partnerID: string;
    createdBy: IUser | string;
    lastModifiedOn: Date;
    createdON: Date;
    lastModifiedBy: IUser | string;
    status: number;
    partnerEntitlementID: string;
    entitlementID: IEntitlement | string;
}

export interface ICorporatePartner {
    isChecked?: boolean;
    clientID: string;
    clientName: string;
    needDecodeQRCodeByServer: boolean;
    needCheckExpireDate: boolean;
    needShowCardHolderName: boolean;
    needShowMobileNumber: boolean;
    needShowMemberLevel: boolean;
    needNumberOfGuestFirst: boolean;
    maxNumberOfGuest: number;
    needShowWarning: boolean;
    warningMessage: string;
    backNeedCallCancel: boolean;
    needMagReadCard: boolean;
}

export interface ICorporateToken {
    isChecked?: boolean;
    tokenID: string;
    tokenName: string;
    tokenImage: string;
}