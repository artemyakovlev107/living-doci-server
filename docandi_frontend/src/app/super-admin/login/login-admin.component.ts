declare var $ : any;
import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {HttpMethod} from "../../shared/services/http.method";
import {SuperAdminComponent} from "../super-admin.component";
@Component({
    moduleId: module.id,
    selector: 'login-admin',
    templateUrl: 'login-admin.component.html',
    providers: [ HttpMethod]

})
export class LoginAdminComponent {
    user : {Data:any, Message: string,Status:string};
    checkUser: boolean;
    baseUrl:string;
    errorMessage:string = null;
    userName:string;
    password:string;
    http_method:any;
    super_admin:any;
    constructor(private router : Router,http_method: HttpMethod, super_admin: SuperAdminComponent)
    {
        this.http_method = http_method;
        this.baseUrl = this.http_method.baseUrl;
        this.super_admin = super_admin;
    }
    
    login()
    {
        this.http_method.postApi(this.baseUrl + 'user/loginadmin',{email:this.userName,password:this.password}).subscribe(
            (response:any) => {
                this.user = JSON.parse(response._body);
                if(this.user.Data != null) {                    
                    sessionStorage.setItem('admin', JSON.stringify(this.user.Data));
                    this.router.navigate(['admin/hospital']);
                    this.checkUser = true;
                    this.super_admin.check();
                }
                if(this.user.Status == "error")
                {
                    this.errorMessage = this.user.Message;
                }
            },
            (error:any) => {
                this.errorMessage = error;
                this.errorMessage = 'Bad Login';
            })
    }
            

}
