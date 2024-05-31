import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, AlertService, UserDataService } from '../_services';
import swal from 'sweetalert2';
import { IResponse } from '../models/server-data-source.model';
import { WebService } from '../services/web.service';
import { ReCaptcha2Component } from 'ngx-captcha';
import { environment as env } from 'src/environments/environment.prod';

@Component({
  templateUrl: 'forgetpassword.component.html',
  styleUrls: ['login.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  public siteKey = '';
  public uatsiteKey = '6LepUA4mAAAAAHOHlOK9sQ-fpBh92guj06liZBUE';
  submitted = false;
  public userName: any;
  protected aFormGroup: FormGroup;
  @ViewChild('captchaElem', { static: true }) captchaElem: ReCaptcha2Component;
  public captchaToken: any;
  currentScreen = 'recoveryForm';
  showNewPassword: boolean;
  showConfirmNewPassword: boolean;
  constructor(
    private WS: WebService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private UserDataService: UserDataService
  ) {}

  ngOnInit() {
    this.uatsiteKey = '6LepUA4mAAAAAHOHlOK9sQ-fpBh92guj06liZBUE';
    if (env.production == true) {
      this.siteKey = env.CAPTCHA_SITE_KEY;
    }
    console.log(this.siteKey);
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
    });
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required],
    });
  }
  public captchaHandleSuccess(data): void {
    this.captchaToken = data;
  }

  public handleReset(): void {
    this.captchaToken = '';
  }
  // localhost:3004/api/fe/v1/user/forget_password
  public sendEmail() {
    this.WS.post('api/master/user/forgot_password', {
      query: {
        userName: this.userName,
      },
    }).subscribe((res: any) => {
      // this.spinner.show();
      console.log(this.userName);
      console.log(res);
      if (res.code === 200) {
        swal({
          position: 'center',
          type: 'success',
          title: "We have shared a new password on your Email I'd",
          html: res.message,
        });

        console.log(res);
      }
      if (res.code === 400) {
        swal({
          position: 'center',
          type: 'error',
          title: 'Mail not Shared Succesfully',
          html: res.message,
        });

        console.log(res);
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.sendEmail();
    // reset alerts on submit
    // this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.router.navigateByUrl('account/confirmforgot');
    this.UserDataService.forgotPasswordUser(this.form.value).subscribe((res:any)=>{
         ;
        if(res.status===1){
            console.log(res);
        }
    //     if(res.statusCode!=undefined && res.statusCode!=200 &&  res.statusCode!=400)
    //     {
    //         swal({
    //             position: "center",
    //             type: "error",
    //             title: "Error...",
    //             html: res.message
    //           });

    //     }
    //     if( res.statusCode!=undefined && res.statusCode==400 && res.err.name !=undefined && res.err.name==="NotAuthorizedException")
    //     {
    //         swal({
    //             position: "center",
    //             type: "error",
    //             title: res.err.name,
    //             html: "user not confirme, Please Contact to lounge Administrator",
    //           });
    //         return;
    //     }
    //     if( res.statusCode!=undefined && res.statusCode!=400)
    //     {
    //         swal({
    //             position: "center",
    //             type: "error",
    //             title: "Invalid user Name and Password",
    //             html: res.message
    //           });
    //           return;
    //     }
    //     if(res.idToken!=undefined && res.idToken!='' &&  res.idToken.payload!=undefined && res.idToken.payload['custom:portlocation']=='ind')
    //     {
    //         swal({
    //             position: "center",
    //             type: "error",
    //             title: "error...",
    //             html: "Register user not mapped any lounge port and location"
    //           });
    //           return;
    //     }
    //    if(res.idToken!=undefined && res.idToken!='')
    //     {

    //         swal({
    //         position: "center",
    //         type: "success",
    //         title: "Successfully...",
    //         html: "Registration successful Please Contact PPG Admin for Account Confirmation."
    //       });

    //       window.location.href="https://market-api.com/dashboard#id_token="+res.idToken.jwtToken

    //     }

    });
  }
  switchScreen(screenName) {
    this.currentScreen = screenName;
  }
  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }
  toggleConfirmNewPasswordVisibility() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }
}
