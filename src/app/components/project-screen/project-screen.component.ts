import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { WebService } from 'src/app/services/web.service';
import { IResponse } from 'src/app/models/server-data-source.model';
import { ToastrService } from 'ngx-toastr';
import {
  IApplication,
  IprojectContact,
  IprojectDetails,
  IprojectDocuments,
  IprojectTask,
  ILinkedActs,
  ITestProjects,
} from 'src/app/models/project.interface';
import { MatTableDataSource } from '@angular/material/table';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { DatePipe } from '@angular/common';
import { HttpEvent, HttpEventType, HttpParams } from '@angular/common/http';
import { event, css } from 'jquery';
import { IPartner } from 'src/app/models/partner.interface';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { Subject, Subscription, interval } from 'rxjs';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { environment as env } from 'src/environments/environment';
import { IGlobalSetting } from '../../chatbot-conversation/chatbot-conversation.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { takeUntil } from 'rxjs/operators';
import Konva from 'konva';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/models/user.interface';
import { IPartnerSettings } from 'src/app/models/partner.interface';
import { MatSort } from '@angular/material/sort';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { ILanguage } from 'src/app/models/language.interface';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-project-screen',
  templateUrl: './project-screen.component.html',
  styleUrls: ['./project-screen.component.css'],
})
export class ProjectScreenComponent implements OnInit {
  public data: ILanguage;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;

  public workflowTypes = [
    { keyCode: 1, key1: 'Type1' },
    { keyCode: 2, key1: 'Type2' },
  ];
  public participants = [
    { _id: '1', name: 'Participant1' },
    { _id: '2', name: 'Participant2' },
  ];
  public workflowStatus = [
    { keyCode: 1, key1: 'Status1' },
    { keyCode: 2, key1: 'Status2' },
  ];
  private workflowModalRef: any = null;
  @ViewChild('workflowModal', { static: false })
  public workflowModal: ElementRef;
  @ViewChild('docCanvas', { static: false }) container: ElementRef;
  private stage: Konva.Stage;
  private layerIndices = {
    steps: 0,
    connectors: 1,
    newStep: 2,
    tooltip: 3,
  };
  public selectedShape: Konva.Group = null;

  private unsubscribe$ = new Subject<void>();
  public projectDataP: MatPaginator;
  public featuresP: MatPaginator;
  public flowP: MatPaginator;
  public issuesP: MatPaginator;
  public testCasesP: MatPaginator;
  public codeP: MatPaginator;
  public sprintP: MatPaginator;
  public projectDocumentsP: MatPaginator;
  public submittedDocumentP: MatPaginator;
  public contactP: MatPaginator;
  public linkedActsP: MatPaginator;
  connectedprojectsP: MatPaginator;
  applicationsP: MatPaginator;
  generatedDocP: MatPaginator;
  issueCommentP: MatPaginator;
  generatedPromptsP: MatPaginator;
  domains: IGlobalSetting[];
  categories: IGlobalSetting[];
  variableOptions: IGlobalSetting[];
  public timeoutOccurred: boolean[] = [];
  public testCaseTimeout: boolean[] = [];
  editMode: boolean;
  simpleSearch: string;
  simpleSearchIssues: string;
  simpleSearchFlow: string;
  simpleSearchTestCase: string;
  simpleSearchTrainedModel: string;
  simpleSearchCode: string;
  sprintInputFields = {
    sprintName: '',
    sprintGoal: '',
    sprintStartDate: '',
    sprintEndDate: '',
    sprintStatus: '',
    sprintFeatures: '',
  };
  variableInputFields: {
    name: any;
    dataType: any;
    isMandatory: any;
    inputType: any;
    characterLimit: any;
    rangeMin: any;
    rangeMax: any;
    defaultValue: any;
    regex_pattern: any;
    createdOn: string;
    variableOption: string;
  };
  interfaceInputFields: {
    s3DocImageId: any;
    _id: string;
    name: string;
    url: string;
    description: string;
    createdOn: Date;
    lastModifiedOn: Date;
    interfaceType: any;
  };
  functionInputFields: {
    _id: string;
    name: string;
    class: string;
    input: string;
    output: string;
    author: string;
    fileName: string;
    exceptionList: string;
    createdOn: Date;
    lastModifiedOn: Date;
  };
  newSprint: boolean;
  showApplicationDetails: boolean = false;
  projectDetailsAccordionCollapsed: boolean;
  projectRowID: any;
  featureStatuses: IGlobalSetting[];
  // featuresCount: any;
  dropdownSettingsFeatures: {
    singleSelection: boolean;
    selectAllText: string;
    unSelectAllText: string;
    itemsShowLimit: number;
    idField: string;
    textField: string;
    allowSearchFilter: boolean;
  };
  dropdownSettingsIssues: {
    singleSelection: boolean;
    selectAllText: string;
    unSelectAllText: string;
    itemsShowLimit: number;
    idField: string;
    textField: string;
    allowSearchFilter: boolean;
  };
  trainedModel = {
    feature: '',
    file: '',
  };
  typeList: IGlobalSetting[];
  editprojectSettings: any = false;
  partnerToken: any;
  parnterSettingPagination: MatPaginator;
  variablePagination: MatPaginator;
  gitDetailForm: any;
  links: IGlobalSetting[];
  priorities: any = [];
  linkTo: any;
  issuesCount: any = 0;
  newTestCase: boolean;
  codeCount: any = 0;
  featureRowID: string;
  sprintRowID: any;
  issueRowID: any;
  dropdownSettingsFeaturesTrainedModel: {
    singleSelection: boolean;
    selectAllText: string;
    unSelectAllText: string;
    itemsShowLimit: number;
    idField: string;
    textField: string;
    allowSearchFilter: boolean;
  };
  flowRowID: any;
  codeRowId: null;
  addNewStep: boolean;
  trainedModelOptions: IGlobalSetting[];
  disableDropDownUseFrom: boolean = true;
  trainedModelType: any;
  testCaseSimpleSearched: string;
  dropdownSettingsType: {
    singleSelection: boolean;
    selectAllText: string;
    unSelectAllText: string;
    itemsShowLimit: number;
    idField: string;
    textField: string;
    allowSearchFilter: boolean;
  };
  selectedFeature: any;
  trainedModelCount: any = 0;
  trainedModelP: MatPaginator;
  fileName: any;
  showFeatureData: any;
  showSprintData: any;
  showIssueData: boolean;
  showCodeData: boolean;
  showFlowData: boolean;
  showTestCaseTabData: boolean;
  featuresName: any[];
  showTrainedModelTabData: any;
  issueStatuses: any[];
  advanceSearchProjectDocument: { documentName: string; createdOn: string };
  settingName: any;
  disableFlowInputFields: boolean;
  dataSourceFineTuning: MatTableDataSource<any>;
  dataSourceVariables: MatTableDataSource<any>;
  dataSourceFlowStepVariables: MatTableDataSource<any>;
  newTuningDataSet: boolean = false;
  projectFineTuningP: MatPaginator;
  // selctedTestCaseValue: any;
  summaryFileTypes: any;
  showVariablesTabData: any;
  showWorkFlowImport: boolean = false;
  variableP: MatPaginator;
  advanceSearchVariable: { name: string };
  variablesCount: any = 0;
  variableRowID: any;
  addVariable: boolean = false;
  enviroments: IGlobalSetting[];
  private languageSubscription: Subscription = null;
  flowSteps: any[] = [];
  showFlowDiagram: boolean = false;
  // workFlowDiagram: any;
  @Output() workFlowDiagram = new EventEmitter<any>();
  showVariableImport: boolean = false;
  importVariableValidator: VariableDataValidator;
  importInterfaceValidator: InterfaceDataValidator;
  importFunctionsValidator: FunctionsDataValidator;
  showNewStep: boolean = false;
  stepInputFields: any = {
    flowStepNumber: '',
    flowStepName: '',
    flowStepDescription: '',
    // flowStepVaribale: '',
    flowStepSampleData: '',
    flowStepDatatype: '',
  };
  flowStepP: MatPaginator;
  featureLabelList: IGlobalSetting[];
  disableFlowStepNumber: boolean = false;
  addInterface: boolean = false;
  addFunction: boolean = false;
  dataSourceInterface: MatTableDataSource<any>;
  dataSourceFunctions: MatTableDataSource<any>;
  interfaceP: MatPaginator;
  functionP: MatPaginator;
  showInterfaceTabData: boolean = false;
  showFunctionsTabData: boolean = false;
  advanceSearchInterface: { name: string };
  showInterfaceImport: boolean = false;
  showFunctionsImport: boolean = false;
  dataSourceInterfaceVariable: MatTableDataSource<unknown>;
  interfaceVariableP: MatPaginator;
  base64Image: string;
  previewUplaodedInterfaceImages: any;
  @ViewChild('projectDataPagination', { static: false })
  set projectDataPage(projectDataPagination: MatPaginator) {
    this.projectDataP = projectDataPagination;
    if (
      this.dataSourceproject !== null &&
      this.dataSourceproject !== undefined
    ) {
      this.dataSourceproject.paginator = projectDataPagination;
    }
  }
  @ViewChild('featuresPagination', { static: false })
  set featuresPage(featuresPagination: MatPaginator) {
    this.featuresP = featuresPagination;
    if (
      this.dataSourceFeatures !== null &&
      this.dataSourceFeatures !== undefined
    ) {
      this.dataSourceFeatures.paginator = featuresPagination;
    }
  }
  @ViewChild('testCasesPagination', { static: false })
  set testCasesPage(testCasesPagination: MatPaginator) {
    this.testCasesP = testCasesPagination;
    if (
      this.dataSourceTestCase !== null &&
      this.dataSourceTestCase !== undefined
    ) {
      this.dataSourceTestCase.paginator = testCasesPagination;
    }
  }

  @ViewChild('flowPagination', { static: false })
  set flowPage(flowPagination: MatPaginator) {
    this.flowP = flowPagination;
    if (this.dataSourceFlow !== null && this.dataSourceFlow !== undefined) {
      this.dataSourceFlow.paginator = flowPagination;
    }
  }

  @ViewChild('flowStpesPagination', { static: false })
  set flowStepPage(flowStpesPagination: MatPaginator) {
    this.flowStepP = flowStpesPagination;
    if (
      this.dataSourceFlowSteps !== null &&
      this.dataSourceFlowSteps !== undefined
    ) {
      this.dataSourceFlowSteps.paginator = flowStpesPagination;
    }
  }

  @ViewChild('codePagination', { static: false })
  set codePage(codePagination: MatPaginator) {
    this.codeP = codePagination;
    if (this.dataSourceCode !== null && this.dataSourceCode !== undefined) {
      this.dataSourceCode.paginator = codePagination;
    }
  }

  @ViewChild('trainedModelPagination', { static: false })
  set trainedModelPage(trainedModelPagination: MatPaginator) {
    this.trainedModelP = trainedModelPagination;
    if (
      this.dataSourceTrainedModel !== null &&
      this.dataSourceTrainedModel !== undefined
    ) {
      this.dataSourceTrainedModel.paginator = trainedModelPagination;
    }
  }

  @ViewChild('sprintPagination', { static: false })
  set sprintPage(sprintPagination: MatPaginator) {
    this.sprintP = sprintPagination;
    if (this.dataSourceSprint !== null && this.dataSourceSprint !== undefined) {
      this.dataSourceSprint.paginator = sprintPagination;
    }
  }
  @ViewChild('documentPagination', { static: false })
  set projectDocumentsPage(documentPagination: MatPaginator) {
    this.projectDocumentsP = documentPagination;
    if (
      this.dataSourceDocuments !== null &&
      this.dataSourceDocuments !== undefined
    ) {
      this.dataSourceDocuments.paginator = documentPagination;
    }
  }
  @ViewChild('fineTuningDataSetPagination', { static: false })
  set projectFineTuningPage(fineTuningDataSetPagination: MatPaginator) {
    this.projectFineTuningP = fineTuningDataSetPagination;
    if (
      this.dataSourceFineTuning !== null &&
      this.dataSourceFineTuning !== undefined
    ) {
      this.dataSourceFineTuning.paginator = fineTuningDataSetPagination;
    }
  }
  @ViewChild('projectSettingSort') projectSettingSort: MatSort;
  @ViewChild('projectSort') projectSort: MatSort;
  @ViewChild('featureSort') featureSort: MatSort;
  @ViewChild('sprintSort') sprintSort: MatSort;
  @ViewChild('generateDocumentSort') generateDocumentSort: MatSort;
  @ViewChild('issuesSort') issuesSort: MatSort;
  @ViewChild('codeSort') codeSort: MatSort;
  @ViewChild('flowSort') flowSort: MatSort;
  @ViewChild('testCaseSort') testCaseSort: MatSort;
  @ViewChild('trainModelSort') trainModelSort: MatSort;
  @ViewChild('documentSort') documentSort: MatSort;
  @ViewChild('fineTuningSort') fineTuningSort: MatSort;
  @ViewChild('variablesSort') variablesSort: MatSort;
  @ViewChild('interfaceSort') interfaceSort: MatSort;
  @ViewChild('issueCommentsDetailSort') issueCommentsDetailSort: MatSort;
  @ViewChild('flowStepsSort') flowStepsSort: MatSort;
  @ViewChild('generatedPromptssort') generatedPromptssort: MatSort;
  @ViewChild('FunctionSort') functionSort: MatSort;

  @ViewChild('generatedDocumentPagination', { static: false })
  set generatedDocPage(generatedDocumentPagination: MatPaginator) {
    this.generatedDocP = generatedDocumentPagination;
    if (
      this.dataSourceGeneratedDocs !== null &&
      this.dataSourceGeneratedDocs !== undefined
    ) {
      this.dataSourceGeneratedDocs.paginator = generatedDocumentPagination;
    }
  }

  @ViewChild('issueCommentPagination', { static: false })
  set issueCommentPage(issueCommentPagination: MatPaginator) {
    this.issueCommentP = issueCommentPagination;
    if (
      this.dataSourceIssueCommentsDetail !== null &&
      this.dataSourceIssueCommentsDetail !== undefined
    ) {
      this.dataSourceIssueCommentsDetail.paginator = issueCommentPagination;
    }
  }

  @ViewChild('generatedPromptsPagination', { static: false })
  set generatedPromptsPage(generatedPromptsPagination: MatPaginator) {
    this.generatedPromptsP = generatedPromptsPagination;
    if (
      this.dataSourceGeneratedPrompts !== null &&
      this.dataSourceGeneratedPrompts !== undefined
    ) {
      this.dataSourceGeneratedPrompts.paginator = generatedPromptsPagination;
    }
  }

  @ViewChild('variablesPagination', { static: false })
  set variablesPage(variablesPagination: MatPaginator) {
    this.variableP = variablesPagination;
    if (
      this.dataSourceVariables !== null &&
      this.dataSourceVariables !== undefined
    ) {
      this.dataSourceVariables.paginator = variablesPagination;
    }
  }
  @ViewChild('interfacePagination', { static: false })
  set interfacePage(interfacePagination: MatPaginator) {
    this.interfaceP = interfacePagination;
    if (
      this.dataSourceInterface !== null &&
      this.dataSourceInterface !== undefined
    ) {
      this.dataSourceInterface.paginator = interfacePagination;
    }
  }
  @ViewChild('interfaceVariablePagination', { static: false })
  set interfaceVariablePage(interfaceVariablePagination: MatPaginator) {
    this.interfaceVariableP = interfaceVariablePagination;
    if (
      this.dataSourceInterfaceVariable !== null &&
      this.dataSourceInterfaceVariable !== undefined
    ) {
      this.dataSourceInterfaceVariable.paginator = interfaceVariablePagination;
    }
  }

  @ViewChild('functionPagination', { static: false })
  set functionPage(functionPagination: MatPaginator) {
    this.functionP = functionPagination;
    if (
      this.dataSourceFunctions !== null &&
      this.dataSourceFunctions !== undefined
    ) {
      this.dataSourceFunctions.paginator = functionPagination;
    }
  }

  public loadershow = false;
  public projectID = '';
  // public prompt = 'Promt';
  public status = '';
  public loaderMessage = '';
  public showData: boolean = false;
  public showProjectDocumentQueryData: boolean = false;
  public showSubmittedDocumentQueryData: boolean = false;
  public showTestCaseQueryData: boolean = false;
  public savedData: boolean = false;
  public showNewProjectDetails: boolean = false;
  public showprojects: boolean = true;
  public savedprojects: boolean = false;
  public addNewContact: boolean = false;
  public newGeneratedDoc: boolean = false;
  public newProjectDocument: boolean = false;
  public showDownloadDocSummary: boolean = false;
  public createTestCases: boolean = false;
  public newSubmittedDocument: boolean = false;
  public newFeatures: boolean = false;
  public newIssues: boolean = false;
  public newFlows: boolean = false;
  public newCode: boolean = false;
  // public newLinkedActs: boolean = false;
  // public newConnectedprojects: boolean = false;
  // public newTask: boolean = false;
  public newApplications: boolean = false;
  public recordingScreen: boolean = false;
  public uploadingProjectRecording: boolean = false;
  public selectedDocumentTypes;
  public isSidebarOpen: boolean = true;
  public partners;
  public dropdownSettingsUploadDocument: IDropdownSettings = {};
  public dropdownSettingsLabels: IDropdownSettings = {};
  public dropdownSettingsTeam: IDropdownSettings = {};
  public dropdownSettingsStatus: IDropdownSettings = {};
  public dropdownSettingsRequiredOutput: IDropdownSettings = {};
  public dropdownSettingsLinkproject: IDropdownSettings = {};
  public dropdownSettingsStage: IDropdownSettings = {};

  public importCommonValidator: ProjectDataValidator;
  public importCommonTestCasesValidator: ProjectTestCasesValidator;
  public importCommonFlowValidator: ProjectFlowValidator;
  public importCommonFineTuningValidator: ProjectFineTuningValidator;

  public documentList: any[] = [];
  public linkprojectList = [];
  public linkedprojects = [];
  public supportContactStatus = [];

  public teamList = [];
  public statusList = [];
  public labelList = [];
  public featureList = [];
  public issueList = [];
  projectLeads: any[];
  caseNames: any[];
  projectPartners: any[];
  parentProjects: IprojectDetails[];
  selectedElement: any;
  public reasonForDeleting: String = '';
  public remarksOnDeleting: String = '';
  partnerId: any;
  partnerName: string;
  // public lastUpdatedOn :Date;
  public projectData: IprojectDetails[] = [];
  public projectInputFields: IprojectDetails;
  public noteText: String = '';
  public dataSourceproject: MatTableDataSource<IprojectDetails>;
  // public dataSourceConnectedprojects;
  public dataSourceDocuments: MatTableDataSource<any>;
  public dataSourceTrainedModel: MatTableDataSource<any>;
  // public dataSourceSubmittedDocuments;
  public dataSourceGeneratedDocs: MatTableDataSource<ITestProjects>;
  public dataSourceFeatures: MatTableDataSource<any> = new MatTableDataSource(
    []
  );
  public dataSourceIssues: MatTableDataSource<any> = new MatTableDataSource([]);
  public dataSourceCode: MatTableDataSource<any> = new MatTableDataSource([]);
  public dataSourceFlow: MatTableDataSource<any> = new MatTableDataSource([]);
  public dataSourceFlowSteps: MatTableDataSource<any> = new MatTableDataSource(
    []
  );
  public dataSourceTestCase: MatTableDataSource<any> = new MatTableDataSource(
    []
  );
  // public dataSourceLinkedActs: MatTableDataSource<ILinkedActs>;
  public dataSourceSprint: MatTableDataSource<any>;
  public dataSourceSetting: MatTableDataSource<any>;
  public dataSourceIssueCommentsDetail: MatTableDataSource<any>;
  // public dataSourceApplications: MatTableDataSource<IApplication>;
  // public dataSourceContact: MatTableDataSource<IprojectContact>;
  notes: ElementRef;
  public advanceSearch = {
    projectName: '',
    projectCode: '',
    category: '',
  };
  public advanceSearchFeature = {
    featureName: '',
    type: '',
    status: '',
  };
  public advanceSearchSprint = {
    name: '',
    goal: '',
    status: '',
  };
  public advanceSearchIssue = {
    name: '',
  };
  public advanceSearchCode = {
    author: '',
    fileName: '',
    repository: '',
  };
  public advanceSearchFlow = {
    flowName: '',
    actor: '',
    expectedResult: '',
  };
  public advanceSearchTestCaseTab = {
    objective: '',
    preCondition: '',
    expectedResult: '',
    priority: '',
  };
  public advanceSearchTrainedModel = {
    fileName: '',
    createdOn: '',
  };
  public featureInputFields = {
    featureName: '',
    featureType: '',
    featurePriority: '',
    featureDescription: '',
    featureStatus: '',
    featureLabels: '',
    featureStartDate: null,
    featureEndDate: null,
    featureActualStartDate: null,
    featureActualEndDate: null,
    featureDependencies: '',
    featureNotes: '',
  };
  public issueInputFields = {
    issueName: '',
    issueType: '',
    issuePriority: '',
    issueDescription: '',
    issueStatus: '',
    issueLabels: '',
    issueStartDate: '',
    refIssueID: '',
    refIssuekey: '',
    issueNotes: '',
    estimatedStartDate: '',
  };
  public flowInputFields = {
    _id: '',
    flowName: '',
    flowNumber: 0,
    flowActor: '',
    // flowStepNumber: '',
    // flowStepDescription: '',
    // flowStepVaribale: [],
    flowSteps: [],
    flowStepSampleData: '',
    flowStepDatatype: '',
    flowExpectedResult: '',
    flowBasedOn: '',
    selctedTestCaseValue: 0,
  };
  public testCaseInputFields = {
    testCaseObjective: '',
    testCasePreCondition: [],
    testCaseTestData: {},
    testCaseSteps: [],
    testCaseExpectedResult: '',
    testCasePriority: '',
  };
  displayedColumns: string[] = [
    'projectName',
    'projectCode',
    'category',
    'domain',
    'lastUpdatedOn',
    'createdOn',
    'Action',
    // 'createdBy',
  ];
  displayedColumnsConnectedprojects: string[] = [
    'fileId',
    'projectName',
    // 'dateOfFiling',
    'nextHearing',
    'court',
    'bench',
    'lastUpdatedOn',
    'createdOn',
    'createdBy',
  ];
  displayedColumnsUploadDocument: string[] = [
    'documentName',
    'uploadedOn',
    'summary',
    'keyFeatures',
    'keyFields',
    // 'issuedTo',
    // 'issuedBy',
    // 'dateOfIssue',
    'action',
  ];
  displayedColumnsTuningDataSet: string[] = [
    'id',
    'system',
    'user',
    'assistant',
    'status',
    'lastModifiedOn',
    'createdOn',
    'action',
  ];
  displayedColumnsTrainedModel: string[] = [
    'documentName',
    'uploadedOn',
    'action',
  ];
  displayedColumnsSubmittedDocument: string[] = [
    'documentName',
    'uploadedOn',
    'summary',
    'arrgumentFor',
    'arrgumentAgainst',
    'action',
  ];
  displayedColumnsGenerateDocument: string[] = [
    'events',
    // 'prompt',
    // 'additionalInstruction',
    'createdOn',
    'status',
    'action',
  ];
  displayedColumnsGeneratePromptDocument: string[] = [
    'promptCode',
    'promptResponse',
    'createdOn',
  ];
  displayedColumnsFeatures: string[] = [
    'name',
    'description',
    'type',
    // 'priority',
    'status',
    // 'labels',
    'createdOn',
    // 'createdBy',
  ];
  displayedColumnsIssues: string[] = [
    'name',
    'refIssueID',
    'refIssueKey',
    'type',
    // 'labels',
    'createdOn',
    // 'createdBy',
    'lastModifiedOn',
    // 'lastModifiedBy',
  ];
  displayedColumnsCode: string[] = [
    'author',
    'fileName',
    'className',
    'functionsName',
    'description',
    'lastModifiedOn',
    'createdOn',
  ];
  displayedColumnsFlow: string[] = [
    'flowNumber',
    'flowName',
    'actor',
    // 'stepDescription',
    'expectedResult',
    'basedOn',
    'createdOn',
    // 'testCasesType',
    'action',
  ];
  displayedColumnsTestCase: string[] = [
    'testCaseNumber',
    'flowNumber',
    'testCaseObjective',
    'testCasePreCondition',
    'testCaseTestData',
    'testCaseSteps',
    'expectedResult',
    'documentName',
    // 'testCasePriority',
    'lastModifiedOn',
  ];
  displayedColumnsFlowSteps: string[] = [
    'stepNumber',
    'stepName',
    'stepDesc',
    // 'stepVariable',
    'stepSampleData',
    // 'stepDataType',
    'action',
  ];
  displayedColumnsLinkedActs: string[] = [
    'actName',
    'actDescription',
    'creaatedOn',
  ];
  displayedColumnsSprint: string[] = [
    'name',
    'goal',
    'startDate',
    'endDate',
    'status',
    // 'features',
    // 'createdBy',
    'createdOn',
  ];
  displayedColumnsApplications: string[] = [
    'applicationType',
    'applicationDescription',
    'applicationStatus',
  ];
  public displayColumnContact: string[] = [
    'name',
    'designation',
    'email',
    'number',
    'status',
  ];
  public displyedSettingColumn: string[] = [
    'name',
    'description',
    'value1',
    'value2',
    'value3',
    'value4',
  ];
  public displayedColumnsIssueCommentsDetail: string[] = [
    'commentId',
    'commentBody',
    'commentBy',
    'commentedOn',
  ];
  public displayedColumnsVariables: string[] = [
    'name',
    'type',
    'inputType',
    'range',
    'defaultValue',
    // 'lastModifiedOn',
    // 'createdOn',
  ];
  public displayedColumnsFlowStepVariables: string[] = [
    'name',
    'type',
    'inputType',
    'range',
    'defaultValue',
    'lastModifiedOn',
    'createdOn',
  ];
  public displayedColumnsInterfaceVariables: string[] = [
    'name',
    'type',
    'inputType',
    'range',
    'defaultValue',
    'lastModifiedOn',
    'createdOn',
  ];
  public displayedColumnsInterface: string[] = [
    'interfaceImage',
    'name',
    "interfaceType",
    'url',
    'description',
    'createdOn',
    'lastModifiedOn',
    // 'action',
  ];
  public displayedColumnsFunctions: string[] = [
    'name',
    'class',
    'input',
    'output',
    'fileName',
    'createdOn',
    'lastModifiedOn',
  ];

  public linkedActInput: ILinkedActs = {};
  public projectTaskInput: IprojectTask = {};
  public supportContactInput: IprojectContact = {};
  public applicationInput: IApplication = {};
  public generatedDocInput: ITestProjects = {};

  selectedFileType: Number;
  downloadSelectedFile: Number;
  selectedFile: any;
  totalGeneratedDocs: number = 0;
  additionalData: any = '';
  showImport: boolean = false;
  showTestCasesImport: boolean = false;
  showFlowImport: boolean = false;
  showFineTuningImport: boolean = false;
  // totalNotesCount: number = 0;
  totalLinksCount: number = 0;
  totalConnectedprojectsCount: number = 0;
  totalTaskCount: number = 0;
  totalContactsCount: number = 0;
  totalApplicationsCount: number = 0;
  public projectDocumentSchema: Number = 0;
  public submittedDocumentCount: Number = 0;

  linkedActData: any;
  projectTaskData: any;
  supportContacts: any;
  applicationsTab: any;
  applicationStatus: IGlobalSetting[];
  requiredOutputList: IGlobalSetting[];
  connectedprojects: String;
  filleTypes: IGlobalSetting[];
  documentSummaryTypes: any = [];

  intervalSubscription: Subscription;

  loadingRows = new Set<number>();
  loadingColumns: Map<number, Set<string>> = new Map();
  loadingTimers: Map<number, Subscription> = new Map();
  projectDocumentData: any;
  showGeneratedDocs: any;
  dataSourceGeneratedPrompts: MatTableDataSource<any>;
  showGeneratedPrompts: boolean = false;
  private userSub: Subscription;
  public authenticatedUser: IUser;
  public projectSettings: IPartnerSettings = {
    _id: '',
    lkCode: '',
    keyCode: 0,
    key1: '',
    key2: '',
    key3: '',
    key4: '',
    key5: '',
    description: '',
  };
  isUsedForTestCase: Number = 0;
  isUsedForTraining: Number = 0;
  constructor(
    private WS: WebService,
    private toastr: ToastrService,
    private auth: AuthenticationService,
    private spinnerService: NgxSpinnerService,
    private cs: CommonServiceService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.resetprojectSettings();
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.loadershow = true;
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);

    this.dropdownSettingsLabels = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: 'keyCode',
      textField: 'key1',
      allowSearchFilter: true,
    };
    this.dropdownSettingsType = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: 'keyCode',
      textField: 'key1',
      allowSearchFilter: true,
    };
    this.dropdownSettingsFeatures = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: '_id',
      textField: 'name',
      allowSearchFilter: true,
    };
    this.dropdownSettingsFeaturesTrainedModel = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: '_id',
      textField: 'name',
      allowSearchFilter: true,
    };
    this.dropdownSettingsIssues = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: '_id',
      textField: 'name',
      allowSearchFilter: true,
    };
    this.dropdownSettingsTeam = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 10,
      idField: '_id',
      textField: 'name',
      allowSearchFilter: true,
    };
    this.dropdownSettingsStatus = {
      singleSelection: true,
      idField: 'key1',
      textField: 'key1',
      allowSearchFilter: true,
    };
    this.dropdownSettingsRequiredOutput = {
      singleSelection: true,
      idField: 'key1',
      textField: 'key1',
      allowSearchFilter: true,
    };
    this.dropdownSettingsStage = {
      singleSelection: true,
      idField: 'key1',
      textField: 'key1',
      allowSearchFilter: true,
    };
    this.dropdownSettingsUploadDocument = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: '_id',
      textField: 'displayText',
      allowSearchFilter: true,
    };
    this.dropdownSettingsLinkproject = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      idField: 'id',
      textField: 'projectName',
      allowSearchFilter: true,
    };
    this.fetchProjectTeams('PROJECT_TEAMS');
    // this.fetchprojectStatus("project_STATUS")
    this.fetchProjectStatus('PROJECT_STATUS');
    this.fetchFeatureStatus('FEATURE_STATUS');
    this.fetchIssueStatus('ISSUES_STATUS');
    this.fetchProjectLabels('PROJECT_LABELS');
    this.fetchFeatureLabels('PROJECT_FEATURE_LABELS');
    this.fetchProjectEnvironments('APPLICATION_ENVIRONMENT');
    this.fetchProjectCategories('PROJECT_CATEGORY');
    this.fetchProjectDomains('PROJECT_DOMAIN');
    this.fetchProjectLinks('PROJECT_LINK');
    this.fetchProjectTrainedModelOptions('TRAINING_MODEL_TYPES');
    this.fetchFeaturePriority('FEATURE_PRIORITY');
    // this.fetchApplicationStatus('APPLICATION_STATUS');
    this.supportContactInput.status = 1;
    this.applicationInput.applicationStatus = 1;
    this.generatedDocInput.status = 0;
    // this.generatedDocInput.prompt = "Prompt" ;
    this.fetchFileTypes('PROJECT_DOCUMENT_TYPE');
    this.fetchprojectsData();
    this.fetchVariableOption('VARIABLE_OPTIONS');

    this.route.queryParams.subscribe((params) => {
      const projectData = params['projectData'];
      if (projectData) {
        setTimeout(() => {
          this.templateSimpleSearch(projectData);
        }, 500);
      }
    });
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  public setprojectLeads(projectDetails): void {
    this.projectInputFields.projectLead = projectDetails.name;
    this.projectInputFields.projectLeadID = projectDetails._id;
    this.projectLeads = [];
  }

  public setParentProjects(projectDetails): void {
    this.projectInputFields.parentProject = projectDetails.projectName;
    this.projectInputFields.parentProjectId = projectDetails._id;
    this.parentProjects = [];
  }
  public setFeatureName(feature): void {}

  public setTrainedModelType(value): void {
    this.trainedModelType = value;
    if (value.keyCode == 1) {
      this.recordingScreen = true;
    } else {
      document.getElementById('fileInput').click();
      // this.uploadingProjectRecording = true
      // this.newProjectDocument = true
    }
  }

  public mapTableSetting(response): void {
    this.dataSourceSetting = new MatTableDataSource(response);
    this.dataSourceSetting.sort = this.projectSettingSort;
    this.dataSourceSetting.paginator = this.parnterSettingPagination;
  }
  public setProjectPartners(projectDetails): void {
    this.projectInputFields.partnerName = projectDetails.name;
    this.projectInputFields.partnerId = projectDetails._id;
    this.projectPartners = [];
  }
  public fetchprojectLeadsName(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post(
        'api/chatbox/fetch/projectLeadsByName',
        { keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.projectLeads = res.result.projectLeads as IprojectDetails[];
          if (!this.projectLeads?.length) {
            this.toastr.info('Not found');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.projectLeads = [];
    }
  }

  public fetchParentProjectName(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post(
        'api/chatbox/fetch/parentProjectByName',
        { keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.parentProjects = res.result.parentProjects as IprojectDetails[];
          if (!this.parentProjects?.length) {
            this.toastr.info('Not found');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.parentProjects = [];
    }
  }
  public fetchFeatureName(keyword: string): void {
    if (keyword.length > 2) {
    } else {
      this.featuresName = [];
    }
  }

  public fetchProjectPartnerName(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post(
        'api/chatbox/fetch/projectPartnerByName',
        { keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.projectPartners = res.result
            .projectPartners as IprojectDetails[];
          if (!this.projectPartners?.length) {
            this.toastr.info('Not found');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.projectPartners = [];
    }
  }
  notesContent(arg0: string, notesContent: any) {
    throw new Error('Method not implemented.');
  }
  showQueryForm() {
    if (!this.showData) {
      // $('.query1').addClass('visible');
      this.showData = true;
    } else {
      // $('#query1').removeClass('visible');
      // $('#query1').hide();
      this.showData = false;
    }
  }
  showProjectDocumentQueryForm() {
    if (!this.showProjectDocumentQueryData) {
      // $('.query1').addClass('visible');
      this.showProjectDocumentQueryData = true;
    } else {
      // $('#query1').removeClass('visible');
      // $('#query1').hide();
      this.showProjectDocumentQueryData = false;
    }
  }
  showSubmittedDocumentQueryForm() {
    if (!this.showSubmittedDocumentQueryData) {
      // $('.query1').addClass('visible');
      this.showSubmittedDocumentQueryData = true;
    } else {
      // $('#query1').removeClass('visible');
      // $('#query1').hide();
      this.showSubmittedDocumentQueryData = false;
    }
  }
  showTestCaseQueryForm() {
    if (!this.showTestCaseQueryData) {
      // $('.query1').addClass('visible');
      this.showTestCaseQueryData = true;
    } else {
      // $('#query1').removeClass('visible');
      // $('#query1').hide();
      this.showTestCaseQueryData = false;
    }
  }
  showFeatureQueryForm() {
    if (!this.showFeatureData) {
      this.showFeatureData = true;
    } else {
      this.showFeatureData = false;
    }
  }
  showSprintQueryForm() {
    if (!this.showSprintData) {
      this.showSprintData = true;
    } else {
      this.showSprintData = false;
    }
  }
  showIssueQueryForm() {
    if (!this.showIssueData) {
      this.showIssueData = true;
    } else {
      this.showIssueData = false;
    }
  }
  showCodeQueryForm() {
    if (!this.showCodeData) {
      this.showCodeData = true;
    } else {
      this.showCodeData = false;
    }
  }
  showFlowQueryForm() {
    if (!this.showFlowData) {
      this.showFlowData = true;
    } else {
      this.showFlowData = false;
    }
  }
  showTestCaseTabQueryForm() {
    if (!this.showTestCaseTabData) {
      this.showTestCaseTabData = true;
    } else {
      this.showTestCaseTabData = false;
    }
  }
  showTrainedModelQueryForm() {
    if (!this.showTrainedModelTabData) {
      this.showTrainedModelTabData = true;
    } else {
      this.showTrainedModelTabData = false;
    }
  }
  showVariablesQueryForm() {
    if (!this.showVariablesTabData) {
      this.showVariablesTabData = true;
    } else {
      this.showVariablesTabData = false;
    }
  }
  showInterfaceQueryForm() {
    if (!this.showInterfaceTabData) {
      this.showInterfaceTabData = true;
    } else {
      this.showInterfaceTabData = false;
    }
  }

  showFunctionsQueryForm() {
    if (!this.showFunctionsTabData) {
      this.showFunctionsTabData = true;
    } else {
      this.showFunctionsTabData = false;
    }
  }

  public addNewproject(): void {
    this.showNewProjectDetails = true;
    this.showApplicationDetails = true;
    this.showImport = false;
    this.savedData = false;
    this.editMode = false;
    this.resetForm();
    this.resetTableData();
    this.projectInputFields.projectLead = this.authenticatedUser.name;
    this.projectInputFields.projectLeadID = this.authenticatedUser._id;
    this.projectInputFields.category = this.categories[0].key1;
    this.projectInputFields.team = [
      {
        _id: this.authenticatedUser._id,
        name: this.authenticatedUser.name,
      },
    ];
    let config = {
      airMode: false,
      placeholder: 'Enter Notes',
      tabsize: 2,
      // lineHeights: ['0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.0', '1.2', '1.4', '1.5', '2.0', '3.0'],
      lineHeight: 1,
      dialogsInBody: true,
      fontSize: 12,
      minHeight: 200,
      height: 200,
      toolbar: [
        ['misc', ['undo', 'redo']],
        ['style', ['bold', 'italic', 'underline']],
        ['font', ['strikethrough', 'superscript', 'subscript', 'clear']], //
        ['fontsize', ['fontsize', 'color']],
        ['para', ['ul', 'ol', 'paragraph']],
        // ['height', ['height']],
        ['insert', ['link', 'picture', 'video', 'hr']],
      ],
    };
    setTimeout(() => {
      $('#addNotes').summernote(config);
    }, 0);
  }

  public addNewFeature() {
    this.newFeatures = true;
  }
  public syncIssue() {
    try {
      this.loadershow = true;
      this.loaderMessage = 'Syncing Issues';
      this.WS.post(
        'api/project/sync/issues',
        { projectId: this.projectRowID },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      });
    } catch (err) {
      this.toastr.error(err.message);
    }
    this.loadershow = false;
  }
  public addNewFlow(isShow: boolean) {
    this.newFlows = isShow;
    this.showFlowDiagram = false;
    this.showNewStep = false;
    this.disableFlowInputFields = !isShow;
    this.resetStepInputFields();
    this.dataSourceFlowSteps = new MatTableDataSource([]);
    this.resetFlow();
  }
  public addNewTestCase() {
    this.newTestCase = true;
  }

  public addNewVariable(isShow: boolean) {
    this.addVariable = isShow;
  }

  public addNewInterface(isShow: boolean) {
    this.addInterface = isShow;
  }
  public addNewFunction(isShow: boolean) {
    this.addFunction = isShow;
  }

  public saveTestCase() {
    if (this.testCaseInputFields.testCaseObjective === '') {
      this.toastr.info('Objective is Mandatory');
      $('#testCaseObjective').focus();
      return;
    }
    if (this.testCaseInputFields.testCasePreCondition?.length == 0) {
      this.toastr.info('Pre-Condition is Mandatory');
      $('#testCasePreCondition').focus();
      return;
    }
    if (!this.testCaseInputFields.testCaseTestData) {
      this.toastr.info('Test Data is Mandatory');
      $('#testCaseTestData').focus();
      return;
    }
    if (this.testCaseInputFields.testCaseSteps?.length == 0) {
      this.toastr.info('Steps is Mandatory');
      $('#testCaseSteps').focus();
      return;
    }
    if (this.testCaseInputFields.testCaseExpectedResult === '') {
      this.toastr.info('Expected Result is Mandatory');
      $('#testCaseExpectedResult').focus();
      return;
    }
    // if (this.testCaseInputFields.testCasePriority === '') {
    //   this.toastr.info('Priority is Mandatory');
    //   $('#testCasePriority').focus();
    //   return;
    // }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Test Cases';
    this.WS.post(
      'api/project/save/testCases',
      { TestCaseData: this.testCaseInputFields, projectID: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newTestCase = false;
        this.toastr.success(res.description);

        this.fetchTestCasesByProjectId();
      }
    });
  }
  public saveFlow() {
    if (this.dataSourceFlow.data?.length) {
      this.flowInputFields.flowNumber = this.dataSourceFlow.data?.length + 1
    } else {
      this.flowInputFields.flowNumber = 1
    }
    // if (this.flowInputFields.flowNumber === '') {
    //   this.toastr.info('Flow Number is Mandatory');
    //   $('#flowNumber').focus();
    //   return;
    // }
    if (this.flowInputFields.flowName === '') {
      this.toastr.info('Flow Name is Mandatory');
      $('#flowName').focus();
      return;
    }
    if (this.flowInputFields.flowActor === null) {
      this.toastr.info(' Flow Actor is Mandatory');
      $('#flowActor').focus();
      return;
    }
    // if (this.flowInputFields.flowStepNumber === '') {
    //   this.toastr.info('Step Number is Mandatory');
    //   $('#flowStepNumber').focus();
    //   return;
    // }
    // if (this.flowInputFields.flowStepDescription === '') {
    //   this.toastr.info('Description is Mandatory');
    //   $('#flowStepDescription').focus();
    //   return;
    // }
    if (this.flowInputFields.flowExpectedResult === '') {
      this.toastr.info('Expected Result is Mandatory');
      $('#flowExpectedResult').focus();
      return;
    }
    // if (this.flowInputFields.flowBasedOn === '') {
    //   this.toastr.info('Based On is Mandatory');
    //   $('#flowBasedOn').focus();
    //   return;
    // }

    this.flowInputFields['flowSteps'] = this.dataSourceFlowSteps.data;

    this.loadershow = true;
    this.loaderMessage = 'Saving Project Flow...';
    this.WS.post(
      'api/project/save/flowData',
      {
        flowData: this.flowInputFields,
        projectID: this.projectID,
        flowID: this.flowRowID,
        flowSteps: this.stepInputFields,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newFlows = false;
        this.toastr.success(res.description);
        this.resetFlow();
        this.fetchProjectFlows();
      } else {
        this.toastr.info(res.description);
      }
    });
  }
  fetchProjectFlows() {
    // this.totalNotesCount = 0;
    this.dataSourceFlow = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectFlows',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        // res.result.projectFlow.forEach((element) => {
        //   element['selctedTestCaseValue'] = 0;
        // });
        this.dataSourceFlow = new MatTableDataSource(res.result.projectFlow);
        this.dataSourceFlow.paginator = this.flowP;
        this.dataSourceFlow.sort = this.flowSort;
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public saveFeature() {
    if (this.featureInputFields.featureName === '') {
      this.toastr.info('Feature Name is Mandatory');
      $('#featureName').focus();
      return;
    }
    if (this.featureInputFields.featureType === null) {
      this.toastr.info(' Feature Type is Mandatory');
      $('#featureType').focus();
      return;
    }
    if (this.featureInputFields.featurePriority === '') {
      this.toastr.info('Feature Priority is Mandatory');
      $('#featurePriority').focus();
      return;
    }
    if (this.featureInputFields.featureDescription === '') {
      this.toastr.info('Feature Description is Mandatory');
      $('#featureDescription').focus();
      return;
    }
    if (this.featureInputFields.featureStatus === '') {
      this.toastr.info('Feature Status is Mandatory');
      $('#featureStatus').focus();
      return;
    }
    // if (this.featureInputFields.featureLabels === '') {
    //   this.toastr.info('Feature Label is Mandatory');
    //   $('#featureLabels').focus();
    //   return;
    // }
    if (
      this.featureInputFields.featureStartDate !== '' &&
      this.featureInputFields.featureEndDate !== ''
    ) {
      const days = this.calculateDayDiff(
        this.featureInputFields.featureStartDate,
        this.featureInputFields.featureEndDate
      );
      if (days < 0) {
        $('#featureEndDate').focus();
        this.toastr.warning('End date cannot be less than Start date');
        return;
      }
    }
    // if (this.featureInputFields.featureEndDate === '') {
    //   this.toastr.info('Feature End Date is Mandatory');
    //   $('#featureEndDate').focus();
    //   return;
    // }
    if (
      this.featureInputFields.featureActualStartDate !== '' &&
      this.featureInputFields.featureActualEndDate !== ''
    ) {
      const days = this.calculateDayDiff(
        this.featureInputFields.featureActualStartDate,
        this.featureInputFields.featureActualEndDate
      );
      if (days < 0) {
        $('#featureActualEndDate').focus();
        this.toastr.warning(
          'Actual End date cannot be less than Actual Start date'
        );
        return;
      }
    }
    // if (this.featureInputFields.featureActualEndDate === '') {
    //   this.toastr.info('Feature Actual End Date is Mandatory');
    //   $('#featureActualEndDate').focus();
    //   return;
    // }
    // if (this.featureInputFields.featureDependencies === '') {
    //   this.toastr.info('Feature Dependencies is Mandatory');
    //   $('#featureDependencies').focus();
    //   return;
    // }
    // if (this.featureInputFields.featureNotes === '') {
    //   this.toastr.info('Feature Notes is Mandatory');
    //   $('#featureNotes').focus();
    //   return;
    // }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Feature';
    this.WS.post(
      'api/project/save/feature',
      {
        featureData: this.featureInputFields,
        projectID: this.projectRowID,
        featureID: this.featureRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newFeatures = false;
        this.toastr.success(res.description);
        this.resetFeatures();
        this.fetchProjectFeatures();
      } else {
        this.toastr.info(res.description);
      }
    });
  }

  public editprojectSetting(data: any, flagEdit: boolean): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (
      matchPermission &&
      !matchPermission['PARTNER'].includes('PARTNER_SETTING_SAVE')
    ) {
      this.toastr.info('Access Denied!');
      return;
    } else {
      this.editprojectSettings = true;
    }
    if (flagEdit) {
      this.projectSettings = {
        _id: data._id,
        lkCode: data.lkCode,
        keyCode: data.keyCode,
        key1: data.key1,
        key2: data.key2,
        key3: data.key3,
        key4: data.key4,
        key5: data.key5,
        description: data.description,
      };
    } else {
      this.resetprojectSettings();
    }
  }

  public isJson(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  public closeAddNewProject() {
    this.newProjectDocument = false;
    this.showNewProjectDetails = false;
    this.savedData = false;
    this.showApplicationDetails = false;
    this.showprojects = true;
    this.fetchprojectsData();
  }

  public objectValidation(): void {
    if (this.projectSettings.key1 !== '') {
      this.projectSettings.key1 = JSON.stringify(this.projectSettings.key1);
    }
    if (
      this.projectSettings.key2 !== '' &&
      this.isJson(this.projectSettings.key2)
    ) {
      this.projectSettings.key2 = JSON.stringify(
        JSON.parse(this.projectSettings.key2)
      );
    }
    if (
      this.projectSettings.key3 !== '' &&
      this.isJson(this.projectSettings.key3)
    ) {
      this.projectSettings.key3 = JSON.stringify(
        JSON.parse(this.projectSettings.key3)
      );
    }
    if (
      this.projectSettings.key4 !== '' &&
      this.isJson(this.projectSettings.key4)
    ) {
      this.projectSettings.key4 = JSON.stringify(
        JSON.parse(this.projectSettings.key4)
      );
    }
    if (
      this.projectSettings.key5 !== '' &&
      this.isJson(this.projectSettings.key5)
    ) {
      this.projectSettings.key5 = JSON.stringify(
        JSON.parse(this.projectSettings.key5)
      );
    }
  }

  public projectSettingUpsert(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (
      matchPermission &&
      !matchPermission['PARTNER'].includes('PARTNER_SETTING_SAVE')
    ) {
      this.toastr.info('Access Denied!');
      return;
    }
    if (this.projectSettings.lkCode === '') {
      this.toastr.info('Look Up code cannot be empty');
      $('#lkCode').focus();
      return;
    }
    if (
      this.projectSettings.keyCode === 0 ||
      this.projectSettings.keyCode < 0
    ) {
      this.toastr.info('Key Code cannot be 0');
      $('#keyCode').focus();
      return;
    }
    if (this.projectSettings.key1 === '') {
      this.toastr.info('Key 1 cannot be empty');
      $('#setting1').focus();
      return;
    }
    this.objectValidation();
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Setting...';
    this.WS.post(
      'api/chatBox/project/settings/upsert',
      {
        _id: this.projectRowID,
        settings: btoa(JSON.stringify(this.projectSettings)),
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.fetchProjectSetting();
        this.editprojectSettings = false;
        this.loadershow = false;
        this.resetprojectSettings();
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  fetchProjectSetting() {
    this.WS.post(
      'api/project/settings/fetch',
      {
        _id: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.mapTableSetting(res.result.projectSetting);
      } else {
        this.mapTableSetting([]);
      }
    });
  }

  public syncProjects() {
    this.loadershow = true;
    this.loaderMessage = 'Syncing Applications';
    this.WS.post(
      'api/project/pull',
      {
        // _id: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        this.loadershow = false;
      } else {
        this.toastr.info(res.description);
        this.loadershow = false;
      }
    });
  }
  public resetprojectSettings(): void {
    this.projectSettings = {
      _id: '',
      lkCode: '',
      keyCode: 0,
      key1: '',
      key2: '',
      key3: '',
      key4: '',
      key5: '',
      description: '',
    };
  }

  public resetFeatures() {
    this.featureInputFields = {
      featureName: '',
      featureType: '',
      featurePriority: '',
      featureDescription: '',
      featureStatus: '',
      featureLabels: '',
      featureStartDate: null,
      featureEndDate: null,
      featureActualStartDate: null,
      featureActualEndDate: null,
      featureDependencies: '',
      featureNotes: '',
    };
  }
  public resetIssues() {
    this.issueInputFields = {
      issueName: '',
      issueType: '',
      issuePriority: '',
      issueDescription: '',
      issueStatus: '',
      issueLabels: '',
      issueStartDate: '',
      refIssueID: '',
      refIssuekey: '',
      issueNotes: '',
      estimatedStartDate: '',
    };
  }
  public resetFlow() {
    this.flowInputFields = {
      _id: '',
      flowNumber: 0,
      flowName: '',
      flowActor: '',
      // flowStepNumber: '',
      // flowStepDescription: '',
      // flowStepVaribale: [],
      flowSteps: [],
      flowStepSampleData: '',
      flowStepDatatype: '',
      flowExpectedResult: '',
      flowBasedOn: '',
      selctedTestCaseValue: 0,
    };
  }

  resetStepInputFields() {
    this.stepInputFields = {
      flowStepNumber: '',
      flowStepName: '',
      flowStepDescription: '',
      // flowStepVaribale: '',
      flowStepSampleData: '',
      flowStepDatatype: '',
    };
  }
  public saveFlowSteps(stepData) {
    this.loadershow = true;
    this.loaderMessage = 'Saving Flow Step';
    // if (this.stepInputFields.flowStepName === '') {
    //   this.toastr.info('Step Name is Mandatory');
    //   $('#flowStepName').focus();
    //   return;
    // }
    // if (this.stepInputFields.flowStepNumber === null) {
    //   this.toastr.info(' Step Number could not be negative');
    //   $('#flowStepNumbers').focus();
    //   return;
    // }
    // if (this.stepInputFields.flowStepDescription === null) {
    //   this.toastr.info(' Step Description is Mandatory');
    //   $('#flowStepDescription').focus();
    //   return;
    // }
    // if (this.stepInputFields.flowStepDatatype === null) {
    //   this.toastr.info(' Step DataType is Mandatory');
    //   $('#flowStepDatatype').focus();
    //   return;
    // }
    // if (this.stepInputFields.flowStepSampleData === null) {
    //   this.toastr.info(' Step SampleData is Mandatory');
    //   $('#flowStepSampleData').focus();
    //   return;
    // }
    // if (this.stepInputFields.flowStepVaribale === null) {
    //   this.toastr.info(' Step Variable is Mandatory');
    //   $('#flowStepVaribale').focus();
    //   return;
    // }
    this.WS.post(
      'api/project/save/flowStep',
      {
        stepDetails: this.stepInputFields,
        flowID: this.flowRowID,
        stepNumber: this.stepInputFields.flowStepNumber,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = false;
        this.toastr.success(res.description);
        this.showNewStep = false;
        this.resetStepInputFields();
        this.fetchProjectFlowsByID(this.flowRowID);
      }
      if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      }
      if (res.status === 0) {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  public addStep() {
    this.addNewStep = true;
    this.resetStepInputFields();
  }
  // public addDataSet(isShow: boolean) {
  //   this.addNewDataSet = isShow;
  // }
  public resetTestCase() {
    this.testCaseInputFields = {
      testCaseObjective: '',
      testCasePreCondition: [],
      testCaseTestData: {},
      testCaseSteps: [],
      testCaseExpectedResult: '',
      testCasePriority: '',
    };
  }
  public addNewSprint() {
    this.resetSprint();
    this.newSprint = true;
  }
  public saveSprint() {
    if (this.sprintInputFields.sprintName === '') {
      this.toastr.info('Sprint Name is Mandatory');
      $('#sprintName').focus();
      return;
    }
    if (this.sprintInputFields.sprintGoal === null) {
      this.toastr.info(' Sprint Goal is Mandatory');
      $('#sprintGoal').focus();
      return;
    }
    if (this.sprintInputFields.sprintFeatures === '') {
      this.toastr.info('Sprint Feature is Mandatory');
      $('#sprintFeatures').focus();
      return;
    }
    if (this.sprintInputFields.sprintStartDate === '') {
      this.toastr.info('Sprint Start date is Mandatory');
      $('#sprintStartDate').focus();
      return;
    }
    if (this.sprintInputFields.sprintStatus === '') {
      this.toastr.info('Sprint Status is Mandatory');
      $('#sprintStatus').focus();
      return;
    }
    if (this.sprintInputFields.sprintEndDate === '') {
      this.toastr.info('Sprint End Date is Mandatory');
      $('#sprintEndDate').focus();
      return;
    }
    const days = this.calculateDayDiff(
      this.sprintInputFields.sprintStartDate,
      this.sprintInputFields.sprintEndDate
    );
    if (days < 0) {
      $('#sprintEndDate').focus();
      this.toastr.warning('End date cannot be less than Start date');
      return;
    }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Sprint';
    this.WS.post(
      'api/project/save/sprint',
      {
        sprintDetails: this.sprintInputFields,
        projectID: this.projectRowID,
        sprintID: this.sprintRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newSprint = false;
        this.toastr.success(res.description);
        this.fetchProjectSprint();
        this.resetSprint();
      } else {
        this.toastr.info(res.description);
      }
    });
  }

  public resetSprint() {
    this.sprintInputFields = {
      sprintName: '',
      sprintGoal: '',
      sprintStartDate: '',
      sprintEndDate: '',
      sprintStatus: '',
      sprintFeatures: '',
    };
  }

  exportProjectDocuments(filename: string) {
    this.WS.post(
      'v1/chatbox/project-data/export/uploadedDocuments',
      {
        projectID: this.projectID,
        fileName: filename,
        docType: 1,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  documentSummaryDownload(s3DocId, filename: string) {
    this.WS.post(
      'v1/chatbox/project-data/export/uploadedDocuments',
      {
        projectID: this.projectID,
        fileName: filename,
        docType: 1,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  exportTestCases() {
    this.loadershow = true;
    this.loaderMessage = 'Exporting Test Cases...';
    this.WS.post(
      'v1/chatbox/project-data/export/testCasesByProjectId',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = true;
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = true;
        this.toastr.info(res.description);
      } else {
        this.loadershow = true;
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  exportFlowData() {
    this.loadershow = true;
    this.loaderMessage = 'Exporting Flow Data...';
    this.WS.post(
      'v1/chatbox/project-data/export/flowDataByProjectId',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = true;
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = true;
        this.toastr.info(res.description);
      } else {
        this.loadershow = true;
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  exportVariablesData() {
    this.loadershow = true;
    this.loaderMessage = 'Exporting Variables Data...';
    this.WS.post(
      'v1/chatbox/project-data/export/variableDataByProjectId',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = true;
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = true;
        this.toastr.info(res.description);
      } else {
        this.loadershow = true;
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  exportInterfaceData() {
    this.loadershow = true;
    this.loaderMessage = 'Exporting Interface Data...';
    this.WS.post(
      'v1/chatbox/project-data/export/interfaceDataByProjectId',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = true;
        window.open(res.result.downloadUrl, '_target');
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.loadershow = true;
        this.toastr.info(res.description);
      } else {
        this.loadershow = true;
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  searchUploadedDocuments(keyword: string) {
    if (keyword?.length > 2) {
      this.WS.post(
        'v1/chatbox/project-data/simpleSearch/uploadedDocuments',
        { projectID: this.projectID, keyword: keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.dataSourceDocuments = new MatTableDataSource(
            res.result.projectDocuments.data
          );
          this.dataSourceDocuments.paginator = this.projectDocumentsP;
          this.dataSourceDocuments.sort = this.documentSort;
        } else {
          // this.loadershow = false;
          this.toastr.error(res.description);
        }
      });
    }
  }
  trainedModelSimpleSearch(keyword: string) {}
  testCaseSimpleSearch(keyword: string) {
    this.testCaseSimpleSearched = keyword;
    if (keyword?.length > 2) {
      this.WS.post(
        'v1/chatbox/project-data/simpleSearch/testCases',
        { projectID: this.projectID, keyword: keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.dataSourceDocuments = new MatTableDataSource(
            res.result.projectDocuments.data
          );
        } else {
          // this.loadershow = false;
          this.toastr.error(res.description);
        }
      });
    }
  }

  public templateSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectData',
      { search: value },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceproject = new MatTableDataSource(res.result);
        this.dataSourceproject.paginator = this.projectDataP;
        this.dataSourceproject.sort = this.projectSort;
      } else {
        this.dataSourceproject = new MatTableDataSource([]);
      }
    });
  }
  public featureSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectFeature',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceFeatures = new MatTableDataSource(res.result);
        this.dataSourceFeatures.paginator = this.featuresP;
        this.dataSourceFeatures.sort = this.featureSort;
      } else {
        this.dataSourceFeatures = new MatTableDataSource([]);
      }
    });
  }
  public sprintSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectSprint',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceSprint = new MatTableDataSource(res.result);
        this.dataSourceSprint.paginator = this.sprintP;
        this.dataSourceSprint.sort = this.sprintSort;
      } else {
        this.dataSourceSprint = new MatTableDataSource([]);
      }
    });
  }
  public issueSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectIssue',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceIssues = new MatTableDataSource(res.result);
        this.dataSourceIssues.paginator = this.issuesP;
        this.dataSourceIssues.sort = this.issuesSort;
      } else {
        this.dataSourceIssues = new MatTableDataSource([]);
      }
    });
  }
  public codeSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectCode',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceCode = new MatTableDataSource(res.result);
        this.dataSourceCode.paginator = this.codeP;
        this.dataSourceCode.sort = this.codeSort;
      } else {
        this.dataSourceCode = new MatTableDataSource([]);
      }
    });
  }
  public variableSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectVariables',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceVariables = new MatTableDataSource(res.result);
        this.dataSourceVariables.paginator = this.variableP;
        this.dataSourceVariables.sort = this.variablesSort;
      } else {
        this.dataSourceVariables = new MatTableDataSource([]);
      }
    });
  }
  public interfaceSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectInterface',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceInterface = new MatTableDataSource(res.result);
        this.dataSourceInterface.paginator = this.interfaceP;
        this.dataSourceInterface.sort = this.interfaceSort;
      } else {
        this.dataSourceInterface = new MatTableDataSource([]);
      }
    });
  }

  public functionSimpleSearch(value): void {
    this.WS.post(
      'api/project/simpleSearchProjectFunctions',
      { search: value, projectId: this.projectRowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceFunctions = new MatTableDataSource(res.result);
        this.dataSourceFunctions.paginator = this.interfaceP;
        this.dataSourceFunctions.sort = this.functionSort;
      } else {
        this.dataSourceFunctions = new MatTableDataSource([]);
      }
    });
  }

  public advanceSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectData',
      {
        data: this.advanceSearch,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceproject = new MatTableDataSource(res.result);
        this.dataSourceproject.paginator = this.projectDataP;
        this.dataSourceproject.sort = this.projectSort;
        this.showQueryForm();
        this.showData = false;
        this.advanceSearchReset();
      } else {
        this.dataSourceproject = new MatTableDataSource([]);
      }
    });
  }
  advanceSearchReset() {
    this.advanceSearch = {
      projectName: '',
      projectCode: '',
      category: '',
    };
  }
  public advanceFeatureSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectFeature',
      {
        data: this.advanceSearchFeature,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceFeatures = new MatTableDataSource(res.result);
        this.showFeatureQueryForm();
        this.advanceFeatureSearchReset();
      } else {
        this.dataSourceFeatures = new MatTableDataSource([]);
      }
    });
  }
  public advanceSprintSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectSprint',
      {
        data: this.advanceSearchSprint,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceSprint = new MatTableDataSource(res.result);
        this.showSprintQueryForm();
        this.advanceSprintSearchReset();
      } else {
        this.dataSourceSprint = new MatTableDataSource([]);
      }
    });
  }
  public advanceIssueSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectIssue',
      {
        data: this.advanceSearchIssue,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceIssues = new MatTableDataSource(res.result);
        this.showIssueQueryForm();
        this.advanceIssueSearchReset();
      } else {
        this.dataSourceIssues = new MatTableDataSource([]);
      }
    });
  }
  public advanceCodeSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectCode',
      {
        data: this.advanceSearchCode,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceCode = new MatTableDataSource(res.result);
        this.showCodeQueryForm();
        this.advanceCodeSearchReset();
      } else {
        this.dataSourceCode = new MatTableDataSource([]);
      }
    });
  }
  public advanceFlowSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectFlow',
      {
        data: this.advanceSearchFlow,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceFlow = new MatTableDataSource(res.result);
        this.showFlowQueryForm();
        this.advanceFlowSearchReset();
      } else {
        this.dataSourceFlow = new MatTableDataSource([]);
      }
    });
  }
  public advanceTestCaseTabSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectTestCase',
      {
        data: this.advanceSearchTestCaseTab,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceTestCase = new MatTableDataSource(res.result);
        this.showTestCaseQueryForm();
        this.advanceTestCaseTabSearchReset();
      } else {
        this.dataSourceTestCase = new MatTableDataSource([]);
      }
    });
  }
  public advanceTrainedModelSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectTrainedModel',
      {
        data: this.advanceSearchTrainedModel,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceTrainedModel = new MatTableDataSource(res.result);
        this.showTrainedModelQueryForm();
        this.advanceTrainedModelSearchReset();
      } else {
        this.dataSourceTrainedModel = new MatTableDataSource([]);
      }
    });
  }

  public advanceVariableSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectVariable',
      {
        data: this.advanceSearchVariable,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceVariables = new MatTableDataSource(res.result);
        this.showVariablesQueryForm();
        this.advanceFeatureSearchReset();
      } else {
        this.dataSourceVariables = new MatTableDataSource([]);
      }
    });
  }

  public advanceInterfaceSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectInterface',
      {
        data: this.advanceSearchInterface,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceInterface = new MatTableDataSource(res.result);
        this.showInterfaceQueryForm();
        // this.advanceFeatureSearchReset();
      } else {
        this.dataSourceInterface = new MatTableDataSource([]);
      }
    });
  }

  public advanceFunctionsSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectFunctions',
      {
        data: this.advanceSearchInterface,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceInterface = new MatTableDataSource(res.result);
        this.showInterfaceQueryForm();
        // this.advanceFeatureSearchReset();
      } else {
        this.dataSourceInterface = new MatTableDataSource([]);
      }
    });
  }

  public stringifyObject(json) {
    return JSON.stringify(json);
  }
  public advanceProjectDocumentSearchSubmit(): void {
    this.WS.post(
      'api/project/advanceSearchProjectDocument',
      {
        data: this.advanceSearchProjectDocument,
        projectID: this.projectRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceDocuments = new MatTableDataSource(res.result);
        this.showProjectDocumentQueryForm();
        this.advanceProjectDocumentReset();
      } else {
        this.dataSourceDocuments = new MatTableDataSource([]);
      }
    });
  }

  public advanceFeatureSearchReset(): void {
    this.advanceSearchFeature = {
      featureName: '',
      type: '',
      status: '',
    };
  }
  public advanceSprintSearchReset(): void {
    this.advanceSearchSprint = {
      name: '',
      goal: '',
      status: '',
    };
  }
  public advanceIssueSearchReset(): void {
    this.advanceSearchIssue = {
      name: '',
    };
  }
  public advanceCodeSearchReset(): void {
    this.advanceSearchCode = {
      author: '',
      fileName: '',
      repository: '',
    };
  }
  public advanceFlowSearchReset(): void {
    this.advanceSearchFlow = {
      flowName: '',
      actor: '',
      expectedResult: '',
    };
  }
  public advanceTestCaseTabSearchReset(): void {
    this.advanceSearchTestCaseTab = {
      objective: '',
      preCondition: '',
      expectedResult: '',
      priority: '',
    };
  }
  public advanceTrainedModelSearchReset(): void {
    this.advanceSearchTrainedModel = {
      fileName: '',
      createdOn: '',
    };
  }
  public advanceProjectDocumentReset(): void {
    this.advanceSearchProjectDocument = {
      documentName: '',
      createdOn: '',
    };
  }
  public advanceProjectVariablesReset(): void {
    this.advanceSearchVariable = {
      name: '',
    };
  }
  public advanceProjectInterfaceReset(): void {
    this.advanceSearchInterface = {
      name: '',
    };
  }
  public hideprojectDetails(): void {
    this.showNewProjectDetails = false;
    this.showApplicationDetails = false;
    this.savedData = false;
    this.resetForm();
    this.fetchprojectsData();
  }
  public fetchProjectDocumentList(): void {
    this.documentList = [];
    this.documentList = [{ _id: '1', displayText: 'List of Events' }];
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectDocumentList',
      {},
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.simpleSearch = '';
        res.result.fetchDocuments.forEach((item) => {
          const displayText = `${item.docTempName} - ${item.docShortCode}`;
          this.documentList.push({
            _id: item._id,
            displayText: displayText,
          });
        });
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    });
  }

  public onTabChange(tab) {
    switch (tab) {
      case 'features':
        this.newFeatures = false;
        this.resetFeatures();
        this.fetchProjectFeatures();
        break;

      case 'sprint':
        this.newSprint = false;
        this.resetSprint();
        this.fetchProjectSprint();
        // this.fetchFileTypes('LEGAL_FILE_TYPE', 2);
        // this.fetchSubmittedprojectDocuments();
        break;

      case 'generate-document':
        this.newGeneratedDoc = false;
        this.generatedDocInput = {};
        this.fetchProjectDocumentList();
        this.fetchGeneratedDocs();
        break;

      case 'flow':
        this.newFlows = false;
        this.showNewStep = false;
        this.resetFlow();
        this.resetStepInputFields();
        this.fetchProjectFlows();
        break;

      case 'testCase':
        this.newTestCase = false;
        this.resetTestCase();
        this.fetchTestCasesByProjectId();
        break;

      case 'issues':
        this.newIssues = false;
        this.resetIssues();
        this.fetchProjectIssues();
        break;

      case 'code':
        this.newCode = false;
        this.fetchProjectCodes();
        break;

      case 'trained-model':
        this.recordingScreen = false;
        this.uploadingProjectRecording = false;
        this.fetchProjectTrainedModels();
        break;

      case 'document':
        this.newProjectDocument = false;
        this.fetchProjectDocuments();
        break;

      case 'fineTuning':
        this.newTuningDataSet = false;
        this.fetchProjectFineTuning();
        break;

      case 'variables':
        this.addVariable = false;
        this.resetVariable();
        this.fetchProjectVariables();
        break;

      case 'interface':
        this.addInterface = false;
        this.resetInterface();
        this.fetchProjectInterfaces();
        break;

      case 'functions':
        this.addFunction = false;
        this.resetFunctions();
        this.fetchProjectFunctions();
        break;
    }
  }

  public onDocumentTypeSelect(arg): void {
    console.log('documentTypeList', arg);
  }
  public onSelectAllDocumentType(arg): void {}
  public onDocumentTypeDeSelect(arg): void {}
  public onDeSelectAllDocumentType(arg): void {}

  public onLinkprojectSelect(item: any): void {
    // 1
    console.log('Selected item:', item);
    this.linkedprojects.push(item);
  }

  public fetchFileTypes(lkcode): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      { lookupCode: lkcode },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.filleTypes = res.result.values as IGlobalSetting[];
      } else {
        this.filleTypes = [];
      }
    });
  }

  public onSelectAllLinkproject(items: any[]): void {
    // 2
    console.log('Selected all items:', items);
    this.linkedprojects = items;
  }

  public onLinkprojectDeSelect(item: any): void {
    // 3
    console.log('Deselected item:', item);
    const indexToRemove = this.linkedprojects.findIndex(
      (obj) => obj.projectName === item.projectName
    );
    if (indexToRemove !== -1) {
      this.linkedprojects.splice(indexToRemove, 1);
    }
  }

  public onDeSelectAllLinkproject(items: any[]): void {
    // 4
    console.log('Deselected all items:', items);
    this.linkedprojects = items;
  }

  public onLabelSelect(arg): void {}
  public onSelectAllLabel(arg): void {}
  public onLabelDeSelect(arg): void {}
  public onDeSelectAllLabel(arg): void {}
  // public onStageSelect(item): void {
  //   this.stage = item;
  // }
  public onSelectAllStage(arg): void {}
  public onStageDeSelect(arg): void {}
  public onDeSelectAllStage(arg): void {}

  public fetchprojectsData(): void {
    this.loadershow = true;
    this.showprojects = true;
    this.simpleSearch = '';
    this.loaderMessage = 'Loading applications...';
    this.WS.post(
      'v1/chatbox/project-data/fetchprojects',
      {},
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.simpleSearch = '';
        this.projectData = res.result as IprojectDetails[];
        // this.packageProductData = res.result;
        // this.mapGlobalSettingsOnData();
        this.loadershow = false;
        // this.updateLocalisation();
        this.toastr.success(res.description);
        this.dataSourceproject = new MatTableDataSource(this.projectData);

        this.dataSourceproject.paginator = this.projectDataP;
        this.dataSourceproject.sort = this.projectSort;
        // console.log('Table data: ', this.dataSourceproject.filteredData);
        this.linkprojectList = this.dataSourceproject.filteredData.map(
          (item) => ({
            projectName: item.projectName,
            id: item._id,
          })
        );
        // console.log('the projects list: ', this.linkprojectList);
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    });
  }

  public fetchProjectByID(id: string) {
    this.projectRowID = id;
    this.editMode = true;
    this.connectedprojects = '';
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/project-data/fetch/dataById',
      { projectID: id },
      'CHATBOX'
    ).subscribe(async (res: IResponse) => {
      if (res.status === 1) {
        this.showNewProjectDetails = true;
        this.savedData = true;
        this.projectID = id;
        this.fetchProjectSetting();
        // this.projectInputFields = res.result.projectDetails as IprojectDetails;
        // this.projectInputFields.lastModifiedOn =
        //   res.result.projectDetails.lastModifiedOn?.substring(0, 10);
        // this.projectInputFields.createdOn =
        //   res.result.projectDetails.createdOn?.substring(0, 10);
        this.projectInputFields.partnerName = res.result.projectDetails
          .projectPartnerr.length
          ? res.result.projectDetails.projectPartnerr[0].name
          : null;
        this.projectInputFields.projectLead = res.result.projectDetails
          .projectLeadd.length
          ? res.result.projectDetails?.projectLeadd[0].name
          : null;
        this.projectInputFields.projectLeadID = res.result.projectDetails
          .projectLeadd.length
          ? res.result.projectDetails?.projectLeadd[0]._id
          : null;
        this.projectInputFields.parentProject = res.result.projectDetails
          ?.parentProjectt.length
          ? res.result.projectDetails?.parentProjectt[0].projectName
          : null;
        this.projectInputFields.parentProjectId = res.result.projectDetails
          ?.parentProjectt.length
          ? res.result.projectDetails?.parentProjectt[0]._id
          : null;
        this.projectInputFields.domain = res.result.projectDetails.domain;
        this.projectInputFields.category = res.result.projectDetails.category;
        this.projectInputFields.projectCode =
          res.result.projectDetails.projectCode;
        this.projectInputFields.projectName =
          res.result.projectDetails.projectName;
        this.projectInputFields.description =
          res.result.projectDetails.description;
        this.projectInputFields.labels = res.result.projectDetails.labels;
        this.projectInputFields.status = res.result.projectDetails.status;
        this.projectInputFields.team = res.result.projectDetails.team;
        this.projectInputFields.environment =
          res.result.projectDetails.environment;
        this.summaryFileTypes = res.result.projectDetails.documentSummaryList;
        this.connectedprojects = res.result.projectDetails.linkedprojects;
        this.fetchProjectFeatures();
        this.fetchProjectVariables();
        this.fetchProjectInterfaces();
        this.fetchProjectFunctions();
        this.fetchProjectSprint();
        this.fetchGeneratedDocs();
        this.fetchProjectDocuments();
        this.fetchProjectFineTuning();
        this.fetchProjectDocumentList();
        this.fetchProjectIssues();
        this.fetchProjectFlows();
        this.fetchProjectCodes();
        this.fetchProjectTrainedModels();
        this.fetchTestCasesByProjectId();

        if (
          res.result.projectDetails &&
          res.result.projectDetails?.documentSummaryList?.length > 0
        ) {
          this.filleTypes.forEach((element) => {
            res.result.projectDetails.documentSummaryList.forEach((item) => {
              if (item.docType == element.keyCode) {
                this.documentSummaryTypes.push(element);
              }
            });
          });
        }
        // this.fetchprojectTask();
        // this.fetchSubmittedprojectDocuments();
        // this.fetchLinkedprojects(this.connectedprojects);
        // this.fetchLinkedActs();
        // this.fetchSupportContacts();
        // this.fetchApplications();
        // this.lastUpdatedOn = res.result.projectDetails.lastUpdatedOn.split("T")[0] |date : "dd MMM yyyy"
        // this.lastUpdatedOn = this.datePipe.transform(res.result.projectDetails.lastUpdatedOn, 'dd/MM/yyyy');

        // console.log(this.plaintiff, this.defendant);

        let config = {
          airMode: false,
          placeholder: 'Enter Notes',
          tabsize: 2,
          // lineHeights: ['0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.0', '1.2', '1.4', '1.5', '2.0', '3.0'],
          lineHeight: 1,
          dialogsInBody: true,
          fontSize: 12,
          minHeight: 200,
          height: 200,
          toolbar: [
            ['misc', ['undo', 'redo']],
            ['style', ['bold', 'italic', 'underline']],
            ['font', ['strikethrough', 'superscript', 'subscript', 'clear']], //
            ['fontsize', ['fontsize', 'color']],
            ['para', ['ul', 'ol', 'paragraph']],
            // ['height', ['height']],
            ['insert', ['link', 'picture', 'video', 'hr']],
          ],
        };
        setTimeout(() => {
          $('#addNotes').summernote(config);
        }, 0);
      }
    });
  }

  public editTuningDataSet(id: string) {
    $('#addTuningMsgDataSetModal').modal('show');
  }

  public fetchProjectFeaturesByID(id: string) {
    this.featureRowID = id;
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/projectFeature-data/fetch/dataById',
      {
        projectID: this.projectRowID,
        id: this.featureRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newFeatures = true;
        this.featureInputFields = {
          featureName: res.result.featureDetail.name,
          featureType: res.result.featureDetail.type,
          featurePriority: res.result.featureDetail.priority,
          featureDescription: res.result.featureDetail.description,
          featureStatus: res.result.featureDetail.status,
          featureLabels: res.result.featureDetail.labels,
          featureStartDate: this.cs.formatDateForInputs(
            res.result.featureDetail.estimatedStartDate
          ),
          featureEndDate: this.cs.formatDateForInputs(
            res.result.featureDetail.estimatedEndDate
          ),
          featureActualStartDate: this.cs.formatDateForInputs(
            res.result.featureDetail.actualStartDate
          ),
          featureActualEndDate: this.cs.formatDateForInputs(
            res.result.featureDetail.actualEndDate
          ),
          featureDependencies: this.getParentFeatures(
            res.result.featureDetail.parentFeature
          ),
          featureNotes: res.result.featureDetail.notes,
        };
      }
    });
  }

  public fetchProjectVariablesByID(id: string) {
    this.variableRowID = id;
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/projectVariables-data/fetch/dataById',
      {
        id: this.variableRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addVariable = true;
        this.variableInputFields = {
          name: res.result.variables.name,
          dataType: res.result.variables.dataType,
          isMandatory: res.result.variables.isMandatory == true ? 1 : 0,
          inputType: res.result.variables.inputType,
          characterLimit: res.result.variables.characterLimit,
          rangeMin: res.result.variables.range.min,
          rangeMax: res.result.variables.range.max,
          defaultValue: res.result.variables.defaultValue,
          regex_pattern: res.result.variables.regex_pattern,
          variableOption: res.result.variables.options.join(','),
          createdOn: res.result.variables.createdOn
            ? this.cs.formatDate(res.result.variables.createdOn)
            : '',
        };
      }
    });
  }

  public fetchProjectInterfaceByID(id: string) {
    this.resetInterface()
    this.dataSourceInterfaceVariable = new MatTableDataSource([])
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/project-data/fetch/interfaceById',
      {
        id,
      },
      'CHATBOX'
    ).subscribe(async (res: IResponse) => {
      if (res.status === 1) {
        this.addInterface = true;
        this.interfaceInputFields = {
          _id: res.result.interfaceDetails._id,
          name: res.result.interfaceDetails.name,
          interfaceType: res.result.interfaceDetails.interfaceType,
          url: res.result.interfaceDetails.url,
          description: res.result.interfaceDetails.description,
          s3DocImageId: res.result.interfaceDetails.screenImageS3Id ? await this.previewInterfaceUploadedImages(res.result.interfaceDetails.screenImageS3Id) : '',
          createdOn: res.result.interfaceDetails.createdOn,
          lastModifiedOn: res.result.interfaceDetails.lastModifiedOn,
        };
        this.dataSourceInterfaceVariable = new MatTableDataSource(
          res.result.interfaceDetails.variablesList
        );
        this.dataSourceInterfaceVariable.paginator = this.interfaceVariableP;
      }
    });
  }

  public fetchProjectFunctionsByID(id: string) {
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/project-data/fetch/functionsById',
      {
        id,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addFunction = true;
        this.functionInputFields = {
          _id: res.result.functionDetails._id,
          name: res.result.functionDetails.name,
          class: res.result.functionDetails.class,
          input: res.result.functionDetails.input,
          output: res.result.functionDetails.output,
          author: res.result.functionDetails.author,
          fileName: res.result.functionDetails.fileName,
          exceptionList: res.result.functionDetails.exceptionList.join(','),
          createdOn: res.result.functionDetails.createdOn,
          lastModifiedOn: res.result.functionDetails.lastModifiedOn,
        };
      }
    });
  }

  public fetchProjectFlowStepsById(data: any) {
    this.dataSourceFlowStepVariables = new MatTableDataSource([]);
    this.showNewStep = true;
    this.disableFlowStepNumber = true;
    this.stepInputFields = {
      flowStepNumber: data.stepNumber,
      flowStepName: data.stepName,
      flowStepDescription: data.stepDescription,
      // flowStepVaribale: data.variable,
      flowStepSampleData: data.sampleData,
      flowStepDatatype: data.dataType,
    };
    this.dataSourceFlowStepVariables = new MatTableDataSource(data.variableIds);
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  chooseInterfaceImage(data: any) {
    const file = data.target.files[0]

    if (file) {
      this.base64Image = ''
      this.convertFileToBase64(file).then(base64String => {
        this.base64Image = base64String
        console.log('Base64 String:', base64String);
        if (this.base64Image) {
          this.WS.post('api/project-data/chatbox/s3/uploadImages', { fileName: file.name, fileType: file.type, bufferString: this.base64Image }, 'CHATBOX').subscribe((res: any) => {
            if (res.status) {
              this.interfaceInputFields.s3DocImageId = res.result.s3DocImageId
            }
          })
        }
      }).catch(error => {
        console.error('Error converting file:', error);
      });
    }


    //  this.WS.post('api/chatbox/s3/presignedURL', {
    //       type: 'InterfaceUplodedImages',
    //       contentType: file.type,
    //       fileSize: file.size,
    //       fileName: file.name,
    //       extension: fileName[fileName.length - 1],
    //     }, 'CHATBOX').subscribe((res: IResponse) => {
    //       if (res.status === 1) {
    //         this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
    //           (event: HttpEvent<any>) => {
    //             switch (event.type) {
    //               case HttpEventType.Sent:
    //                 break;
    //               case HttpEventType.ResponseHeader:
    //                 break;
    //               case HttpEventType.UploadProgress:
    //                 break;
    //               case HttpEventType.Response:
    //                 this.WS.post(
    //                   'v1/chatbox/project-data/upload/projectDocuments',
    //                   {},
    //                   'CHATBOX'
    //                 ).subscribe(async (res: IResponse) => {
    //                   if (res.status === 1) {
    //                     this.loadershow = false;
    //                     this.toastr.success(res.description);
    //                   }
    //                 });
    //             }
    //           }
    //         );
    //       } else if (res.status === 2) {
    //         this.toastr.info(res.description);
    //       } else {
    //         this.toastr.error(res.description);
    //       }
    //     });
  }

  public calculateDayDiff(startDate: string, endDate: string): any {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // tslint:disable-next-line: max-line-length
    const date = Math.floor(
      (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
        Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
        (1000 * 60 * 60 * 24)
    );
    return date;
  }

  public fetchProjectFlowsByID(id: string) {
    this.showFlowDiagram = false;
    this.disableFlowInputFields = true;
    this.flowRowID = id;
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/projectFlow-data/fetch/dataById',
      {
        projectID: this.projectRowID,
        id: this.flowRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newFlows = true;
        this.flowInputFields = {
          _id: res.result.flowDetail._id,
          flowNumber: res.result.flowDetail.flowNumber,
          flowName: res.result.flowDetail.flowName,
          flowActor: res.result.flowDetail.actor,
          // flowStepNumber: res.result.flowDetail.steps,
          // flowStepDescription: res.result.flowDetail,
          flowExpectedResult: res.result.flowDetail.expectedResult,
          flowBasedOn: res.result.flowDetail.projectDocumentId.documentName,
          // flowStepVaribale: res.result.flowDetail.variableData,
          flowSteps: res.result.flowDetail.steps,
          flowStepSampleData: '',
          flowStepDatatype: '',
          selctedTestCaseValue: 0,
        };
        // this.flowSteps = res.result.flowDetail.steps;
        this.dataSourceFlowSteps = new MatTableDataSource(
          this.flowInputFields.flowSteps
        );
        this.dataSourceFlowSteps.paginator = this.flowStepP;
      } else {
        this.toastr.info(res.description);
      }
    });
  }

  addNewStepsToFlow() {
    this.showNewStep = true;
    this.disableFlowStepNumber = false;
    this.resetStepInputFields();
  }

  previewWorkFlowDiagram(flowData: any) {
    this.showFlowDiagram = true;
    // this.changeDetector.detectChanges()
    // this.initialiseStage()
    // console.log('Flow Steps', flowData)
    // this.WS.post(
    //   'api/master/workflow/create/ai',
    //   {
    //     projectID: this.projectRowID,
    //     flowStepId: flowData._id,
    //   },
    //   'CHATBOX'
    // ).subscribe((res: IResponse) => {
    //   if (res.status === 1) {
    //     this.showFlowDiagram = true;
    //     this.toastr.success(res.description);
    //     for (let step of res.result.workflow) {
    //       let shape = null
    //       if (step.type === "START") {
    //         shape = this.drawStart({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       else if (step.type === "HUMAN STEP") {
    //         shape = this.drawHumanStep({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       else if (step.type === "SYSTEM STEP") {
    //         shape = this.drawSystemStep({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       else if (step.type === "DELAY") {
    //         shape = this.drawDelay({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       else if (step.type === "DECISION") {
    //         shape = this.drawDecision({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       else if (step.type === "END") {
    //         shape = this.drawEnd({
    //           stepName: step.name,
    //           stepText: step.text,
    //           stepDescription: step.description,
    //           formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
    //         })
    //       }
    //       if (shape) {
    //         step.shapeID = shape.getAttr('id')
    //       }
    //     }
    //     for (let i = 0; i < res.result.workflow.length - 1; i++) {
    //       if (res.result.workflow[i + 1]) {
    //         let shape1 = this.stage.children[this.layerIndices.steps].findOne(`#${res.result.workflow[i].shapeID}`)
    //         let shape2 = this.stage.children[this.layerIndices.steps].findOne(`#${res.result.workflow[i + 1].shapeID}`)
    //         this.linkShape(shape1, shape2, {})
    //       }
    //     }
    //     this.selectedShape = null

    //   }
    //   else if (res.status === 2) {
    //     this.toastr.info(res.description)
    //   }
    //   else {
    //     this.toastr.error(res.description)
    //   }
    // });
  }

  getParentFeatures(depen: any): any {
    const dependencies = [];
    if (depen.length) {
      depen.forEach((element) => {
        dependencies.push({ _id: element._id, name: element.name });
      });
      return dependencies;
    } else {
      return null;
    }
  }

  public fetchProjectSprintByID(id: string) {
    this.sprintRowID = id;
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/projectSprint-data/fetch/dataById',
      {
        projectID: this.projectRowID,
        id: this.sprintRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newSprint = true;
        this.sprintInputFields = {
          sprintName: res.result.sprintDetails.name,
          sprintGoal: res.result.sprintDetails.goal,
          sprintStartDate: this.cs.formatDateForInputs(
            res.result.sprintDetails.startDate
          ),
          sprintEndDate: this.cs.formatDateForInputs(
            res.result.sprintDetails.endDate
          ),
          sprintStatus: res.result.sprintDetails.status,
          sprintFeatures: res.result.sprintDetails.features,
        };
      }
    });
  }

  public fetchProjectIssueByID(id: string) {
    this.issueRowID = id;
    console.log('the ID: ', id);
    this.WS.post(
      'v1/chatbox/projectIssue-data/fetch/dataById',
      {
        projectID: this.projectRowID,
        id: this.issueRowID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newIssues = true;
        this.issueInputFields = {
          issueName: res.result.issueDetail.name,
          issueType: res.result.issueDetail.type,
          issuePriority: res.result.issueDetail.priority,
          issueDescription: res.result.issueDetail.description,
          refIssueID: res.result.issueDetail.refIssueID,
          issueStatus: res.result.issueDetail.status,
          issueLabels: res.result.issueDetail.labels,
          issueStartDate: this.cs.formatDateForInputs(
            res.result.issueDetail.startDate
          ),
          estimatedStartDate: this.cs.formatDateForInputs(
            res.result.issueDetail.estimatedStartDate
          ),
          issueNotes: res.result.issueDetail,
          refIssuekey: res.result.issueDetail.refIssuekey,
        };
      }
      this.dataSourceIssueCommentsDetail = res.result.issueDetail.comments.map(
        (comment) => JSON.parse(comment)
      );
      this.dataSourceIssueCommentsDetail.paginator = this.issueCommentP;
    });
  }
  getStatuss(value: any, from): string {
    let filter = null;
    if (value) {
      switch (from) {
        case 'Feature':
          if (this.featureStatuses && this.featureStatuses.length) {
            filter = this.featureStatuses.filter((a) => a.keyCode == value);
          }
          break;
        case 'Sprint':
          if (this.statusList && this.statusList.length) {
            filter = this.statusList.filter((a) => a.keyCode == value);
          }
          break;
        case 'Category':
          if (this.categories && this.categories.length) {
            filter = this.categories.filter((a) => a.keyCode == value);
          }
          break;
        case 'Domain':
          if (this.domains && this.domains.length) {
            filter = this.domains.filter((a) => a.keyCode == value);
          }
          break;
        case 'FileType':
          if (this.filleTypes && this.filleTypes.length) {
            filter = this.filleTypes.filter((a) => a.keyCode == value);
          }
          break;
      }
      return filter && filter.length ? filter[0].key1 : '';
    }
  }

  public generateProjectDocuments(id: string) {
    this.generatedDocInput.projectID = id;

    if (this.generatedDocInput.event?.length === 0) {
      this.toastr.info('Select Documents From Dropdown');
      $('#testProjectType').focus();
      return;
    }
    this.generatedDocInput.event.forEach((element) => {
      if (element._id === '1') {
        element['status'] = 1;
      } else {
        element['status'] = 0;
      }
    });
    this.WS.post(
      'v1/chatbox/project-data/generate/projectDataEvents',
      {
        data: this.generatedDocInput,
      },
      'CHATBOX'
    ).subscribe(async (res: IResponse) => {
      if (res.status === 1) {
        this.newGeneratedDoc = false;
        this.toastr.success(res.description);
        this.fetchGeneratedDocs();
        this.generatedDocInput.event.forEach(async (element) => {
          if (element._id === '1') {
            element['docTemplateID'] = {
              _id: 1,
              docShortCode: 'List of Events',
            };
          } else {
            for (let [
              index,
              generatedTestCase,
            ] of res.result.generatedPromptReq.entries()) {
              await this.reloadTestCases(index, generatedTestCase);
            }
          }
        });

        console.log('generatesPrompts created');
      } else {
        this.toastr.info(res.description);
      }

      this.loadershow = false;
    });
  }

  async reloadTestCases(index: number, newDocument: any) {
    this.testCaseTimeout[index] = false;

    const subscription = this.WS.getID(
      'v1/chatbox/project-data/process/testCaseData',
      newDocument._id
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (updatedDocument: any) => {
          this.testCaseTimeout[index] = false;
          this.dataSourceGeneratedDocs.data[index] = updatedDocument.result;
          // updatedDocument.result.forEach((item) => {
          //   if (!item.docTemplateID) {
          //     item['docTemplateID'] = { _id: 1, docShortCode: 'List of Events' };
          //   }
          // });
          // this.dataSourceGeneratedDocs = new MatTableDataSource(updatedDocument.result);
          this.dataSourceGeneratedDocs.paginator = this.generatedDocP;
          if (updatedDocument && updatedDocument.result.status === 1) {
            this.dataSourceGeneratedDocs._updateChangeSubscription();
          }
        },
        (error) => {
          if (error) {
            console.log('Server error:', error.message);
          }
        }
      );

    // Timeout handling
    setTimeout(() => {
      if (
        !this.dataSourceGeneratedDocs.data[index] ||
        this.dataSourceGeneratedDocs.data[index].status !== 1
      ) {
        console.log('Condition not matched after 2 minutes');
        subscription.unsubscribe(); // Unsubscribe on timeout
        this.testCaseTimeout[index] = true;
      }
    }, 30000); // 0.5 minutes
  }

  // public generatePromptRequest(data: string) {
  //   this.WS.post(
  //     'v1/chatbox/project-data/create/generatedPromptRequest',
  //     {
  //       requestData: data,
  //     },
  //     'CHATBOX'
  //   ).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       res.result.forEach((item) => {
  //         if (!item.docTemplateID) {
  //           item['docTemplateID'] = { _id: 1, docShortCode: 'List of Events' };
  //         }
  //       });
  //       this.dataSourceGeneratedDocs = new MatTableDataSource(res.result);
  //       this.dataSourceGeneratedDocs.paginator = this.generatedDocP;
  //       this.toastr.success(res.description);
  //     } else {
  //       this.toastr.info(res.description);
  //     }

  //     this.loadershow = false;
  //   });
  // }

  public downloadTestCasesDocXExcel(path: string) {
    this.WS.post(
      'v1/chatbox/project-data/download/projectDataEvents',
      { awsPath: path },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        window.open(res.result, '_self');
        this.toastr.success(res.description);
      } else {
        this.toastr.info(res.description);
      }

      this.loadershow = false;
    });
  }

  refreshRow(index: number, data: any) {
    this.WS.getID(
      'v1/chatbox/project-data/process/generateDocument',
      data._id
    ).subscribe(
      (updatedData: any) => {
        this.dataSourceGeneratedDocs.data[index] = updatedData.result;
        this.dataSourceGeneratedDocs._updateChangeSubscription();
        this.dataSourceGeneratedDocs.paginator = this.generatedDocP;
        this.dataSourceGeneratedDocs.sort = this.generateDocumentSort;
      },
      (error) => {
        console.log('Error fetching updated application:', error);
      }
    );
  }

  public callGenerateDocsRequest(id: string) {
    this.WS.post(
      'v1/chatbox/project-data/generateDocs/projectDataEvents',
      { _id: id },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.fetchGeneratedDocs();
      } else {
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  public fetchGeneratedDocs() {
    // this.totalGeneratedDocs = 0;
    this.dataSourceGeneratedDocs = new MatTableDataSource([]);
    this.WS.post(
      'v1/chatbox/project-data/fetch/generatedDocuments',
      { projectID: this.projectID, event: 1, docType: 2 },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.newGeneratedDoc = false;
        // this.totalGeneratedDocs = res.result?.length;
        res.result.forEach((item, index) => {
          if (!item.docTemplateID) {
            item['docTemplateID'] = {
              _id: 1,
              docShortCode: 'LOE',
              docTempName: 'List of Events',
            };
          }
          // this.reloadTestCases(index, item);
        });
        // res.result.forEach((element, index) => {
        //   this.reloadTestCases(index, element);
        // });
        this.dataSourceGeneratedDocs = new MatTableDataSource(res.result);
        this.dataSourceGeneratedDocs.paginator = this.generatedDocP;
        this.dataSourceGeneratedDocs.sort = this.generateDocumentSort;
        // this.toastr.success(res.description);
      } else {
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  public previewTestCaseDocs(value: any): void {
    // this.dataSourceGeneratedPrompts = new MatTableDataSource([])
    this.WS.post(
      'v1/chatbox/project-data/fetch/generatedDocument/prompts',
      { requestId: value._id, event: 1, docType: 3 },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.showGeneratedDocs = value;
        // this.showGeneratedPrompts = true
        this.dataSourceGeneratedPrompts = new MatTableDataSource(
          res.result.generatedPromptDetails
        );
        this.dataSourceGeneratedPrompts.paginator = this.generatedPromptsP;
        this.dataSourceGeneratedPrompts.sort = this.generatedPromptssort;
        console.log(
          'dataSourceGeneratedPrompts',
          this.dataSourceGeneratedPrompts
        );
        $('#showGeneratedPrompts').modal('show');
        this.toastr.success(res.description);
      } else {
        this.toastr.info(res.description);
        // this.showGeneratedPrompts = false
      }

      this.loadershow = false;
    });
  }

  public parseResponse(data: string): string {
    let htmlContent = '';
    let isTableStarted = false;

    // Split the data into lines
    const lines = data.split('\n');

    // Iterate through each line
    for (const line of lines) {
      // Check if the line starts with '|' to identify table rows
      if (line.trim().startsWith('|')) {
        // If table is not started, start the table
        if (!isTableStarted) {
          isTableStarted = true;
          htmlContent += '<table>';
        }
        // Remove leading and trailing '|' characters and split the line by '|'
        const columns = line
          .trim()
          .slice(1, -1)
          .split('|')
          .map((col) => col.trim());
        // Generate HTML for table row
        htmlContent += `<tr><td>${columns[1]}</td><td>${columns[2]}</td><td>${columns[3]}</td></tr>`;
      } else {
        // If table is already started, close the table
        if (isTableStarted) {
          isTableStarted = false;
          htmlContent += '</table>';
        }
        // Add the line as it is
        htmlContent += `<p>${line}</p>`;
      }
    }

    // If table was not closed, close it
    if (isTableStarted) {
      htmlContent += '</table>';
    }

    return htmlContent;
  }

  public onlyDate(dateString: string): string {
    const [datePart, timePart] = dateString.split(' ');
    return datePart;
  }

  public saveproject() {
    // console.log('hi');
    // this.projectInputFields['partner'] = this.partnerId
    if (this.projectInputFields.projectName === '') {
      this.toastr.info('Application Name is Mandatory');
      $('#projectName').focus();
      return;
    }
    if (this.projectInputFields.projectCode === null) {
      this.toastr.info(' Application Code is Mandatory');
      $('#projectCode').focus();
      return;
    }

    if (this.projectInputFields.environment === null) {
      this.toastr.info(' Application Environment is Mandatory');
      $('#environment').focus();
      return;
    }

    // if (this.projectInputFields.domain === '') {
    //   this.toastr.info('Domain is Mandatory');
    //   $('#domain').focus();
    //   return;
    // }
    // if (this.projectInputFields.category === '') {
    //   this.toastr.info('Category is Mandatory');
    //   $('#category').focus();
    //   return;
    // }
    if (this.projectInputFields.projectLead === '') {
      this.toastr.info('Application Lead is Mandatory');
      $('#projectLead').focus();
      return;
    }
    if (
      this.projectInputFields.team === '' ||
      this.projectInputFields.team.length == 0
    ) {
      this.toastr.info('Team is Mandatory');
      $('#team').focus();
      return;
    }
    if (this.projectInputFields.partnerId === '') {
      this.toastr.info('Application Partner is Mandatory');
      $('#partnerId').focus();
      return;
    }
    if (this.projectInputFields.description === '') {
      this.toastr.info('Description is Mandatory');
      $('#description').focus();
      return;
    }
    if (this.projectInputFields.status === '') {
      this.toastr.info('Status is Mandatory');
      $('#projectStatus').focus();
      return;
    }
    if (
      this.projectInputFields.projectCode &&
      this.projectInputFields.projectCode.length > 10
    ) {
      this.toastr.info('Application Code is too long : must be less than 10');
      return;
    }
    this.loadershow = true;
    this.loaderMessage = 'Saving Application Details';
    this.WS.post(
      'v1/chatbox/project-data/saveDetail',
      {
        data: this.projectInputFields,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        this.hideprojectDetails();
        this.fetchprojectsData();
        this.loadershow = false;
        // this.fetchProjectFeatures();
        // this.fetchProjectDocuments();
        // this.fetchprojectTask();
        // this.fetchSubmittedprojectDocuments();
        // this.fetchLinkedprojects(this.connectedprojects);
        // this.fetchGeneratedDocs();
        // this.fetchLinkedActs();
        // this.fetchSupportContacts();
        // this.fetchApplications();
        // this.fetchProjectDocumentList();

        let config = {
          airMode: false,
          placeholder: 'Enter Notes',
          tabsize: 2,
          // lineHeights: ['0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.0', '1.2', '1.4', '1.5', '2.0', '3.0'],
          lineHeight: 1,
          dialogsInBody: true,
          fontSize: 12,
          minHeight: 200,
          height: 200,
          toolbar: [
            ['misc', ['undo', 'redo']],
            ['style', ['bold', 'italic', 'underline']],
            ['font', ['strikethrough', 'superscript', 'subscript', 'clear']], //
            ['fontsize', ['fontsize', 'color']],
            ['para', ['ul', 'ol', 'paragraph']],
            // ['height', ['height']],
            ['insert', ['link', 'picture', 'video', 'hr']],
          ],
        };
        setTimeout(() => {
          $('#addNotes').summernote(config);
        }, 0);
        // this.fileId = res.result.projectDetails.fileId;
        // this.filingNumber = res.result.projectDetails.filingNumber;
        // this.projectNumber = res.result.projectDetails.projectNumber;
        // this.projectName = res.result.projectDetails.projectName;
        // this.cnrNumber = res.result.projectDetails.cnrNumber;
        // this.subject = res.result.projectDetails.subject;
        // this.stage = res.result.projectDetails.stage;
        // this.jurisdictionDistrict = res.result.projectDetails.jurisdictionDistrict;
        // this.jurisdictionState = res.result.projectDetails.jurisdictionState;
        // this.labels = res.result.projectDetails.labels;
        // this.billingCurrency = res.result.projectDetails.billingCurrency;
        // this.court = res.result.projectDetails.court;
        // this.nextHearing = res.result.projectDetails.nextHearing;
        // this.disposalDate = res.result.projectDetails.disposalDate;
        // this.lastUpdatedOn = res.result.projectDetails.lastUpdatedOn;
        // this.bench = res.result.projectDetails.bench;
        // this.createdBy = res.result.projectDetails.createdBy;
        // this.projectDescription = res.result.projectDetails.projectDescription;
        // this.plaintiff = res.result.projectDetails.plaintiff;
        // this.defendant = res.result.projectDetails.defendant;
        // this.requiredOutput = res.result.projectDetails.requiredOutput;
        // this.item = res.result.projectDetails.item;
        // this.projectStatus = res.result.projectDetails.projectStatus;

        // this.fetchprojectsData();
        this.savedData = true;
        this.resetTableData();
        this.resetAllFlag();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  getLabels(labels: any) {
    let extractedLables: any = [];
    extractedLables.push(labels.map((a: any) => a.key1));
    return extractedLables.join(',');
  }

  getPriority(data: any): any {
    this.priorities.forEach((element) => {
      if (element.keyCode == data) {
        return element.key1;
      }
    });
  }

  getTypes(type: any) {
    if (type.length) {
      return type[0].key1;
    } else {
      return '';
    }
  }

  resetTableData() {
    this.dataSourceproject = new MatTableDataSource([]);
    this.dataSourceDocuments = new MatTableDataSource([]);
    this.dataSourceTrainedModel = new MatTableDataSource([]);
    this.dataSourceGeneratedDocs = new MatTableDataSource([]);
    this.dataSourceFeatures = new MatTableDataSource([]);
    this.dataSourceIssues = new MatTableDataSource([]);
    this.dataSourceCode = new MatTableDataSource([]);
    this.dataSourceFlow = new MatTableDataSource([]);
    this.dataSourceFlowSteps = new MatTableDataSource([]);
    this.dataSourceTestCase = new MatTableDataSource([]);
    this.dataSourceSprint = new MatTableDataSource([]);
    this.dataSourceSetting = new MatTableDataSource([]);
    this.dataSourceIssueCommentsDetail = new MatTableDataSource([]);
    this.dataSourceGeneratedPrompts = new MatTableDataSource([]);
  }
  public addContact(isShow: any) {
    this.addNewContact = isShow;
  }

  // public addNote() {
  //   console.log(this.noteText, this.projectID);
  //   this.WS.post(
  //     'v1/chatbox/project-data/saveNotes',
  //     {
  //       projectID: this.projectID,
  //       // note: this.noteText,
  //       note: $('#addNotes').summernote('code'),
  //     },
  //     'CHATBOX'
  //   ).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       this.toastr.success(res.description);
  //       // call the function that shows all the notes
  //       this.fetchProjectFeatures();
  //     } else if (res.status === 2) {
  //       this.toastr.info(res.description);
  //     } else {
  //       this.toastr.error(res.description);
  //     }
  //     this.loadershow = false;
  //     this.noteText = '';
  //   });
  // }

  public fetchProjectFeatures() {
    this.featureList = [];
    this.featureRowID = null;
    // this.totalNotesCount = 0;
    this.dataSourceFeatures = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectFeatures',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        // this.totalNotesCount = res.result.projectNotes?.length;
        this.dataSourceFeatures = new MatTableDataSource(
          res.result.projectFeatures
        );
        this.featureList = [];
        res.result.projectFeatures.forEach((element) => {
          this.featureList = element.type;
          element['featureTypes'] = [];
          element.type.forEach((item) => {
            element['featureTypes'].push(item.key1);
          });
        });
        // this.featuresCount = res.result.projectFeatures.length;
        this.dataSourceFeatures.paginator = this.featuresP;
        this.fetchFeatureTypes('FEATURE_TYPE');
        this.dataSourceFeatures.sort = this.featureSort;
        console.log('Notes table: ', this.dataSourceFeatures);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
        // this.featuresCount = 0;
      } else {
        this.toastr.error(res.description);
        // this.featuresCount = 0;
      }
      this.loadershow = false;
    });
  }
  public saveVariable() {
    if (this.variableInputFields.name === '') {
      this.toastr.info('Variable Name is Mandatory');
      $('#variableName').focus();
      return;
    }
    // if (this.variableInputFields.dataType === null) {
    //   this.toastr.info(' Data Type is Mandatory');
    //   $('#variableDataType').focus();
    //   return;
    // }
    // if (this.variableInputFields.inputType === null) {
    //   this.toastr.info(' Input Type is Mandatory');
    //   $('#inputType').focus();
    //   return;
    // }
    if (this.variableInputFields.isMandatory === '') {
      this.toastr.info('IsMandatory Field is Mandatory');
      $('#variableIsMandatory').focus();
      return;
    }
    // if (this.variableInputFields.characterLimit === '') {
    //   this.toastr.info('Character Limit is Mandatory');
    //   $('#variableCharacterLimit').focus();
    //   return;
    // }
    // if (this.variableInputFields.rangeMax === '') {
    //   this.toastr.info('Range Max is Mandatory');
    //   $('#characterLimit').focus();
    //   return;
    // }
    // if (this.variableInputFields.rangeMin === '') {
    //   this.toastr.info('Range Min is Mandatory');
    //   $('#variableRangeMin').focus();
    //   return;
    // }
    // if (this.variableInputFields.defaultValue === '') {
    //   this.toastr.info('Default Value is Mandatory');
    //   $('#defaultValue').focus();
    //   return;
    // }
    // if (this.variableInputFields.regex_pattern === '') {
    //   this.toastr.info('Regex is Mandatory');
    //   $('#regex_pattern').focus();
    //   return;
    // }
    // if (this.variableInputFields.variableOption === '') {
    //   this.toastr.info('Options are Mandatory');
    //   $('#variableOptions').focus();
    //   return;
    // }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Variable';
    this.WS.post(
      'api/project/save/variable',
      {
        variableData: this.variableInputFields,
        variableID: this.variableRowID,
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addVariable = false;
        this.toastr.success(res.description);
        this.resetVariable();
        this.fetchProjectVariables();
      } else {
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }
  public saveInterface() {
    if (this.interfaceInputFields.name === '') {
      this.toastr.info('Interface Name is Mandatory');
      $('#interfaceName').focus();
      return;
    }
    if (this.interfaceInputFields.interfaceType === '') {
      this.toastr.info('Interface Type is Mandatory');
      $('#interType').focus();
      return;
    }
    if (this.interfaceInputFields.url === '') {
      this.toastr.info(' Data Type is Mandatory');
      $('#interfaceUrl').focus();
      return;
    }
    if (this.interfaceInputFields.description === '') {
      this.toastr.info(' Input Type is Mandatory');
      $('#interfaceDesc').focus();
      return;
    }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Interface';
    this.WS.post(
      'api/project/save/interface',
      {
        interfaceData: this.interfaceInputFields,
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addInterface = false;
        this.toastr.success(res.description);
        this.resetInterface();
        this.fetchProjectInterfaces();
      } else {
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  public saveFunction() {
    if (this.functionInputFields.name === '') {
      this.toastr.info('Name is Mandatory');
      $('#functionName').focus();
      return;
    }
    if (this.functionInputFields.class === '') {
      this.toastr.info('Class is Mandatory');
      $('#functionClass').focus();
      return;
    }
    if (this.functionInputFields.input === '') {
      this.toastr.info(' Input is Mandatory');
      $('#functionInput').focus();
      return;
    }
    if (this.functionInputFields.output === '') {
      this.toastr.info('Output is Mandatory');
      $('#functionOutput').focus();
      return;
    }
    if (this.functionInputFields.author === '') {
      this.toastr.info('Author is Mandatory');
      $('#functionAuthor').focus();
      return;
    }
    if (this.functionInputFields.fileName === '') {
      this.toastr.info('FileName is Mandatory');
      $('#functionFileName').focus();
      return;
    }
    if (this.functionInputFields.exceptionList === '') {
      this.toastr.info('Exception List is Mandatory');
      $('#functionExceptionList').focus();
      return;
    }
    this.loadershow = true;
    this.loaderMessage = 'Saving Project Functions';
    this.WS.post(
      'api/project/save/functions',
      {
        functionData: this.functionInputFields,
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.addFunction = false;
        this.toastr.success(res.description);
        this.resetFunctions();
        this.fetchProjectFunctions();
      } else {
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  resetVariable() {
    this.variableInputFields = {
      name: '',
      dataType: '',
      isMandatory: '',
      inputType: '',
      characterLimit: '',
      rangeMin: '',
      rangeMax: '',
      defaultValue: '',
      regex_pattern: '',
      createdOn: '',
      variableOption: '',
    };
  }
  resetInterface() {
    this.interfaceInputFields = {
      _id: '',
      name: '',
      url: '',
      description: '',
      createdOn: null,
      lastModifiedOn: null,
      interfaceType: '',
      s3DocImageId: '',
    };
  }
  resetFunctions() {
    this.functionInputFields = {
      _id: '',
      name: '',
      class: '',
      input: '',
      output: '',
      author: '',
      fileName: '',
      exceptionList: '',
      createdOn: null,
      lastModifiedOn: null,
    };
  }
  public fetchProjectVariables() {
    this.variableRowID = null;
    this.dataSourceVariables = new MatTableDataSource([]);
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectVariables',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceVariables = new MatTableDataSource(
          res.result.projectVariables
        );
        this.variablesCount = res.result.projectVariables.length;
        this.dataSourceVariables.paginator = this.variableP;
        this.dataSourceVariables.sort = this.variablesSort;
        console.log('Notes table: ', this.dataSourceVariables);
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.variablesCount = 0;
      } else {
        this.toastr.error(res.description);
        this.variablesCount = 0;
      }
      this.loadershow = false;
    });
  }
  public fetchProjectInterfaces() {
    this.dataSourceInterface = new MatTableDataSource([]);
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectInterfaces',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        res.result.projectInterfaces.forEach(async element => {
          if (element.screenImageS3Id) {
            element['uploadedImage'] =element.screenImageS3Id ?  await this.previewInterfaceUploadedImages(element.screenImageS3Id): ''
          }
        });
        this.dataSourceInterface = new MatTableDataSource(
          res.result.projectInterfaces
        );
        this.dataSourceInterface.paginator = this.interfaceP;
        this.dataSourceInterface.sort = this.interfaceSort;
        console.log('dataSourceInterface table: ', this.dataSourceInterface);
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.variablesCount = 0;
      } else {
        this.toastr.error(res.description);
        this.variablesCount = 0;
      }
      this.loadershow = false;
    });
  }

  public fetchProjectFunctions() {
    this.dataSourceFunctions = new MatTableDataSource([]);
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectFunctions',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceFunctions = new MatTableDataSource(
          res.result.projectFunctions
        );

        this.dataSourceFunctions.paginator = this.interfaceP;
        this.dataSourceFunctions.sort = this.functionSort;
        console.log('dataSourceFunctions table: ', this.dataSourceFunctions);
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.variablesCount = 0;
      } else {
        this.toastr.error(res.description);
        this.variablesCount = 0;
      }
      this.loadershow = false;
    });
  }

  public onValueChange(value) {
    const val = this.featureList.filter((a) => a._id == value);
    this.selectedFeature = val[0];
    this.fileName = this.selectedFeature.name;
    this.disableDropDownUseFrom = false;
  }
  public fetchProjectSprint() {
    this.sprintRowID = null;
    // this.totalNotesCount = 0;
    this.dataSourceSprint = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectSprint',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        // this.totalNotesCount = res.result.projectNotes?.length;
        this.dataSourceSprint = new MatTableDataSource(
          res.result.projectSprint
        );
        // this.featuresCount=res.result.projectSprint.length
        this.dataSourceSprint.paginator = this.featuresP;
        console.log('Notes table: ', this.dataSourceSprint);
        this.dataSourceSprint.sort = this.sprintSort;
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public fetchProjectIssues() {
    this.issueRowID = null;
    // this.totalNotesCount = 0;
    this.loaderMessage = 'Fetching Issues';
    this.loadershow = true;
    this.dataSourceIssues = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectIssues',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        // this.totalNotesCount = res.result.projectNotes?.length;
        this.dataSourceIssues = new MatTableDataSource(
          res.result.projectIssues
        );
        this.issuesCount = res.result.projectIssues.length;
        this.dataSourceIssues.paginator = this.issuesP;
        this.dataSourceIssues.sort = this.issuesSort;
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.issuesCount = 0;
      } else {
        this.toastr.error(res.description);
        this.issuesCount = 0;
      }
      this.loadershow = false;
    });
  }

  public fetchTestCasesByProjectId() {
    this.loaderMessage = 'Fetching Test Cases';
    this.loadershow = true;
    this.dataSourceTestCase = new MatTableDataSource([]);
    this.WS.post(
      'v1/chatbox/project-data/fetchTestCasesByProjectId',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        res.result.fetchTestCases.forEach((element) => {
          element.preConditions = element.preConditions.join(',\n');
          element.steps = element.steps.join(',\n');
          element.sampleTestData =
            typeof element.sampleTestData === 'object'
              ? Object.entries(element.sampleTestData)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(',\n')
              : element.sampleTestData;
        });
        this.dataSourceTestCase = new MatTableDataSource(
          res.result.fetchTestCases
        );
        this.dataSourceTestCase.paginator = this.testCasesP;
        this.dataSourceTestCase.sort = this.testCaseSort;
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public fetchProjectCodes() {
    this.codeRowId = null;
    // this.totalNotesCount = 0;
    this.loaderMessage = 'Fetching Codes...';
    this.loadershow = true;
    this.dataSourceCode = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectCode',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        // this.totalNotesCount = res.result.projectNotes?.length;
        res.result.projectCode.forEach((element) => {
          if (
            element.updatedCodeAnalysis &&
            element.updatedCodeAnalysis?.length
          ) {
            element['functionsNames'] = [];
            element['overallSummarys'] = [];
            element.updatedCodeAnalysis.forEach((item) => {
              if (item.functions?.length) {
                element['overallSummarys'].push(item.overallSummary);

                item.functions.forEach((ele) => {
                  element['functionsNames'].push(ele.functionName);
                });
              }
            });
          }
        });
        this.dataSourceCode = new MatTableDataSource(res.result.projectCode);
        this.codeCount = res.result.projectCode.length;
        this.dataSourceCode.paginator = this.codeP;
        this.dataSourceCode.sort = this.codeSort;
        this.loadershow = false;
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.loadershow = false;
        this.codeCount = 0;
      } else {
        this.toastr.error(res.description);
        this.loadershow = false;
        this.codeCount = 0;
      }
      this.loadershow = false;
    });
  }

  public fetchProjectTrainedModels() {
    this.codeRowId = null;
    // this.totalNotesCount = 0;
    this.loaderMessage = 'Fetching Trained Models';
    this.loadershow = true;
    this.dataSourceTrainedModel = new MatTableDataSource([]);
    // console.log("In fetch notes", this.projectID)
    this.WS.post(
      'v1/chatbox/project-data/fetchProjectTrainedModels',
      {
        projectID: this.projectID,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        // this.totalNotesCount = res.result.projectNotes?.length;
        this.dataSourceTrainedModel = new MatTableDataSource(
          res.result.projectTrainedModels
        );
        this.trainedModelCount = res.result.projectTrainedModels.length;
        this.dataSourceTrainedModel.paginator = this.trainedModelP;
        this.dataSourceTrainedModel.sort = this.trainModelSort;
        this.loadershow = false;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
        this.loadershow = false;
        this.trainedModelCount = 0;
      } else {
        this.toastr.error(res.description);
        this.loadershow = false;
        this.trainedModelCount = 0;
      }
      this.loadershow = false;
    });
  }
  // public fetchLinkedprojects(id: any) {
  //   this.totalConnectedprojectsCount = 0;
  //   this.dataSourceConnectedprojects = new MatTableDataSource([]);
  //   // console.log("In fetch notes", this.projectID)
  //   this.WS.post(
  //     'v1/chatbox/project-data/fetchLinkedprojects',
  //     {
  //       linkedIds: id,
  //     },
  //     'CHATBOX'
  //   ).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       // this.toastr.success(res.description);
  //       this.totalConnectedprojectsCount = res.result.projectsLinked?.length;
  //       this.dataSourceConnectedprojects = new MatTableDataSource(
  //         res.result.projectsLinked
  //       );
  //       console.log('linked projects : ', this.dataSourceConnectedprojects);
  //       this.dataSourceConnectedprojects.paginator = this.connectedprojectsP;
  //     } else if (res.status === 2) {
  //       this.toastr.info(res.description);
  //     } else {
  //       this.toastr.error(res.description);
  //     }
  //     this.loadershow = false;
  //   });
  // }

  public fetchProjectDocuments() {
    // this.projectDocumentSchema = 0;
    this.dataSourceDocuments = new MatTableDataSource([]);
    console.log('In fetch AI documents: ');
    this.WS.post(
      'v1/chatbox/project-data/fetch/DocumentsByProjectID',
      {
        projectID: this.projectID,
        docType: 1,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.toastr.success(res.description);
        this.dataSourceDocuments = new MatTableDataSource(
          res.result.projectDocuments
        );
        this.dataSourceDocuments.paginator = this.projectDocumentsP;
        this.dataSourceDocuments.sort = this.documentSort;
        // this.projectDocumentSchema = res.result.projectDocuments?.length;
        this.projectDocumentData = res.result.projectDocuments;
        res.result.projectDocuments.forEach((element, index) => {
          this.loadDocumentData(index, element);
        });
        console.log('Document table: ', this.dataSourceDocuments);
      } else if (res.status === 2) {
        // this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  public fetchProjectFineTuning() {
    // this.projectDocumentSchema = 0;
    this.dataSourceFineTuning = new MatTableDataSource([]);
    console.log('In fetch AI documents: ');
    this.WS.post(
      'v1/chatbox/project-data/fetch/fineTuningDataSets',
      {
        projectID: this.projectID,
        docType: 1,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        this.dataSourceFineTuning = new MatTableDataSource(
          res.result.fetchTuningDataSets
        );
        this.dataSourceFineTuning.paginator = this.projectFineTuningP;
        this.dataSourceFineTuning.sort = this.fineTuningSort;
        console.log('Document table: ', this.dataSourceFineTuning);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }

  // public fetchSubmittedprojectDocuments() {
  //   this.submittedDocumentCount = 0;
  //   this.dataSourceSubmittedDocuments = new MatTableDataSource([]);
  //   this.WS.post(
  //     'v1/chatbox/project-data/fetch/submitted/DocumentsByproject',
  //     {
  //       projectID: this.projectID,
  //       docType: 2,
  //     },
  //     'CHATBOX'
  //   ).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       this.toastr.success(res.description);
  //       this.dataSourceSubmittedDocuments = new MatTableDataSource(
  //         res.result.projectDocuments
  //       );
  //       this.dataSourceSubmittedDocuments.paginator = this.submittedDocumentP;
  //       this.submittedDocumentCount = res.result.projectDocuments?.length;
  //     } else if (res.status === 2) {
  //       this.toastr.info(res.description);
  //     } else {
  //       this.toastr.error(res.description);
  //     }
  //     this.loadershow = false;
  //   });
  // }

  downloadProjectDocSummary(docId: Number) {
    this.WS.post(
      'v1/chatbox/project-data/download/uploaded/docSummary',
      { docId },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if ((res.status = 1)) {
        if (res.status === 1) {
          window.open(res.result, '_target');
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      }

      this.loadershow = false;
    });
  }

  UploadProjectDocuments(docTypeValue, docType) {
    this.loadershow = true;
    this.loaderMessage = 'Uploading Document...';
    const fileTypeValue = this.filleTypes.filter((item) => {
      if (item.keyCode == this.selectedFileType) {
        return item.key1;
      }
    });
    const formData: FormData = new FormData();

    const inputValues = {
      projectID: this.projectID,
      docType: docType,
      docTypeVal: docTypeValue,
      fileType: this.selectedFileType,
      isUsedForTraining: this.isUsedForTraining,
      isUsedForTestCase: this.isUsedForTestCase,
    };

    for (const file of this.selectedFile) {
      formData.append('file', file);
    }
    formData.append('ProjectData', JSON.stringify(inputValues));

    this.WS.post(
      'v1/chatbox/project-data/upload/projectDocuments',
      formData,
      'CHATBOX'
    ).subscribe(async (res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = false;
        // this.toastr.success(res.description);
        let assistantResponses = [];
        this.newProjectDocument = false;
        this.fetchProjectDocuments();
        for (let response of res.result) {
          // let responseMsg = response.data.status === 'In Process' ? 'File upload is in progress' : response.data.status;
          this.loadershow = false;
          // this.toastr.info(responseMsg);

          await this.fetchAssistantResponse(response);
          let summaryAssistantRes = await this.fetchAssistantResponse(response);
          if (summaryAssistantRes) {
            assistantResponses.push(summaryAssistantRes);
          }
        }
        // await this.checkStatusWithDelay()
        //  await this.fetchCaseDocuments();
        for (let [index, assistantResponse] of assistantResponses.entries()) {
          await this.loadDocumentData(index, assistantResponse);
        }
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    });

    // upload document using presigned Url

    // for (const file of this.selectedFile) {
    //   const fileName = file.name.split('.');
    //   this.WS.post('api/master/s3/presignedURL', {
    //     type: 'project_Documents',
    //     contentType: file.type,
    //     fileSize: file.size,
    //     fileName: file.name,
    //     extension: fileName[fileName.length - 1],
    //   }, 'CHATBOX').subscribe((res: IResponse) => {
    //     if (res.status === 1) {
    //       this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
    //         (event: HttpEvent<any>) => {
    //           switch (event.type) {
    //             case HttpEventType.Sent:
    //               break;
    //             case HttpEventType.ResponseHeader:
    //               break;
    //             case HttpEventType.UploadProgress:
    //               break;
    //             case HttpEventType.Response:
    //               const inputValues = {
    //                 projectID: this.projectID,
    //                 docType: docType,
    //                 docTypeVal: docTypeValue,
    //                 fileType: this.selectedFileType,
    //                 isUsedForTraining: this.isUsedForTraining,
    //                 isUsedForTestCase: this.isUsedForTestCase,
    //               };
    //               this.WS.post(
    //                 'v1/chatbox/project-data/upload/projectDocuments',
    //                 {data: inputValues},
    //                 'CHATBOX'
    //               ).subscribe(async (res: IResponse) => {
    //                 if (res.status === 1) {
    //                   this.loadershow = false;
    //                   // this.toastr.success(res.description);
    //                   let assistantResponses = [];
    //                   this.newProjectDocument = false;
    //                   this.fetchProjectDocuments();
    //                   for (let response of res.result) {
    //                     // let responseMsg = response.data.status === 'In Process' ? 'File upload is in progress' : response.data.status;
    //                     this.loadershow = false;
    //                     // this.toastr.info(responseMsg);

    //                     await this.fetchAssistantResponse(response);
    //                     let summaryAssistantRes = await this.fetchAssistantResponse(response);
    //                     if (summaryAssistantRes) {
    //                       assistantResponses.push(summaryAssistantRes);
    //                     }
    //                   }
    //                   // await this.checkStatusWithDelay()
    //                   //  await this.fetchCaseDocuments();
    //                   for (let [index, assistantResponse] of assistantResponses.entries()) {
    //                     await this.loadDocumentData(index, assistantResponse);
    //                   }
    //                 } else if (res.status === 2) {
    //                   this.loadershow = false;
    //                   this.toastr.info(res.description);
    //                 } else {
    //                   this.loadershow = false;
    //                   this.toastr.error(res.description);
    //                 }
    //               });
    //           }
    //         }
    //       );
    //     } else if (res.status === 2) {
    //       this.toastr.info(res.description);
    //     } else {
    //       this.toastr.error(res.description);
    //     }
    //   });
    // }
  }

  UploadTrainedModelDocuments() {
    this.isUsedForTraining = 1;
    this.isUsedForTestCase = 0;
    // this.loadershow = true;
    // this.loaderMessage = 'Uploading Training Model...';
    let formData: FormData = new FormData();
    let inputValues = null;
    if (this.trainedModelType.keyCode == 4) {
      inputValues = {
        projectID: this.projectID,
        docType: this.trainedModelType.keyCode,
        docTypeVal: this.trainedModelType.key1,
        fileType: 1, //this.selectedFeature.status,
        featureId: this.selectedFeature._id,
        isUsedForTraining: this.isUsedForTraining,
        isUsedForTestCase: this.isUsedForTestCase,
      };
      for (const file of this.trainedModel.file) {
        formData.append('file', file);
      }
      formData.append('ProjectData', JSON.stringify(inputValues));
    } else {
      inputValues = {
        projectID: this.projectID,
        docType: this.trainedModelType.keyCode,
        docTypeVal: this.trainedModelType.key1,
        fileType: 1, //this.selectedFeature.status,
        featureId: this.selectedFeature._id,
        isUsedForTraining: this.isUsedForTraining,
        isUsedForTestCase: this.isUsedForTestCase,
      };
      for (const file of this.trainedModel.file) {
        formData.append('file', file);
      }
      formData.append('ProjectData', JSON.stringify(inputValues));
    }

    this.WS.post(
      'v1/chatbox/project-data/upload/projectDocuments',
      formData,
      'CHATBOX'
    ).subscribe(async (res: IResponse) => {
      if (res.status === 1) {
        this.loadershow = false;
        // this.toastr.success(res.description);
        this.trainedModel = {
          file: null,
          feature: null,
        };
        this.disableDropDownUseFrom = true;
        let assistantResponses = [];
        this.newProjectDocument = false;
        this.fetchProjectDocuments();
        for (let response of res.result) {
          // let responseMsg = response.data.status === 'In Process' ? 'File upload is in progress' : response.data.status;
          this.loadershow = false;
          // this.toastr.info(responseMsg);

          await this.fetchAssistantResponse(response);
          let summaryAssistantRes = await this.fetchAssistantResponse(response);
          if (summaryAssistantRes) {
            assistantResponses.push(summaryAssistantRes);
          }
        }
        // await this.checkStatusWithDelay()
        //  await this.fetchCaseDocuments();
        for (let [index, assistantResponse] of assistantResponses.entries()) {
          await this.loadDocumentData(index, assistantResponse);
        }
      } else if (res.status === 2) {
        this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        this.loadershow = false;
        this.toastr.error(res.description);
      }
    });
  }

  async fetchAssistantResponse(input: any) {
    return new Promise((resolve, reject) => {
      this.WS.post(
        'v1/chatbox/summaryAssistant',
        {
          // projectID: this.projectID,
          docId: input.data.docId,
          // requiredOutput: this.projectInputFields.requiredOutput,
          // caseDescription: this.projectInputFields.description,
        },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.toastr.success(res.description);
          resolve(res.result.projectDocumentUpdate1);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
          resolve(null);
        } else {
          this.toastr.error(res.description);
          resolve(null);
        }
      });
    });
  }

  // public linkTheproject() {
  //   console.log('yes we can link projects');
  //   console.log(this.projectID);
  //   let projectIdsToLink = [];
  //   projectIdsToLink = this.linkedprojects.map((item) => item.id);
  //   this.WS.post(
  //     'v1/chatbox/project-data/linkprojects',
  //     {
  //       projectID: this.projectID,
  //       projectLink: projectIdsToLink,
  //     },
  //     'CHATBOX'
  //   ).subscribe((res: IResponse) => {
  //     if (res.status === 1) {
  //       this.toastr.success(res.description);
  //       this.fetchLinkedprojects(projectIdsToLink);
  //     } else if (res.status === 2) {
  //       this.toastr.info(res.description);
  //     } else {
  //       this.toastr.error(res.description);
  //     }
  //     this.loadershow = false;
  //   });
  // }

  generateNewDocument(isShow: any) {
    this.newGeneratedDoc = isShow;
  }
  addnewProjectDocument(isShow: boolean) {
    this.newProjectDocument = isShow;
  }
  addnewProjectVariable(isShow: boolean) {
    this.addVariable = isShow;
  }
  ShowDownloadProjectSummary(isShow: boolean) {
    this.showDownloadDocSummary = isShow;
  }
  addnewTuningDataSet(isShow: boolean) {
    this.newTuningDataSet = isShow;
  }
  // generateDocTestCases(isShow: boolean) {
  //   this.createTestCases = isShow;
  // }
  addNewSubmittedDocument() {
    this.newSubmittedDocument = true;
  }
  // addNewNotes() {
  //   this.newFeatures = true;
  //   let config = {
  //     airMode: false,
  //     placeholder: 'Enter Notes',
  //     tabsize: 2,
  //     // lineHeights: ['0.2', '0.3', '0.4', '0.5', '0.6', '0.8', '1.0', '1.2', '1.4', '1.5', '2.0', '3.0'],
  //     lineHeight: 1,
  //     dialogsInBody: true,
  //     fontSize: 12,
  //     minHeight: 200,
  //     height: 200,
  //     toolbar: [
  //       ['misc', ['undo', 'redo']],
  //       ['style', ['bold', 'italic', 'underline']],
  //       ['font', ['strikethrough', 'superscript', 'subscript', 'clear']], //
  //       ['fontsize', ['fontsize', 'color']],
  //       ['para', ['ul', 'ol', 'paragraph']],
  //       // ['height', ['height']],
  //       ['insert', ['link', 'picture', 'video', 'hr']],
  //     ],
  //   };
  //   setTimeout(() => {
  //     $('#addNotes').summernote(config);
  //   }, 0);
  // }
  // addNewLinkedActs(isShow: any) {
  //   this.newLinkedActs = isShow;
  // }
  // addNewConnectedprojects() {
  //   this.newConnectedprojects = true;
  // }
  // addNewTask(isShow: any) {
  //   this.newTask = isShow;
  // }
  addNewApplications(isShow: any) {
    this.newApplications = isShow;
  }

  resetAllFlag() {
    this.resetVariable();
    this.resetForm();
    this.resetFeatures();
    this.resetIssues();
    this.resetFlow();
    this.resetTestCase();
    this.resetSprint();
    this.generatedDocInput = {};
  }

  onFileChange(data) {
    console.log(data);
    this.selectedFile = data.target.files;
  }

  onFileChangeTrainedModel(data) {
    console.log(data);
    this.trainedModel.file = data.target.files;

    if (data.target.files) {
      this.UploadTrainedModelDocuments();
    }
    // this.uploadingProjectRecording = true
    // this.newProjectDocument = true
  }
  resetForm() {
    this.projectInputFields = {
      domain: '',
      parentProject: '',
      _id: '',
      projectName: '',
      labels: [],
      description: '',
      status: '',
      partnerName: '',
      projectLead: '',
      category: '',
      team: '',
      parentProjectId: '',
      projectLeadID: '',
      environment: '',
    };
  }

  public deleteDocument(): void {
    console.log('in deleting');
    console.log('data for deleting: ', this.reasonForDeleting);
    this.WS.post(
      'v1/chatbox/project-data/deleteDocument',
      {
        documentId: this.selectedElement._id,
        reasonForDeleting: this.reasonForDeleting,
        remarksOnDeleting: this.remarksOnDeleting,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        $('#documentDeleteModal').modal('hide');
        this.fetchProjectDocuments();
        this.reasonForDeleting = '';
        this.remarksOnDeleting = '';
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
  }
  public deleteSubmittedDocument() {
    $('#submittedDocumentDeleteModal').modal('hide');
  }
  public deleteTestCases() {
    $('#generateDocumentDeleteModal').modal('hide');
  }

  public fetchOutletOwnedNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partners = res.result.partners as IPartner[];
            if (!this.partners.length) {
              this.toastr.info('Not found');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.partners = [];
    }
  }

  public setTokenOutletOwned(partner): void {
    this.getPartnerById(partner._id);
    this.partners = [];
  }

  public getPartnerById(partnerId: string): void {
    this.WS.post('api/master/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const partner: IPartner = res.result.partners[0];
          this.projectInputFields.partnerId = partner._id;
          this.projectInputFields.partnerName = partner.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public getInfoOfpartnerName(): string {
    return 'Choose the partner who owns this outlet';
  }

  fetchProjectTeams(lookupCode: string): void {
    this.WS.post('api/chatbox/fetchUsers', {}, 'CHATBOX').subscribe(
      (res: any) => {
        if (res.status === 1) {
          this.teamList = res.result;
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }

  getUser(id) {
    this.WS.post('api/chatbox/fetchUserById', { id: id }, 'CHATBOX').subscribe(
      (res: any) => {
        if (res.status === 1) {
          return res.result.name;
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }

  fetchProjectStatus(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.statusList = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchFeatureTypes(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.typeList = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchFeatureStatus(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.featureStatuses = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.featureStatuses = [];
        this.toastr.info(res.description);
      } else {
        this.featureStatuses = [];
        this.toastr.error(res.description);
      }
    });
  }

  fetchIssueStatus(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.issueStatuses = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.issueStatuses = [];
        this.toastr.info(res.description);
      } else {
        this.issueStatuses = [];
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectLabels(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        console.log('labels', res.result.values as IGlobalSetting);
        this.labelList = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchFeatureLabels(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        console.log('labels', res.result.values as IGlobalSetting);
        this.featureLabelList = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectEnvironments(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        console.log('labels', res.result.values as IGlobalSetting);
        this.enviroments = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectCategories(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.categories = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchVariableOption(lookupCode: string) {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.variableOptions = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectDomains(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.domains = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectLinks(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.links = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchFeaturePriority(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.priorities = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchApplicationStatus(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.applicationStatus = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchProjectTrainedModelOptions(lookupCode: string): void {
    this.WS.post(
      'api/chatbox/globalSetting/fetch/lookupCode',
      {
        lookupCode,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.trainedModelOptions = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  // async loadDocumentData(index: number, newDocument: any) {
  //   this.timeoutOccurred[index] = false;

  //   const subscription = this.WS.getID(
  //     'api/chatbox/process/uploadedDocumentData',
  //     newDocument._id
  //   )
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe(
  //       (updatedDocument: any) => {
  //         this.timeoutOccurred[index] = false;
  //         this.dataSourceDocuments.data[index] = updatedDocument.result;
  //         this.dataSourceDocuments.paginator = this.projectDocumentsP;
  //         if (updatedDocument.result.analysisStatus === 1) {
  //           this.dataSourceDocuments._updateChangeSubscription();
  //         }
  //       },
  //       (error) => {
  //         if (error) {
  //           console.log('Server error:', error.message);
  //         }
  //       }
  //     );

  //   // Timeout handling
  //   setTimeout(() => {
  //     if (
  //       !this.dataSourceDocuments.data[index] ||
  //       this.dataSourceDocuments.data[index].analysisStatus !== 1
  //     ) {
  //       console.log('Condition not matched after 2 minutes');
  //       subscription.unsubscribe(); // Unsubscribe on timeout
  //       this.timeoutOccurred[index] = true;
  //     }
  //   }, 120000); // 2 minutes
  // }

  async loadDocumentData(index: number, newDocument: any) {
    if (newDocument.analysisStatus !== 1) {
      this.timeoutOccurred[index] = false;

      const checkInterval = 30000; // 30 seconds
      const timeoutDuration = 120000; // 2 minutes

      const subscription = this.WS.getID(
        'api/chatbox/process/uploadedDocumentData',
        newDocument._id
      )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (updatedDocument: any) => {
            this.timeoutOccurred[index] = false;
            this.dataSourceDocuments.data[index] = updatedDocument.result;
            this.dataSourceDocuments.paginator = this.projectDocumentsP;
            if (updatedDocument.result.analysisStatus === 1) {
              this.dataSourceDocuments._updateChangeSubscription();
              clearInterval(intervalId); // Stop the interval if condition is met
            }
          },
          (error) => {
            if (error) {
              console.log('Server error:', error.message);
            }
          }
        );

      const intervalId = setInterval(() => {
        this.WS.getID(
          'api/chatbox/process/uploadedDocumentData',
          newDocument._id
        )
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            (updatedDocument: any) => {
              this.timeoutOccurred[index] = false;
              this.dataSourceDocuments.data[index] = updatedDocument.result;
              this.dataSourceDocuments.paginator = this.projectDocumentsP;
              if (updatedDocument.result.analysisStatus === 1) {
                this.dataSourceDocuments._updateChangeSubscription();
                clearInterval(intervalId); // Stop the interval if condition is met
              }
            },
            (error) => {
              if (error) {
                console.log('Server error:', error.message);
              }
            }
          );
      }, checkInterval);

      // Timeout handling
      setTimeout(() => {
        if (
          !this.dataSourceDocuments.data[index] ||
          this.dataSourceDocuments.data[index].analysisStatus !== 1
        ) {
          console.log('Condition not matched after 2 minutes');
          clearInterval(intervalId); // Unsubscribe on timeout
          subscription.unsubscribe();
          this.timeoutOccurred[index] = true;
        }
      }, timeoutDuration);
    }
  }

  retryOperation(index: number, data: any) {
    this.timeoutOccurred[index] = false;
    this.WS.getID(
      'api/chatbox/process/uploadedDocumentData',
      data._id
    ).subscribe(
      (updatedData: any) => {
        this.timeoutOccurred[index] = false;
        this.dataSourceDocuments.data[index] = updatedData.result;
        this.dataSourceDocuments._updateChangeSubscription();
        // this.dataSourceDocuments.paginator = this.generatedDocumentP;
      },
      (error) => {
        console.log('Error fetching updated application:', error);
      }
    );
    // Timeout handling
    setTimeout(() => {
      if (
        !this.dataSourceDocuments.data[index] ||
        this.dataSourceDocuments.data[index].analysisStatus !== 1
      ) {
        console.log('Condition not matched after 2 minutes');
        // this.toastr.info('Retry');
        this.timeoutOccurred[index] = true;
      }
    }, 120000); // 2 minutes
  }

  // isProcessedWithinTwoMinutes(element: any): boolean {
  //   return element.analysisStatus === 1; // Assuming 1 indicates processed
  // }

  ngOnDestroy() {
    // Unsubscribe on component destruction
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  downloadUploadedDocuments(s3DocId: any) {
    const awsKey = `${s3DocId.folderName}/${s3DocId.fileName}`;
    this.WS.post(
      'v1/chatbox/project-data/download/projectDataEvents',
      { awsPath: awsKey },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if ((res.status = 1)) {
        if (res.status === 1) {
          window.open(res.result, '_target');
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      }

      this.loadershow = false;
    });
  }




  previewInterfaceUploadedImages(s3DocId: any) {
    return new Promise((resolve, reject) => {
      const awsKey = `${s3DocId.folderName}/${s3DocId.fileName}`;
      this.WS.post(
        'v1/chatbox/project-data/download/projectDataEvents',
        { awsPath: awsKey },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if ((res.status = 1)) {
          if (res.status === 1) {
            // this.previewUplaodedInterfaceImages = res.result
            // window.open(res.result, '_target');
            // this.toastr.success(res.description);
            resolve(res.result)
          } else {
            reject(this.toastr.info(res.description));
          }
        }

        this.loadershow = false;
      });
    });
  }

  createNewTestCase(inputData: any) {
    this.loadershow = true;
    this.loaderMessage = 'Creating Project Test Cases';
    this.WS.post(
      'v1/chatbox/project-data/create/uploadedDocument/testCases',
      { data: inputData },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.fetchTestCasesByProjectId();
        this.loadershow = false;
        // $('#test-case-tab').focus();
        // this.dataSourceTestCase = new MatTableDataSource(
        //   res.result.generatedTestCases
        // );
        // this.dataSourceTestCase.paginator = this.testCasesP;
        this.toastr.success(res.description);
        this.toastr.success('Go to Test Cases Tab');
      } else {
        this.loadershow = false;
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  createTestCasesByFlowId(value: any) {
    this.loadershow = true;
    this.loaderMessage = 'Generating Test Cases';
    this.WS.post(
      'v1/chatbox/project-data/create/flow/testCases',
      {
        flowId: value._id,
        testCaseType: value.selctedTestCaseValue,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.fetchTestCasesByProjectId();
        this.loadershow = false;
        // $('#test-case-tab').focus();
        // this.dataSourceTestCase = new MatTableDataSource(
        //   res.result.generatedTestCases
        // );
        // this.dataSourceTestCase.paginator = this.testCasesP;
        // this.toastr.success(res.description);
        this.toastr.success('Go to Test Cases Tab');
      } else {
        this.loadershow = false;
        this.toastr.info(res.description);
      }
      this.loadershow = false;
    });
  }

  showprojectDataImport() {
    this.importCommonValidator = new ProjectDataValidator(this.WS);
    this.showImport = !this.showImport;
  }

  showVariableDataImport() {
    this.importVariableValidator = new VariableDataValidator(
      this.WS,
      this.projectID
    );
    this.showVariableImport = !this.showVariableImport;
  }

  showInterfaceDataImport() {
    this.importInterfaceValidator = new InterfaceDataValidator(
      this.WS,
      this.projectID
    );
    this.showInterfaceImport = !this.showInterfaceImport;
  }

  showFunctionsDataImport() {
    this.importFunctionsValidator = new FunctionsDataValidator(
      this.WS,
      this.projectID
    );
    this.showFunctionsImport = !this.showFunctionsImport;
  }

  showFineTuningDataImport() {
    this.importCommonFineTuningValidator = new ProjectFineTuningValidator(
      this.WS,
      this.projectID
    );
    this.showFineTuningImport = !this.showFineTuningImport;
  }
  showProjectTestCasesImport() {
    this.importCommonTestCasesValidator = new ProjectTestCasesValidator(
      this.WS,
      this.projectID
    );
    this.showTestCasesImport = !this.showTestCasesImport;
  }
  showProjectFlowImport() {
    this.importCommonFlowValidator = new ProjectFlowValidator(
      this.WS,
      this.projectID
    );
    this.showFlowImport = !this.showFlowImport;
  }
  showWorkFlow() {
    this.showWorkFlowImport = !this.showWorkFlowImport;
  }

  public closeWorkFlow(): void {
    this.showFlowDiagram = false;
    this.showNewStep = false;
  }

  public backToResults(): void {
    this.showNewProjectDetails = false;
    this.fetchprojectsData();
    this.showImport = false;
  }
  public closeTestCaseImport(): void {
    this.showTestCasesImport = false;
    this.fetchTestCasesByProjectId();
    this.newTestCase = false;
  }
  public closeFlowImport(): void {
    this.showFlowImport = false;
    this.fetchProjectFlows();
    this.newFlows = false;
  }
  public closeVariableImport(): void {
    this.showVariableImport = false;
    this.fetchProjectVariables();
    this.addVariable = false;
  }
  public closeInterfaceImport(): void {
    this.showInterfaceImport = false;
    this.fetchProjectInterfaces();
    this.addInterface = false;
  }
  public closeFineTuningImport(): void {
    this.newTuningDataSet = false;
    this.fetchProjectFineTuning();
    this.showFineTuningImport = false;
  }
  public openAddGitModal(data) {
    this.linkTo = data;
    this.WS.post(
      'v1/chatbox/project/git/add',
      {
        id: this.projectRowID,
        lkCode: data.key2,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.gitDetailForm = res.result.gitFormString;
        this.settingName = res.result.settingName;
        $('#addToGItModal').modal('show');
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  public saveLinkTo(data) {
    // if (this.featureInputFields.featureName === '') {
    //   this.toastr.info('Feature Name is Mandatory');
    //   $('#featureName').focus();
    //   return;
    // }
    for (let obj of this.gitDetailForm) {
      if (obj.isRequired == true) {
        if (!obj.value || obj.value === '') {
          this.toastr.info('Please Enter ' + obj.displayName);
          $('#source' + obj.name).focus();
          return;
        }
      }
    }
    this.WS.post(
      'api/project/save/linkProjectTo',
      {
        id: this.projectRowID,
        lkCode: data.key2,
        formData: this.gitDetailForm,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.status === 1) {
        this.fetchProjectSetting();
        $('#addToGItModal').modal('hide');
      }
    });
  }
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.projectPartners = [];
  }
}

export class ProjectDataValidator extends AbstractValidator<IprojectDataImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IprojectDataImport>;
  public title = 'Import Application';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Application Template';
  public templateURL =
    env.GENQE_BASE_URL +
    'api/chatbox/template/download/Application Template.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Application Name*',
      {
        column: 'Application Name*',
        key: 'projectName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Application Code*',
      {
        column: 'Application Code*',
        key: 'projectCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Description*',
      {
        column: 'Description*',
        key: 'description',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Domain',
      {
        column: 'Domain',
        key: 'domain',
        validations: [],
      },
    ],
    [
      'Category',
      {
        column: 'Category',
        key: 'category',
        validations: [],
      },
    ],
    [
      'Labels',
      {
        column: 'Labels',
        key: 'labels',
        validations: [],
      },
    ],
    [
      'Parent Application Code',
      {
        column: 'Parent Application Code',
        key: 'parentProjectCode',
        validations: [],
      },
    ],
    [
      'Application Lead*',
      {
        column: 'Application Lead*',
        key: 'projectLead',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Team*',
      {
        column: 'Team*',
        key: 'team',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Application Partner Code*',
      {
        column: 'Application Partner Code*',
        key: 'projectPartnerCode',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(private WS: WebService, u: IprojectDataImport = null) {
    super(u);
    this.eachValue = new Subject<IprojectDataImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callUpsertAI(v);
    });
  }

  callUpsertAI(inputData: any) {
    this.WS.post(
      'api/projectDataTemplate/import/upsert',
      {
        data: inputData,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IprojectDataImport {
  fileId: String;
  filingNumber: String;
  projectNumber: String;
  projectName: String;
  cnrNumber: String;
  subject: String;
  stage: String;
  jurisdictionDistrict: String;
  jurisdictionState: String;
  labels: String;
  billingCurrency: String;
  court: String;
  nextHearing: Date;
  disposalDate: String;
  bench: String;
  projectDescription: String;
  plaintiff: String;
  defendant: String;
  requiredOutput: String;
  item: String;
  status: String;
  partner: String;
}

export class VariableDataValidator extends AbstractValidator<IvariableDataImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IvariableDataImport>;
  public title = 'Import Variables';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Variable Template';
  public templateURL =
    env.GENQE_BASE_URL + 'api/chatbox/template/download/Variable Template.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Variable Name*',
      {
        column: 'Variable Name*',
        key: 'variableName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Data Type*',
      {
        column: 'Data Type*',
        key: 'dataType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'isMandatory*',
      {
        column: 'isMandatory*',
        key: 'isMandatory',
        validations: [],
      },
    ],
    [
      'Input Type*',
      {
        column: 'Input Type*',
        key: 'inputType',
        validations: [],
      },
    ],
    [
      'Character Limit*',
      {
        column: 'Character Limit*',
        key: 'characterLimit',
        validations: [],
      },
    ],
    [
      'Range (Min)*',
      {
        column: 'Range (Min)*',
        key: 'minRange',
        validations: [],
      },
    ],
    [
      'Range (Max)*',
      {
        column: 'Range (Max)*',
        key: 'maxRange',
        validations: [],
      },
    ],
    [
      'Default Value*',
      {
        column: 'Default Value*',
        key: 'defaultValue',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Regex Pattern*',
      {
        column: 'Regex Pattern*',
        key: 'regex',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IvariableDataImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IvariableDataImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callVariableUpsertAI(v);
    });
  }

  callVariableUpsertAI(inputData: any) {
    this.WS.post(
      'api/variableDataTemplate/import/upsert',
      {
        data: inputData,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IvariableDataImport {
  name: any;
  dataType: any;
  isMandatory: any;
  inputType: any;
  characterLimit: any;
  rangeMin: any;
  rangeMax: any;
  defaultValue: any;
  regex_pattern: any;
}
export class InterfaceDataValidator extends AbstractValidator<IInterfaceDataImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IInterfaceDataImport>;
  public title = 'Import Interfaces';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Interface Template';
  public templateURL =
    env.GENQE_BASE_URL +
    'api/chatbox/template/download/Interface Template.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Interface Name*',
      {
        column: 'Interface Name*',
        key: 'interfaceName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Url*',
      {
        column: 'Url*',
        key: 'url',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Description*',
      {
        column: 'Description*',
        key: 'description',
        validations: [],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IInterfaceDataImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IInterfaceDataImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callVariableUpsertAI(v);
    });
  }

  callVariableUpsertAI(inputData: any) {
    this.WS.post(
      'api/interfaceDataTemplate/import/upsert',
      {
        data: inputData,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export class FunctionsDataValidator extends AbstractValidator<IFunctionsDataImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IFunctionsDataImport>;
  public title = 'Import Functions';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Functions Template';
  public templateURL =
    env.GENQE_BASE_URL +
    'api/chatbox/template/download/Interface Template.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Function Name*',
      {
        column: 'Function Name*',
        key: 'functionName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Class*',
      {
        column: 'Class*',
        key: 'class',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Input*',
      {
        column: 'Input*',
        key: 'input',
        validations: [],
      },
    ],
    [
      'Output*',
      {
        column: 'Output*',
        key: 'output',
        validations: [],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IFunctionsDataImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IFunctionsDataImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callVariableUpsertAI(v);
    });
  }

  callVariableUpsertAI(inputData: any) {
    this.WS.post(
      'api/interfaceDataTemplate/import/upsert',
      {
        data: inputData,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IInterfaceDataImport {
  interfaceName: any;
  url: any;
  description: any;
}

export interface IFunctionsDataImport {
  functionName: any;
  class: any;
  input: any;
  ouput: any;
}
export class ProjectTestCasesValidator extends AbstractValidator<IProjectTestCasesImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IProjectTestCasesImport>;
  public title = 'Import Test Cases';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Test Case Template';
  public templateURL =
    env.GENQE_BASE_URL + 'api/chatbox/template/download/TestCases_Import.xlsx';
  public _header: Map<string, IColumn> = new Map([
    // [
    //   'Document Name*',
    //   {
    //     column: 'Document Name*',
    //     key: 'projectDocumentName',
    //     validations: [DataValidatorRequired()],
    //   },
    // ],
    [
      'Test Case Number*',
      {
        column: 'Test Case Number*',
        key: 'testCaseNumber',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Objective*',
      {
        column: 'Objective*',
        key: 'testCaseObjective',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'PRE-Condition*',
      {
        column: 'PRE-Condition*',
        key: 'testCasePreCondition',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Test Data*',
      {
        column: 'Test Data*',
        key: 'testCaseTestData',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Steps*',
      {
        column: 'Steps*',
        key: 'testCaseSteps',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Expected Results*',
      {
        column: 'Expected Results*',
        key: 'expectedResult',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IProjectTestCasesImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IProjectTestCasesImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callUpsertAI(v);
    });
  }

  callUpsertAI(inputData: any) {
    this.WS.post(
      'api/projectDataTemplate/import/testCases/upsert',
      {
        data: inputData,
        documentName: inputData[0].filedata[0].name,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IProjectTestCasesImport {
  // projectDocumentName: String;
  testCaseNumber: String;
  testCaseObjective: String;
  testCasePreCondition: any;
  testCaseTestData: any;
  testCaseSteps: any;
  expectedResult: String;
}
export class ProjectFlowValidator extends AbstractValidator<IProjectFlowImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IProjectFlowImport>;
  public title = 'Import Flows';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Flow Template';
  public templateURL =
    env.GENQE_BASE_URL + 'api/chatbox/template/download/Flow_Import.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Flow Number*',
      {
        column: 'Flow Number*',
        key: 'flowNumber',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Flow Name*',
      {
        column: 'Flow Name*',
        key: 'flowName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Actor*',
      {
        column: 'Actor*',
        key: 'actor',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Steps*',
      {
        column: 'Steps*',
        key: 'steps',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Expected Results*',
      {
        column: 'Expected Results*',
        key: 'expectedResult',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Based On*',
      {
        column: 'Based On*',
        key: 'basedOn',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IProjectFlowImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IProjectFlowImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callUpsertAI(v);
    });
  }

  callUpsertAI(inputData: any) {
    this.WS.post(
      'api/projectDataTemplate/import/flows/upsert',
      {
        data: inputData,
        documentName: inputData[0].filedata[0].name,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IProjectFlowImport {
  flowNumber: String;
  flowName: String;
  actor: any;
  steps: any;
  expectedResult: any;
  basedOn: any;
}
export class ProjectFineTuningValidator extends AbstractValidator<IProjectFineTuningImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IProjectFineTuningImport>;
  public title = 'Import Fine Tuning';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Fine Tuning Template';
  public templateURL =
    env.GENQE_BASE_URL + 'api/chatbox/template/download/fineTuning_Import.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Id*',
      {
        column: 'Id*',
        key: 'id',
        validations: [],
      },
    ],
    [
      'System*',
      {
        column: 'System*',
        key: 'system',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'User*',
      {
        key: 'user',
      },
    ],
    [
      'Assistant*',
      {
        column: 'Assistant*',
        key: 'assistant',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Answer Description',
      {
        column: 'Answer Description',
        key: 'answerDesc',
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    private projectID: string,
    u: IProjectFineTuningImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IProjectFineTuningImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callUpsertAI(v);
    });
  }

  callUpsertAI(inputData: any) {
    this.WS.post(
      'api/projectDataTemplate/import/tuningDataSet/upsert',
      {
        data: inputData,
        // documentName: inputData[0].filedata[0].name,
        projectID: this.projectID,
        type: 'Import',
        token: {},
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      if (res.result) {
        res.result.forEach((re) => {
          if (re.result.data) {
            re.result.data.forEach((d) => {
              this.success += 1;
            });
          }
        });
      }
      this.saveResponse.next(res);
    });
  }
}

export interface IProjectFineTuningImport {
  id?: Number;
  system?: String;
  user?: String;
  assistant?: String;
  answerDesc?: String;
}
