import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import _ from 'lodash';
import { ILanguage } from 'src/app/models/language.interface';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { IDevice } from '../../../models/device.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IGlobalSetting } from 'src/app/models/globalSetting.interface';
import { ToastrService } from 'ngx-toastr';
import { ThrowStmt } from '@angular/compiler';
import { ILounge } from 'src/app/models/lounge.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ALERT_RESPONSE, IAlert } from '../../alert-modal/alert.interface';
import { AppAlertComponent } from '../../alert-modal/alert.component';
import {
  AbstractValidator,
  IColumn,
} from '../../import/validators/abstract-validator.interface';
import { DataValidatorRequired } from '../../import/validators/validator.functions';
import { IPartnerImport } from '../partner/partner.component';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Select2OptionData } from 'ng-select2';
import { Options } from 'select2';
import { FormControl } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/models/user.interface';
import { environment as env } from 'src/environments/environment';
import { MatTableExporterDirective } from 'mat-table-exporter';
declare var $;
@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css'],
})
export class DevicesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) deviceSort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public isSidebarOpen: boolean = true;
  public showData: boolean;
  public importValidator: DeviceValidator;
  public showImport: boolean;
  public showDeviceDetails = false;

  public ExportLoader = false;
  public exportloaderMessage = '';
  public data: ILanguage;
  private languageSubscription: Subscription = null;
  public deviceData: IDevice[] = [];
  public deviceDataDetails: IGlobalSetting[] = [];
  public deviceTypes: IGlobalSetting[] = [];
  public deviceCategoriesDetails: IGlobalSetting[] = [];
  public deviceBrandsDetails: IGlobalSetting[] = [];
  public deviceLounges: ILounge[] = [];
  public deviceIdentifiedBy: IGlobalSetting[] = [];
  public deviceSelectString: any;
  public deviceTagList: Array<Select2OptionData>;
  public options: Options;
  public simplesearch = '';
  public devicelounge: ILounge[] = [];
  public authenticatedUser: IUser;
  private userSub: Subscription;
  status: '';
  serialNo: '';
  currentLounge: '';
  newCurrentLounge: '';
  name: '';
  tag: string[] = [];
  displayType: '';
  displayBrand: '';
  displayCategory: '';
  displayStatus: '';
  displayName: '';
  lounge: ILounge[];
  loungeId: any;
  _id: '';
  type: '';
  brand: '';
  category: '';
  public displayedColumns: string[] = [
    'name',
    'displayType',
    'serialNo',
    'currentLounge',
    'displayBrand',
    'displayCategory',
    'status',
    'action',
  ];
  public dataSourceDevice: MatTableDataSource<IDevice>;
  public device: IDevice[] = [];
  isActive: boolean = true;
  private allDeviceIdentifiers: IGlobalSetting[] = [];
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  fruits: string[] = [];
  allFruits: string[] = [];

  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private location: Location,
    private alerts: AppAlertComponent,
    private WS: WebService,
    private cs: CommonServiceService,
    private auth: AuthenticationService
  ) {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this._filter(fruit) : this.allFruits.slice()
      )
    );
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.tag.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.fruitCtrl.setValue(null);
  }

  remove(tag: string): void {
    const index = this.tag.indexOf(tag);
    if (index >= 0) {
      this.tag.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tag.push(event.option.viewValue);

    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allFruits.filter(
      (fruit) => fruit.toLowerCase().indexOf(filterValue) === 0
    );
  }
  ngOnInit(): void {
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
      }
    });
    this.fetchDeviceData();
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.importValidator = new DeviceValidator(this.WS);
    if (
      this.route.snapshot.queryParams.n &&
      this.route.snapshot.queryParams.n === 'y'
    ) {

      this.showDeviceDetails = true;
    }

    this.deviceTagList = [
      {
        id: 'IP1',
        text: 'IP Address1',
      },
      {
        id: 'IP2',
        text: 'Address2',
      },
    ];
    this.options = {
      multiple: true,
      closeOnSelect: false,
      width: '100%',
    };
  }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  // The function is making a POST request to fetch device data and updating the properties deviceData, fetchDeviceType, fetchDeviceBrand, fetchDeviceCategory, and simplesearch based on the response
  public fetchDeviceDataSearch(): void {
    this.WS.post('api/master/device/fetchDeviceData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.deviceData = res.result;
          this.fetchDeviceType('DEVICE_TYPE');
          this.fetchDeviceBrand('DEVICE_BRAND');
          this.fetchDeviceCategory('DEVICE_CATEGORY');
          this.simplesearch = '';
          this.toastr.success(res.description);
        } else {
          this.toastr.error(res.description);
        }
      }
    );
  }
  // Sends a POST request to the API endpoint 'api/master/device/fetchDeviceData' and updates the deviceData property with the result received from the response.
  public fetchDeviceData(): void {
    this.WS.post('api/master/device/fetchDeviceData').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.deviceData = res.result;
          this.fetchDeviceType('DEVICE_TYPE');
          this.fetchDeviceBrand('DEVICE_BRAND');
          this.fetchDeviceCategory('DEVICE_CATEGORY');
          this.toastr.success(res.description);
        } else {
          this.toastr.error(res.description);
        }
        this.mapGlobalSettingsOnData();
      }
    );
  }
  //Updates the simplesearch property with the value passed as a parameter, makes a POST request to the API endpoint 'api/master/device/simpleSearchDeviceData', updates the deviceDat
  public simpleSearchDevice(value): void {
    this.simplesearch = value;
    this.WS.post('api/master/device/simpleSearchDeviceData', {
      search: value,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.deviceData = res.result;
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      } else if (res.status === 3) {
        this.deviceData = [];
        this.mapGlobalSettingsOnData();
        this.dataSourceDevice = new MatTableDataSource(this.deviceData);
        this.toastr.info(res.description);
      } else {
      }
    });
  }
  //Sends a POST request ' with the deviceName, type, category, and brand parameters,   Updates the deviceData property , calls the mapGlobalSettingsOnData() method
  public fetchDevicesAdvanced(
    deviceName: string,
    type: number,
    category: number,
    brand: number
  ): void {
    this.WS.post('api/master/device/advanced/fetch', {
      deviceName,
      type,
      category,
      brand,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.deviceData = res.result.devices as IDevice[];
        this.mapGlobalSettingsOnData();
        this.toastr.success(res.description);
      } else if (res.status === 3) {
        this.deviceData = [];
        this.mapGlobalSettingsOnData();
        this.toastr.info(
          `${this.data ? this.data.master.device.noSuch : 'No Such Device Exists'
          }`
        );
        this.dataSourceDevice = new MatTableDataSource(this.deviceData);
        // this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
    $('#query1').hide();
  }
  //Resets device details
  public resetDeviceDetails(): void {
    if (this._id !== '') {
      this.getDeviceById(this._id);
    } else {
      this.ResetDeviceTable();
    }
  }
  //Resets device table
  public ResetDeviceTable(): void {
    this.showDeviceDetails = true;
    this._id = '';
    this.name = '';
    this.type = '';
    this.displayType = '';
    this.brand = '';
    this.category = '';
    this.status = '';
    this.isActive = true;
    this.serialNo = '';
    this.currentLounge = '';
    this.tag = [];
  }
  //Fetches and sorts device types based on lookupCode
  private fetchDeviceType(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.deviceDataDetails = res.result.values as IGlobalSetting[];
        this.deviceDataDetails = _.sortBy(
          this.deviceDataDetails,
          (o) => o.key1
        );
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  public getDeviceClickData(id: string) {
    this.mapGlobalSettingsOnData();
    this.getDeviceById(id);
  }
  public setTokenDevice(device: IDevice): void {
    this.getDeviceById(device._id);
    this.device = [];
  }
  public setDevicelounge(lounge: ILounge): void {
    this.getLoungeById(lounge._id);
    this.lounge = [];
  }
  public fetchLoungeNames(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/lounge/fetchLoungeNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.lounge = res.result.lounge as ILounge[];
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.lounge = [];
    }
  }
  // Fetches lounge names based on a keyword and updates the lounge property.
  public getLoungeById(loungeId: string): void {
    this.WS.post('api/master/lounge/fetch/id', { id: loungeId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.loungeId = res.result.lounge._id;
          this.currentLounge = res.result.lounge.name;
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }
  //Fetches lounge details by ID and sets current lounge name and ID
  public getDeviceById(deviceId: string): void {
    this.WS.post('api/master/device/fetch/id', { id: deviceId }).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this._id = res.result.device._id;
          this.name = res.result.device.name;
          this.tag = res.result.device.tag;
          this.type = res.result.device.type;
          this.serialNo = res.result.device.serialNo;
          this.currentLounge = res.result.device.currentLounge.name;
          this.category = res.result.device.category;
          this.brand = res.result.device.brand;
          this.isActive = res.result.device.isActive;
          this.showDeviceDetails = true;
          this.mapGlobalSettingsOnData();
        } else {
          this.toastr.info(res.description);
        }
      }
    );
  }
  // Fetches device names from the server based on a keyword input
  public fetchDeviceName(keyword: string): void {
    if (keyword.length > 2) {
      this.WS.post('api/master/device/fetchDeviceNames', { keyword }).subscribe(
        (res: IResponse) => {
          if (res.status === 1) {
            this.device = res.result.device as IDevice[];
          } else if (res.status === 2) {
            this.toastr.info(res.description);
          } else {
            this.toastr.error(res.description);
          }
        }
      );
    } else {
      this.device = [];
    }
  }
  // Fetches device brands using a lookup code and maps the result to data
  private fetchDeviceBrand(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.deviceBrandsDetails = res.result.values as IGlobalSetting[];
        this.deviceBrandsDetails = _.sortBy(
          this.deviceBrandsDetails,
          (o) => o.key1
        );
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  // Fetches device categories from the server and sorts them by a specific key value
  private fetchDeviceCategory(lookupCode: string): void {
    this.WS.post('api/master/globalSetting/fetch/lookupCode', {
      lookupCode,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.deviceCategoriesDetails = res.result.values as IGlobalSetting[];
        this.deviceCategoriesDetails = _.sortBy(
          this.deviceCategoriesDetails,
          (o) => o.key1
        );
        this.mapGlobalSettingsOnData();
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.error(res.description);
      }
    });
  }
  // Maps global settings on device data for displaying user-friendly names and sets up the data source for the material table
  private mapGlobalSettingsOnData(): void {
    if (this.deviceData.length) {
      this.deviceData.map((device) => {
        if (this.deviceDataDetails.length) {
          const matchType = this.deviceDataDetails.find(
            (d) => d.keyCode === device.type
          );
          if (matchType) {
            device.displayType = matchType.key1;
          }
        }
        if (this.deviceCategoriesDetails.length) {
          const matchCat = this.deviceCategoriesDetails.find(
            (d) => d.keyCode === device.category
          );
          if (matchCat) {
            device.displayCategory = matchCat.key1;
          }
        }
        if (this.deviceBrandsDetails.length) {
          const matchBra = this.deviceBrandsDetails.find(
            (d) => d.keyCode === device.brand
          );
          if (matchBra) {
            device.displayBrand = matchBra.key1;
          }
        }
        if (this.deviceLounges.length) {
          const matchLou = this.deviceLounges.find(
            (d) => d._id === device.currentLounge._id
          );
          if (matchLou) {
            device.displayLounge = matchLou.name;
          }
        }
      });
      this.dataSourceDevice = new MatTableDataSource(this.deviceData);
      this.dataSourceDevice.sort = this.deviceSort;
      this.dataSourceDevice.paginator = this.paginator;
    }
  }
  // For deleting device data and requires appropriate permissions.
  public deleteDeviceData(deviceID: string): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('DEVICES')
    );
    if (matchPermission && matchPermission['DEVICES'].includes('DELETE')) {
      const alert: IAlert = {
        title: `${this.data
            ? this.data.master.device.delConf
            : 'Delete Device Confirmation!'
          }`,
        message: `${this.data
            ? this.data.master.device.msg
            : 'Are you sure you want to delete this Device?'
          }`,
        labelConfirm: `${this.data ? this.data.master.device.yes : 'Yes'}`,
        labelCancel: `${this.data ? this.data.master.device.no : 'No'}`,
      };
      this.alerts.alertConfirm(alert).subscribe((r) => {
        if (r === ALERT_RESPONSE.CONFIRM) {
          this.WS.post('api/master/device/deletedevicedata', {
            id: deviceID,
          }).subscribe((res: IResponse) => {
            if (res.status === 1) {
              this.device.splice(
                this.device.findIndex((i) => i._id === res.result.deleteId),
                1
              );
              this.toastr.success(res.description);
              this.fetchDeviceData();
            } else {

            }
          });
        } else {


        }
      });
    } else {
      this.toastr.info(
        `${this.data
          ? this.data.master.device.accessD
          : 'Access Denied for module DEVICES action DELETE'
        }`
      );
    }
  }
  // Returns the display name of a device based on its ID
  public returnDeviceid(device: number): string {
    let foundObject = this.deviceDataDetails.filter(
      (d) => d.keyCode === device
    );
    if (foundObject.length > 0) {
      return foundObject[0].key1;
    } else {
      return '';
    }
  }
  // Returns the display name of a device brand based on its ID
  public returnDeviceBrandid(device: number): string {
    let foundObject = this.deviceBrandsDetails.filter(
      (d) => d.keyCode === device
    );
    if (foundObject.length > 0) {
      return foundObject[0].key1;
    } else {
      return '';
    }
  }
  // Returns the display name of a device category based on its ID
  public returnDeviceCategoryid(device: number): string {

    let foundObject = this.deviceCategoriesDetails.filter(
      (d) => d.keyCode === device
    );
    if (foundObject.length > 0) {
      return foundObject[0].key1;
    } else {
      return '';
    }
  }
  // Returns the name of a lounge where a device is located based on the device's ID
  public returnDeviceLoungeid(device: string): string {
    let foundObject = this.lounge.filter((d) => d._id === device);
    if (foundObject.length > 0) {
      return foundObject[0].name;
    } else {
      return '';
    }
  }
  // public hideDeviceDetails(): void {
  //   if (
  //     this.route.snapshot.queryParams.n &&
  //     this.route.snapshot.queryParams.n === 'y'
  //   ) {
  //     this.showDeviceDetails = false;
  //     this.location.replaceState('/device');
  //   } else {
  //     this.showDeviceDetails = false;
  //   }

  //   this.ResetDeviceTable();
  //   this.fetchDeviceData();
  //   // this.showLoungeDetails = false;
  //   // window.location.reload();
  //   // this.ngOnInit();
  //   setTimeout(() => {
  //     $('#query1').removeClass('visible');
  //     $('#query1').hide();
  //   }, 50);
  // }
  public saveDeviceData(): void {
    if (!this.name || this.name === '') {
      $('#deviceName1').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.enterDeviceName
          : 'Enter Device Name'
        }`
      );
      return;
    }
    if (!this.type || this.type === '') {
      $('#displayType').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.selectDeviceType
          : 'Select Device Type'
        }`
      );
      return;
    }
    if (!this.serialNo || this.serialNo === '') {
      $('#serialNo').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.enterSerialNu
          : 'Enter Serial Number'
        }`
      );
      return;
    }
    if (!this.currentLounge || this.currentLounge === '') {
      $('#currentLounge').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.enterAvailableAtOutlet
          : 'Enter Available At Outlet'
        }`
      );
      return;
    }
    if (!this.category || this.category === '') {
      $('#displayCategory').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.selectDeviceCategory
          : 'Select Device Category'
        }`
      );
      return;
    }
    if (!this.brand || this.brand === '') {
      $('#displayBrand').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.selectDeviceBrand
          : 'Select Device Brand'
        }`
      );
      return;
    }
    if (!this.tag || this.tag.length === 0) {
      $('#tag').focus();
      this.toastr.info(
        `${this.data
          ? this.data.master.device.enterDeviceTag
          : 'Enter Device Tag'
        }`
      );
      return;
    }
    // if (!this.isActive) {
    //   $('#isActive').focus();
    //   this.toastr.info('Select Is Active');
    //   return;
    // }
    this.WS.post('api/master/device/createDeviceData', {
      _id: this._id,
      name: this.name,
      type: this.type,
      brand: this.brand,
      category: this.category,
      isActive: this.isActive,
      serialNo: this.serialNo,
      currentLounge: this.loungeId,
      tag: this.tag,
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this._id = res.result._id;
        this.name = res.result.name;
        this.type = res.result.type;
        this.brand = res.result.brand;
        this.category = res.result.category;
        this.isActive = res.result.device.isActive;
        this.serialNo = res.result.serialNo;
        this.currentLounge = res.result.loungeId;
        this.tag = res.result.tag;
        this.showDeviceDetails = false;
        this.fetchDeviceData();
        this.toastr.success(res.description);
      } else if (res.status === 2) {
        this.toastr.info(res.description);
      } else {
        this.toastr.info(res.description);
      }
      this.showData = false;
    });
  }

  ngAfterViewInit(): void {
    if (this.simplesearch.trim() !== '') {
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

    $(document).click(function (event) {
      // if you click on anything except the modal itself or the "open modal" link, close the modal
      if (!$(event.target).closest('.query1,.dropdown-form').length) {
        if (
          $(event.target).hasClass('select2-selection__choice__remove')
            .length ||
          $(event.target).parent('.select2-selection__choice__remove').length
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

  hideDeviceDetails() {
    this.showDeviceDetails = false;
    // this.fetchDeviceData();
    // window.location.reload();
    setTimeout(() => {
      $('#query1').removeClass('visible');
      $('#query1').hide();
      document.getElementById('txtSearch').focus();
    }, 50);
  }
  addNewDevice(isshow): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('DEVICES')
    );
    if (matchPermission && matchPermission['DEVICES'].includes('NEW')) {
      this.showDeviceDetails = isshow;
      this.ResetDeviceTable();
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.device.acDen : 'Access denied'}`
      );
    }
  }
  public backToResults(): void {
    this.showImport = false;
    // this.fetchDeviceData();
  }

  public showDeviceImport(): void {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('DEVICES')
    );
    if (matchPermission && matchPermission['DEVICES'].includes('IMPORT')) {
      this.showImport = true;
    } else {
      this.toastr.info(
        `${this.data ? this.data.master.device.acDen : 'Access denied'}`
      );
    }
  }
  //To export Report
  public exportReport(filename) {
    const matchPermission = this.authenticatedUser.permissions.find((l) =>
      Object.keys(l).includes('DEVICES')
    );
    if (matchPermission && matchPermission['DEVICES'].includes('EXPORT')) {
      try {
        this.ExportLoader = true;
        this.exportloaderMessage = 'Exporting data..';

        this.exporter.exportTable('xlsx', { fileName: filename });

        setTimeout(() => {
          this.ExportLoader = false;
        }, 1000);
      } catch (error) {

      }
    } else {
      this.toastr.info(
        `${this.data ? this.data.admission.accessDenied : 'Access denied'}`
      );
    }
  }
  // TO hide suggestion box
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.device = [];
    this.lounge = [];
  }
}
class DeviceValidator extends AbstractValidator<IDeviceImport> {
  // tslint:disable-next-line:variable-name
  public success = 0;
  public failure = 0;
  // public importFileId = '';
  public importType = 'Device';
  public eachValue: Subject<IDeviceImport>;
  public title = 'Import Device';
  public closeTitle = 'Close Import';
  public saveResponse: Subject<any>;
  public fileSubject: Subject<File>;
  public screenName = 'Device Import';
  public templateName = 'Device Template';
  public templateURL =
    env.BASE_URL + 'api/master/template/download/device.xlsx';
  public _header: Map<string, IColumn> = new Map([
    [
      'Device Name',
      {
        column: 'Device Name',
        key: 'deviceName',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Device Type',
      {
        column: 'Device Type',
        key: 'deviceType',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Device Category',
      {
        column: 'Device Category',
        key: 'deviceCategory',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Device Brand',
      {
        column: 'Device Brand',
        key: 'deviceBrand',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Serial Number',
      {
        column: 'Serial Number',
        key: 'serialNumber',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Available At Outlet',
      {
        column: 'Available At Outlet',
        key: 'availableAtOutlet',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Device Tag',
      {
        column: 'Device Tag',
        key: 'deviceTag',
        validations: [DataValidatorRequired()],
      },
    ],
    [
      'Is Active',
      {
        column: 'Is Active',
        key: 'isActive',
        validations: [DataValidatorRequired()],
      },
    ],
  ]);

  constructor(private WS: WebService, u: IDeviceImport = null) {
    super(u);
    this.fileSubject = new Subject<File>();
    this.saveResponse = new Subject<any>();
    this.eachValue = new Subject<IDeviceImport>();
    this.eachValue.subscribe((v: any) => {

      this.callSaveDevice(v);
    });
  }
  // /This method uploads multiple files and saves device data using the WebService
  callSaveDevice(inputData: any): void {
    this.WS.uploadMultipleFile(
      'api/master/device/save/import',
      inputData.filedata,
      {
        inputData: inputData.tJSON,
        filelength: inputData.filelength,
        indexNo: inputData.indexNo,
        importId: inputData.importID,
      }
    ).subscribe((res: any) => {
      const response = JSON.parse(res);
      if (response.status === 1) {
        this.success = this.success + 1;
      } else {
        this.failure = this.failure + 1;
      }
      this.saveResponse.next(JSON.parse(res));
      if (inputData.indexNo === inputData.filelength) {


        this.WS.post('api/master/fileImportExport/save/import', {
          id: inputData.importID,
          success: this.success,
          failure: this.failure,
          tCount: inputData.indexNo,
        }).subscribe((r: IResponse) => {
          this.failure = 0;
          this.success = 0;
        });
      }
    });
  }
}
export interface IDeviceImport {
  deviceName?: string;
  deviceType?: string;
  deviceCategory?: string;
  deviceBrand?: string;
  serialNumber?: string;
  availableAtOutlet?: string;
  deviceTag?: string;
}
