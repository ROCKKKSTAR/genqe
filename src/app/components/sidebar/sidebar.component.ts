import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { environment as env } from '../../../environments/environment';
import { WebService } from 'src/app/services/web.service';
import { IResponse } from 'src/app/models/server-data-source.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() sidebarState!: boolean;
  @Output() sidebarStateChange = new EventEmitter();
  public data: ILanguage;
  private languageSubscription: Subscription = null;
  public buildNum = env.BUILDNUM;
  public userSub: Subscription;
  public userType = 1;
  public elem;
  partnerId: any;
  partnerType: any;
  public tokenData= [];
  QRTypeAI: boolean;
  CCTypeAI: boolean;
  parnterName: any;
  public sidebarItems = [];
  constructor(
    private auth: AuthenticationService,
    private cs: CommonServiceService,
    private WS: WebService,
    @Inject(DOCUMENT) private document: any
  ) {}
  ngOnInit(): void {
    this.auth.sidebarItems = this.auth.sidebarItems.sort((a, b) => a.keyCode - b.keyCode);
    for (const item of this.auth.sidebarItems) {
      // if (item.key5 && item.key5 !== "") {
      //   let matchParent = this.sidebarItems.find(menu => menu.name === item.key3)
      //   if (!matchParent) {
      //     this.sidebarItems.push({ name: item.key5, route: "#", icon: "", subItems: [] });
      //     matchParent = this.sidebarItems.find(menu => menu.name === item.key3)
      //   }
      //   matchParent.subItems.push({ name: item.key3, route: item.key2, icon: item.key4, subItems: [] })
      // }
      // else {
        this.sidebarItems.push({ name: item.key3, route: item.key2, icon: item.key4, subItems: [] });
      // }
    }
    console.log(this.sidebarItems);
    this.elem = document.documentElement;
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.userType = user.userType;
        this.partnerId = user.userPartnerID;
        if(this.userType === 2) {
          this.fetchTokens();
        }
      }
    });
    setTimeout(() => {
      this.languageSubscription = this.cs._language.subscribe((lang) => {
        this.changeLanguage(lang);
      });
    }, 100);
    this.fetchPartnerType(this.partnerId);
    this.fetchPartnerName();
  }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }

  toggleSidebarState(): void {
    this.sidebarState = !this.sidebarState;
    this.sidebarStateChange.emit(this.sidebarState);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  public fetchPartnerName() {
    this.WS.post('api/master/dmr/fetchPartnerName', {partnerId:this.partnerId}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.parnterName= res.result
        }
      }
    );
  }

  public fetchPartnerType(partnerId: string) {
    this.WS.post('api/master/dmr/fetchPartnertype', {partnerId:this.partnerId}).subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          this.partnerType= res.result;
        }
      }
    );
  }

  public fetchTokens(): void {
    this.WS.post('api/master/admissionToken/fetch', {
      keyword: '',
    }).subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.tokenData = res.result.tokens ;
        this.tokenData.map((t) => {
          t.partnerName = t.partnerID.name;
          if(t.type === 2){
            this.QRTypeAI = true;
          }
          if (t.type === 1) {
            this.CCTypeAI = true;
          }
        });
      } else {
        this.tokenData = [];
      }
    });
  }
  public displayCouponGen():any {
    if(this.userType === 1){
      return true;
    } else if(this.userType === 2) {
      if(this.QRTypeAI) {
        if(this.CCTypeAI) {
          return true;
        }
        else {
          return true;
        }
      } else {
        return false;
      }
    } else if(this.userType === 3) {
      return false;
    }
  }

  public displayReports(): any{
    if(this.userType === 1){
      return true;
    } else if(this.userType === 2) {
      if(this.CCTypeAI) {
        return true;
      }
      else {
        return false;
      }
    } else if(this.userType === 3) {
      return false;
    }
  }
}
