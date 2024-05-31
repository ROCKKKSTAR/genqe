import { Injectable, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreDataService {


  @Output() SidenavChange: EventEmitter<any> = new EventEmitter();

  private messageSource = new BehaviorSubject('true');

  private showhideMenu = new BehaviorSubject('false');

  private showhideClass = new BehaviorSubject('true');

  private token = new BehaviorSubject('null');

  currenttoken = this.token.asObservable();

  currentshowhideClass = this.showhideClass.asObservable();

  currentMessage = this.messageSource.asObservable();

  currentshowhideMenu = this.showhideMenu.asObservable();
  private ToogleValue = new BehaviorSubject('defaultmessage');
  NavValue = this.ToogleValue.asObservable();

  constructor() { }

  changestoken(message: string): void {
    this.token.next(message);
  }


  changesshowhideClass(message: string): void {
    this.showhideClass.next(message);
  }


  changeshowhideMenu(message: string): void {
    this.showhideMenu.next(message);
  }


  changeMessage(message: string) {
    this.messageSource.next(message);
  }

  ChangeToggle(message: any) {
    this.messageSource.next(message)
  }

}
