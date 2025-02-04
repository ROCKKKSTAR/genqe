import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileImportExportComponent } from './components/file-import-export/file-import-export.component';
import { LoginComponent } from './account/login.component';
import { DevicesComponent } from './components/masters/devices/devices.component';
import { LoungeComponent } from './components/masters/lounge/lounge.component';
import { MembersComponent } from './components/masters/members/members.component';
import { PartnerComponent } from './components/masters/partner/partner.component';
import { UsersComponent } from './components/masters/users/users.component';
import { AirportComponent } from './components/masters/airport/airport.component';
import { CountryComponent } from './components/masters/country/country.component';
import { CurrencyComponent } from './components/masters/currency/currency.component';
import { PincodeComponent } from './components/masters/pincode/pincode.component';
import { GlobalSettingComponent } from './components/masters/global-setting/global-setting.component';
import { ModuleComponent } from './components/masters/module/module.component';
import { ActionComponent } from './components/masters/action/action.component';
import { RoleComponent } from './components/masters/role/role.component';
import { ConfirmForgotPassword } from './account/confirmForgotPassword.component';
import { ForgetPasswordComponent } from './account/forgetpassword.component';
import { RegisterComponent } from './account/register.component';
import { AirlineCodeComponent } from './components/masters/airline-code/airline-code.component';
import CanActivateURL from './services/auth.guard';
import { OutletEventsComponent } from './components/masters/outlet-events/outlet-events.component';
import { ChatbotConversationComponent } from './components/chatbot-conversation/chatbot-conversation.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { RegisterdMemberComponent } from './components/masters/registerd-member/registerd-member.component';
import { ChatboxLoungeCheckinAssistantComponent } from './components/chatbox-loungeCheckin-assistant/chatbox-loungeCheckin-assistant.component';
import { ChatboxLoungeAssistantComponent } from './components/chatbox-lounge-assistant/chatbox-lounge-assistant.component';
import { ChatassistantLoungeComponent } from './components/chatassistant-lounge/chatassistant-lounge.component';
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
import { ProjectAssistantComponent } from './components/project-assistant/project-assistant.component';
import { LoginFingerprintComponent } from './components/login-fingerprint/login-fingerprint.component';
import { TrainNewModelComponent } from './components/train-new-model/train-new-model.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  // {
  //   path: 'print',
  //   outlet: 'print',
  //   component: PrintLayoutComponent,
  //   children: [
  //     { path: 'printinvoice/:invoiceIds', component: PrintinvoiceComponent }
  //   ],
  //   canActivate: [CanActivateURL],
  // },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'register', component: RegisterComponent },
  { path: 'forget', component: ForgetPasswordComponent },
  { path: 'confirmforgot', component: ConfirmForgotPassword },
  {
    path: 'partner',
    component: PartnerComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'lounge',
    component: LoungeComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'airport',
    component: AirportComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'country',
    component: CountryComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'currency',
    component: CurrencyComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'pincode',
    component: PincodeComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'members',
    component: MembersComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'registered-members',
    component: RegisterdMemberComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'file-import-export',
    component: FileImportExportComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'devices',
    component: DevicesComponent,
    canActivate: [CanActivateURL],
  },

  //
  {
    path: 'global-setting',
    component: GlobalSettingComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'module',
    component: ModuleComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'action',
    component: ActionComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'role',
    component: RoleComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'airline-code',
    component: AirlineCodeComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'outlet-events',
    component: OutletEventsComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'chatbot-conversation',
    component: ChatbotConversationComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'chatbox',
    component: ChatbotComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'loungeCheckIn-Assistant',
    component: ChatboxLoungeCheckinAssistantComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'lounge-Assistant',
    component: ChatboxLoungeAssistantComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'lounge-details',
    component: ChatassistantLoungeComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'application-assistant',
    component: ProjectAssistantComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'prompt-templates',
    component: PromptTemplatesComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'document-templates',
    component: DocumentTemplatesComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'applications',
    component: ProjectScreenComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'channels',
    component: ChannelsComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'train-model',
    component: TrainModelComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'train-new-model',
    component: TrainNewModelComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'test-planning',
    component: TestPlanningComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'test-case-management',
    component: TestCaseManagementComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'test-execution',
    component: TestExecutionComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'defects',
    component: DefectsComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'reporting-and-analytics',
    component: ReportingAndAnalyticsComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'intake-and-assignments',
    component: IntakeAndAssignmentsComponent,
    canActivate: [CanActivateURL],
  },
  {
    path: 'login1',
    component: LoginFingerprintComponent,
  },
  {
    path: '**',
    component: LoginComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
