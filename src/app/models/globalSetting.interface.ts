import { IPartner } from "./partner.interface";
import { IUser } from "./user.interface";

export interface IGlobalSetting {
  description?: string;
  productID?: string;
  type?: number;
  total_docs_count?: any;
  _id: string;
  lkCode: string;
  keyCode: number;
  key1: string;
  key2?: string;
  key3?: string;
  key4?: string;
  key5?: string;
  key6?: string;
  key7?: string;
  key8?: string;
  lastModifiedOn?: any;
  // total_docs_count?: number;
}

export interface ICountry {
  _id: string;
  name?: string;
  region?:string;
  currency?: string[];
  language?: string[];
  airportTimezone?: string;
}
export interface IDelayedFlight {
  _id: string;
  airlineName?: string;
  airlineNo?: string[];
  paxCount?:number;
  hours?:string;
  currency?: string;
  contractAmount?: number;
  termsAndConditions?: string;
  status?: number
}
export interface IAirlines {
  _id: string;
  airline?: string;
  icao?: string;
  callSign?:number;
  hours?:string;
  country?: string;
}


export interface ICurrency {
  _id: string;
  name: string;
  currencyCode: string;
  value: number;
  respectTo: number;
  displayrespectTo: string;
  action: string;
}
export interface IAudit {
  _id: string;
  moduleName: string;
  actionName: string;
  api: string;
  access: string;
  status: string;
  userName: string;
}
export interface IFailedTokens {
  displaytokenCategory: string;
  category: number;
  description: string;
  tokenCode: string;
  tokenType: number;
  partrnerID?: IPartner;
  createdBy: IUser;
  createdOn: string;
  displaytokenType: string;
  _id: string;
  moduleName: string;
  actionName: string;
  api: string;
  access: string;
  status: string;
  userName: string;
}

export interface INearestAirport {
  _id: string;
  name: string[];
}


export interface IShift {

  _id: string;
  shiftName: string;
  openingTime: string;
  closingTime: string;
 
}
