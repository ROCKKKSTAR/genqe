export interface ICaseDetails {
  _id?: string;
  domain?: string;
  parentProject?: string;
  fileId?: number;
  filingNumber?: number;
  caseNumber?: number;
  caseName?: string;
  cnrNumber?: string;
  subject?: string;
  stage?: string;
  jurisdictionDistrict?: string;
  jurisdictionState?: string;
  labels?: string;
  billingCurrency?: string;
  court?: string;
  nextHearing?: Date;
  disposalDate?: Date;
  lastUpdatedOn?: Date;
  createdOn?: Date;
  createdBy?: string;
  bench?: string;
  requiredOutput?: string;
  caseDescription?: string;
  plaintiff?: string;
  defendant?: string;
  item?: string;
  caseStatus?: string;
  outletOwnedBy?: string;
  outletOwnedId?: string;

}

export interface ICaseDocuments {
  _id: string;
  events: string;
  prompt: string;
  additionalInstruction: string;
  createdOn: Date;
  status: string;
  action: string;
}
export interface ICaseAdvanceSearch {
  caseNumber?: number;
  caseName?: string;
  nextHearing?: Date;
  court?: string;
}
export interface ILinkedActs {
  _id?: string;
  desc?: string;
  type?: string;
  createdOn?: Date;
}
export interface ICaseTask {
  _id?: string;
  taskType?: String;
  dueDate?: Date;
  completedOn?: Date;
  taskDescription?: String;
  createdOn?: Date;
}
export interface ICaseContact {
  _id?: string;
  contactName?: String;
  contactDesignation?: String;
  contactNumber?: String;
  contactEmail?: String;
  status?: Number;
  createdOn?: Date;
}
export interface IApplication {
  _id?: string;
  applicationType?: String;
  applicationDesc?: String;
  applicationStatus?: Number;
  createdOn?: Date;
}
export interface IGenerateDocument {
  _id?: string;
  caseID?: string;
  event?: Number;
  status?: Number,
  createdOn?: Date;
}