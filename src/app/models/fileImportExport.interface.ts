import { IUser } from './user.interface';

export interface IFileImportExport {
    _id?: string;
    fileName?: string;
    fileFormatType?: string;
    activity?: string;
    recordProcessed?: string;
    recordSuccess?: string;
    recordFailure?: string;
    status?: number;
    url?: string;
    entity?: string;
    createOn?: Date;
    createdBy?: IUser;
    lastModifiedBy?: IUser;
    lastModifiedOn?: Date;
}

export interface IErrorStatus {
    _id: string;
    fileImportId: IFileImportExport;
    columnName: string;
    rowNo: number;
    columnNo: number;
    createdOn: Date;
}

export interface IFileImport {
    token?: string;
    startDate?: Date;
    endDate?: Date;
    partnerTin?: string;
    quota?: string;
}
