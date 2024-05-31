import { ILounge } from "./lounge.interface";

// export class IUser {
//   _id: string;
//   name: string;
//   type: string;
//   defaultProperty: ILounge;
//   mobile: string;
//   email: string;
//   businessLine: string;
//   remoteUserID: string;
//   isActive: boolean;
//   userrole: IRole;
//   createdOn?: Date;
//   createdBy?: number;
//   lastModifiedOn?: Date;
//   lastModifiedBy?: number;
//   status: number;
// }
export class ILoungeAccess {
  loungename: string;
  loungecategory: string;
  loungebrand: string;
  country: string;
}
export class ILoungeTable {
  loungeID: ILounge;

}
export class IUser {
  _id?: string;
  userName?:string;
  role?: string;
  name?: string;
  type?: number;
  defaultOutlet?: ILounge;
  mobile?: string;
  email?: string;
  businessLine?: string;
  remoteUserID?: string;
  isActive?: boolean;
  userrole?: IRole;
  displayCategory?: string;
  category?: number;
  lounges?: ILounge[];
  password?:string;
  reEnterPassword?:string;
  createdOn?: Date;
  createdBy?: number;
  lastModifiedOn?: any;
  lastModifiedBy?: IUser;
  status?: number;
  userOutlet?: any;
  language?: any;
  permissions?: any;
  userType?: number;
  userPartnerID? : any;
  OutletName?:any;
  PartnerName?:string
  userLanguage?: any;
}

export class IRole {
  name: string;
  roleName?: string;
  description?: string;
  _id: string;
  createdOn?: Date;
  createdBy?: number;
  lastModifiedOn?: string;
}
