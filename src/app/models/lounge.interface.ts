import { ICountry } from './globalSetting.interface';
import { IPartner } from './partner.interface';
import { IUser } from './user.interface';

export class ILounge {
  _id: string;
  name?: string;
  displaName?: string;
  category?: number;
  type?: number;
  zone?: number;
  brand?: string;
  displayBrand?: string;
  area?: string;
  securedBy?: number;
  parent?: ILounge;
  journeyType?: number;
  travelDirection?: number;
  businessLine?: number;
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  // nearestPort: INearestPort[];
  airport?: IAirport;
  facilities?: IFacility[];
  capacity?: number;
  isActive?: boolean;
  isSecured?: boolean;
  security?: string;
  description?: string;
  photos?: string[];
  timings?: object;
  status?: number;
  organisationId?: string;
  siteId?: string;
  createdOn?: Date;
  createdBy?: number;
  lastModifiedOn?: Date;
  lastModifiedBy?: number;
  keyCode?: number;
  key1?: string;
  displayType?: string;
  displayCategory?: string;
  displayJourney?: string;
  displayDirection?: string;
  displayZone?: string;
  displaySecured?: string;
  displayBusiness?: string;
  // displayBrand: string;
  certificateID?: ICertificate;
  localisation?: object;
  loungeFeatures?: any;
  baseCurrency?: string;
  isVisible?: boolean;
  // shard: number;
  // displayShard: string;
  code?: string;
  currentUseStatus?: number;
  displayCurrentUseStatus?: string;
  outletOperatedBy?: any;
  outletOwnedBy?: any;
}

export interface ICertificate {
  _id: string;
  publicKey: string;
}
export class IFacility {
  name: string;
  status: number;
  createdOn: Date;
  createdBy: number;
  lastModifiedOn: Date;
  lastModifiedBy: number;
}

export interface IOutletSettings {
  _id: string;
  lkCode: string;
  keyCode: number;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  createdOn?: Date;
  createdBy?: IUser | string;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser | string;
}

export class IAirport {
  airportName: string;
  airportCountry?: ICountry;
  status: number;
  createdOn: Date;
  createdBy: number;
  lastModifiedOn: Date;
  lastModifiedBy: number;
  airportContinent?: string;
  airportRegion?: string;
  airportState: string;
  airportCode: string;
  airportTimezone: string;
}

export interface ILoungePartnerLink {
  localLoungeID: ILounge;
  foreignLoungeID: string;
  partnerID: IPartner;
  status: number;
  createdOn?: Date;
  createdBy?: IUser;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser;
}

export interface ILoungePartnerLinkImport {
  code?: string;
  partnerOutletId?: string;
}
