import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import {
  AbstractValidator,
  IColumn,
} from '../import/validators/abstract-validator.interface';
import { Subject, Subscription } from 'rxjs';
import { DataValidatorRequired } from '../import/validators/validator.functions';
import { WebService } from 'src/app/services/web.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { IResponse } from 'src/app/models/server-data-source.model';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import {
  ICountry,
  IGlobalSetting,
} from 'src/app/models/globalSetting.interface';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { IVendor } from 'src/app/models/vendor.interface';
import { MatTableDataSource } from '@angular/material/table';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { SelectionModel } from '@angular/cdk/collections';
import * as Handlebars from 'handlebars';
import { IPartner } from 'src/app/models/partner.interface';
declare var $;

export interface TemplateData {
  keyCode: number;
  key1: string;
  labelName: number[];
  _id: string;
  tname: string;
  docTempName: string;
  twidth: string;
  fontsize: string;
  fonttype: number;
  tshortcode: string;
  templateDesc: string;
  type: number;
  category: number;
  displayCategory: string;
  HTMLurl: string;
  displayFont: string;
  displayNames: string;
  templateName: string;
  vendor: string;
  country: string;
  shortCode: number;
  pageWidth: string;
  pageHeight: string;
  status: number;
}

export interface ComponentData {
  DisplaylabelName: string;
  DisplaylabelCategory: string;
  receiptf: number;
  checkbox: boolean;
  labelName: string;
  description: string;
}
@Component({
  selector: 'app-document-templates',
  templateUrl: './document-templates.component.html',
  styleUrls: ['./document-templates.component.css'],
})
export class DocumentTemplatesComponent implements OnInit, AfterViewInit {
  public data: ILanguage;
  private userSub: Subscription;
  public authenticatedUser: IUser;
  private languageSubscription: Subscription = null;
  documentTemplateP: MatPaginator;
  loadershow: boolean = false;
  @ViewChild('documentTemplatePagination', { static: false })
  set documentTemplatePage(documentTemplatePagination: MatPaginator) {
    this.documentTemplateP = documentTemplatePagination;
    if (
      this.dataSourceTemplate !== null &&
      this.dataSourceTemplate !== undefined
    ) {
      this.dataSourceTemplate.paginator = documentTemplatePagination;
    }
  }
  @ViewChild('templateName') templateName: ElementRef;
  @ViewChild('tShortCode') tShortCode: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('itemSort') itemSort: MatSort;

  public importCommonValidator: DocxTemplaterValidator
  public isSidebarOpen = true;
  public showData: boolean;
  public showTemplateDetails = false;
  public ExportLoader = false;
  public exportloaderMessage = '';


  public htmlURL;
  public templateData: TemplateData[] = [];
  public componentData: ComponentData[] = [];
  // public dtOptions: DataTables.Settings = {};
  public templateNameA = '';
  public selectedStatus = 'Active';
  public docShortCode = '';
  public docTempName = '';
  public tshortcode = '';
  public templateObject = {
    _id: '',
    templatename: '',
    templateshortcode: '',
    status: 1,
    type: '',
    docDesc: "",
    s3DocsId: "",
    fieldDetails: [],
    partnerId: "",
    partnerName: "",
    docUrl: ""
  };
  docTemplateTypes: any[] = []
  public dataSourceTemplate: MatTableDataSource<TemplateData>;
  public displayedTemplateColumn: string[] = [
    'tname',
    'tshortcode',
    'templateDesc',
    'status',
    'action',
  ];
  public dataSourceFieldDetails: MatTableDataSource<any>;
  public displayedFieldDetailsColumn: string[] = [
    'fieldName',
    'fieldType',
    'promptId',
    'status',
    'description',
    // 'IncludePrompt',
  ];

  public simpleSearch = '';
  public selection = new SelectionModel<any>(true, []);
  rowKeyCode: any[] = [];
  public advanceSearch: boolean = false;
  templates: TemplateData[] = [];
  uploadedFilePath: any;
  docTemplateStatus: IGlobalSetting[];
  showImport: boolean = false;
  newFieldDetails: boolean = false;
  existingDocTemplates: any;
  partners: IPartner[];
  partnerId: string;
  partnerName: string;
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private cs: CommonServiceService,
    private toastr: ToastrService,
    private auth: AuthenticationService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.fetchTemplates()
    this.fetchDocxTemplateTypes("PROJECT_DOCUMENT_TYPE")
    this.fetchDocxTemplateStatus("DOCX_STATUS")
    // this.dtOptions = {
    //   searching: false,
    //   paging: true,
    // };
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.loadershow = false;
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);

  }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  showDocxImport(): void {
    this.showImport = true
  }

  ngAfterViewInit(): void {
    this.searchInputFunction();
    $('#query1').hide();
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this).find('~ label, ~ span:nth-of-type(n+3)').addClass('not-empty');
      } else {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .removeClass('not-empty');
      }
    });
    $('.search-input input ~ span:nth-of-type(4)').click(function () {
      $('.search-input input').val('');
      $('.search-input input')
        .find('~ label, ~ span:nth-of-type(n+3)')
        .removeClass('not-empty');
    });

    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection__choice__remove')
            .length ||
          $(event.target).parent('.searchSuggestions__choice__remove').length ||
          $(event.target).parent('.searchSuggestions').length
        ) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          // $('body').find('.query1').removeClass('visible');
          // $('#query1').hide();
          this.showData = false;
        }
      }
    });
  }

  showQueryForm(): void {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }

  hideTemplateDetails(): void {
    this.showTemplateDetails = false;
  }
  public searchInputFunction(): void {
    if (this.simpleSearch.trim() !== '') {
      $('.search-input input').focus();
    }
    $('#query1').hide();
    $('.search-input input').blur(function () {
      if ($(this).val()) {
        $(this).find('~ label, ~ span:nth-of-type(n+3)').addClass('not-empty');
      } else {
        $(this)
          .find('~ label, ~ span:nth-of-type(n+3)')
          .removeClass('not-empty');
      }
    });
    $('.search-input input ~ span:nth-of-type(4)').click(function () {
      $('.search-input input').val('');
      $('.search-input input')
        .find('~ label, ~ span:nth-of-type(n+3)')
        .removeClass('not-empty');
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.rowKeyCode.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.rowKeyCode);
  }

  /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: any): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }

  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
  //     row.position + 1
  //   }`;
  // }

  public advanceTemplateSearch(): void {
    this.simpleSearch = '';
    this.advanceSearch = true;
    this.WS.post('api/chatbox/search/advance/DocumentDataSearch', { documentTempName: this.docTempName, documentShortCode: this.docShortCode, status: this.selectedStatus }, 'CHATBOX').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.dataSourceTemplate = new MatTableDataSource(res.result)
          this.dataSourceTemplate.paginator = this.documentTemplateP
          this.toastr.success(res.description);
        }else {
          this.toastr.info(res.description);
          this.dataSourceTemplate = new MatTableDataSource([])
          this.dataSourceTemplate.paginator = this.documentTemplateP
        }
      })
  }

  public fetchTemplateByNames(keyword: string): void {
    this.templates = []
    if (keyword.length > 2) {
      this.WS.post('api/chatbox/fetch/documentByName', {
        keyword: keyword
      }, 'CHATBOX').subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.templates = res.result
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.templates = [];
    }
  }

  public getTemplateById(templateId: string): void {
    this.WS.post('api/chatbox/fetch/documentById', { id: templateId }, 'CHATBOX').subscribe(async (res: any) => {
      if (res.status == 1) {
        this.addNewTemplate(true)
        let docValue = this.docTemplateTypes.find((item) => item.keyCode === res.result.docType);

        this.templateObject = {
          _id: res.result._id,
          templatename: res.result.docTempName,
          templateshortcode: res.result.docShortCode,
          status: res.result.status,
          type: docValue.key1,
          docDesc: res.result.docDesc,
          s3DocsId: res.result.s3DocsId,
          fieldDetails: res.result.fieldDetails,
          docUrl: res.result.docUrl,
          partnerId: res.result.partnerId,
          partnerName: res.result.partnerName
        }
        this.dataSourceFieldDetails = new MatTableDataSource(res.result.fieldDetails)
        this.toastr.success(res.description)
      } else {
        this.toastr.success(res.description)
      }
    })
  }

  public getPromptTemplateById(templateId: string): void {
    this.WS.post('api/promptTemplate/fetch/id', { id: templateId }, 'CHATBOX').subscribe((res: any) => {
      if (res.status == 1) {
        this.addNewTemplate(true)

        this.toastr.success(res.description)
      } else {
        this.toastr.success(res.description)
      }
    })
  }

  public setTokenReceipt(template: any, type: String): void {
    if (type === 'search') {
      this.docTempName = template.docTempName
        ;
      this.templates = [];
    } else {
      this.getTemplateById(template._id);
      this.templates = [];
    }
  }

  public searchExistingTemplates(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/chatbox/search/documentsByName', { keyword }, 'CHATBOX').subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.existingDocTemplates = res.result ;
        } else if (res.status === 2) {
          this.existingDocTemplates = []
          this.toastr.info(res.description);
        } else {
          this.existingDocTemplates = []
          this.toastr.error(res.description);
        }
      });
    } else {
      this.existingDocTemplates = [];
    }
  }

  public setTemplateToSearch(value: any): void {
    this.resetAllFlag()
    this.templateObject = {
      _id: value._id,
      templatename: value.docTempName,
      status: value.status,
      type: value.docType,
      docDesc: value.docDesc,
      s3DocsId: value.s3DocsId,
      fieldDetails: value.fieldDetails,
      docUrl: value.docUrl,
      templateshortcode: value.docShortCode,
      partnerId: value.partnerId,
      partnerName: value.partnerName
    };
    if(value.fieldDetails?.length){
      this.dataSourceFieldDetails = new MatTableDataSource(value.fieldDetails)
    }else {
      this.dataSourceFieldDetails = new MatTableDataSource([])
    }
    this.existingDocTemplates = [];
  }

  public fetchPartners(keyword: string): void {
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
  public setPartner(partner): void {
    this.getPartnerById(partner._id);
    this.partners = [];
  }
  public getPartnerById(partnerId: string): void {
    this.WS.post('api/master/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const partner = res.result.partners[0] as IPartner;
          this.templateObject.partnerId = partner._id;
          this.templateObject.partnerName = partner.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public templateSimpleSearch(value): void {
    this.advanceSearch = false;
    this.WS.post('api/chatbox/simple/search/DocumentDataSearch', { search: value }, 'CHATBOX').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.dataSourceTemplate = new MatTableDataSource(res.result)
          this.dataSourceTemplate.paginator = this.documentTemplateP
          this.toastr.success(res.description);
        }else {
          this.toastr.info(res.description);
          this.dataSourceTemplate = new MatTableDataSource([])
          this.dataSourceTemplate.paginator = this.documentTemplateP
        }
      })
  }
  public saveTemplate(): void {
    if (this.templateObject.templatename === '') {
      this.toastr.info('Document Name is Mandatory');
      $('#templateName').focus();
      return;
    }
    if (!this.templateObject.status) {
      this.toastr.info(' Document Status is Mandatory');
      $('#status').focus();
      return;
    }
    if (this.templateObject.templateshortcode === '') {
      this.toastr.info('Document Short Code is Mandatory');
      $('#tShortCode').focus();
      return;
    }
    if (this.templateObject.docDesc === '') {
      this.toastr.info('Document Description is Mandatory');
      $('#templateDesc').focus();
      return;
    }
    if (this.templateObject.type === '') {
      this.toastr.info('Document Type is Mandatory');
      $('#documentType').focus();
      return;
    }
    if (this.templateObject.s3DocsId === '') {
      this.toastr.info('File is Mandatory');
      $('#fileInput').focus();
      return;
    }
    if (!this.templateObject.partnerId) {
      this.toastr.info('Partner cannot be empty');
      $('#fileInput').focus();
      return;
    }

    this.WS.post('api/chatbox/create/document/templateData', { templateData: this.templateObject }, 'CHATBOX').subscribe((res: any) => {
      if (res.status == 1) {
        this.hideTemplateDetails()
        this.fetchTemplates()
        this.resetAllFlag();
        this.toastr.success(res.description)
      }
    })

  }

  fetchTemplates(): void {
    this.WS.post('api/chatbox/fetch/document/templates', {}, 'CHATBOX').subscribe((res: any) => {
      if (res.status == 1) {
        this.dataSourceTemplate = new MatTableDataSource(res.result)
        this.dataSourceTemplate.paginator = this.documentTemplateP
        this.toastr.success(res.description)
      }
    })
  }

  downloadDocTemplate(s3Bucket: any): void {
    let path = `${s3Bucket.folderName}/${s3Bucket.fileName}`
    this.WS.post(
      'v1/chatbox/case-data/download/uploadedDocs',
      { awsPath: path },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        window.open(res.result, '_target');
        this.toastr.success(res.description);
      } else {
        this.toastr.info(res.description);
      }
    });
  }

  onFileChange(data: any): void {
    try {
      let file = data[0]
      let inputData = {
        docType: this.templateObject.type
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('inputData', JSON.stringify(inputData));
      this.WS.post('api/chatbox/get/preSignedAWSUrl', formData, 'CHATBOX').subscribe((re: IResponse) => {
        if (re.status === 1) {
          this.templateObject.fieldDetails = re.result.fieldDetails
          this.templateObject.s3DocsId = re.result.s3DocsId
          this.templateObject.docUrl = re.result.docUrl
          this.dataSourceFieldDetails = new MatTableDataSource(re.result.fieldDetails)
        }
        else {
          // this.loadershow = false;
        }
      })

    } catch (error) {
      console.log('error', error)
    }

  }

  public resetAdvanceSearch() {

  }

  addNewTemplate(isshow): void {
    this.selection.clear();
    this.resetAllFlag();
    this.showTemplateDetails = isshow;
  }

  public exportReport(filename) {
    try {
      this.ExportLoader = true;
      this.exportloaderMessage = 'Exporting data..';

      this.exporter.exportTable('xlsx', { fileName: filename });

      setTimeout(() => {
        this.ExportLoader = false;
      }, 1000);
    } catch (error) {
      console.log('Error', error);
    }
  }

  public saveNewVoucherHTML(files: File[]): void {
    // console.log(files);

    const file: File = files[0]; // Get the uploaded file
    const reader: FileReader = new FileReader();

    reader.onload = (e) => {
      // When the file reading is completed, set the content to the div
      let fileContent = reader.result as string;
    };
  }

  resetAllFlag(): void {
    this.templateObject = {
      _id: "",
      templatename: "",
      templateshortcode: "",
      status: 1,
      type: '',
      docDesc: "",
      s3DocsId: "",
      fieldDetails: [],
      partnerId: "",
      partnerName: "",
      docUrl: "",
    }
    this.dataSourceFieldDetails = new MatTableDataSource([])
  }

  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.templates.length = 0;
  }
  templateNameSuggestionIndex = -1;

  onTemplateNameInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.templateNameSuggestionIndex = Math.max(
          this.templateNameSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.templateNameSuggestionIndex = Math.min(
          this.templateNameSuggestionIndex + 1,
          this.existingDocTemplates.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.templateNameSuggestionIndex >= 0) {
          this.setTemplateToSearch(
            this.existingDocTemplates[this.templateNameSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  fetchDocxTemplateTypes(lookupCode: string): void {
    this.WS.post('api/chatbox/globalSetting/fetch/lookupCode', {
      lookupCode,
    }, 'CHATBOX').subscribe((res: any) => {
      if (res.status === 1) {
        this.docTemplateTypes = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  fetchDocxTemplateStatus(lookupCode: string): void {
    this.WS.post('api/chatbox/globalSetting/fetch/lookupCode', {
      lookupCode,
    }, 'CHATBOX').subscribe((res: any) => {
      if (res.status === 1) {
        this.docTemplateStatus = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

}

export class DocxTemplaterValidator extends AbstractValidator<IDocxTemplateImport> {
  public startDate = '';
  public endDate = '';
  public success = 0;
  public importFileId = '';
  public elasticIdArray = [];
  public eachValue: Subject<IDocxTemplateImport>;
  public title = 'Import Document Templates';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public templateName = 'Docx Template';
  public templateURL =
    env.BASE_URL + 'api/chatbox/template/download/Docx_Template.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Document Template Name',
      {
        column: 'Document Template Name',
        key: 'docTempName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Document Short Code',
      {
        column: 'Document Short Code',
        key: 'docShortCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Document Description',
      {
        column: 'Document Description',
        key: 'docDesc',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Status',
      {
        column: 'Status',
        key: 'status',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Action',
      {
        column: 'Aws File Path',
        key: 'docPath',
        validations: [DataValidatorRequired()],
      },
    ]
  ]);

  constructor(
    private WS: WebService,
    private cs: CommonServiceService,
    u: IDocxTemplateImport = null
  ) {
    super(u);
    this.eachValue = new Subject<IDocxTemplateImport>();
    this.saveResponse = new Subject<any>();
    this.fileSubject = new Subject<File>();

    this.eachValue.subscribe((v: any) => {
      this.callUpsertAI(v);
    });
  }

  callUpsertAI(inputData: any) {
    this.WS.post('api/chatbox/docxTemplater/import/upsert', {
      data: inputData,
      type: 'Import',
      token: {},
    }).subscribe((res: any) => {
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

export interface IDocxTemplateImport {
  docTempName: string;
  docShortCode: string;
  docDesc: string;
  status: Number;
  docPath: string;
}