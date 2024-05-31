import { ILounge } from "./lounge.interface";
import { IPartner } from "./partner.interface";
import { IUser } from "./user.interface";

export interface IReportQueue {
    _id?: string;
    requestNum?: string,
    type?: number,
    s3Path?: string,
    password?: string,
    filter?: {
        startDate?: string,
        endDate?: string,
        partner?: IPartner,
        outlet?: ILounge
    },
    paxTotal?: number,
    cronMonthly?: boolean,
    status?: number,
    createdOn?: Date,
    createdBy?: IUser,
    lastModifiedOn?: Date,
    lastModifiedBy?: IUser
}