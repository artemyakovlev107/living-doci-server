import { Component } from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {FormsModule} from "@angular/forms";
import {Router} from '@angular/router';

import 'rxjs/Rx';
import {HttpMethod} from "../shared/services/http.method";
/**
 * This class represents the lazy loaded LoginComponent.
 */
@Component({
    moduleId: module.id,

    selector: 'forgot-password-cmp',
    templateUrl: 'forgot-password.component.html',
    styleUrls: ['forgot-password.component.css'],
    providers:[HttpMethod]
  
})
export class ForgotPasswordComponent {
    baseUrl:string;
    errorMessage:string = null;
    userName:string;
    loading:boolean=false;
    http_method:any;
     constructor(http_method : HttpMethod, private router:Router) {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
    }


    forgotPassword() {
        this.loading=true;
        this.http_method.postApiNotAuth(this.baseUrl + 'user/forgotpassword',{'email':this.userName}).subscribe(
            (response:any) => {
                this.loading=false;
                let res= JSON.parse(response._body);
                if( res.Status == "error"){
                    this.errorMessage = res.Message;
                }else{
                    this.router.navigate(['/', 'login']);
                }
            },
            (error:any) => {
                this.loading=false;
                this.errorMessage = error;
            });
    }


}
