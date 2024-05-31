import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { LayoutComponent } from './layout.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import {ForgetPasswordComponent} from './forgetpassword.component';
import {ConfirmForgotPassword} from './confirmForgotPassword.component';
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AccountRoutingModule,
        NgxSpinnerModule,
        FormsModule,
        NgxCaptchaModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [
    ]
})
export class AccountModule { }