import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IResponse } from 'src/app/models/server-data-source.model';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { Options } from 'select2';
import { FormControl } from '@angular/forms';
import { IPartner } from 'src/app/models/partner.interface';

declare var $;
@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.css'],
})
export class ChannelsComponent implements OnInit {
  @ViewChild(MatSort) channelSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;

  @ViewChild('channelSettingSort') channelSettingSort: MatSort;
  @ViewChild('channelSettingPagination') channelSettingPagination: MatPaginator;
  public channelName;
  public channelName1;
  public source;
  public source1;
  public destination;
  public destination1;
  public status;
  public status1 = true;
  public destinationUsername;
  public destinationPassword;
  public destinationUrl;
  public destinationGrantType;
  public destinationClientId;
  public sourceUsername;
  public sourcePassword;
  public sourceUrl;
  public sourceForm = [];
  public destinationForm = [];
  public sourceConnectionStringForm = {};
  public destinationConnectionStringForm = {};
  // @ViewChild(MatSort) partnerSort: MatSort;
  public isSidebarOpen = true;
  public showChannelDetails = false;
  public passwordType;
  public passwordIcon = false;
  public showImport: boolean;
  public showData: boolean;
  private languageSubscription: Subscription = null;
  public importValidator: ChannelsValidator;
  public data: ILanguage;
  public authenticatedUser: IUser;
  private userSub: Subscription;
  public ExportLoader = false;
  public exportloaderMessage = '';
  formObject = { formName: null };
  _id: string;
  public settings;
  public dataSourceChannels: MatTableDataSource<IChannels>;
  public displayedChannelsColumn: string[] = [
    'channelName',
    'source',
    'destination',
    'createdOn',
    'createdBy',
    'status',
  ];
  public supportedEvents = new FormControl([]);
  public supportedEventsOptions = [
    'activateChannel',
    'deactivateChannel',
    'listProducts',
    'unlistProducts',
    'fetchProducts',
    'inventoryUpdate',
    'fetchPrice',
    'priceUpdate',
    'fetchInventory',
    'fetchOrder',
    'updateOrderStatus',
    'orderFulfilled',
    'modifyOrder',
    'cancelOrder',
  ];
  public channelSettings: IChannelSettings = {
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
  allSelected = false;
  selectedOptions: string[] = [];
  editChannelSettings: boolean = false;
  toggleSelectAllOptions() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.supportedEvents.setValue(this.supportedEventsOptions);
    } else {
      this.supportedEvents.setValue([]);
    }
  }
  public dataSourceSetting: MatTableDataSource<any>;
  public displyedSettingColumn: string[] = [
    'name',
    'description',
    'value1',
    'value2',
    'value3',
    'value4',
  ];
  public channelsData: IChannels[] = [];
  public channelsNameList: IChannels[] = [];
  public sourceList: IChannels[] = [];
  public destinationList: IChannels[] = [];
  u: IChannels;
  public simpleSearch = '';
  public supportedEvents1 = [];
  public options: Options;
  public inputValidator;

  constructor(
    private WS: WebService,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) {
    this.showImport = false;
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
          $(event.target).parent('.select2-selection__choice__remove').length ||
          $(event.target).parent('.searchSuggestions').length
        ) {
          // Clicked on select 2 cross icon. Do nothing
        } else {
          $('body').find('.query1').removeClass('visible');
          $('#query1').hide();
          this.showData = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.passwordType = 'password';
    this.options = {
      multiple: true,
      closeOnSelect: false,
      width: '100%',
      tags: true,
    };
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new ChannelsValidator(this.WS, this.u, this.toaster);

    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showChannelDetails = true;
    }
    this.getChannels();
    this.supportedEvents.valueChanges.subscribe((values: string[]) => {
      this.selectedOptions = values;
    });
  }
  public changeLanguage(lang: string): void {
    this.data = this.cs.getLanguageData(lang);
  }
  addNewChannels(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CHANNELS')
    );
    if (matchPermission && matchPermission['CHANNELS'].includes('NEW')) {
      this.showChannelDetails = isshow;
      this._id = '';
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
      );
    }
  }
  showImportScreen(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CHANNELS')
    );
    if (matchPermission && matchPermission['CHANNELS'].includes('IMPORT')) {
      this.showImport = !this.showImport;
    } else {
      this.toaster.info(
        `${this.data ? this.data.master.action.accessdenied : 'Access denied'}`
      );
    }
  }
  showQueryForm() {
    if (!this.showData) {
      $('.query1').addClass('visible');
      this.showData = true;
    } else {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.showData = false;
    }
  }
  hideChannelDetails(): void {
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {
      this.showChannelDetails = false;
    } else {
      this.showChannelDetails = false;
    }
    this.showChannelDetails = false;
    this.resetChannel();
    this.simpleSearch = '';
    this.getChannels();
    this.resetChannelSettings();
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      this.searchInputFunction();
    }, 50);
  }

  public backToResults(): void {
    this.showImport = false;
    this.getChannels();
  }

  togglePasswordInput() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
      this.passwordIcon = true;
    } else {
      this.passwordType = 'password';
      this.passwordIcon = false;
    }
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

  public sourceModalClose(): void {
    for (let obj of this.sourceForm) {
      if (!obj.value || obj.value === '') {
        this.toaster.info('Please Enter Source ' + obj.displayName);
        $('#source' + obj.name).focus();
        return;
      }

      if (obj.value && !obj.value.match(obj.pattern)) {
        this.toaster.info(`Enter a valid ${obj.displayName}`);
        $('#source' + obj.name).focus();
        return;
      }
      this.sourceConnectionStringForm[obj.name] = obj.value;
    }
    $('#sourceModalCloseBtn').click();
  }
  public destinationModalClose(): void {
    for (let obj of this.destinationForm) {
      if (!obj.value || obj.value === '') {
        this.toaster.info('Please Enter Destination ' + obj.displayName);
        $('#destination' + obj.name).focus();
        return;
      }
      if (obj.value && !obj.value.match(obj.pattern)) {
        this.toaster.info(`Enter a valid ${obj.displayName}`);
        $('#destination' + obj.name).focus();
        return;
      }
      this.destinationConnectionStringForm[obj.name] = obj.value;
    }
    $('#destinationModalCloseBtn').click();
  }

  public saveChannel(): void {
    if (!this.channelName1 || this.channelName1.trim() === '') {
      this.toaster.info('Please Enter Channel Name');
      $('#channelName1').focus();
      return;
    }
    if (!this.source1 || this.source1.trim() === '') {
      this.toaster.info('Please Enter Source Name');
      $('#source1').focus();
      return;
    }
    if (!this.sourceForm || this.sourceForm.length === 0) {
      this.toaster.info('Please choose valid Source Name');
      $('#source1').focus();
      return;
    }
    if (!this.destinationForm || this.destinationForm.length === 0) {
      this.toaster.info('Please choose valid Destination Name');
      $('#destination1').focus();
      return;
    }
    for (let obj of this.sourceForm) {
      if (!obj.value || obj.value === '') {
        this.toaster.info('Please Enter Source ' + obj.displayName);
        $('#source' + obj.name).focus();
        return;
      }
    }
    if (!this.destination1 || this.destination1 === '') {
      this.toaster.info('Please select Destination Name');
      $('#destination1').focus();
      return;
    }
    if (!this.supportedEvents || this.selectedOptions.length === 0) {
      this.toaster.info('Please Select Supported Events');
      $('#supportedEvents').click();
      return;
    }
    for (let obj of this.destinationForm) {
      if (obj.isRequired) {
        if (!obj.value || obj.value === '') {
          this.toaster.info('Please Enter Destination ' + obj.displayName);
          $('#destination' + obj.name).focus();
          return;
        }
      }
    }
    this.WS.post('api/channel/save', {
      _id: this._id,
      channelName: this.channelName1,
      source: this.source1,
      destination: this.destination1,
      status: this.status1,
      destinationConnectionString: this.destinationConnectionStringForm,
      sourceConnectionString: this.sourceConnectionStringForm,
      supportedEvents: this.selectedOptions,
      settings: this.settings,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toaster.success(res.description);
        this.showChannelDetails = false;
        this.resetChannel();
        this.getChannels();
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  public getTableClickData(id: string): void {
    this.getChannelById(id);
  }
  public getChannelById(channelsId: string): void {
    this.WS.post('api/channel/fetch/id', { id: channelsId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const channels = res.result.channels;

          this._id = channelsId;
          this.channelName1 = channels.channelName;
          this.source1 = channels.source;
          this.destination1 = channels.destination;
          this.status1 = channels.status;
          this.sourceForm = res.result.sourceFormString;
          this.destinationForm = res.result.destinationFormString;

          this.supportedEvents.setValue(channels.supportedEvents);
          this.settings = res.result.settings;
          this.mapSettingTable();
          this.showChannelDetails = true;
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }
  public simpleSearchChannelsData(value): void {
    this.WS.post('api/channel/simpleSearchChannelData', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.channelsData = res.result;
        this.mapGlobalSettingsOnData();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.error(res.description);
      } else if (res.status === 3) {
        this.channelsData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
    });
  }
  public getChannels(): void {
    this.WS.post('api/channel/fetchChannels').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.channelsData = res.result as IChannels[];
        this.mapGlobalSettingsOnData();
        this.toaster.success(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  private mapGlobalSettingsOnData(): void {
    this.dataSourceChannels = new MatTableDataSource(this.channelsData);
    this.dataSourceChannels.sort = this.channelSort;
    this.dataSourceChannels.paginator = this.paginator;
  }
  public advanceChannelsSearch(): void {
    this.WS.post('api/channel/advance/search', {
      channelName: this.channelName,
      source: this.source,
      destination: this.destination,
      status: this.status,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.channelsData = res.result as IChannels[];
        this.mapGlobalSettingsOnData();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.channelsData = [];
        this.mapGlobalSettingsOnData();
        this.toaster.info(res.description);
      } else {
        console.log(res.description);
      }
      this.resetAdvanceSearch();
      $('#query1').removeClass('visible');
      $('#query1').hide();
    });
  }
  public fetchChannelNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/channel/names/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.channelsNameList = res.result.channels as IChannels[];
            if (!this.channelsNameList.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.channelsNameList = [];
    }
  }

  public setTokenChannelName(channel: IChannels, type: string): void {
    if (type === 'search') {
      this.channelName = channel.channelName;
      this.channelsNameList = [];
    } else {
      this.getTableClickData(channel._id);
      this.channelsNameList = [];
    }
  }
  public fetchSource(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/source/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.sourceList = res.result.channels as IChannels[];
            if (!this.sourceList.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.sourceList = [];
    }
  }

  public setTokenSource(channel: IPartner, type: string): void {
    if (type === 'search') {
      this.getPartnerById(channel._id);
      this.source = channel.name;
      this.sourceList = [];
    } else if (type === 'populate') {
      this.getPartnerById(channel._id);
      this.source1 = channel.name;
      this.getConnectionString(this.source1, this.sourceForm);
      this.sourceList = [];
    }
  }
  public fetchDestination(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/destination/fetch', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.destinationList = res.result.channels as IChannels[];
            if (!this.destinationList.length) {
              this.toaster.info('Not found');
            }
          } else if (res.status === 2) {
            this.toaster.info(res.description);
          } else {
            this.toaster.error(res.description);
          }
        }
      );
    } else {
      this.destinationList = [];
    }
  }

  public setTokenDestination(channel: IPartner, type: string): void {
    if (type === 'search') {
      this.getPartnerById(channel._id);
      this.destination = channel.name;
      this.destinationList = [];
    } else if (type === 'populate') {
      this.getPartnerById(channel._id);
      this.destination1 = channel.name;

      this.getConnectionString(this.destination1, this.destinationForm);
      this.destinationList = [];
    }
  }
  public getPartnerById(partnerId: string): void {
    this.WS.post('api/mt/partner/fetch/id', { id: partnerId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          const partner: IPartner = res.result.partners[0];
        } else {
          this.toaster.info(res.description);
        }
      }
    );
  }

  public getConnectionString(partnerName: string, destinationForm: {}[]): void {
    this.WS.post('api/connectionStringForm/fetch', {
      name: partnerName,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        const connectionString = res.result.formString[0].key1;
        const parsedFormName = JSON.parse(connectionString);
        destinationForm.push(...parsedFormName);
      } else {
        this.toaster.info(res.description);
      }
    });
  }
  public destinationConnectionStringBtn(): void {
    if (!this.destination1 || this.destination1.trim() === '') {
      this.toaster.info('Please select Destination.');
    }
    $('#destinationConnectionStringModalBtn').click();
  }
  public sourceConnectionStringBtn(): void {
    if (!this.source1 || this.source1.trim() === '') {
      this.toaster.info('Please select Soucre.');
    }
    $('#sourceConnectionStringModalBtn').click();
  }
  // resetChannel function is getting called
  public resetChannel(): void {
    this.channelName1 = '';
    this.source1 = '';
    this.destination1 = '';
    this.sourceForm = [];
    this.destinationForm = [];
    this.status1 = true;
    this.allSelected = false;
    this.supportedEvents.setValue([]);
  }
  public resetAdvanceSearch(): void {
    this.channelName = '';
    this.status = true;
    this.source = '';
    this.destination = '';
  }
  // export function on channel
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('CHANNELS')
    );
    if (matchPermission && matchPermission['CHANNELS'].includes('EXPORT')) {
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
    } else {
      this.toaster.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }

  public resetChannelSettings(): void {
    this.channelSettings = {
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
      this.channelSettings.key1 !== '' &&
      this.isJson(this.channelSettings.key1)
    ) {
      this.channelSettings.key1 = JSON.stringify(
        JSON.parse(this.channelSettings.key1)
      );
    }
    if (
      this.channelSettings.key2 !== '' &&
      this.isJson(this.channelSettings.key2)
    ) {
      this.channelSettings.key2 = JSON.stringify(
        JSON.parse(this.channelSettings.key2)
      );
    }
    if (
      this.channelSettings.key3 !== '' &&
      this.isJson(this.channelSettings.key3)
    ) {
      this.channelSettings.key3 = JSON.stringify(
        JSON.parse(this.channelSettings.key3)
      );
    }
    if (
      this.channelSettings.key4 !== '' &&
      this.isJson(this.channelSettings.key4)
    ) {
      this.channelSettings.key4 = JSON.stringify(
        JSON.parse(this.channelSettings.key4)
      );
    }
    if (
      this.channelSettings.key5 !== '' &&
      this.isJson(this.channelSettings.key5)
    ) {
      this.channelSettings.key5 = JSON.stringify(
        JSON.parse(this.channelSettings.key5)
      );
    }
  }
  public editChannelSetting(data: any, flagEdit: boolean): void {
    this.editChannelSettings = true;
    if (flagEdit) {
      this.channelSettings = {
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
      this.resetChannelSettings();
    }
  }
  public channelSettingUpsert(): void {
    if (this.channelSettings.lkCode === '') {
      this.toaster.info('Look Up code cannot be empty');
      $('#lkCode').focus();
      return;
    }
    if (
      this.channelSettings.keyCode === 0 ||
      this.channelSettings.keyCode < 0
    ) {
      this.toaster.info('Key Code cannot be 0');
      $('#keyCode').focus();
      return;
    }
    if (this.channelSettings.key1 === '') {
      this.toaster.info('Key 1 cannot be empty');
      $('#setting1').focus();
      return;
    }
    this.objectValidation();
    this.WS.post('api/mt/channel/settings/upsert', {
      _id: this._id,
      settings: btoa(JSON.stringify(this.channelSettings)),
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.settings = res.result.channelSetting;
        this.editChannelSettings = false;
        this.mapSettingTable();
        this.resetChannelSettings();
        this.toaster.success(res.description);
      } else if (res.status === 2) {
        this.toaster.info(res.description);
      } else {
        this.toaster.error(res.description);
      }
    });
  }
  public mapSettingTable(): void {
    this.dataSourceSetting = new MatTableDataSource(this.settings);
    this.dataSourceSetting.sort = this.channelSettingSort;
    this.dataSourceSetting.paginator = this.channelSettingPagination;
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.channelsNameList.length = 0;
    this.sourceList.length = 0;
    this.destinationList.length = 0;
  }
  tokenActionSuggestionIndex = -1;

  onTokenChannelsInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionSuggestionIndex = Math.max(
          this.tokenActionSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionSuggestionIndex = Math.min(
          this.tokenActionSuggestionIndex + 1,
          this.channelsNameList.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        break;
    }
  }

  tokenActionPopulateSuggestionIndex = -1;

  onTokenActionPopulateInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenActionPopulateSuggestionIndex = Math.max(
          this.tokenActionPopulateSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenActionPopulateSuggestionIndex = Math.min(
          this.tokenActionPopulateSuggestionIndex + 1,
          this.channelsNameList.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        break;
    }
  }
}

class ChannelsValidator extends AbstractValidator<IChannels> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  public importFileId = '';
  public loadershow = false;
  declare public eachValue: Subject<IChannels>;
  public title = 'Import Channels';
  public closeTitle = 'Close Import';
  declare public saveResponse: Subject<any>;
  declare public fileSubject: Subject<File>;
  public templateName = 'Channels Template';
  public templateURL =
    env.BASE_URL + 'api/mt/template/download/ImportChannel.xlsx';
  // tslint:disable-next-line: variable-name
  public _header: Map<string, IColumn> = new Map([
    [
      'Channel Name',
      {
        column: 'Channel Name',
        key: 'channelName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Source',
      {
        column: 'Source',
        key: 'source',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Destination',
      {
        column: 'Destination',
        key: 'destination',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Source Connection String',
      {
        column: 'Source Connection String',
        key: 'sourceConnectionString',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Destination Connection String',
      {
        column: 'Destination Connection String',
        key: 'destinationConncetionString',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Supported Events',
      {
        column: 'Supported Events',
        key: 'supportedEvents',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(
    private WS: WebService,
    u: IChannels = null,
    private toaster: ToastrService
  ) {
    super(u);
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IChannels>();
    this.fileSubject = new Subject<File>();

    this.fileSubject.subscribe((v) => {
      this.callToCreatePresigned(v);
    });
    setTimeout(() => {
      this.eachValue.subscribe((v: any) => {
        setTimeout(() => {
          this.callSaveChannelWebService(v);
        }, 1500);
      });
    }, 2000);
  }

  callToCreatePresigned(file: File): void {
    const nameSplits = file.name.split('.');
    this.WS.post('api/mt/s3/presignedURL', {
      type: 'Channel',
      extension: nameSplits[nameSplits.length - 1],
      contentType: file.type,
      fileName: nameSplits[0],
    }).subscribe((res: any) => {
      this.WS.put(res.result.urlInfo.url, file, file.type).subscribe(
        (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;
            case HttpEventType.ResponseHeader:
              break;
            case HttpEventType.UploadProgress:
              break;
            case HttpEventType.Response:
              this.WS.post('api/mt/fileImportExport/save/import', {
                path: res.result.urlInfo.key,
                type: 'Channel',
                fileName: file.name,
                activity: 'Import',
                extension: nameSplits[nameSplits.length - 1],
              }).subscribe((re: IResponse) => {
                if (re.status === 1) {
                  this.importFileId = re.result;
                } else if (re.status === 2) {
                  // this.toaster.info(re.description);
                } else {
                  // this.toastr.error(re.description);
                }
              });
          }
        }
      );
    });
  }

  callSaveChannelWebService(inputData: any): void {
    this.WS.post('api/channel/save/import', {
      inputData: inputData,
    }).subscribe((res: any) => {
      const response = res;
      this.saveResponse.next(response);
    });
  }
}
export class IChannels {
  _id: string;
  channelName: string;
  source: string;
  destination: string;
  sourceConnectionString: object;
  destinationConnectionString: object;
  createdBy: string;
  status: boolean;
  supportedEvents: string[];
  createdOn: Date;
  settings: string[];
}
export interface IChannelSettings {
  _id: string;
  lkCode: string;
  keyCode: number;
  key1: string;
  key2: string;
  key3: string;
  key4: string;
  key5: string;
  description: string;
  createdOn?: Date;
  createdBy?: IUser | string;
  lastModifiedOn?: Date;
  lastModifiedBy?: IUser | string;
}
