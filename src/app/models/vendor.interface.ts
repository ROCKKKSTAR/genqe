export class IVendor {
  // tslint:disable-next-line: variable-name
  _id: string;
  name?: string;
  tin?: string;
  status?: number;
  photos?: string;
  // tslint:disable-next-line: variable-name
  type?: number;
  displayType?: string;
  displayName?: string;
  // tslint:disable-next-line: variable-name
  ERP_Number?: string;
  category?: number;
  displayCategory?: string;
  addressLine1?: string;
  addressLine2?: string;
  parentVendorId?: IVendor[];
  country?: string;
  postalCode?: string;
  region?: string;
  state?: string;
  city?: string;
  entityCode?: string;
  allianceProgram?: number;
  displayAlliance?: number;
  organisationId?: number;
  siteId?: number;
  createdOn?: Date;
  createdBy?: number;
  lastModifiedOn?: Date;
  lastModifiedBy?: number;
}
