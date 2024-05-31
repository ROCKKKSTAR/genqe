import { StringMapWithRename } from '@angular/compiler/src/compiler_facade_interface';
import { IAdmissionToken } from './admission-token.interface';
import { IPartner } from './partner.interface';
import { IUser } from './user.interface';
import { IProduct } from './product.interface';
import { ILounge } from './lounge.interface';

export interface IPartnerContract {
    _id?: '';
    token?: IAdmissionToken[];
    partnerId?: string;
    displayType?: string;
    contractType?: number;
    name?: string;
    tin?: string;
    type?: number;
    isActive?: boolean;
    displayContract?: string;
    contractStart?: string;
    contractEnd?: string;
    status?: number;
    partnerID?: IPartner;
    contractQuota: number;
    contractQuotaRefresh?: number;
    organisationId?: number;
    statusHistory?: any;
    admissionToken?: IAdmissionToken[] | any;
    siteId?: number;
    rejection?: {
        reason: number;
        comment: string;
    };
    createdOn?: string;
    createdBy?: IUser;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser;
    contractPrice?: any;
}

export interface IPartnerContractImport {
    partnerName: string;
    contractStart: string;
    contractEnd: string;
    contractType: string;
    tokenName: string;
    contractQuotaRefresh: string;
    contractQuota: number;
}

export interface IContractPrice {
    _id?: string;
    outlet?: ILounge;
    product?: IProduct;
    applicableTo?: number;
    price?: number;
    entitlementQuantity?: number;
    currency?: string;
    createdOn?: string;
    createdBy?: IUser;
    lastModifiedOn?: Date;
    lastModifiedBy?: IUser;
}

export interface IContractPriceImport {
    masterID: number;
    partnerContractID: string;
    admissionInstructionID: string;
    partnerName: string;
    aiName: string;
    partnerID: string;
    productName: string;
    productSku: string;
    outletCode: string;
    outletName: string;
    EntitledQuantity:number;
    Currency:string;
    ApplicableTo:string;
    ServiceDuration:number;
    contractPrice: number;
    amount: number;
    tax: number;
    taxRate: number;
    createdOn: Date; 
    modifiedOn: Date; 
    masterType: string;
}

export interface ILoungePriceImport {
    masterID: number;
    partnerContractID: string;
    admissionInstructionID: string;
    partnerName: string;
    aiName: string;
    partnerID: string;
    productName: string;
    productSku: string;
    outletCode: string;
    outletName: string;
    EntitledQuantity:number;
    Currency:string;
    ApplicableTo:string;
    ServiceDuration:number;
    contractPrice: number;
    amount: number;
    tax: number;
    taxRate: number;
    createdOn: Date; 
    modifiedOn: Date; 
    masterType: string;
}
