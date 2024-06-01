import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ImportDataModule } from './components/import/import-data.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './account/login.component';
import { PartnerComponent } from './components/masters/partner/partner.component';
import { UsersComponent } from './components/masters/users/users.component';
import { MembersComponent } from './components/masters/members/members.component';
import { FileImportExportComponent } from './components/file-import-export/file-import-export.component';
import { AlertModalComponent } from './components/alert-modal/alert-modal.component';
import { AppAlertComponent } from './components/alert-modal/alert.component';
import { MatDialogModule } from '@angular/material/dialog';
import { LoungeComponent } from './components/masters/lounge/lounge.component';
import { SharedModule } from './modules/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
// import { ChartsModule } from 'ng2-charts';
import { AuthInterceptor } from './services/authInterceptor';
import { AirportComponent } from './components/masters/airport/airport.component';
import { DevicesComponent } from './components/masters/devices/devices.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RejectModalComponent } from './components/alert-modal/reject-modal/reject-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgSelect2Module } from 'ng-select2';
import { LoaderComponent } from './components/loader/loader.component';
import { CountryComponent } from './components/masters/country/country.component';
import { PincodeComponent } from './components/masters/pincode/pincode.component';
import { MatIconModule } from '@angular/material/icon';
import { StripeModule } from 'stripe-angular';
import { GlobalSettingComponent } from './components/masters/global-setting/global-setting.component';
import { ModuleComponent } from './components/masters/module/module.component';
import { ActionComponent } from './components/masters/action/action.component';
import { RoleComponent } from './components/masters/role/role.component';
import { CurrencyComponent } from './components/masters/currency/currency.component';
import { ConfirmForgotPassword } from './account/confirmForgotPassword.component';
import { ForgetPasswordComponent } from './account/forgetpassword.component';
import { LayoutComponent } from './account/layout.component';
import { RegisterComponent } from './account/register.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AccountRoutingModule } from './account/account-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
// import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTableExporterModule } from 'mat-table-exporter';
import { SettleModalComponent } from './components/alert-modal/settle-modal/settle-modal.component';
import { AirlineCodeComponent } from './components/masters/airline-code/airline-code.component';
import CanActivateURL from './services/auth.guard';
import { OutletEventsComponent } from './components/masters/outlet-events/outlet-events.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatChipsModule } from '@angular/material/chips';
import { ChatbotConversationComponent } from './components/chatbot-conversation/chatbot-conversation.component';
import { ShowSettleModalComponent } from './components/alert-modal/show-settle-modal/show-settle-modal.component';
// import { PrintService } from './print.service';

import { QRCodeModule } from 'angular2-qrcode';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { RegisterdMemberComponent } from './components/masters/registerd-member/registerd-member.component';
import { ChatboxLoungeCheckinAssistantComponent } from './components/chatbox-loungeCheckin-assistant/chatbox-loungeCheckin-assistant.component';
import { ChatboxLoungeAssistantComponent } from './components/chatbox-lounge-assistant/chatbox-lounge-assistant.component';
import { ChatassistantLoungeComponent } from './components/chatassistant-lounge/chatassistant-lounge.component';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
// import { LegalAssistantComponent } from './components/legal-assistant/legal-assistant.component';
import { PromptTemplatesComponent } from './components/prompt-templates/prompt-templates.component';
import { DocumentTemplatesComponent } from './components/document-templates/document-templates.component';
import { ProjectScreenComponent } from './components/project-screen/project-screen.component';
import { ChannelsComponent } from './components/channels/channels.component';
import { TrainModelComponent } from './components/train-model/train-model.component';
import { TestPlanningComponent } from './components/test-planning/test-planning.component';
import { TestCaseManagementComponent } from './components/test-case-management/test-case-management.component';
import { TestExecutionComponent } from './components/test-execution/test-execution.component';
import { DefectsComponent } from './components/defects/defects.component';
import { ReportingAndAnalyticsComponent } from './components/reporting-and-analytics/reporting-and-analytics.component';
import { IntakeAndAssignmentsComponent } from './components/intake-and-assignments/intake-and-assignments.component';
import { ScreenRecordingComponent } from './components/screen-recording/screen-recording.component';
import { ProjectAssistantComponent } from './components/project-assistant/project-assistant.component';
import { LoginFingerprintComponent } from './components/login-fingerprint/login-fingerprint.component';
import { TrainNewModelComponent } from './components/train-new-model/train-new-model.component';
import { ConfigureWorkflowComponent } from './components/configure-workflow/configure-workflow.component';
// import { ClipboardModule } from 'ngx-clipboard';
// tslint:disable-next-line: typedef
export function createTranslateLoader(http: HttpClient) {
  const loader = new TranslateHttpLoader(http, '/assets/i18n/', '.json');
  return loader;
}
// tslint:disable-next-line: typedef
export function appInitializerFactory(translate: TranslateService) {
  return () => {
    translate.setDefaultLang('English');
    translate.store.langs = ['English', 'Chinese'];
    for (const l of translate.store.langs) {
      translate.use(l).toPromise();
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    LoginComponent,
    PartnerComponent,
    UsersComponent,
    MembersComponent,
    FileImportExportComponent,
    AlertModalComponent,
    LoungeComponent,
    AirportComponent,
    DevicesComponent,
    RejectModalComponent,
    LoaderComponent,
    CountryComponent,
    PincodeComponent,
    GlobalSettingComponent,
    ModuleComponent,
    ActionComponent,
    RoleComponent,
    CurrencyComponent,
    LayoutComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    ConfirmForgotPassword,
    SettleModalComponent,
    ShowSettleModalComponent,
    AirlineCodeComponent,
    OutletEventsComponent,
    ChatbotConversationComponent,
    ChatbotComponent,
    RegisterdMemberComponent,
    ChatboxLoungeCheckinAssistantComponent,
    ChatboxLoungeAssistantComponent,
    ChatassistantLoungeComponent,
    PromptTemplatesComponent,
    DocumentTemplatesComponent,
    ProjectScreenComponent,
    ChannelsComponent,
    TrainModelComponent,
    TestPlanningComponent,
    TestCaseManagementComponent,
    TestExecutionComponent,
    DefectsComponent,
    ReportingAndAnalyticsComponent,
    IntakeAndAssignmentsComponent,
    ScreenRecordingComponent,
    ProjectAssistantComponent,
    LoginFingerprintComponent,
    TrainNewModelComponent,
    ConfigureWorkflowComponent,
  ],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    NgxCaptchaModule,
    // QRCodeModule,
    ImportDataModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatInputModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    NgSelect2Module,
    MatIconModule,
    MatCheckboxModule,
    CommonModule,
    AccountRoutingModule,
    NgxSpinnerModule,
    MatTableExporterModule,
    MatButtonModule,
    NgMultiSelectDropDownModule.forRoot(),
    // ClipboardModule,
    NgbPaginationModule,
    ToastrModule.forRoot({
      timeOut: 3500,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    SharedModule,
    // ChartsModule,
    SlickCarouselModule,
    StripeModule.forRoot(''),
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyAi1Xk9kT389P7ys2ZVtEoa8Ehu2Dv-s_s',
    // }),
    // AgmDirectionModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    DatePipe,
    ToastrService,
    AppAlertComponent,
    CanActivateURL,
    // PrintService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
