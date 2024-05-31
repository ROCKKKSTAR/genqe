import { IAdmission } from './admission.interface';
import { IPartner } from './partner.interface';

export interface ITax {
    total?: number,
    components?: {
        tax: string,
        components: {
            name: string,
            value: number,
            amount: number
        }[]
    }[]
}
export interface IOrder {
    _id: string;
    admissionID?: string | IAdmission;
    partnerID?: string | IPartner;
    products?: IItem[];
    currency?: string;
    amount?: number;
    collectedAmount?: number;
    pendingAmount?: number;
    status?: number;
    tax?: ITax,
    displayStatus?: string;
    createdOn?: Date;
}

export interface IBooking{
    contactInfo: any;
    _id: string;
    tokenType?: string | IAdmission;
    partnerID?: string | IPartner;
    products?: any[];
    currency?: string;
    amount?: number;
    admissionTokenID?: string;
    admissionTokenName?: string;
    startDate?: Date;
    endDate?: Date;
    status?: number;
    displayStatus?: string;
    paymentID?: string;
    createdOn?: Date;
    bookingStatus?: number;
}
export interface IItem {
    name: string;
    sku: string;
    propertyId: string,
    quantity: number;
    serviceTime: number;
    price: number;
    tax?: ITax,
    productID: string;
    isPaid: boolean;
}
