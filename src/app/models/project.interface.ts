export interface IprojectDetails {
  projectLeadID: any;
  parentProjectId: any;
  parentProject: any;
  domain: any;
  _id?: string;
  category: string;
  projectLead: string;
  projectCode?: string;
  projectName?: string;
  labels?: [];
  environment?: string;
  team: any;
  lastModifiedOn?: Date;
  createdOn?: Date;
  createdBy?: string;
  description?: string;
  status?: string;
  partnerName?: string;
  partnerId?: string;
}

export interface IprojectDocuments {
  _id: string;
  events: string;
  prompt: string;
  additionalInstruction: string;
  createdOn: Date;
  status: string;
  action: string;
}
export interface ILinkedActs {
  _id?: string;
  desc?: string;
  type?: string;
  createdOn?: Date;
}
export interface IprojectTask {
  _id?: string;
  taskType?: String;
  dueDate?: Date;
  completedOn?: Date;
  taskDescription?: String;
  createdOn?: Date;
}
export interface IprojectContact {
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
export interface ITestProjects {
  _id?: string;
  projectID?: string;
  event?: any;
  status?: Number;
  createdOn?: Date;
}
