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
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
// import { saveAs } from 'file-saver';
import { IVendor } from 'src/app/models/vendor.interface';
import { MatTableDataSource } from '@angular/material/table';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { SelectionModel } from '@angular/cdk/collections';
// import * as Handlebars from 'handlebars';
import { IPartner } from 'src/app/models/partner.interface';
import { DatePipe, Location } from '@angular/common';
declare var $;

export interface TemplateData {
  keyCode: number;
  key1: string;
  labelName: number[];
  _id: string;
  tname: string;
  twidth: string;
  fontsize: string;
  fonttype: number;
  tshortcode: string;
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
  selector: 'app-prompt-templates',
  templateUrl: './prompt-templates.component.html',
  styleUrls: ['./prompt-templates.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptTemplatesComponent implements OnInit, AfterViewInit {
  public data: ILanguage;
  private userSub: Subscription;
  public authenticatedUser: IUser;
  private languageSubscription: Subscription = null;
  loadershow: boolean = false;
  @ViewChild('templateName') templateName: ElementRef;
  @ViewChild('tShortCode') tShortCode: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  @ViewChild('itemSort') itemSort: MatSort;
  @ViewChild('documentPaginator') documentPaginator: MatPaginator;

  public isSidebarOpen = true;
  public showData: boolean;
  public showTemplateDetails = false;
  public ExportLoader = false;
  public loaderShow = false;
  public loaderMessage = 'Fetching Data';
  public newIncludeDocuments = false;
  public exportloaderMessage = '';
  public importValidator: PromptValidator;
  public templateStatus: IGlobalSetting[] = [];
  public htmlURL;
  public templateData = [];
  public componentData: ComponentData[] = [];
  // public dtOptions: DataTables.Settings = {};
  public templateNameA = '';
  public selectedStatus = 'Active';
  public tshortcode = '';
  public templateObject = {
    _id: '',
    templatename: '',
    templatecategory: 1,
    country: '',
    templatewidth: '',
    pageHeight: '',
    pageWidth: '',
    fontsize: '',
    fonttype: 0,
    templateshortcode: '',
    status: 1,
    desc: '',
    filterDocumentType: false,
    samplePrompt: "",
    category: "",
    isSystemPrompt: false
  };

  public dataSourceTemplate: MatTableDataSource<any>;
  public displayedTemplateColumn: string[] = [
    'tname',
    'tshortcode',
    'prompt',
    'status',
    'lastModifiedOn',
  ];
  public dataSourceIncludeDocuments: MatTableDataSource<any>;
  public displayedColumnsIncludeDocuments: string[] = [
    'documentType',
    'fileType',
    'criteria',
  ];

  public simpleSearch = '';
  public selection = new SelectionModel<any>(true, []);
  rowKeyCode: any[] = [];
  public advanceSearch: boolean = false;
  templates = [];
  tScodeA: any;
  editMode: boolean;
  document: any = {
    fileType: '',
    docType: '',
    criteria: '',
  };
  fileTypes: any;
  documentTypes: any;
  rowID: any;
  showImport: boolean;
  partners: IPartner[];
  partnerId: string;
  partnerName: string;
  isNew: boolean;
  documentRowID: string;
  tableFileTypes: any;
  categories: any;
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private cs: CommonServiceService,
    private toastr: ToastrService,
    private auth: AuthenticationService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchTemplates();
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
    // this.dtOptions = {
    //   searching: false,
    //   paging: true,
    // };
    this.fetchglobalSetting('PROMPT_STATUS')
    this.fetchglobalSetting('PROJECT_FILE_TYPE')
    this.fetchglobalSetting('PROJECT_DOCUMENT_TYPE')
    this.fetchglobalSetting('PROMPT_CATEGORY')
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  ngAfterViewInit(): void {
    this.searchInputFunction();
    $('#query1').hide();
    $('.search-input input').blur( () => {
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

    $(document).click( (event) => {
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

  addNewIncludeDocuments() {
    this.newIncludeDocuments = true;
  }
  resetDocument() {
    this.document = {
      fileType: '',
      docType: '',
      criteria: '',
    };
  }
  saveDocument() {
    if (this.document.fileType === '') {
      this.toastr.info('Document : File Type is Mandatory');
      $('#templateName').focus();
      return;
    }

    if (this.document.docType === '' || this.document.docType == 0) {
      this.toastr.info('Document : Doc Type is Mandatory');
      $('#templateName').focus();
      return;
    }

    if (this.document.criteria === '') {
      this.toastr.info('Document : Criteria is Mandatory');
      $('#templateName').focus();
      return;
    }
    if (this.rowID) {
      this.WS.post(
        'api/prompt/saveDocument',
        { id: this.rowID, docData: this.document, docID: this.documentRowID },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.editMode = true;
          this.newIncludeDocuments = false;
          this.getDocumentsById(this.rowID);
          this.cdr.detectChanges()
          this.resetDocument()
        } else {
          this.toastr.info(res.description);
        }
      });
      this.getDocumentsById(this.rowID);
    } else {
      this.toastr.info('Add prompt Data to add document');
    }
    this.cdr.detectChanges()
  }
  getDocumentsById(rowID: any) {
    this.WS.post(
      'api/prompt/fetchDocument',
      { id: rowID },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.editMode = true;
        this.newIncludeDocuments = false;
        this.documentRowID = null
        this.dataSourceIncludeDocuments = new MatTableDataSource(
          res.result.documents
        );
        this.dataSourceIncludeDocuments.paginator = this.documentPaginator;
        this.cdr.detectChanges()
      } else {
        this.toastr.info(res.description);
      }
    });
  }
  hideTemplateDetails(): void {
    this.showTemplateDetails = false;
    this.rowID = null;
    this.resetDetails();
    this.cdr.detectChanges();
  }
  public searchInputFunction(): void {
    if (this.simpleSearch.trim() !== '') {
      $('.search-input input').focus();
    }
    $('#query1').hide();
    $('.search-input input').blur( () => {
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
    this.WS.post(
      'api/prompt/advancepromptDataSearch',
      {
        partnerID: this.partnerId,
        promptShortCode: this.tScodeA,
        status: this.selectedStatus == '1' ? 1 : 0,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceTemplate = new MatTableDataSource(res.result);
        this.showQueryForm()
      } else {
        this.dataSourceTemplate = new MatTableDataSource([]);
      }
    });
  }

  public fetchTemplateNames(keyword: string): void {
    if (keyword?.length > 2) {
      this.WS.post(
        'api/master/templateNames/fetch',
        { keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.templates = res.result.partners;
          if (this.templates?.length === 0) {
            this.toastr.info('No Partner Found!');
          }
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

  public getTableClickData(id: string): void {
    this.rowID = id;
    this.isNew = true
    this.newIncludeDocuments = false
    this.fetchglobalSetting('PROJECT_DOCUMENT_TYPE')
    this.fetchglobalSetting('PROJECT_FILE_TYPE')
    this.getTemplateById(id);
  }
  public getTemplateById(templateId: string): void {
    this.WS.post(
      'api/promptTemplate/fetch/id',
      { id: templateId },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.editMode = true;
        this.showTemplateDetails = true;
        this.templateObject.templateshortcode = res.result.promptShortCode;
        this.templateObject.templatename = res.result.promptTempName;
        this.templateObject.templatecategory = res.result.status;
        this.templateObject.desc = res.result.promptDescription;
        this.templateObject.samplePrompt = res.result.samplePromptOutput
        this.templateObject.category = res.result.category
        this.templateObject.isSystemPrompt = res.result.isSystemPrompt != undefined ? res.result.isSystemPrompt : false
        this.dataSourceIncludeDocuments = new MatTableDataSource(
          res.result.documents
        );
        res.result.filterDocumentType == true ? this.templateObject.filterDocumentType = true : this.templateObject.filterDocumentType = false
        this.partnerName = res.result.partnerName
        this.partnerId = res.result.partnerId
        this.cdr.detectChanges();
      }
    });
    this.selection.clear();
  }
  public getDocumentDataById(templateId: string): void {
    this.documentRowID = templateId
    this.WS.post(
      'api/fetch/document/byId',
      { id: templateId },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        res.result.documents.forEach(element => {
          if (element._id.toString() == templateId) {
            this.document.fileType = element.fileType
            this.document.docType = element.docType
            this.document.criteria = element.criteria
          }
        });
        this.newIncludeDocuments = true;
        this.cdr.detectChanges();
      }
    });
    this.selection.clear();
  }
  public setTokenReceipt(template: any, type: String): void {
    if (type === 'search') {
      this.templateNameA = template.tname;
      this.templates = [];
    } else {
      this.getTableClickData(template._id);
      this.templates = [];
    }
  }
  public templateSimpleSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.advanceSearch = false;
    this.WS.post(
      'api/prompt/simpleSearchPromptData',
      { search: value },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceTemplate = new MatTableDataSource(res.result);
        this.dataSourceTemplate.paginator = this.paginator
      } else {
        this.dataSourceTemplate = new MatTableDataSource([]);
      }
    });
  }

  public documentSimpleSearch(value): void {
    this.advanceSearch = false;
    this.WS.post(
      'api/prompt/simpleSearchDocumentData',
      { search: value },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.dataSourceIncludeDocuments = new MatTableDataSource(res.result);
      } else {
        this.dataSourceIncludeDocuments = new MatTableDataSource([]);
      }
    });
  }

  public fetchPartners(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partners = res.result.partners as IPartner[];
            this.cdr.detectChanges()
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
          const partner: IPartner = res.result.partners[0];
          this.partnerId = partner._id;
          this.partnerName = partner.name;
          this.cdr.detectChanges();
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }
  public fetchglobalSetting(lkcode): void {
    this.advanceSearch = false;
    this.documentTypes = null
    this.fileTypes = null
    this.WS.post(
      'api/prompt/fetchStatus/globalSetting',
      { lkCode: lkcode },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        switch (lkcode) {
          case 'PROMPT_STATUS':
            this.templateStatus = res.result;
            break;
          case 'PROJECT_FILE_TYPE':
            this.fileTypes = res.result;
            this.tableFileTypes = res.result;
            break;
          case 'PROJECT_DOCUMENT_TYPE':
            this.documentTypes = res.result;
            break;
          case 'PROMPT_CATEGORY':
            this.categories = res.result;
            break;
        }
      }
    });
    this.cdr.detectChanges()
  }

  public fetchFileTypes(lkcode, key): void {
    this.advanceSearch = false;
    this.document.fileType = ''
    this.fileTypes = []
    this.WS.post(
      'api/prompt/fetch/fileTypes/globalSetting',
      { lkCode: lkcode, docType: key },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.fileTypes = res.result;
      }
    });
    this.cdr.detectChanges()
  }
  // public getKeyValue(value,lkCode){
  //   this.WS.post('api/fetch/globalSetting/keyValue', { keyCode:value,lkCode }, 'CHATBOX').subscribe((res: any) => {
  //     if (res.status == 1) {
  //       this.toastr.success(res.description)
  //       return res.result.key1
  //     }
  //     else {
  //       this.toastr.info(res.description)
  //     }
  //   })
  // }
  public getKeyValue(value: string, lkCode: string) {
    let key1 = null;
    if (lkCode == 'PROJECT_DOCUMENT_TYPE') {
      this.documentTypes.forEach((element) => {
        if (element.keyCode == value) {
          key1 = element.key1;
        }
      });
    }
    if (lkCode == 'LEGAL_FILE_TYPE') {
      this.tableFileTypes.forEach((element) => {
        if (element.keyCode == value) {
          key1 = element.key1;
        }
      });
    }
    return key1;
  }

  public saveTemplate(id): void {
    if (this.templateObject.templatename === '') {
      this.toastr.info('Prompt Name is Mandatory');
      $('#templateName').focus();
      return;
    }
    if (this.templateObject.templatecategory === null) {
      this.toastr.info(' Prompt Status is Mandatory');
      $('#templatecategory').focus();
      return;
    }
    if (this.templateObject.category === null) {
      this.toastr.info(' Prompt Category is Mandatory');
      $('#category').focus();
      return;
    }
    if (this.templateObject.templateshortcode === '') {
      this.toastr.info('Prompt Short Code is Mandatory');
      $('#tShortCode').focus();
      return;
    }
    if (this.templateObject.templateshortcode.length > 20) {
      this.toastr.info('Prompt Short Code is too long');
      $('#tShortCode').focus();
      return;
    }
    if (this.templateObject.desc === '') {
      this.toastr.info('Prompt Description is Mandatory');
      $('#templateName').focus();
      return;
    }
    if (this.partnerName === '' || this.partnerId == '') {
      this.toastr.info('Partner is Mandatory');
      $('#templateName').focus();
      return;
    }
    if (this.templateObject.filterDocumentType == true && !id) {
      if (this.document.fileType === '' || !this.document.fileType) {
        this.toastr.info('Document : File Type is Mandatory');
        $('#templateName').focus();
        return;
      }

      if (this.document.docType === '' || !this.document.docType || this.document.docType == 0) {
        this.toastr.info('Document : Doc Type is Mandatory');
        $('#templateName').focus();
        return;
      }

      if (this.document.criteria === '' || !this.document.criteria) {
        this.toastr.info('Document : Criteria is Mandatory');
        $('#templateName').focus();
        return;
      }
    }
    if (id && this.dataSourceIncludeDocuments?.filteredData.length > 0) {
      this.WS.post('api/createPromptData', { templateData: this.templateObject, documentData: this.document, id: id, partnerID: this.partnerId }, 'CHATBOX').subscribe((res: any) => {
        if (res.status == 1) {
          this.fetchTemplates();
          this.hideTemplateDetails()
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      });
    } else {
      this.WS.post(
        'api/createPromptData',
        { templateData: this.templateObject, documentData: this.document, id: id, partnerID: this.partnerId },
        'CHATBOX'
      ).subscribe((res: any) => {
        if (res.status == 1) {
          this.fetchTemplates();
          this.hideTemplateDetails()
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      });
    }
    this.cdr.detectChanges()
  }
  fetchTemplates() {
    this.loaderShow = true;
    this.WS.post('api/fetch/propmt/template', {}, 'CHATBOX').subscribe(
      (res: any) => {
        if (res.status == 1) {
          this.dataSourceTemplate = new MatTableDataSource(res.result);
          this.dataSourceTemplate.paginator = this.paginator
          this.loaderShow = false;
          this.cdr.detectChanges()
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }
  public resetAdvanceSearch() {
    this.tScodeA = '';
    this.selectedStatus = '';
    this.templateNameA = '';
    this.partnerId = null
    this.partnerName = null
    this.cdr.detectChanges()
  }
  public resetDetails() {
    this.templateObject = {
      _id: '',
      templatename: '',
      templatecategory: 1,
      country: '',
      templatewidth: '',
      pageHeight: '',
      pageWidth: '',
      fontsize: '',
      fonttype: 0,
      templateshortcode: '',
      status: 1,
      desc: '',
      filterDocumentType: true,
      samplePrompt: "",
      category: "",
      isSystemPrompt: false
    }
    this.document.docType = 0
    this.document.fileType = null
    this.document.criteria = null
    this.rowID = null
    this.isNew = false
    this.partnerId = null
    this.partnerName = null
    this.editMode = false
    this.cdr.detectChanges()
  }
  addNewTemplate(isshow): void {
    this.selection.clear();
    this.fileTypes = null
    this.resetDetails()
    this.dataSourceIncludeDocuments = new MatTableDataSource([])
    this.showTemplateDetails = isshow;
    this.cdr.detectChanges()
    this.newIncludeDocuments = false
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
  public onCategoryChange(selectedValue) {
    this.categories.forEach(element => {
      if (element.keyCode == selectedValue)
        this.templateObject.samplePrompt = element.key2
    });
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

  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    // this.partners.length = 0
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
          this.templates.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.templateNameSuggestionIndex >= 0) {
          this.setTokenReceipt(
            this.templates[this.templateNameSuggestionIndex],
            ''
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  public backToResults(): void {
    this.showImport = false;
    this.fetchTemplates();
    this.cdr.detectChanges()
  }
  public showImports() {
    this.showImport = true;
    this.importValidator = new PromptValidator(this.WS);
  }
}
export class PromptValidator extends AbstractValidator<IPromptImport> {
  // tslint:disable
  public success = 0;
  public failure = 0;
  public importID = '';
  public eachValue: Subject<IPromptImport>;
  public title = 'Import Prompt Template';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'Prompt Template Import';
  public templateName = 'Prompt Template';
  public templateURL =
    env.CHATBOX_BASE_URL + 'api/master/template/download/PromptTemplate.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Prompt Template Name*',
      {
        column: 'Prompt Template Name*',
        key: 'promptName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Prompt Short Code*',
      {
        column: 'Prompt Short Code*',
        key: 'promptCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Prompt Description*',
      {
        column: 'Prompt Description*',
        key: 'promptDesc',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Document Type*',
      {
        column: 'Document Type*',
        key: 'docType',
        validations: [],
      },
    ],
    [
      'File Type*',
      {
        column: 'File Type*',
        key: 'fileType',
        validations: [],
      },
    ],
    [
      'Criteria*',
      {
        column: 'Criteria*',
        key: 'criteria',
        validations: [],
      },
    ],
    [
      'Partner Short Code*',
      {
        column: 'Partner Short Code*',
        key: 'partnerCode',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Filter Document*',
      {
        column: 'Filter Document*',
        key: 'filterDocumentType',
        validations: [],
      },
    ],
    [
      'Category*',
      {
        column: 'Category*',
        key: 'category',
        validations: [],
      },
    ],
    [
      'Sample Prompt Output',
      {
        column: 'Sample Prompt Output',
        key: 'samplePrompt',
        validations: [],
      },
    ]
  ]);

  constructor(private WS: WebService, u: IPromptImport = null) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IPromptImport>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSavePrompt(v);
    });
  }

  callSavePrompt(inputData: any): void {
    this.WS.post(
      'api/prompt/save/import',
      {
        data: inputData,
      },
      'CHATBOX'
    ).subscribe((res: any) => {
      const response = res;
      // const response = JSON.parse(res);
      this.saveResponse.next(response);
    });
  }
}

export interface IPromptImport {
  promptTempName?: string;
  promptShortCode?: string;
  promptDescription?: string;
  docType: string;
  fileType: string;
  criteria: string;
  status: string;
}
export interface IResponseType {
  status: true;
  result: null;
  message: string;
}
