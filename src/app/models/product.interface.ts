import { IUser } from "./user.interface";
import { ILounge } from "./lounge.interface";
import { IPartner } from "./partner.interface";
export class IProductAvailableAt {
  _id: string;
  maskPatternID: string | IProductPattern;
  loungeID: ILounge;
  availableat: IAvailable[];
}
export class IAvailable {
  _id: string;
  applicableTo: number;
  displayApplicableTo?: string;
  product: IProduct;
  quota: number;
  within: number;
  displayWithin?: string;
  fallbackProduct: IProduct;
  discountType: number;
  displayDiscountType?: string;
  discountedPrice: number;
}
export class IProductPattern {
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
  availablity?: IProductAvailableAt[];
}
export class IProduct {
  _id: string;
  name?: string;
  type?: number;
  displayType?: string;
  category?: number;
  categoryDisplay?: string;
  currency?: string;
  price?: number;
  loyaltyPoints?: number;
  tax?: number;
  description?: string;
  status?: number;
  organisationId?: number;
  siteId?: number;
  createdOn?: Date;
  fulfilledBy?: string;
  serviceTime?: number;
  createdBy?: IUser;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser;
  lname?: string;
  sku?: string;
  listPrice?: number;
  legacyProductId?: string;
  salesTerm?: string;
  listCurrency?: string;
  unitOfMeasure?: string;
  localisation?: object;
  productID?: any
  lpsku?: string;
}

export class IPackageProduct{
  _id?: string;
  name?: String;
}
export interface IApplicableTax {
  _id?: string;
  tax?: number;
}

export interface IChannelItemLink {
  _id?: string;
  loungeId?: ILounge[];
  productID?: IProduct | string;
  lname?: string;
  listPrice?: number;
  listCurrency?: string;
  selllingPrice?: string;
  sellingCurrency?: string;
  isAvailable?: boolean;
  unitOfMeasure?: number;
  unitOfMeasureDisplay?: string;
  lpsku?: string;
  ltax?: number;
  createdOn?: Date;
  createdBy?: IUser;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser;
}

export interface IPackageItemLink {
  _id?: string;
  productPackageName?: string;
  productPackagePrice?: string;
  entitledQuantity?: string;
  packageQuantity?: string;  
  createdOn?: Date;
  createdBy?: IUser;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser;
}


export interface IProductImport {
  name?: string;
  sku?: string;
  type?: string;
  currency?: string;
  price?: number;
  loyaltyPoints?: number;
  tax?: string;
  description?: string;
  measure?: string;
  codes?: string;
  vendorTin: string;
  serviceTime: string;
  productCategory: string;
  legacyProductId: string;
  salesTerm: string;
}
export interface IProductPartnerLink{
  localProductID: IProduct;
  foreignProductID: string;
  partnerID: IPartner;
  status: number;
  createdOn?: Date;
  createdBy?: IUser;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser;
}
export interface IProductPartnerLinkImport {
  sku?: string;
  partnerProductId?: string;
}
