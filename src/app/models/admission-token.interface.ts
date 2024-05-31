import { ILounge } from "./lounge.interface";
import { IPartner } from "./partner.interface";
import { IProduct } from "./product.interface";
import { IUser } from "./user.interface";

export class IAdmissionToken {
    _id: string;
    name: string;
    shortCode: string;
    type?: number;
    displayType?: string;
    partnerID?: IPartner;
    partnerName?: string;
    isPartnerOnline?: boolean;
    category?: number;
    displayCategory?: string;
    color?: string;
    validation?: number;
    status?: number;
    displayStatus?: string;
    samples?: string[];
    tokenIdentification?: IMaskPattern[];
    documents?: number[];
    identifiedBy?: number[];
    rejection?: {
        reason: number;
        comment: string;
    };
    localisation?: object;
    refreshDate?: number;
    refreshMonth?: number;
    tnc?: string;
    organisationId?: number;
    siteId?: number;
    createdOn?: Date;
    createdBy?: IUser;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser;
    quotaType?: number;
    notes?: string;
}

export class IMaskPattern {
    _id: string;
    issuingCountry?: string;
    issuingLanguage?: string;
    baseCurrency?: string;
    digits?: number;
    mask?: string;
    startBIN?: string;
    endBIN?: string;
    airlineCode?: string;
    travelClass?: string;
    ruleSequence?: number;
    reportMask?: string;
    loungeEntitlements?: ILoungeEntitlement[];
}

export class ITokenCode {
    _id: string;
    code: string;
    expiry: Date;
    createdOn: Date;
    createdBy: IUser;
    status: number;
    usedOn?: Date;
}

export class IVoucherLog {
    _id: string;
    tokenID: string;
    contains: string;
    partnerName: string;
    startDate: Date;
    endDate: Date;
    createdOn: Date;
    createdBy: IUser;
    status: number;
    imported?: boolean;
    qrCount?: number;
    IsExpire: string;
    title: string;
}

export class ILoungeEntitlement {
    _id: string;
    maskPatternID: string | IMaskPattern;
    loungeID: ILounge;
    entitlements: IEntitlement[];
}

export class IEntitlement {
    _id: string;
    applicableTo: number;
    displayApplicableTo?: string;
    product: IProduct;
    quantity: number;
    quota: number;
    within: number;
    withinPriority: number;
    displayWithin?: string;
    fallbackProduct: IProduct;
    discountType: number;
    displayDiscountType?: string;
    discountedPrice: number;
    currency: string;
    partnerEntitlementID?: string;
    remark?: string;
    showForm?: boolean;
}
export class IAdmissionTokenImport {

}
