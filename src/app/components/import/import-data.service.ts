import { Injectable } from '@angular/core';
import {AbstractValidator} from './validators/abstract-validator.interface';
import {ActivationEnd, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {
  public validator$ = new Subject<AbstractValidator<any>>();
  private savedValidator: AbstractValidator<any>;
  private srcUrl: string;
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/admin/import') {
        const e: NavigationEnd = event as NavigationEnd;
        if (!this.savedValidator) {
          this.router.navigate([this.srcUrl]);
        }
        this.validator$.next(this.savedValidator);
      } else if (event instanceof NavigationStart && event.url === 'admin/import') {
        if (!this.savedValidator) {
          this.router.navigate([this.srcUrl]);
        }
      }
    });
  }

  public showImportSteps(validator: AbstractValidator<any>, srcUrl: string): void {
    this.srcUrl = srcUrl;
    this.savedValidator = validator;
    this.router.navigate(['/admin/import']);

  }
  public closeImport(): void {
    this.router.navigate([this.srcUrl]);
  }
}
