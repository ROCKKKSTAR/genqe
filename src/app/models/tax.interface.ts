export class ITax {
  // tslint:disable-next-line: variable-name
  _id?: string;
  taxName?: string;
  shortName?: string;
  taxCategory?: number;
  displayTaxCategory?: string;
  displayApplicableOn?: string;
  applicableOn?: number;
  country?: string;
  isActive?: boolean;
}

export class ITaxComponent{
  _id?: string;
  componentName?: string;
  effectiveRate?: number;
  displayRate?: number;
}
