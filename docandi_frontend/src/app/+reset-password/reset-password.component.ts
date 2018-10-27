import {Component} from "@angular/core";
import {OnInit} from "@angular/core";
import {Router,ActivatedRoute } from "@angular/router";
import {Subscription} from "rxjs";
import {HttpMethod} from "../shared/services/http.method";


/**
 * This class represents the lazy loaded LoginComponent.
 */
@Component({
    moduleId: module.id,
    selector: 'reset-password-cmp',
    templateUrl: 'reset-password.component.html',
    providers:[HttpMethod]
})
export class ResetPasswordComponent {
    baseUrl :string;
    errorMessage:string = null;
    mes:string;
    confirmPassword:string;
    password:string;
    email:string;
    oldPassword:string;
     token: string;
    http_method:any;
    private subscription: Subscription;

    constructor(http_method:HttpMethod, private route:ActivatedRoute,private router:Router) {
         this.http_method= http_method;
         this.baseUrl = this.http_method.baseUrl;
    }
    ngOnInit() {
        this.subscription = this.route.queryParams.subscribe(
            (param: any) => {
                this.token = param['token'];
            });
        // console.log(this.token)
    }

    getParam(){

    }

    changePassword() {
        this.mes=null;
        this.errorMessage=null;
        if(this.token){
            this.http_method.postApiNotAuth(this.baseUrl + 'user/resetpassword',{'token':this.token,'password':this.password}).subscribe(
                (response:any) => {
                let res= JSON.parse(response._body);
                if( res.Status == "error"){
                    this.errorMessage = res.Message;
                }else{
                    this.router.navigate(['/', 'login']);
                }
            },
                (error:any) => {
                this.errorMessage = error;
            });
        }
        else{
            this.http_method.postApi(this.baseUrl + 'user/changePassword',{'email':this.email,'password':this.oldPassword,'newpassword':this.password}).subscribe(
                (response:any) => {
                let res= JSON.parse(response._body);
               if(res.Status =="success"){
                   this.mes = "Changpasword Success"
                }
                else{
                    this.errorMessage = res.Message;
                }
            },
                (error:any) => {
                this.errorMessage = error;
            });
            
        }
    }
}
