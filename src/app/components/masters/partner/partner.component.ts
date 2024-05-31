import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ResolvedReflectiveFactory,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { WebService } from 'src/app/services/web.service';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { IResponse } from '../../../models/server-data-source.model';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { IPartner } from 'src/app/models/partner.interface';
import {
  ICountry,
  IGlobalSetting,
} from 'src/app/models/globalSetting.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { ILanguage } from 'src/app/models/language.interface';

import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/models/user.interface';
import { environment as env } from 'src/environments/environment';
import { IProduct } from 'src/app/models/product.interface';
import { IPartnerSettings } from 'src/app/models/partner.interface';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTableExporterDirective } from 'mat-table-exporter';
//here
import { KeyCode } from '@ng-select/ng-select/lib/ng-select.types';
import { NgSelect2Component, Select2OptionData } from 'ng-select2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var $;
@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css'],
})
export class PartnerComponent implements OnInit, AfterViewInit {
  @ViewChild('partnerName') partnerName: ElementRef;
  @ViewChild('partnercategory') partnercategory: ElementRef;
  @ViewChild('partnerType') partnertype: ElementRef;
  @ViewChild('tin') tin: ElementRef;
  @ViewChild('status') status: ElementRef;
  @ViewChild('partnerSort') partnerSort: MatSort;
  @ViewChild('partnerPaginator') partnerPaginator: MatPaginator;
  @ViewChild('contactSort') contactSort: MatSort;
  @ViewChild('entitySort') entitySort: MatSort;
  @ViewChild('contactpaginator') contactpaginator: MatPaginator;
  @ViewChild('entitypaginator') entitypaginator: MatPaginator;
  @ViewChild('partnerSettingSort') partnerSettingSort: MatSort;
  @ViewChild('parnterSettingPagination') parnterSettingPagination: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public isSidebarOpen = true;
  public showData: boolean;
  public showPartnerDetails = false;
  public importValidator: PartnerValidator;
  public loadershow = false;
  public showImport = false;
  public partnerData: IPartner[] = [];
  public searchInput = '';
  public type = [];
  public device = [];
  public userName = [];
  public selectedDevice = '';
  public name = '';
  public selectedType = '';
  public selectedCategory = '';
  public selectedStatus = 'Active';
  public selectedCountry = '';
  public support = [];
  public partnerERP = '';
  public country: string;
  public addNewProperty = false;
  public addNewContact = false;
  public loaderMessage = '';
  private lang = '';
  public userType = 1;
  public availLanguages: IGlobalSetting[] = [];
  //here
  public regionValues = [];
  public dataSourceMain: MatTableDataSource<IPartner>;
  public displayedColumns: string[] = [
    'name',
    'displayType',
    'displayCategory',
    'status',
    'createdOn',
    'action',
    'generate_ai',
  ];
  public dataSourceStatusHistory: MatTableDataSource<any>;
  public displyedActionColumn = [
    'action',
    'remarks',
    'outlet',
    'modifiedOn',
    'modifiedBy',
  ];
  public dataSourceEntity: MatTableDataSource<IPartner>;
  public displayColumnEntity: string[] = [
    'name',
    'addressLine1',
    'addressLine2',
    'country',
    'state',
    'city',
    'status',
    'action',
  ];
  public dataSourceContact: MatTableDataSource<any>;
  public displayColumnContact: string[] = [
    'name',
    'designation',
    'email',
    'number',
    'status',
    'action',
  ];
  public dataSourceLocalisation: MatTableDataSource<string>;
  public displayedColumnsLocalisation: string[] = ['attribute'];
  public localisedAttributes: string[] = ['name'];
  public dataSourceSetting: MatTableDataSource<any>;
  public displyedSettingColumn: string[] = [
    'name',
    'description',
    'value1',
    'value2',
    'value3',
    'value4',
  ];
  public partnerTypes: IGlobalSetting[] = [];
  public partnerCategory: IGlobalSetting[] = [];
  public alliancePartner: IGlobalSetting[] = [];
  public partnerRegions: IGlobalSetting[] = [];
  public contactRole: IGlobalSetting[] = [];
  // public dtOptions: DataTables.Settings = {};
  public dtTrigger: Subject<any> = new Subject<any>();
  public partners: IPartner[] = [];
  public dropdownSettingsRegion: IDropdownSettings = {};
  public updateSelectedRegion = [];
  public countryData = [];
  public RegionSearchList: Array<Select2OptionData>
  public selectedRegion = [];
  public AccPICs = [];
  public AccPIC: IUser = {
    name:'',
    email:'',
    mobile:''
  };
  // here
  public patrnerNameByCountry: IPartner[] = [];
  public partnersEntity: IPartner[] = [];
  public tins: IPartner[] = [];
  public countries: ICountry[] = [];
  public data: ILanguage;
  public simpleSearch = '';
  public advanceSearch = false;
  public remarkDetails = {
    remarks: '',
    action:''
  }
  public prnert_Id = '';
  public entityToken = {
    erpNo: '',
    partnerId: '',
    _id: '',
    name: '',
    category: 0,
    type: 0,
    tin: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    pinCode: '',
    entityCode: '',
    status: 1,
    alliancePartner: 0,
    state: '',
    region: 0,
    role: {
      _id: '',
      name: '',
    },
    city: '',
  };
  public supportContact = {
    partnerId: '',
    _id: '',
    name: '',
    designation: '',
    number: '',
    email: '',
    entity: { _id: '', name: '' },
    type: 0,
    isActive: 1
  };
  public partnerToken = {
    _id: '',
    name: '',
    type: 0,
    category: 0,
    erpNo: '',
    status: 1,
    tin: '',
    partnerSC: '',
    country: '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    state: '',
    city: '',
    region: 0,
    role: {
      _id: '',
      name: '',
    },
    alliancePartner: 0,
    logoURL: '',
    logoKey: '',
    entity: [],
    supportContacts: [],
    settings: [],
    localisation: {
      name: {},
    },
    isActive: true,
    statusHistory:[],
    AccPICid:'',
  };
  public partnerToken2 = {
    _id: '',
    name: '',
    type: 0,
    category: 0,
    erpNo: '',
    status: 1,
    tin: '',
    partnerSC: '',
    country: '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    state: '',
    city: '',
    region: 0,
    role: {
      _id: '',
      name: '',
    },
    alliancePartner: 0,
    logoURL: '',
    logoKey: '',
    entity: [],
    supportContacts: [],
    settings: [],
  };
  public partnerSettings: IPartnerSettings = {
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
  public statusMap = {
    1: 'Active',
    2: 'Inactive',
  };
  public editpartnerSettings = false;
  private languageSubscription: Subscription = null;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public message = '';
  public loadershowPartner = false;
  public userRoles = [];

  public parid: any;
  partnerDelayedId: any;
      public showFiles:boolean=true
      public filleTypes:any
  shareAS: any;
  tokenRowid: any;
  dataSourcePartnerDocuments: MatTableDataSource<unknown>;
  // clipboardid: any;
 // isActive = true;
  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private location: Location,
    private toastr: ToastrService,
    private alerts: AppAlertComponent,
    private datepipe: DatePipe,
    private cs: CommonServiceService,
    private auth: AuthenticationService,
    private clipboardid: ClipboardModule
  ) {}
  public keyword = '';
  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
        if(this.route.snapshot.queryParams.partnerId){
          this.partnerDelayedId = this.route.snapshot.queryParams.partnerId
          this.getPartnerById(this.partnerDelayedId);
        }
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);

    this.importValidator = new PartnerValidator(this.WS);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showPartnerDetails = true;
    }
    // this.dtOptions = {
    //   searching: false,
    //   paging: true,
    // };
    // this.clipboardid
    // this.copy();
    // this.updateDatabase();
    this.getPartner();
    this.fetchCountries();
    this.fetchRoles();
    this.fetchParnterTypes('PARTNER_TYPE');
    this.fetchPartnerCategory('PARTNER_CATEGORY');
    this.fetchPartnerRegion('PARTNER_REGION');
    this.fetchPartnerAlliance('PARTNER_ALLIANCE_PROGRAM_TYPE');
    this.fetchPartnerContactRole('PARTNER_CONTACT_ROLE');
    this.fetchFilleTypes('PARTNER_DOCUMENT_FILE_TYPE');
    this.dataSourceLocalisation = new MatTableDataSource(
      this.localisedAttributes
    );

    this.dropdownSettingsRegion = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      idField: 'id',
      textField: 'text',
      allowSearchFilter: true,
    };
    this.getCountry();
  }

  public someClickHandler(info: any): void {
    this.message = info.id + ' - ' + info.firstName;
  }

  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  public backToResults(): void {
    this.showImport = false;
    this.getPartner();
  }
  public copiedMessage() {
    this.toastr.info(
      `${
        this.data
          ? this.data.master.partner.cbcopymsg
          : 'ID Copied to Clipboard'
      }`
    );
  }
  public showPartnerImport(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('IMPORT')) {
      this.showImport = !this.showImport;
      // this.showPropertyData=false;
      // console.log('showImportScreen', this.showImport);
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.partner.accessDen : 'Access denied'}`
      );
    }
  }

  public getPID(pid: IPartner): void {
    this.clipboardid = pid;
  }
  browseFile(data){
    this.loadershow = true;
    this.loaderMessage = 'Uploading File';
    let file=data.file
    let slectedType=data.fileType
let fileExtension = file.name.split('.').pop();
this.WS.post('api/master/get/preSignedAWSUrl', {
                  type: `uploadedDocs/partner/${slectedType}`,
                  contentType: file.type,
                  extension: fileExtension,
                  fileName:file.name
                }).subscribe((re: IResponse) => {
                  if (re.status === 1) {
                    this.WS.put(re.result.urlInfo.url, file, file.type).subscribe(
                      (event: HttpEvent<any>) => {
                        switch (event.type) {
                          case HttpEventType.Sent:
                            break;
                          case HttpEventType.ResponseHeader:
                            break;
                          case HttpEventType.UploadProgress:
                            break;
                          case HttpEventType.Response:
                            this.loadershow = false;
                          this.WS.post('api/master/document/savetoDB', 
                          {awsdata:re.result,docType:slectedType,fileName:file.name,metadata:'',urlInfo:re.result.urlInfo,
                    associatedEntityType:'partner',associatedEntityId:this.tokenRowid}).subscribe((res: IResponse) => {
                      if (res.status === 1) {
                        this.loadershow = false;
                        this.fetchAIDocuments(this.tokenRowid)
                        }
                      else{
                        this.toastr.error(res.description)
                        this.loadershow = false;
                      }
                    });
                    }})
                    
                  }})

  }
  fetchAIDocuments(tokenRowid: any) {
    this.loadershow=true
    this.loaderMessage='Fetching Document'
    this.WS.post('api/master/fetch/documentss', {tokenId:tokenRowid}).subscribe((re: IResponse) => {
      if(re.status==1){
        this.toastr.success(re.description)
        this.dataSourcePartnerDocuments=new MatTableDataSource(re.result)
        this.cs.sendEvent(this.dataSourcePartnerDocuments)
        this.loadershow=false
      }
      else{
        this.loadershow=false
        this.toastr.info(re.description)
      }
  })
  }

  changeDocumentStatus(data){
    const alert: IAlert = {
      title: `${this.data
        ? this.data.master.admissionToken.titleDel
        : 'Confirm Delete'
        }`,
      message: `${this.data
        ? this.data.master.admissionToken.docmsg
        : 'You are about to delete a Document. \n\nDo you want to continue?'
        }`,
      labelConfirm: `${this.data ? this.data.master.admissionToken.yes : 'Yes'
        }`,
      labelCancel: `${this.data ? this.data.master.admissionToken.no : 'no'}`,
      textColor: `${this.data ? this.data.master.admissionToken.txtColor : 'red'
        }`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
    this.loadershow=true
    this.loaderMessage='Deleting Document'
    this.WS.post('api/master/delete/documentss', {id:data.id}).subscribe((re: IResponse) => {
      if(re.status==1){
        this.toastr.success(re.description)
        this.loadershow=false
        this.fetchAIDocuments(this.tokenRowid)
      }
      else{
        this.loadershow=false
        this.toastr.info(re.description)
      }
  })}})
  }

      private fetchFilleTypes(lookupCode): void {
        // debugger
        this.WS.post('api/master/globalSetting/fetch/lookupCode', {
          lookupCode,
        }).subscribe((res: any) => {
          // const res = r.decrypted;
          if (res.status === 1) {
            this.filleTypes = res.result.values as IGlobalSetting[];
            if (this.filleTypes.length) {
              this.shareAS = this.filleTypes[0].keyCode;
            }
    
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        });
      }
  public getPartner(): void {
    this.loadershowPartner = true;
    this.loaderMessage = 'Loading Partners...';
    this.WS.post('api/master/partner/get').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerData = res.result as IPartner[];
        this.mapGlobalSettingsOnData();
        this.updateLocalisation();
        this.toastr.success(res.description);
      } else if (res.status === 1) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershowPartner = false;
    });
  }

  private mapGlobalSettingsOnData(): void {
    if (this.partnerData.length) {
      this.partnerData.map((token) => {
        if (this.partnerTypes.length) {
          const matchType = this.partnerTypes.find(
            (t) => t.keyCode === token.type
          );
          if (matchType) {
            token.displayType = matchType.key1;
          }
        }
        if (this.partnerCategory.length) {
          const matchCat = this.partnerCategory.find(
            (t) => t.keyCode === token.category
          );
          if (matchCat) {
            token.displayCategory = matchCat.key1;
          }
        }
      });
    }
    this.dataSourceMain = new MatTableDataSource(this.partnerData);
    this.dataSourceMain.sort = this.partnerSort;
    this.dataSourceMain.paginator = this.partnerPaginator;
  }

  public changeSelectedfile(files): void {
    for (const im of files) {
      // Get pre signed url from AWS
      this.WS.post('aws/bucket/presigned/URL', {
        contentType: im.type,
      }).subscribe((res: any) => {
        if (res.status === 1) {
          this.WS.put(res.result.url, im, im.type).subscribe((r) => {
            // console.log(r);
          });
        }
      });
    }
  }

  public updateDatabase(): void {
    this.WS.post('api/master/partner/update/database').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.toastr.success(res.description);
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  private fetchPartnerRegion(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerRegions = res.result.values as IGlobalSetting[];
        if (this.partnerRegions.length && this.partnerToken.type === 0) {
          this.partnerToken.region = this.partnerRegions[0].keyCode;
        }
        // this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchParnterTypes(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerTypes = res.result.values as IGlobalSetting[];
        if (this.partnerTypes.length && this.partnerToken.type === 0) {
          this.partnerToken.type = this.partnerTypes[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

   //dropdown select Region
   public onItemSelectRegion(user: any): void {
    // console.log(user)
    this.updateSelectedRegion.push(user.id);
  }

  public onSelectAllRegion(user: any): void {
    // console.log(user);
    this.updateSelectedRegion = user.map(
      (o: { id: string; text: string }) => {
        return o.id;
      }
    );
  }

  public onItemDeSelectRegion(user: any): void {
    // console.log(user)
    if (this.updateSelectedRegion.includes(user.id)) {
      this.updateSelectedRegion.splice(
        this.updateSelectedRegion.indexOf(user.id),
        1
      );
    }
    // console.log(this.updateSelectedRegion);
  }

  public onItemDeSelectAllRegion(outlets: any): void {
    this.updateSelectedRegion = outlets;
  }

  private fetchCountries(): void {
    this.WS.post('api/master/country/fetch', { sort: 'country' }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.countries = res.result.values as ICountry[];
          if (this.countries.length && this.country === '') {
            this.country = this.countries[0].name;
          }
        }
      }
    );
  }

  public getCountry(): void {
    // this.countryLoaderShow = true;
    this.WS.post('api/master/country/fetchCountryData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          // this.countryLoaderShow = false;
          this.countryData = res.result;
          const list = [];
          for (const country of this.countryData) {
            list.push({ id: country._id, text: country.name });
          }
          if (list.length) {
            this.RegionSearchList = list;
          }
          this.selectedRegion = []
          this.countryData.unshift({ _id: 'radnomizedAllCountry', countryCode: 'ALL', name: 'ALL' });
          // this.reportFilter.country = this.authenticatedUser.userOutlet.airport.airportCountry.name;
          this.partnerToken.country = this.countryData[0].name ? this.countryData[0].name : 'ALL';

        } else {
          // this.toaster.error(res.description);
          // console.log(res.description);
        }
        // this.mapGlobalSettingsOnData();
      }
    );
  }

  private fetchPartnerCategory(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerCategory = res.result.values as IGlobalSetting[];
        if (this.partnerCategory.length && this.partnerToken.category === 0) {
          this.partnerToken.category = this.partnerCategory[0].keyCode;
        }
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchPartnerAlliance(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.alliancePartner = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private fetchPartnerContactRole(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.contactRole = res.result.values as IGlobalSetting[];
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  ngAfterViewInit(): void {
    this.searchInputFunction();

    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection__choice__remove')
            .length ||
          $(event.target).parent('.searchSuggestions').length ||
          $(event.target).parent('.select2-selection__choice__remove').length
        ) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          // $('body').find('.query1').removeClass('visible');
          // $('#query1').hide();
          this.showData = false;
        }
      }

      // remove suggestion field when goes out of focus()
      // var hasFocus = $('#idOfTheInputElement').is(':focus');
      // if (!$('.suggestionInput').is(':focus')) {
      //   setTimeout(() => {
      //     this.partners = [];
      //   }, 50)
      // }
    });
      this.auth.currentLanguage.subscribe((l) => {
        this.lang = l;
        this.updateLocalisation();
      });
     

  }

  private updateLocalisation(): void {
        this.partnerData.map((token) => {
      for (const att of this.localisedAttributes) {
        if( token.localisation){
        //console.log('---',token.localisation[att],'---')
        token[att] =
          token.localisation[att] && token.localisation[att][this.lang]
            ? token.localisation[att][this.lang]
            : '';
      }
      }
    });
    if (this.partnerToken._id !== '') {
      for (const att of this.localisedAttributes) {
        //console.log('--->',this.partnerToken.name,'<---lang');

       if( this.partnerToken.localisation){

        this.partnerToken[att] =
          this.partnerToken.localisation[att] &&
            this.partnerToken.localisation[att][this.lang]
            ? this.partnerToken.localisation[att][this.lang]
            : '';

        }
      }
    }
  }

  public updatePartnerLocalisation(): void {
    this.loadershow = true;
    this.loaderMessage = 'Saving Partner local names';
    this.WS.post(
      'api/master/partner/localisation/update', {
      _id: this.partnerToken._id,
      localNames: this.partnerToken.localisation
    }
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {

        this.partnerToken.localisation = res.result.updatedPartner.localisation;
        this.partnerToken.name = res.result.updatedPartner.localisation.name[this.lang];
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershow = false;
    });
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

  public showQueryForm(): void {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }

  public hidePartnerDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showPartnerDetails = false;
      this.location.replaceState('/partner');
    } else {
      this.showPartnerDetails = false;
    }
    // console.log(this.showPartnerDetails);
    this.parid = '';
    this.clipboardid = '';
    // this.clipboardid = '';
    this.partnerToken = {
      _id: '',
      name: '',
      type: this.partnerToken.type,
      category: this.partnerToken.category,
      erpNo: '',
      status: 1,
      tin: '',
      partnerSC: '',
      country: '',
      addressLine1: '',
      addressLine2: '',
      pinCode: '',
      state: '',
      role: {
        _id: '',
        name: '',
      },
      city: '',
      logoURL: '',
      alliancePartner: 0,
      logoKey: '',
      region: this.partnerToken.region,
      entity: [],
      supportContacts: [],
      settings: [],
      localisation: this.partnerToken.localisation,
      isActive: true,
      statusHistory:[],
      AccPICid:''
    };
    this.AccPICs = [];
    this.AccPIC = {
      name:'',
      email:'',
      mobile:''
    }
    // this.getPartner();
    if (this.simpleSearch.trim() === '' && this.advanceSearch==false) {
      this.getPartner();
    }
    if(this.advanceSearch==true){
      this.advancePartnerSearch();
    }
    this.mapGlobalSettingsOnData();
    this.resetPartnerSettings();

    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInputFunction();
    }, 50);
  }

  public addNewPartner(isshow): void {
    this.clipboardid = '';
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('NEW')) {
      this.showPartnerDetails = isshow;
      this.cs.fetchLocalisationLanguages().subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.availLanguages = res.result.values as IGlobalSetting[];
          this.displayedColumnsLocalisation = ['attribute'];
          this.availLanguages.map((l) =>
            this.displayedColumnsLocalisation.push(l.key2)
          );
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
        this.defaultAccPIC();
        this.fetchRoles();
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.partner.accessDen : 'Access denied'}`
      );
    }
  }

  public fetchPartnerNamesByType(keyword: string): void {
    // console.log('select', this.selectedType);
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetchByType', {
        keyword,
        type: this.selectedType,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.partners = res.result.partners as IPartner[];
          if (this.partners.length === 0) {
            this.toastr.info('No Partner Found!');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.partners = [];
    }
  }
  public fetchAccPICs(keyword: string): void {
    this.partnerToken.AccPICid='';
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/users/fetchByType', {
        keyword,
  
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.AccPICs = res.result.users;
         // console.log('AccPICs-',this.AccPICs)
          if (this.AccPICs.length === 0) {
            this.toastr.info('User Not Found!');
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.AccPICs = [];
    }
  }

  public defaultAccPIC(): void {
    if(!this.partnerToken.AccPICid ){
    let keyword = 'sneha'
    this.WS.post('api/master/partner/users/fetchByType', {
      keyword
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.AccPIC = res.result.users[0];
        this.partnerToken.AccPICid = this.AccPIC._id;
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  }


  public changeName() {
    this.name = '';
  }

  public fetchApprovalRoles(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/role/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.userRoles = res.result.roles;
            if (this.userRoles.length === 0) {
              this.toastr.info('No Role Found!');
            }
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.userRoles = [];
    }
  }

  public fetchRoles(): void {
    if(!this.partnerToken.role.name){
    this.WS.post('api/master/role/get', {}).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.userRoles = res.result;
        const Role = this.userRoles.find(role => role.roleName === 'Local Sales - AI creator');   
    if (Role) {
      this.partnerToken.role._id = Role._id;
    }

        // console.log(this.userRoles);
        if (this.userRoles.length === 0) {
          this.toastr.info('No Role Found!');
        }
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  }

  // here
  public countyType() {
    this.WS.post('api/master/partner/partnerRegionByCountry', {
      country: this.partnerToken.country,
    }).subscribe((res: IResponse) => {
      this.regionValues = [];
      this.partnerToken.region = 0;
      if (res.status === 1) {
        this.patrnerNameByCountry = res.result.partner as IPartner[];
        this.entityToken.country = this.partnerToken.country;
        this.mapCountryName();
        // this.mapCountryName2();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private mapCountryName(): void {
    if (this.patrnerNameByCountry.length) {
      this.patrnerNameByCountry.map((token) => {
        if (this.partnerRegions.length) {
          const matchType = this.partnerRegions.find(
            (t) => t.keyCode === token.region
          );
          if (matchType) {
            // this.item={name:matchType.key1, keyCode:token.region}
            this.regionValues = [
              { name: matchType.key1, keyCode: token.region },
            ];
            this.partnerToken.region = this.regionValues[0].keyCode;
            this.entityToken.region = this.partnerToken.region;
          }
        }
      });
    }
    // console.log("this.regionValues", this.regionValues)
    // console.log('this.partnerToken.region', this.partnerToken.region)
    // this.countyType2();
    // this.mapCountryName2();
  }

  public countyType2() {
    this.WS.post('api/master/partner/partnerRegionByCountry', {
      country: this.entityToken.country,
    }).subscribe((res: IResponse) => {
      this.regionValues = [];
      this.entityToken.region = 0;
      if (res.status === 1) {
        this.patrnerNameByCountry = res.result.partner as IPartner[];
        this.mapCountryName2();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }

  private mapCountryName2(): void {
    if (this.patrnerNameByCountry.length) {
      this.patrnerNameByCountry.map((token) => {
        if (this.partnerRegions.length) {
          const matchType = this.partnerRegions.find(
            (t) => t.keyCode === token.region
          );
          if (matchType) {
            // this.item={name:matchType.key1, keyCode:token.region}
            this.regionValues = [
              { name: matchType.key1, keyCode: token.region },
            ];
            this.entityToken.region = this.regionValues[0].keyCode;
          }
        }
      });
    }
    // console.log("this.regionValues", this.regionValues)
    // console.log('this.partnerToken.region', this.partnerToken.region)
  }

  public setApprovalRole(role): void {
    // this.name = role.name;
    this.partnerToken.role = {
      _id: role,
      name: '',
    };
    this.entityToken.role = {
      _id: role,
      name: '',
    };
    // this.userRoles = [];
  }

  public fetchPartnerNamesEntity(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/partner/names/fetch', {
        keyword,
       // id: this.partnerToken._id,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.partnersEntity = res.result.partners as IPartner[];
          // if (this.partnersEntity.length === 0) {
          //   this.toastr.info('No Partner Found!');
          // }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
      });
    } else {
      this.partnersEntity = [];
    }
  }

  public setTokenPartner(partner: IPartner, type: string): void {
    if (type === 'search') {
      this.name = partner.name;
      this.partners = [];
    } else {
      this.getPartnerById(partner._id);
      this.partners = [];
    }
  }
  public setAccPIC(AccPIC, type: string): void {
    if (type === 'search') {
     this.AccPIC= AccPIC;
     
     this.partnerToken.AccPICid = AccPIC._id;
      this.AccPICs = [];
    } else {
      this.AccPICs = [];
    }
  }

  public setTokenPartnerEntity(partner: IPartner): void {
    this.supportContact.entity.name = partner.name;
    this.supportContact.entity._id = partner._id;
    this.partnersEntity = [];
  }

  public fetchPartnerTins(keyword: string): void {
    if (keyword.length > 1) {
      this.WS.post('api/master/partner/fetch/tins', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.tins = res.result.partners as IPartner[];
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    }
  }

  public setParterTokenTin(t: IPartner): void {
    this.tins = [];
  }

  public getTableClickData(id: string): void {
    this.prnert_Id = id;
    this.tokenRowid=id
    this.getPartnerById(id);
  }

  public getPartnerById(partnerId: string): void {
    // debugger
    this.WS.post('api/master/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const partner: IPartner = res.result.partners[0];
          this.partnerToken = {
            _id: partner._id,
            name: partner.name,
            type: partner.type,
            category: partner.category,
            tin: partner.tin,
            erpNo: partner.ERP_Number,
            status: partner.status,
            partnerSC: partner.entityCode,
            region: partner.region,
            country: partner.country,
            entity: res.result.entity,
            addressLine1: partner.addressLine1,
            addressLine2: partner.addressLine2,
            pinCode: partner.postalCode,
            state: partner.state,
            city: partner.city,
            alliancePartner: partner.allianceProgram,
            role: {
              _id: partner?.approvalRole?._id,
              name: partner?.approvalRole?.roleName,
            },
            logoKey: res.result.logoKey ? res.result.logoKey : '',
            logoURL: partner.logoURL ? partner.logoURL : '',
            supportContacts: res.result.support,
            settings: res.result.settings,
            localisation: res.result.partners[0].localisation,
            isActive: partner.status == 1 ? true : false,
            statusHistory: res.result.partners[0].statusHistory,
            AccPICid: res.result.partners[0].AccPICid //? res.result.partners[0].AccPICid : null//need to update
          };
          //console.log('AccPICid-',this.partnerToken.AccPICid)
          if(res.result.partners[0].AccPICid){
               this.AccPIC = {
                   name: res.result.partners[0].AccPICid.name,
                   email: res.result.partners[0].AccPICid.email ,
                   mobile: res.result.partners[0].AccPICid.mobile
                 };
          }else{
                this.defaultAccPIC();
          }
                    //console.log('AccPIC-',this.AccPIC)
          this.updateLocalisation();
          this.addNewPartner(true);
          // console.log('this.partnerToken', this.partnerToken);
          // this.fetchAccPICs(this.partnerToken.AccPICid);
          this.entityToken.role = {
            _id: partner?.approvalRole?._id,
            name: partner?.approvalRole?.roleName,
          };
          this.getPID(res.result.partners[0]._id);
          this.mapTableContact();
          this.mapTableEntity();
          this.mapTableSetting();
          if (res.result.partners[0].statusHistory && res.result.partners[0].statusHistory.length > 0)
          {
            this.mapActionHistory(this.partnerToken.statusHistory);
          } else {
            this.mapActionHistory([]);
          }
          this.showPartnerDetails = true;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }

  public editEntity(entity): void {
    this.entityToken = {
      erpNo: entity.ERP_Number,
      partnerId: '',
      _id: entity._id,
      name: entity.name,
      category: entity.category,
      type: this.partnerToken.type,
      tin: entity.tin,
      addressLine1: entity.addressLine1,
      addressLine2: entity.addressLine2,
      country: entity.country,
      pinCode: entity.postalCode,
      entityCode: entity.entityCode,
      alliancePartner: entity.allianceProgram,
      state: entity.state,
      status: entity.status,
      city: entity.city,
      region: entity.region,

      role: {
        _id:
          entity.approvalRole && entity.approvalRole.role
            ? entity.approvalRole.role._id
            : this.partnerToken.role._id,
        name:
          entity.approvalRole && entity.approvalRole.role
            ? entity.approvalRole.role.name
            : this.partnerToken.role.name,
      },
    };
    this.addNewProperty = true;
  }

  public editSupportContacts(contact): void {
    this.supportContact = {
      partnerId: '',
      _id: contact._id,
      name: contact.name,
      designation: contact.designation,
      number: contact.number,
      email: contact.email,
      entity: { _id: '', name: contact.entity },
      type: contact.type,
      isActive: contact.status
    };
    this.addNewContact = true;
  }

  public simpleSearchPartner(value: string): void {
    this.loadershowPartner = true;
    this.loaderMessage = 'Loading Partners...';
    this.WS.post('api/master/partner/simple/search', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerData = res.result as IPartner[];
        this.mapGlobalSettingsOnData();
        this.updateLocalisation();
        // this.mapTable(this.partnerData);
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.partnerData = [];
        this.mapGlobalSettingsOnData();
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershowPartner = false;
    });
  }

  public advancePartnerSearch(): void {
    this.loadershowPartner = true;
    this.loaderMessage = 'Loading Partners...';
    this.advanceSearch=true;

    let RegionCountry = this.selectedRegion.length > 0 ? this.selectedRegion.map(res => res.text) : '';
    this.WS.post('api/master/partner/advance/search', {
      name: this.name,
      status: this.selectedStatus,
      type: this.selectedType,
      category: this.selectedCategory,
      country : RegionCountry,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerData = res.result as IPartner[];
        this.mapGlobalSettingsOnData();
        // this.mapTable(this.partnerData);
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.partnerData = [];
        this.mapGlobalSettingsOnData();
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      // this.resetPartner();
      this.loadershowPartner = false;
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }

  public checkCategoryValidation(): boolean {
    const categoryMap = {
      1: 'Global',
      2: 'Regional',
      3: 'Local',
    };
    if (this.partnerToken.entity.length > 0) {
      for (const c of this.partnerToken.entity) {
        if (c.category < this.partnerToken.category) {
          this.toastr.info(
            `Partner Entity ${c.name} contains ${
              categoryMap[c.category]
            } as category so You can't set Partner Categroy to ${
              categoryMap[this.partnerToken.category]
            }`
          );
          return false;
        }
      }
      return true;
    } else {
      return true;
    }
  }

  public savePartnerLogo(files: File[]): void {
    for (const file of files) {
      const fileName = file.name.split('.');
      if (
        fileName[fileName.length - 1] === 'jpeg' ||
        fileName[fileName.length - 1] === 'jpg' ||
        fileName[fileName.length - 1] === 'png'
      ) {
        if (file.size <= 20000) {
          this.WS.post('api/master/s3/presignedURL', {
            type: 'partner-photos',
            contentType: file.type,
            extension: fileName[fileName.length - 1],
          }).subscribe((res: IResponse) => {
            // console.log("url",res.result)
            if (res.status === 1) {
              // console.log('res.result',res.result)
              this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
                (event: HttpEvent<any>) => {
                  switch (event.type) {
                    case HttpEventType.Sent:
                      // console.log('Request has been made!');
                      break;
                    case HttpEventType.ResponseHeader:
                      // console.log('Response header has been received!');
                      break;
                    case HttpEventType.UploadProgress:
                      break;
                    case HttpEventType.Response:
                      this.WS.post('api/master/vendor/photos/save', {
                        // _id: this.vendorToken._id,
                        path: res.result.urlInfo.key,
                      }).subscribe((r: any) => {
                        if (r.status === 1) {
                          // console.log(r.result);
                          this.partnerToken.logoURL = r.result.url;
                          this.partnerToken.logoKey = r.result.key;
                          // this.partnerToken.logo.key = r.result.key;
                          // this.addNewVendorPhotos = false;
                          this.toastr.success(r.description);
                        } else if (r.status === 2) {
                          this.toastr.info(r.description);
                        } else {
                          this.toastr.error(r.description);
                        }
                      });
                  }
                }
              );
            } else if (res.status === 2) {
              this.toastr.info(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        } else {
          this.toastr.warning('Select Image size should be lesser than 20kb');
          return;
        }
      } else {
        this.toastr.warning('Please Selected either png/jpeg image');
        return;
      }
    }
  }

  public savePartner() {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('SAVE')) {
      // if (this.name.trim() === '') {
      if (this.partnerToken.name.trim() === '') {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.pleaseEnterPartnerName
              : 'Please Enter Partner Name'
          }`
        );
        this.partnerName.nativeElement.focus();
        return false;
      }
      if (this.partnerToken.type === 0) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.partTyp
              : 'Please select Partner Type'
          }`
        );
        this.partnertype.nativeElement.focus();
        return false;
      }
      if (this.partnerToken.category === 0) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.partCat
              : 'Please select Partner Category'
          }`
        );
        this.partnercategory.nativeElement.focus();
        return false;
      }
      // if (this.partnerToken.tin.trim() === '') {
      //   this.toastr.info(
      //     `${this.data ? this.data.master.partner.partTin : 'Please Enter TIN'}`
      //   );
      //   this.tin.nativeElement.focus();
      //   return;
      // }
      if (this.partnerToken.status === 0) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.selectStatus
              : 'Please select status'
          }`
        );
        this.status.nativeElement.focus();
        return false;
      }
      // if (this.partnerToken.partnerSC.trim() === '') {
      //   this.toastr.info(
      //     `${this.data
      //       ? this.data.master.partner.pleaseEnterPartSC
      //       : 'Please Enter Partner Short Code'
      //     }`
      //   );
      //   $('#partnerSC').focus();
      //   return;
      // }
      if (this.partnerToken.partnerSC.trim() !== '') {
        const regex = /[ `!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
        if (regex.test(this.partnerToken.partnerSC.trim()) === true) {
          this.toastr.info(
            `${
              this.data
                ? this.data.master.partner.partSc
                : 'Partner Short Code Should not contain special character'
            }`
          );
          $('#partnerSC').focus();
          return false;
        }
      }
      if (this.partnerToken.country === '') {
        this.toastr.info(
          `${
            this.data ? this.data.master.partner.selectCont : 'Select Country'
          }`
        );
        $('$country').focus();
        return false;
      }
      if (this.partnerToken.addressLine1.trim() === '') {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.pleaseAdd
              : 'Please Enter Partner Address Line 1'
          }`
        );
        $('#addressLineP1').focus();
        return false;
      }
      // if (this.partnerToken.pinCode.trim() === '') {
      //   this.toastr.info(
      //     `${this.data
      //       ? this.data.master.partner.postCode
      //       : 'Please Enter Partner Postal Code'
      //     }`
      //   );
      //   $('#postalCodeP').focus();
      //   return;
      // }
      // if (this.partnerToken.state.trim() === '') {
      //   this.toastr.info(
      //     `${this.data
      //       ? this.data.master.partner.partState
      //       : 'Please Enter Partner State'
      //     }`
      //   );
      //   $('#stateP').focus();
      //   return;
      // }
      // if (this.partnerToken.city.trim() === '') {
      //   this.toastr.info(
      //     `${this.data
      //       ? this.data.master.partner.partCity
      //       : 'Please Enter Partner City'
      //     }`
      //   );
      //   $('#cityP').focus();
      //   return;
      // }

      // if (this.partnerToken.role.name === '') {
      //   $('#partnerApproval').focus();
      //   this.toastr.info('Select Partner Approval Role')
      //   return;
      // }
      if (this.partnerToken.AccPICid === '' || this.partnerToken.AccPICid == undefined ) {
        $('#AccPICname').focus();
        this.toastr.info('Select Valid Account PIC');
        return false;
      }

      if (this.partnerToken.role._id === '') {
        $('#partnerApproval').focus();
        this.toastr.warning('Select Partner Approval Role');
        return false;
      }

      const val = this.checkCategoryValidation();
      if (!val) {
        this.partnercategory.nativeElement.focus();
        return false;
      }
      const partnerData = this.partnerToken;
      delete partnerData.settings;
      this.loaderMessage = 'Saving Partner...';
      this.loadershowPartner = true;

      this.WS.post('api/master/partner/save', this.partnerToken).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.partnerToken = {
              _id: res.result.partner._id,
              name: res.result.partner.name,
              type: res.result.partner.type,
              category: res.result.partner.category,
              erpNo: res.result.partner.ERP_Number,
              status: res.result.partner.status,
              tin: res.result.partner.tin,
              country: res.result.partner.country,
              entity: this.partnerToken.entity,
              addressLine1: res.result.partner.addressLine1,
              addressLine2: res.result.partner.addressLine2,
              city: res.result.partner.city,
              state: res.result.partner.state,
              role: {
                _id: res.result.partner.approvalRole?._id,
                name: res.result.partner.approvalRole?.roleName,
              },
              alliancePartner: res.result.partner.allianceProgram || 0,
              logoKey: res.result.logoKey,
              logoURL: res.result.partner.logoURL,
              pinCode: res.result.partner.postalCode,
              partnerSC: res.result.partner.entityCode,
              region: res.result.partner.region,
              supportContacts: this.partnerToken.supportContacts,
              settings: this.partnerToken.settings,
              localisation: res.result.partner.localisation, //this.partnerToken.localisation
              isActive: res.result.partner.status == 1 ? true : false,
              statusHistory: res.result.partner.statusHistory,
              AccPICid: res.result.partner.AccPICid //? res.result.partner.AccPICid : null//need to update
            };

            this.entityToken.role = {
              _id: res.result?.partner.approvalRole?._id,
              name: res.result?.partner.approvalRole?.roleName,
            };

            // if (this.partnerToken.logoURL && this.partnerToken.logoURL !== '') {
            //   let splitLogo = this.partnerToken.logoURL.split('?');
            //   this.partnerToken.logoKey = splitLogo[0].split('.com/')[1];
            // }
            this.mapTableContact();
            this.mapTableEntity();
            this.toastr.success(res.description);
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
          this.loadershowPartner = false;
        }
      );
      // }
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.role.accessdenied : 'Access denied'}`
      );
    }
    return true;
  }
   public changeStatus(){
        this.partnerToken.isActive=!this.partnerToken.isActive
        this.partnerToken.status = this.partnerToken.isActive ? 1 : 2;
       // this.isActive = this.partnerToken.status == 1 ? true : false;
        //console.log('isActive',this.partnerToken.isActive)
        //console.log('-status-',this.partnerToken.status)
   }

   public saveStatusHistory(){
    //console.log('saveHistory',this.remarkDetails.remarks)
    if (this.remarkDetails.remarks.trim() === '') {
        this.remarkDetails.remarks = ''
        this.toastr.info("Please Enter Remarks");
        document.getElementById("svbtn").removeAttribute('data-dismiss');
        return;
    }
    this.remarkDetails.action=this.partnerToken.isActive ? 'Active':'Inactive';
    this.partnerToken.statusHistory=[];
    this.partnerToken.statusHistory.push(this.remarkDetails);
    this.WS.post('api/master/partner/save/status', this.partnerToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {

          this.partnerToken.statusHistory = res.result.statusHistory;
          this.mapActionHistory(this.partnerToken.statusHistory);
          // console.log('stsus hstry--',this.partnerToken.statusHistory)
          this.toastr.success(res.description);
        }
          else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
      })
    this.remarkDetails.remarks = ''
    document.getElementById("svbtn").setAttribute('data-dismiss','modal');
   }

   public mapActionHistory(data): void {
    this.dataSourceStatusHistory = new MatTableDataSource(data);
    this.dataSourceStatusHistory.sort = this.partnerSort;
    this.dataSourceStatusHistory.paginator = this.partnerPaginator;
  }
  public deletePartner(partnerID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.partner.delPart
            : 'Delete Partner Confirmation!'
        }`,
        message: `${
          this.data
            ? this.data.master.partner.delMsg
            : 'Are you sure you want to delete this Partner?'
        }`,
        labelConfirm: `${this.data ? this.data.master.partner.labCnf : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.partner.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/partner/delete', {
            id: partnerID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.partnerData.splice(
                this.partnerData.findIndex(
                  (i) => i._id === res.result.deleteId
                ),
                1
              );
              this.dataSourceMain = new MatTableDataSource(this.partnerData);
              this.dataSourceMain.sort = this.partnerSort;
              this.dataSourceMain.paginator = this.partnerPaginator;
              this.toastr.success(res.description);
            } else {
              // console.log(res.description);
            }
          });
        } else {
          // console.log('Dont delete entry yet');
        }
      });
    } else {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.accMsg
            : 'Access Denied for module PARTNER action DELETE'
        }`
      );
    }
  }

  public deletePartnerLogo(path: number): void {
    // const matchPermission = this.authenticatedUser.permissions.find((l) =>
    //   Object.keys(l).includes('ADMISSION_TOKEN')
    // );
    // if (
    //   matchPermission &&
    //   matchPermission['ADMISSION_TOKEN'].includes('DELETE')
    // ) {
    const alert: IAlert = {
      title: `${
        this.data ? this.data.master.admissionToken.titleDel : 'Confirm Delete'
      }`,
      message:
        'You are about to delete a Partner Logo. \n\nDo you want to continue?',
      labelConfirm: `${
        this.data ? this.data.master.admissionToken.yes : 'Yes'
      }`,
      labelCancel: `${this.data ? this.data.master.admissionToken.no : 'no'}`,
      textColor: `${
        this.data ? this.data.master.admissionToken.txtColor : 'red'
      }`,
    };
    this.alerts.alertConfirm(alert).subscribe((r) => {
      if (r === ALERT_RESPONSE.CONFIRM) {
        this.WS.post('api/master/partner/logo/delete', {
          _id: this.partnerToken._id,
        }).subscribe((res: IResponse) => {
          if (res.status === 1) {
            if (res.result.delete) {
              this.partnerToken.logoURL = '';
            }
            this.toastr.success(res.description);
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        });
      }
    });
    // } else {
    //   this.toastr.info(
    //     `${this.data
    //       ? this.data.master.admissionToken.AccModule
    //       : 'Access Denied for module ADMISSION_TOKEN action DELETE'
    //     }`
    //   );
    // }
  }

  public addPartnerEntity(): void {
    if (this.partnerToken._id === '') {
      this.toastr.warning(
        `${
          this.data
            ? this.data.master.partner.createPart
            : 'Please first create Partner to save entity'
        }`
      );
      return;
    }
    if (this.entityToken.name.trim() === '') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.partEntN
            : 'Enter Partner Entity Name'
        }`
      );
      $('#entityName').focus();
      return;
    }
    // if (this.entityToken.tin.trim() === '') {
    //   this.toastr.info(
    //     `${this.data
    //       ? this.data.master.partner.partEntTin
    //       : 'Enter Partner entity Tin'
    //     }`
    //   );
    //   $('#entityTin').focus();
    //   return;
    // }
    if (this.entityToken.category === 0) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.partEntCat
            : 'Enter Partner entity Category'
        }`
      );
      $('#entityCategory').focus();
      return;
    }
    if (this.entityToken.category === 1 && this.partnerToken.category === 2) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.partEntCatG
            : 'Partner Entity Category must not be global If Parent Partner is Regional'
        }`
      );
      $('#entityCategory').focus();
      return;
    }
    if (this.entityToken.category === 1 && this.partnerToken.category === 3) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.partEntL
            : 'Partner Entity Category must not be global If Parent Partner is Local'
        }`
      );
      $('#entityCategory').focus();
      return;
    }
    if (this.entityToken.category === 2 && this.partnerToken.category === 3) {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.partEntR
            : 'Partner Entity Category must not be Regional If Parent Partner is Local'
        }`
      );
      $('#entityCategory').focus();
      return;
    }
    if (this.entityToken.addressLine1.trim() === '') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.entAdd
            : 'Enter entity Address Line 1'
        }`
      );
      $('#addressLine1').focus();
      return;
    }
    // if (this.entityToken.pinCode.trim() === '') {
    //   this.toastr.info(
    //     `${this.data
    //       ? this.data.master.partner.entPost
    //       : 'Enter entity Postal code'
    //     }`
    //   );
    //   $('#postalCode').focus();
    //   return;
    // }
    // if (this.entityToken.state.trim() === '') {
    //   this.toastr.info(
    //     `${this.data ? this.data.master.partner.entSt : 'Enter entity State'}`
    //   );
    //   $('#state').focus();
    //   return;
    // }
    // if (this.entityToken.city.trim() === '') {
    //   this.toastr.info(
    //     `${this.data ? this.data.master.partner.entCt : 'Enter entity City'}`
    //   );
    //   $('#city').focus();
    //   return;
    // }
    if (this.entityToken.country.trim() === '') {
      this.toastr.info(
        `${
          this.data ? this.data.master.partner.selEntC : 'Select entity Country'
        }`
      );
      $('#entitycountry').focus();
      return;
    }
    // if (this.entityToken.entityCode.trim() === '') {
    //   this.toastr.info(
    //     `${this.data
    //       ? this.data.master.partner.entPartSc
    //       : 'Enter Partner Short Code'
    //     }`
    //   );
    //   $('#locationCode').focus();
    //   return;
    // }
    if (this.entityToken.entityCode.trim() !== '') {
      const regex = /[ `!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
      if (regex.test(this.entityToken.entityCode.trim()) === true) {
        this.toastr.info(
          `${
            this.data
              ? this.data.master.partner.partScS
              : 'Partner Short Code Should not contain special character'
          }`
        );
        $('#locationCode').focus();
        return;
      }
    }
    if (this.entityToken.status === 0) {
      this.toastr.info(
        `${
          this.data ? this.data.master.partner.entSta : 'Select entity Status'
        }`
      );
      $('#enStatus').focus();
      return;
    }
    this.entityToken.partnerId = this.partnerToken._id;
    this.entityToken.type = this.partnerToken.type;
    this.loaderMessage = 'Saving Partner Entity ...';
    this.loadershowPartner = true;
    this.WS.post('api/master/partner/save/entity', this.entityToken).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.partnerToken.entity = res.result.entity;
          this.mapTableEntity();
          this.resetAddEntity();
          this.addNewProperty = false;
          this.toastr.success(res.description);
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.error(res.description);
        }
        this.loadershowPartner = false;
      }
    );
  }

  public deleteEntity(id: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.partner.delConf
            : 'Delete Partner Entity!'
        }`,
        message: `${
          this.data
            ? this.data.master.partner.msg
            : 'Are you sure you want to delete this Partner Entity?'
        }`,
        labelConfirm: `${this.data ? this.data.master.partner.labCnf : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.partner.no : 'No'}`,
      };

      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/partner/delete/entity', {
            _id: id,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.partnerToken.entity.splice(
                this.partnerToken.entity.indexOf(id),
                1
              );
              this.mapTableEntity();
              this.toastr.success(res.description);
            } else if (res.status === 2) {
              this.toastr.info(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        } else {
        }
      });
    } else {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.accMsg
            : 'Access Denied for module PARTNER action DELETE'
        }`
      );
    }
  }

  public addPartnerContact(): void {
    if (this.partnerToken._id === '') {
      this.toastr.warning(
        `${
          this.data
            ? this.data.master.partner.partSpC
            : 'Please first create Partner to save support contact'
        }`
      );
      return;
    }
    if (this.supportContact.name.trim() === '') {
      this.toastr.info(
        `${this.data ? this.data.master.partner.spN : 'Enter support name'}`
      );
      $('#contactName').focus();
      return;
    }
    if (this.supportContact.designation.trim() === '') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.entCD
            : 'Enter contact Designation'
        }`
      );
      $('#contactDesignation').focus();
      return;
    }
    if (this.supportContact.number === '') {
      this.toastr.info(
        `${this.data ? this.data.master.partner.entCN : 'Enter contact Number'}`
      );
      $('#contactNo').focus();
      return;
    }
    if (isNaN(parseInt(this.supportContact.number, 10))) {
      this.toastr.error(
        `${
          this.data ? this.data.master.partner.invN : 'Invalid Contact Number'
        }`
      );
      $('#contactNo').focus();
      return;
    }
    if (typeof this.supportContact.number === 'string') {
      const s = parseInt(this.supportContact.number, 10);
      const phoneno = /^\d{10}$/;
      if (isNaN(s)) {
        this.toastr.error(
          `${
            this.data ? this.data.master.partner.invN : 'Invalid Contact Number'
          }`
        );
        $('#contactNo').focus();
        return;
      }
      if (s < 0) {
        this.toastr.error(
          `${
            this.data ? this.data.master.partner.invN : 'Invalid Contact Number'
          }`
        );
        $('#contactNo').focus();
        return;
      }
    }
    if (this.supportContact.email.trim() === '') {
      this.toastr.info(
        `${this.data ? this.data.master.partner.contEm : 'Enter contact email'}`
      );
      $('#contactEmail').focus();
      return;
    }
    if (this.supportContact.email !== '') {
      if (!this.ValidateEmail(this.supportContact.email)) {
        this.toastr.warning(
          `${
            this.data
              ? this.data.master.partner.validEmail
              : 'Please Enter a Valid email'
          }`
        );
        $('#contactEmail').focus();
        return;
      }
    }
    if (this.supportContact.entity.name.trim() === '') {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.cntPartEnt
            : 'Enter contact Partner Entity'
        }`
      );
      $('#supportEntity').focus();
      return;
    }
    if (this.supportContact.type === null || this.supportContact.type === 0) {
      this.toastr.info(
        `${
          this.data ? this.data.master.partner.cntRole : 'Select contact Role'
        }`
      );
      $('#supportType').focus();
      return;
    }
    this.supportContact.partnerId = this.partnerToken._id;
    this.loaderMessage = 'Saving Partner Contact...';
    this.loadershowPartner = true;
    this.WS.post(
      'api/master/partner/supportContact/save',
      this.supportContact
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerToken.supportContacts = res.result.supportcontact;
        this.mapTableContact();
        this.resetAddSupport();
        this.addNewContact = false;
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.info(res.description);
      }
      this.loadershowPartner = false;
    });
    this.addNewContact = false;
    this.resetAddSupport();
  }

  public deleteSupportContact(id: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${
          this.data
            ? this.data.master.partner.delSup
            : 'Delete Partner Contact!'
        }`,
        message: `${
          this.data
            ? this.data.master.partner.delSupMsg
            : 'Are you sure you want to delete this Partner Contact?'
        }`,
        labelConfirm: `${this.data ? this.data.master.partner.labCnf : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.partner.no : 'No'}`,
      };

      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/partner/delete/contact', {
            _id: id,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.partnerToken.supportContacts.splice(
                this.partnerToken.supportContacts.indexOf(id),
                1
              );
              this.mapTableContact();
              this.toastr.success(res.description);
            } else if (res.status === 2) {
              this.toastr.info(res.description);
            } else {
              this.toastr.error(res.description);
            }
          });
        } else {
        }
      });
    } else {
      this.toastr.info(
        `${
          this.data
            ? this.data.master.partner.accMsg
            : 'Access Denied for module PARTNER action DELETE'
        }`
      );
    }
  }

  // tslint:disable-next-line: typedef
  public ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      return false;
    }
  }

  public mapTableEntity(): void {
    this.dataSourceEntity = new MatTableDataSource(this.partnerToken.entity);
    this.dataSourceEntity.sort = this.entitySort;
    this.dataSourceEntity.paginator = this.entitypaginator;
  }

  public mapTableContact(): void {
    this.dataSourceContact = new MatTableDataSource(
      this.partnerToken.supportContacts
    );
    this.dataSourceContact.sort = this.contactSort;
    this.dataSourceContact.paginator = this.contactpaginator;
  }

  public mapTableSetting(): void {
    this.dataSourceSetting = new MatTableDataSource(this.partnerToken.settings);
    this.dataSourceSetting.sort = this.partnerSettingSort;
    this.dataSourceSetting.paginator = this.parnterSettingPagination;
  }

  public resetPartner(): void {
    if (this.partnerToken._id !== '') {
      this.getPartnerById(this.partnerToken._id);
    } else {
      this.selectedType = '';
      this.selectedStatus = '';
      this.selectedCountry = '';
      this.name = '';
      this.selectedCategory = '';
      this.partnerToken = {
        _id: '',
        name: '',
        type: this.partnerToken.type,
        category: this.partnerToken.category,
        partnerSC: '',
        region: this.partnerToken.region,
        erpNo: '',
        country: '',
        addressLine1: '',
        addressLine2: '',
        state: '',
        city: '',
        pinCode: '',
        status: 1,
        alliancePartner: 0,
        tin: '',
        role: {
          _id: '',
          name: '',
        },
        logoURL: '',
        logoKey: '',
        entity: [],
        supportContacts: [],
        settings: [],
        localisation: this.partnerToken.localisation,
        isActive: true,
        statusHistory:[],
        AccPICid:''
      };
      this.selectedRegion=[];
      this.partners = [];
      this.resetAddEntity();
      this.resetAddSupport();
      this.resetPartnerFields();
    }
  }

  public addNewPartnerEntity(): void {
    this.addNewProperty = !this.addNewProperty;
    // this.resetAddEntity();
    // console.log(this.partnerToken.country);
    this.entityToken.country = this.partnerToken.country;
    this.entityToken.region = this.partnerToken.region;
    this.entityToken.role = {
      _id: this.partnerToken.role._id,
      name: this.partnerToken.role.name,
    };
  }

  public addNewPartnerContact(): void {
    this.addNewContact = !this.addNewContact;
    this.resetAddSupport();
  }

  public resetAddEntity(): void {
    this.entityToken = {
      erpNo: '',
      partnerId: '',
      _id: '',
      name: '',
      tin: '',
      category: 0,
      type: 0,
      addressLine1: '',
      addressLine2: '',
      country: '',
      pinCode: '',
      entityCode: '',
      alliancePartner: 0,
      state: '',
      region: 0,
      role: {
        _id: '',
        name: '',
      },
      status: 1,
      city: '',
    };
  }

  public resetAddSupport(): void {
    this.supportContact = {
      partnerId: '',
      _id: '',
      name: '',
      designation: '',
      number: '',
      email: '',
      entity: { _id: '', name: '' },
      type: 0,
      isActive: 1
    };
  }

  public resetPartnerSettings(): void {
    this.partnerSettings = {
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

  public resetPartnerFields(): void {
    // this.contactName = '';
    // this.contactEmail = '';
    // this.contactEntity = '';
    // this.contactDesignation = '';
    // this.contactNumber = '';
    // this.contactType = '';
  }

  downloadpartnertoken(partnerID): void {
    try {
      const partneridarray = [];

      // if (this.partnerToken.entity.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      // for (let i = 0; i < this.partnerToken.entity.length; i++) {
      // partneridarray.push(this.prnert_Id);
      partneridarray.push(partnerID);

      this.WS.post('api/master/partner/generatepdf/getTokenId', {
        PartnerId: partneridarray,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.loadershow = true;

          if (res.result.length > 0) {
            const tokenIdArray = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < res.result.length; i++) {
              tokenIdArray.push(res.result[i]._id);
            }

            this.cs
              .generatePDF(tokenIdArray, 'Partner')
              .then((responspdf) => {
                // this.loadershow=false;

                if (responspdf == true) {
                  this.loadershow = false;
                  this.toastr.success(
                    `${
                      this.data
                        ? this.data.master.partner.downSucc
                        : 'Downloaded successfully!'
                    }`
                  );
                } else if (responspdf === false) {
                  this.loadershow = false;
                  this.toastr.info('access');
                }
              })
              .catch((errres) => {
                this.loadershow = false;
                this.toastr.info(errres.message);
                console.log('Error e', errres);
              });
          } else {
            this.loadershow = false;
            this.toastr.info(
              `${
                this.data
                  ? this.data.master.partner.admTokNot
                  : 'Admission Instruction not found!'
              }`
            );
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
        } else {
          this.toastr.info(res.description);
        }
      });
      // api/master/partner/generatepdf/getTokenId
    } catch (error) {
      // console.log('Error', error);
      this.toastr.info(error);
    }
  }

  downloadpartnertokenNew(partnerID): void {
    try {
      const partneridarray = [];

      // if (this.partnerToken.entity.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      // for (let i = 0; i < this.partnerToken.entity.length; i++) {
      // partneridarray.push(this.prnert_Id);
      partneridarray.push(partnerID);

      this.WS.post('api/master/partner/generatepdf/getTokenId', {
        PartnerId: partneridarray,
      }).subscribe((res: IResponse) => {
        if (res.status === 1) {
          this.loaderMessage= 'Generating PDF...';
          this.loadershow = true;
          if (res.result.length > 0) {
            const tokenIdArray = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < res.result.length; i++) {
              tokenIdArray.push(res.result[i]._id);
            }

            this.cs
              .generatePDFnew(tokenIdArray, 'Partner',0, false)
              .then((responspdf:IResponseType) => {
                this.loadershow = false;
                if (responspdf.status === true) {
                  this.loadershow = false;
                  this.toastr.success(
                    `${
                      this.data
                        ? this.data.master.partner.downSucc
                        : 'Downloaded successfully!'
                    }`
                  );
                }
              })
              .catch((errres) => {
                this.loadershow = false;
                this.toastr.info(errres.message);
                console.log('Error e', errres);
              });
          } else {
            this.loadershow = false;
            this.toastr.info(
              `${
                this.data
                  ? this.data.master.partner.admTokNot
                  : 'Admission Instruction not found!'
              }`
            );
          }
        } else if (res.status === 2) {
          this.toastr.info(res.description);
          this.loadershow = false;
        } else {
          this.toastr.info(res.description);
          this.loadershow = false;
        }
      });
      // api/master/partner/generatepdf/getTokenId
    } catch (error) {
      // console.log('Error', error);
      this.loadershow = false;
      this.toastr.info(error);
    }
  }

  public editPartnerSetting(data: any, flagEdit: boolean): void {
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
      this.editpartnerSettings = true;
    }
    if (flagEdit) {
      this.partnerSettings = {
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
      this.resetPartnerSettings();
    }
  }

  public submitPartner(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && !matchPermission['PARTNER'].includes('SUBMIT')) {
      this.toastr.info('Access Denied!');
      return;
    } else {
      let isSuccess = this.savePartner();
      if(isSuccess == true){
        setTimeout(() => {this.getPartner() }, 50)
        this.hidePartnerDetails();
      }
    }
  }

  public editPermission(): void {
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
      this.editpartnerSettings = true;
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

  public objectValidation(): void {
    if (
      this.partnerSettings.key1 !== '' &&
      this.isJson(this.partnerSettings.key1)
    ) {
      this.partnerSettings.key1 = JSON.stringify(
        JSON.parse(this.partnerSettings.key1)
      );
    }
    if (
      this.partnerSettings.key2 !== '' &&
      this.isJson(this.partnerSettings.key2)
    ) {
      this.partnerSettings.key2 = JSON.stringify(
        JSON.parse(this.partnerSettings.key2)
      );
    }
    if (
      this.partnerSettings.key3 !== '' &&
      this.isJson(this.partnerSettings.key3)
    ) {
      this.partnerSettings.key3 = JSON.stringify(
        JSON.parse(this.partnerSettings.key3)
      );
    }
    if (
      this.partnerSettings.key4 !== '' &&
      this.isJson(this.partnerSettings.key4)
    ) {
      this.partnerSettings.key4 = JSON.stringify(
        JSON.parse(this.partnerSettings.key4)
      );
    }
    if (
      this.partnerSettings.key5 !== '' &&
      this.isJson(this.partnerSettings.key5)
    ) {
      this.partnerSettings.key5 = JSON.stringify(
        JSON.parse(this.partnerSettings.key5)
      );
    }
  }

  public partnerSettingUpsert(): void {
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
    if (this.partnerSettings.lkCode === '') {
      this.toastr.info('Look Up code cannot be empty');
      $('#lkCode').focus();
      return;
    }
    if (
      this.partnerSettings.keyCode === 0 ||
      this.partnerSettings.keyCode < 0
    ) {
      this.toastr.info('Key Code cannot be 0');
      $('#keyCode').focus();
      return;
    }
    if (this.partnerSettings.key1 === '') {
      this.toastr.info('Key 1 cannot be empty');
      $('#setting1').focus();
      return;
    }
    this.objectValidation();
    this.loadershowPartner = true;
    this.loaderMessage = 'Saving Partner Setting...';
    this.WS.post('api/master/partner/settings/upsert', {
      _id: this.partnerToken._id,
      settings: btoa(JSON.stringify(this.partnerSettings)),
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.partnerToken.settings = res.result.partnerSetting;
        this.mapTableSetting();
        this.editpartnerSettings = false;
        this.resetPartnerSettings();
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
      this.loadershowPartner = false;
    });
  }

  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('PARTNER')
    );
    if (matchPermission && matchPermission['PARTNER'].includes('EXPORT')) {
      try {
        this.loadershowPartner = true;
        this.loaderMessage = 'Exporting data..';

        this.exporter.exportTable('xlsx', { fileName: filename });

        setTimeout(() => {
          this.loadershowPartner = false;
        }, 1000);
      } catch (error) {
        console.log('Error', error);
      }
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.partners = [];
    this.partnersEntity = [];
    // this.userRoles.length = 0;
  }

  tokenPartnerSearchSuggestionIndex = -1;

  onTokenPartnerSearchInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenPartnerSearchSuggestionIndex = Math.max(
          this.tokenPartnerSearchSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenPartnerSearchSuggestionIndex = Math.min(
          this.tokenPartnerSearchSuggestionIndex + 1,
          this.partners.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenPartnerSearchSuggestionIndex >= 0) {
          this.setTokenPartner(
            this.partners[this.tokenPartnerSearchSuggestionIndex],
            'search'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenPartnerPopulateSuggestionIndex = -1;

  onTokenPartnerPopulateInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenPartnerPopulateSuggestionIndex = Math.max(
          this.tokenPartnerPopulateSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenPartnerPopulateSuggestionIndex = Math.min(
          this.tokenPartnerPopulateSuggestionIndex + 1,
          this.partners.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenPartnerPopulateSuggestionIndex >= 0) {
          this.setTokenPartner(
            this.partners[this.tokenPartnerPopulateSuggestionIndex],
            'populate'
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  approvalRoleSuggestionIndex = -1;

  onApprovalRoleInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.approvalRoleSuggestionIndex = Math.max(
          this.approvalRoleSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.approvalRoleSuggestionIndex = Math.min(
          this.approvalRoleSuggestionIndex + 1,
          this.userRoles.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.approvalRoleSuggestionIndex >= 0) {
          this.setApprovalRole(
            this.userRoles[this.approvalRoleSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

  tokenPartnerEntitySuggestionIndex = -1;

  onTokenPartnerEntityInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenPartnerEntitySuggestionIndex = Math.max(
          this.tokenPartnerEntitySuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenPartnerEntitySuggestionIndex = Math.min(
          this.tokenPartnerEntitySuggestionIndex + 1,
          this.partnersEntity.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenPartnerEntitySuggestionIndex >= 0) {
          this.setTokenPartnerEntity(
            this.partnersEntity[this.tokenPartnerEntitySuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }
}

export class PartnerValidator extends AbstractValidator<IPartnerImport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importID = '';
  public eachValue: Subject<IPartnerImport>;
  public title = 'Import Partner';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'Partner Import';
  public templateName = 'Partner Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/Partner.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Partner Name*',
      {
        column: 'Partner Name*',
        key: 'partnerName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Partner Type*',
      {
        column: 'Partner Type*',
        key: 'partnerType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Partner Category*',
      {
        column: 'Partner Category*',
        key: 'partnerCategory',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Tax Identification Number',
      {
        column: 'Tax Identification Number',
        key: 'tin',
        validations: [],
      },
    ],
    [
      'Partner Legal Entity Country*',
      {
        column: 'Partner Legal Entity Country*',
        key: 'country',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Region',
      {
        column: 'Region',
        key: 'partnerRegion',
        validations: [],
      },
    ],
    [
      'Partner Short Code',
      {
        column: 'Partner Short Code',
        key: 'shortENCode',
        validations: [],
      },
    ],
    [
      'ERP Accounting Code',
      {
        column: 'ERP Accounting Code',
        key: 'erpNumber',
        validations: [],
      },
    ],
    [
      'AddressLine 1*',
      {
        column: 'AddressLine 1*',
        key: 'addressLine1',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'AddressLine 2',
      {
        column: 'AddressLine 2',
        key: 'addressLine2',
        validations: [],
      },
    ],
    [
      'Postal Code',
      {
        column: 'Postal Code',
        key: 'postalCode',
        validations: [],
      },
    ],
    [
      'State',
      {
        column: 'State',
        key: 'state',
        validations: [],
      },
    ],
    [
      'City',
      {
        column: 'City',
        key: 'city',
        validations: [],
      },
    ],
    [
      'Approval Role*',
      {
        column: 'Approval Role*',
        key: 'approvalRole',
        validations: [],
      },
    ],
    [
      'Alliance Program',
      {
        column: 'Alliance Program',
        key: 'allianceProgram',
        validations: [],
      },
    ],
    [
      'Contact Name',
      {
        column: 'Contact Name',
        key: 'contactName',
        validations: [],
      },
    ],
    [
      'Contact Designation',
      {
        column: 'Contact Designation',
        key: 'contactDesignation',
        validations: [],
      },
    ],
    [
      'Contact Number',
      {
        column: 'Contact Number',
        key: 'contactNumber',
        validations: [],
      },
    ],
    [
      'Contact Email',
      {
        column: 'Contact Email',
        key: 'contactEmail',
        validations: [],
      },
    ],
    [
      'Partner Entity',
      {
        column: 'Partner Entity',
        key: 'partnerEntity',
        validations: [],
      },
    ],
    [
      'Contact Role',
      {
        column: 'Contact Role',
        key: 'contactRole',
        validations: [],
      },
    ],
    [
      'Parent Tin',
      {
        column: 'Parent Tin',
        key: 'parentTin',
        validations: [],
      },
    ],
  ]);

  constructor(private WS: WebService, u: IPartnerImport = null) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IPartnerImport>();

    this.eachValue.subscribe((v: any) => {
      // console.log('received value from import - ', v);
      this.callSavePartner(v);
    });
  }

  callSavePartner(inputData: any): void {
    this.WS.post('api/master/partner/save/import', {
      data: inputData,
      // inputData: inputData.tJSON,
      // filelength: inputData.filelength,
      // indexNo: inputData.indexNo,
      // importId: inputData.importID,
    }).subscribe((res: any) => {
      const response = res;
      // const response = JSON.parse(res);
      this.saveResponse.next(response);
    });
  }
}


export interface IPartnerImport {
  partnerName?: string;
  partnerType?: string;
  partnerCategory?: string;
  tin?: string;
  erpNumber?: string;
  contactName?: string;
  contactDesignation?: string;
  contactNumber?: string;
  contactEmail?: string;
  partnerEntity?: string;
  partnerRegion?: string;
  contactRole?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  approvalRole?: string;
  state?: string;
  city?: string;
  country?: string;
  allianceProgram?: string;
  shortENCode?: string;
  parentTin?: string;
}
export interface IResponseType {
  status: true,
  result: null,
  message: string
}
