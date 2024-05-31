import { ILounge } from "./lounge.interface";
import { IUser } from "./user.interface";
export class IDevice{
_id: string;
name:string;
tag:string;
type:number;
displayType?:string;
brand:number;
displayBrand?:string;
category:number;
displayCategory?:string;
status:number;
currentLounge:ILounge;
displayLounge?:string;
organisationId?: number;
siteId?: number;
createdOn?: Date;
createdBy?: IUser;
lastModifiedOn?: Date;
lastModifiedBy?: IUser;
  // device: any;
  identifiedBy: number;
  serialNo:string;
}
