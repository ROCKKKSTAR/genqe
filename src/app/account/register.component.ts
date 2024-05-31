import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService, UserDataService } from '../_services';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2/dist/sweetalert2.js';
import { AuthenticationService } from '../services/auth.service';
import { IUser } from '../models/user.interface';
import { Subscription } from 'rxjs';
import { IResponse } from '../models/server-data-source.model';
import { ToastrService } from 'ngx-toastr';
import { WebService } from '../services/web.service';

@Component({
  templateUrl: 'register.component.html',
  styleUrls: ['login.component.scss'],
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  data: any = [];
  lowerflag: boolean = false;
  upperflag: boolean = false;
  specialflag: boolean = false;
  numberflag: boolean = false;
  charactersflag: boolean = false;
  showflag: boolean = false;
  showflagGreen: boolean = false;
  confirmpassword: boolean = false;
  public str: string;
  currentScreen = 'createAccountForm';
  roles = [
    { id: 'asATester', label: 'As a Tester' },
    { id: 'asALeadTester', label: 'As a Lead Tester' },
    { id: 'asAManager', label: 'As a Manager' },
    { id: 'asADeveloper', label: 'As a Developer' },
  ];
  selectedUserType: any = { id: '', label: '' };
  authenticatedUser: IUser;
  userSub: Subscription;
  remoteUserID: any;
  userID: any;
  globalUser: any;
  partner: any;
  termsValidation: boolean = false;
  showPassword: boolean;
  showConfirmNewPassword: boolean;
  // public specialCharPattern = new RegExp(
  //     /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g
  //   );
  //   public lowerCharPattern = new RegExp(/a-z/g);
  //   public upperCharPattern = new RegExp(/A-Z/g);
  //   public numCharPattern = new RegExp(/0-9/g);
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private UserDataService: UserDataService,
    private spinner: NgxSpinnerService,
    private auth: AuthenticationService,
    private toastr: ToastrService,
    private WS: WebService
  ) {
    this.lowerflag = false;
    this.upperflag = false;
    this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;
  }

  ngOnInit() {
    this.lowerflag = false;
    this.upperflag = false;
    this.specialflag = false;
    this.numberflag = false;
    this.charactersflag = false;
    this.showflag = true;
    this.showflagGreen = false;

    this.form = this.formBuilder.group({
      name: [''],
      username: ['', Validators.required],
      email: [
        '',
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
      teamName: ['', Validators.required],
      organisationName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(8)]],
      termsConditions: [false, [Validators.required]],
    });
  }
  onKeypressEvent($event: any) {
    this.showflag = false;
    this.showflagGreen = false;
    this.confirmpassword = false;
    this.str = $event.target.value;
    this.isAllPresent(this.str);

    this.str = '';
  }
  getUserType(role) {
    this.selectedUserType = role;
  }
  isAllPresent(str: string) {
    // Regex to check if a string
    // contains uppercase, lowercase
    // special character & numeric value
    const pattern = new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$'
    );

    // If the string is empty
    // then print No

    // Print Yes If the string matches
    // with the Regex
    if (pattern.test(str)) {
      this.showflag = true;
      this.showflagGreen = true;
    }

    return;
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.form.controls;
  }
  chkdomanflag: any = false;
  // @ViewChild('code')code
  //   onVerficationCode()
  //   {
  //      ;

  //       // reset alerts on submit
  //       this.alertService.clear();

  //       // stop here if form is invalid
  //       if (this.form.invalid) {
  //           return;
  //       }

  //       this.spinner.show();

  //       this.loading = true;
  // this.UserDataService.onVerficationCode(this.form.value).subscribe((res:any)=>{
  //                ;
  //               this.spinner.hide();

  //               if(res.statusCode!=undefined && res.statusCode==400 && res.result.message!=undefined  && res.result.message=="User already exists")
  //               {
  //                   swal({
  //                       position: "center",
  //                       type: "error",
  //                       title: res.message,
  //                       html: ""//res.message
  //                     });

  //               }
  //              if(res.result.UserSub!=undefined && res.result.UserSub!='' &&  res.statusCode!=400 )
  //               {

  //                 swal({
  //                   position: "center",
  //                   type: "success",
  //                   title: "Registration successful",
  //                   html: "Please Contact Lounge Administrator for Confirmation"
  //                 });

  //                 this.form.reset();
  //                 this.router.navigate(['../login'], { relativeTo: this.route });

  //               }

  //           });

  //   }
  async onSubmit() {
    this.submitted = true;
    this.chkdomanflag = false;
    // reset alerts on submit
    this.alertService.clear();

    if (this.form.value.termsConditions == false) {
      this.toastr.warning('Agree Terms & Conditions is mandatory');
      return;
    }
    if (this.form.value.teamName == '') {
      this.toastr.warning('Team/Group is mandatory');
      return;
    }
    if (this.form.value.password !== this.form.value.confirmpassword) {
      this.confirmpassword = true;
      return;
    }

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }
    this.confirmpassword = false;
    this.spinner.show();

    this.loading = true;

    if (this.selectedUserType.label == '') {
      this.toastr.info('User Role is Mandatory');
      $('#accountRole').focus();
      this.spinner.hide();
      return;
    }
    const isUserExists = await this.checkUser();
    if (!isUserExists) {
      this.UserDataService.RegisterUser(this.form.value).subscribe(
        async (res: any) => {
          console.log(res);
          this.spinner.hide();
          if (
            res.statusCode != undefined &&
            res.statusCode == 400 &&
            res.result.code == 'InvalidLambdaResponseException'
          ) {
            swal({
              position: 'center',
              type: 'success',
              title: 'Registration successful',
              html: 'Please Contact GenQe Administrator for Confirmation',
            });
            let email = '';
            if (
              this.form.value.email != undefined &&
              this.form.value.email != null &&
              this.form.value.email != ''
            ) {
              email = this.form.value.email;
            } else {
              email = this.form.value.name + '@Plaza.com';
            }

            let userdata =
              'username=' +
              this.form.value.username +
              '&name=' +
              this.form.value.name +
              '&portlocation=' +
              'gso' +
              '&emailid=' +
              email +
              '&empid=2323&dob=12/12/1089&role=' +
              'A1' +
              '';
            this.form.reset();
            this.updateUser(userdata);
            this.router.navigate(['../login'], { relativeTo: this.route });
          }
          if (
            res.statusCode != undefined &&
            res.statusCode == 400 &&
            res.result.message != undefined &&
            res.result.message == 'User already exists'
          ) {
            swal({
              position: 'center',
              type: 'error',
              title: res.result.message,
              html: '', //res.message
            });
          }
          if (
            res.result.UserSub != undefined &&
            res.result.UserSub != '' &&
            res.statusCode != 400
          ) {
            swal({
              position: 'center',
              type: 'success',
              title: 'Registration successful',
              html: 'Please Contact GenQe Administrator for Confirmation',
            });

            if (
              res.result.chkdomanflag != undefined &&
              res.result.chkdomanflag
            ) {
              this.chkdomanflag = res.result.chkdomanflag;
            }

            let userdata =
              'username=' +
              this.form.value.username +
              '&name=' +
              this.form.value.username +
              '&portlocation=' +
              'GSO' +
              '&emailid=' +
              'abc@gmail.com' +
              '&approvedby=created&empid=2323&dob=12/12/1089&role=' +
              'ind' +
              '';
            // this.confirmUserEmail({username:this.form.value.username,email:this.form.value.email})
            // this.updateUser(userdata);
            this.remoteUserID = res.result.UserSub;
            let userid = await this.createUser();
            if (userid && userid != '') {
              this.router.navigate(['../login'], {
                queryParams: { username: this.form.value.username },
                relativeTo: this.route,
              });
              this.form.reset();
            } else {
              this.toastr.info('Something Went Wrong');
            }
          }
        }
      );
    } else {
      this.toastr.info('User already exists');
      this.spinner.hide();
    }
  }

  public async createUser(): Promise<string> {
    try {
      const res2: any = await this.WS.post('api/master/user/register/user', {
        name: this.form.value.username,
        email: this.form.value.email,
        remoteUserID: this.remoteUserID,
        role: this.selectedUserType.label,
        defaultLanguage: 'en',
      }).toPromise();

      if (res2.status == 1) {
        return res2.result.user._id;
      } else {
        this.toastr.info('Something Went Wrong');
        return '';
      }
    } catch (error) {
      this.toastr.error(error.message);
      return ''; // or null, depending on your preference
    }
  }

  public async checkUser(): Promise<boolean> {
    try {
      const res2: any = await this.WS.post('api/master/user/check/user', {
        name: this.form.value.username,
        email: this.form.value.email,
      }).toPromise();

      if (res2.status == 1) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.toastr.error(error.message);
      return false; // or null, depending on your preference
    }
  }

  private updateUser(updateuser: any): void {
    this.UserDataService.updateUser('?' + updateuser).subscribe((res: any) => {
      if (res.status === 1) {
      } else {
      }
    });
  }

  private confirmUserEmail(updateuser: any): void {
    this.UserDataService.confirmUser('?' + updateuser).subscribe((res: any) => {
      if (res.status === 1) {
      } else {
      }
    });
  }
  swithcScreen(screen) {
    this.currentScreen = screen;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmNewPasswordVisibility() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }
}
