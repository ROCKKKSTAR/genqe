import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService, AlertService, UserDataService } from  '../_services';;
import swal from 'sweetalert2';

@Component({ 
    templateUrl: 'confirmForgotPassword.component.html',
    styleUrls: ["login.component.scss"]
})
export class ConfirmForgotPassword implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private UserDataService:UserDataService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            code: ['', Validators.required],
            password: ['', Validators.required],
            newpassword: ['', Validators.required]
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
        this.loading = true;
        this.UserDataService.loginUser(this.form.value).subscribe((res:any)=>{
             ;
            
            if(res.statusCode!=undefined && res.statusCode!=200 &&  res.statusCode!=400)
            {
                swal({
                    position: "center",
                    type: "error",
                    title: "Error...",
                    html: res.message
                  });
                
            }
            if( res.statusCode!=undefined && res.statusCode==400 && res.err.name !=undefined && res.err.name==="NotAuthorizedException")
            {
                swal({
                    position: "center",
                    type: "error",
                    title: res.err.name,
                    html: "user not confirme, Please Contact to lounge Administrator",
                  });
                return;
            }
            if( res.statusCode!=undefined && res.statusCode!=400)
            {
                swal({
                    position: "center",
                    type: "error",
                    title: "Invalid user Name and Password",
                    html: res.message
                  });
                  return;
            }
            if(res.idToken!=undefined && res.idToken!='' &&  res.idToken.payload!=undefined && res.idToken.payload['custom:portlocation']=='ind') 
            {
                swal({
                    position: "center",
                    type: "error",
                    title: "error...",
                    html: "Register user not mapped any lounge port and location"
                  });
                  return;
            }
           if(res.idToken!=undefined && res.idToken!='') 
            { 
                
                swal({
                position: "center",
                type: "success",
                title: "Successfully...",
                html: "Registration successful Please Contact PPG Admin for Account Confirmation."
              });

              window.location.href="https://market-api.com/dashboard#id_token="+res.idToken.jwtToken
            
            }
               
        });        
       
    }
}